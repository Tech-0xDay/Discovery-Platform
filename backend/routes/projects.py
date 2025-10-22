"""
Project routes
"""
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app import db
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
    """List projects with filtering and sorting"""
    try:
        page, per_page = get_pagination_params(request)
        sort = request.args.get('sort', 'trending')  # trending, newest, top-rated

        # TODO: Implement project listing with filters
        # Check cache first
        cached = CacheService.get_cached_feed(page, sort)
        if cached:
            return paginated_response(cached['items'], cached['total'], page, per_page)

        # Get projects from database
        query = Project.query.filter_by(is_deleted=False).order_by(Project.created_at.desc())

        total = query.count()
        projects = query.limit(per_page).offset((page - 1) * per_page).all()

        data = [p.to_dict(include_creator=True) for p in projects]
        CacheService.cache_feed(page, sort, {'items': data, 'total': total})

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

        return success_response(project.to_dict(include_creator=True), 'Project retrieved', 200)
    except Exception as e:
        return error_response('Error', str(e), 500)


@projects_bp.route('', methods=['POST'])
@token_required
def create_project(user_id):
    """Create new project"""
    try:
        data = request.get_json()
        schema = ProjectCreateSchema()
        validated_data = schema.load(data)

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
            tech_stack=validated_data.get('tech_stack', [])
        )

        # Add screenshots
        for url in validated_data.get('screenshot_urls', []):
            screenshot = ProjectScreenshot(url=url)
            project.screenshots.append(screenshot)

        # Calculate initial scores
        user = User.query.get(user_id)
        ProofScoreCalculator.update_project_scores(project)

        db.session.add(project)
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


from datetime import datetime
