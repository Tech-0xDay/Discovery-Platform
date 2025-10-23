"""
Project routes
"""
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from datetime import datetime, timedelta
from sqlalchemy import func, or_
from sqlalchemy.orm import joinedload

from extensions import db
from models.project import Project, ProjectScreenshot
from models.user import User
from schemas.project import ProjectSchema, ProjectCreateSchema, ProjectUpdateSchema
from utils.decorators import token_required, admin_required, optional_auth
from utils.helpers import success_response, error_response, paginated_response, get_pagination_params
from utils.scores import ProofScoreCalculator
from utils.cache import CacheService

projects_bp = Blueprint('projects', __name__)


@projects_bp.route('', methods=['GET'])
@optional_auth
def list_projects(user_id):
    """List projects with advanced filtering and sorting"""
    try:
        page, per_page = get_pagination_params(request)
        sort = request.args.get('sort', 'trending')  # trending, newest, top-rated, most-voted

        # Advanced filters
        search = request.args.get('search', '').strip()
        tech_stack = request.args.getlist('tech')
        hackathon = request.args.get('hackathon', '').strip()
        min_score = request.args.get('min_score', type=int)
        has_demo = request.args.get('has_demo', type=lambda v: v.lower() == 'true') if request.args.get('has_demo') else None
        has_github = request.args.get('has_github', type=lambda v: v.lower() == 'true') if request.args.get('has_github') else None
        featured_only = request.args.get('featured', type=lambda v: v.lower() == 'true') if request.args.get('featured') else None
        badge_type = request.args.get('badge', '').strip()

        # Build query
        query = Project.query.filter_by(is_deleted=False)

        # Search in title, description, tagline
        if search:
            search_term = f'%{search}%'
            query = query.filter(
                or_(
                    Project.title.ilike(search_term),
                    Project.description.ilike(search_term),
                    Project.tagline.ilike(search_term)
                )
            )

        # Tech stack filter (contains all specified techs)
        if tech_stack:
            for tech in tech_stack:
                query = query.filter(Project.tech_stack.contains([tech]))

        # Hackathon filter
        if hackathon:
            query = query.filter(Project.hackathon_name.ilike(f'%{hackathon}%'))

        # Score filter
        if min_score is not None:
            query = query.filter(Project.proof_score >= min_score)

        # Has demo link
        if has_demo is not None:
            if has_demo:
                query = query.filter(Project.demo_url.isnot(None), Project.demo_url != '')
            else:
                query = query.filter(or_(Project.demo_url.is_(None), Project.demo_url == ''))

        # Has GitHub link
        if has_github is not None:
            if has_github:
                query = query.filter(Project.github_url.isnot(None), Project.github_url != '')
            else:
                query = query.filter(or_(Project.github_url.is_(None), Project.github_url == ''))

        # Featured only
        if featured_only:
            query = query.filter(Project.is_featured == True)

        # Badge filter
        if badge_type:
            from models.badge import ValidationBadge
            query = query.join(ValidationBadge).filter(
                ValidationBadge.badge_type == badge_type.lower()
            )

        # Sorting
        if sort == 'trending' or sort == 'hot':
            # Trending: combination of score and recent activity
            query = query.order_by(
                Project.proof_score.desc(),
                Project.created_at.desc()
            )
        elif sort == 'newest' or sort == 'new':
            query = query.order_by(Project.created_at.desc())
        elif sort == 'top-rated' or sort == 'top':
            query = query.order_by(Project.proof_score.desc())
        elif sort == 'most-voted':
            query = query.order_by(
                (Project.upvotes + Project.downvotes).desc()
            )
        else:
            # Default to trending
            query = query.order_by(
                Project.proof_score.desc(),
                Project.created_at.desc()
            )

        total = query.count()
        # Eager load creator to avoid N+1 queries
        projects = query.options(joinedload(Project.creator)).limit(per_page).offset((page - 1) * per_page).all()

        data = [p.to_dict(include_creator=True, user_id=user_id) for p in projects]

        return paginated_response(data, total, page, per_page)
    except Exception as e:
        return error_response('Error', str(e), 500)


@projects_bp.route('/<project_id>', methods=['GET'])
@optional_auth
def get_project(user_id, project_id):
    """Get project details"""
    try:
        project = Project.query.get(project_id)
        if not project or project.is_deleted:
            return error_response('Not found', 'Project not found', 404)

        # Increment view count
        project.view_count += 1
        db.session.commit()

        return success_response(project.to_dict(include_creator=True, user_id=user_id), 'Project retrieved', 200)
    except Exception as e:
        return error_response('Error', str(e), 500)


@projects_bp.route('', methods=['POST'])
@token_required
def create_project(user_id):
    """Create new project"""
    try:
        data = request.get_json()
        print("=== RECEIVED PROJECT DATA ===")
        print(f"github_url in request: {data.get('github_url')}")
        print(f"Full request data: {data}")
        print("============================")

        schema = ProjectCreateSchema()
        validated_data = schema.load(data)

        print("=== VALIDATED DATA ===")
        print(f"github_url after validation: {validated_data.get('github_url')}")
        print("======================")

        # Create project
        project = Project(
            user_id=user_id,
            title=validated_data['title'],
            tagline=validated_data.get('tagline'),
            description=validated_data['description'],
            demo_url=validated_data.get('demo_url'),
            github_url=validated_data.get('github_url'),
            hackathon_name=validated_data.get('hackathon_name'),
            hackathon_date=validated_data.get('hackathon_date'),
            tech_stack=validated_data.get('tech_stack', []),
            team_members=validated_data.get('team_members', [])
        )

        # Add screenshots
        for url in validated_data.get('screenshot_urls', []):
            screenshot = ProjectScreenshot(url=url)
            project.screenshots.append(screenshot)

        # Add to session first
        db.session.add(project)
        db.session.flush()  # Flush to get the relationship loaded

        # Calculate initial scores
        ProofScoreCalculator.update_project_scores(project)

        db.session.commit()

        CacheService.invalidate_project_feed()

        return success_response(project.to_dict(include_creator=True), 'Project created', 201)
    except ValidationError as e:
        return error_response('Validation error', str(e.messages), 400)
    except Exception as e:
        db.session.rollback()
        return error_response('Error', str(e), 500)


@projects_bp.route('/<project_id>', methods=['PUT'])
@token_required
def update_project(user_id, project_id):
    """Update project"""
    try:
        project = Project.query.get(project_id)
        if not project:
            return error_response('Not found', 'Project not found', 404)

        if project.user_id != user_id:
            return error_response('Forbidden', 'You can only edit your own projects', 403)

        data = request.get_json()
        schema = ProjectUpdateSchema()
        validated_data = schema.load(data)

        # Update fields
        for key, value in validated_data.items():
            if value is not None:
                setattr(project, key, value)

        project.updated_at = datetime.utcnow()
        ProofScoreCalculator.update_project_scores(project)

        db.session.commit()
        CacheService.invalidate_project(project_id)

        return success_response(project.to_dict(include_creator=True), 'Project updated', 200)
    except ValidationError as e:
        return error_response('Validation error', str(e.messages), 400)
    except Exception as e:
        db.session.rollback()
        return error_response('Error', str(e), 500)


@projects_bp.route('/<project_id>', methods=['DELETE'])
@token_required
def delete_project(user_id, project_id):
    """Delete project (soft delete)"""
    try:
        project = Project.query.get(project_id)
        if not project:
            return error_response('Not found', 'Project not found', 404)

        if project.user_id != user_id:
            return error_response('Forbidden', 'You can only delete your own projects', 403)

        project.is_deleted = True
        db.session.commit()
        CacheService.invalidate_project(project_id)

        return success_response(None, 'Project deleted', 200)
    except Exception as e:
        db.session.rollback()
        return error_response('Error', str(e), 500)


@projects_bp.route('/<project_id>/feature', methods=['POST'])
@admin_required
def feature_project(user_id, project_id):
    """Feature a project (admin only)"""
    try:
        project = Project.query.get(project_id)
        if not project:
            return error_response('Not found', 'Project not found', 404)

        from datetime import datetime as dt
        project.is_featured = True
        project.featured_at = dt.utcnow()
        project.featured_by = user_id

        db.session.commit()
        CacheService.invalidate_project(project_id)

        return success_response(project.to_dict(include_creator=True), 'Project featured', 200)
    except Exception as e:
        db.session.rollback()
        return error_response('Error', str(e), 500)


@projects_bp.route('/<project_id>/upvote', methods=['POST'])
@token_required
def upvote_project(user_id, project_id):
    """Upvote a project"""
    try:
        from models.vote import Vote

        project = Project.query.get(project_id)
        if not project or project.is_deleted:
            return error_response('Not found', 'Project not found', 404)

        # Check if vote exists
        existing_vote = Vote.query.filter_by(user_id=user_id, project_id=project_id).first()

        if existing_vote:
            # If already upvoted, remove vote
            if existing_vote.vote_type == 'up':
                project.upvotes = max(0, project.upvotes - 1)
                db.session.delete(existing_vote)
            else:
                # Change from downvote to upvote
                project.downvotes = max(0, project.downvotes - 1)
                project.upvotes += 1
                existing_vote.vote_type = 'up'
        else:
            # Create new upvote
            vote = Vote(user_id=user_id, project_id=project_id, vote_type='up')
            project.upvotes += 1
            db.session.add(vote)

        # Recalculate scores
        ProofScoreCalculator.update_project_scores(project)
        db.session.commit()
        CacheService.invalidate_project(project_id)

        return success_response(project.to_dict(include_creator=True), 'Project upvoted', 200)
    except Exception as e:
        db.session.rollback()
        return error_response('Error', str(e), 500)


@projects_bp.route('/<project_id>/downvote', methods=['POST'])
@token_required
def downvote_project(user_id, project_id):
    """Downvote a project"""
    try:
        from models.vote import Vote

        project = Project.query.get(project_id)
        if not project or project.is_deleted:
            return error_response('Not found', 'Project not found', 404)

        # Check if vote exists
        existing_vote = Vote.query.filter_by(user_id=user_id, project_id=project_id).first()

        if existing_vote:
            # If already downvoted, remove vote
            if existing_vote.vote_type == 'down':
                project.downvotes = max(0, project.downvotes - 1)
                db.session.delete(existing_vote)
            else:
                # Change from upvote to downvote
                project.upvotes = max(0, project.upvotes - 1)
                project.downvotes += 1
                existing_vote.vote_type = 'down'
        else:
            # Create new downvote
            vote = Vote(user_id=user_id, project_id=project_id, vote_type='down')
            project.downvotes += 1
            db.session.add(vote)

        # Recalculate scores
        ProofScoreCalculator.update_project_scores(project)
        db.session.commit()
        CacheService.invalidate_project(project_id)

        return success_response(project.to_dict(include_creator=True), 'Project downvoted', 200)
    except Exception as e:
        db.session.rollback()
        return error_response('Error', str(e), 500)


@projects_bp.route('/<project_id>/vote', methods=['DELETE'])
@token_required
def remove_vote(user_id, project_id):
    """Remove vote from project"""
    try:
        from models.vote import Vote

        project = Project.query.get(project_id)
        if not project or project.is_deleted:
            return error_response('Not found', 'Project not found', 404)

        # Find and remove vote
        vote = Vote.query.filter_by(user_id=user_id, project_id=project_id).first()

        if not vote:
            return error_response('Not found', 'No vote to remove', 404)

        if vote.vote_type == 'up':
            project.upvotes = max(0, project.upvotes - 1)
        else:
            project.downvotes = max(0, project.downvotes - 1)

        db.session.delete(vote)
        ProofScoreCalculator.update_project_scores(project)
        db.session.commit()
        CacheService.invalidate_project(project_id)

        return success_response(None, 'Vote removed', 200)
    except Exception as e:
        db.session.rollback()
        return error_response('Error', str(e), 500)


@projects_bp.route('/leaderboard', methods=['GET'])
@optional_auth
def get_leaderboard(user_id):
    """Get top projects and builders leaderboard"""
    try:
        timeframe = request.args.get('timeframe', 'month')  # week/month/all
        limit = request.args.get('limit', 10, type=int)
        limit = min(limit, 50)  # Cap at 50

        # Calculate date filter
        if timeframe == 'week':
            since = datetime.utcnow() - timedelta(days=7)
        elif timeframe == 'month':
            since = datetime.utcnow() - timedelta(days=30)
        else:
            since = None

        # Top projects
        query = Project.query.filter_by(is_deleted=False)
        if since:
            query = query.filter(Project.created_at >= since)

        top_projects = query.options(joinedload(Project.creator)).order_by(
            Project.proof_score.desc()
        ).limit(limit).all()

        # Top builders (by total karma/proof score)
        builder_query = db.session.query(
            User.id,
            User.username,
            User.display_name,
            User.avatar_url,
            func.sum(Project.proof_score).label('total_score'),
            func.count(Project.id).label('project_count')
        ).join(Project, User.id == Project.user_id).filter(
            Project.is_deleted == False
        )

        if since:
            builder_query = builder_query.filter(Project.created_at >= since)

        top_builders = builder_query.group_by(
            User.id, User.username, User.display_name, User.avatar_url
        ).order_by(
            func.sum(Project.proof_score).desc()
        ).limit(limit).all()

        # Featured projects
        featured = Project.query.options(joinedload(Project.creator)).filter_by(
            is_deleted=False,
            is_featured=True
        ).order_by(Project.featured_at.desc()).limit(limit).all()

        return success_response({
            'top_projects': [p.to_dict(include_creator=True) for p in top_projects],
            'top_builders': [{
                'id': str(b.id),
                'username': b.username,
                'display_name': b.display_name,
                'avatar_url': b.avatar_url,
                'total_score': int(b.total_score or 0),
                'project_count': b.project_count
            } for b in top_builders],
            'featured': [p.to_dict(include_creator=True) for p in featured],
            'timeframe': timeframe,
            'limit': limit
        }, 'Leaderboard retrieved', 200)

    except Exception as e:
        return error_response('Error', str(e), 500)
