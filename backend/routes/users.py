"""
User routes
"""
from flask import Blueprint, request
from marshmallow import ValidationError

from extensions import db
from models.user import User
from models.project import Project
from schemas.user import UserProfileUpdateSchema
from utils.decorators import token_required, optional_auth
from utils.helpers import success_response, error_response, paginated_response, get_pagination_params
from utils.cache import CacheService

users_bp = Blueprint('users', __name__)


@users_bp.route('/<username>', methods=['GET'])
@optional_auth
def get_user_profile(user_id, username):
    """Get user profile by username"""
    try:
        # Check cache (5 min TTL)
        cache_key = f"user_profile:{username}"
        cached = CacheService.get(cache_key)
        if cached:
            from flask import jsonify
            return jsonify(cached), 200

        user = User.query.filter_by(username=username).first()
        if not user:
            return error_response('Not found', 'User not found', 404)

        profile = user.to_dict()
        profile['project_count'] = user.projects.count()
        profile['karma'] = user.karma

        # Build response data
        response_data = {
            'status': 'success',
            'message': 'User profile retrieved',
            'data': profile
        }

        # Cache for 5 minutes
        CacheService.set(cache_key, response_data, ttl=300)

        from flask import jsonify
        return jsonify(response_data), 200
    except Exception as e:
        return error_response('Error', str(e), 500)


@users_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(user_id):
    """Update own profile"""
    try:
        user = User.query.get(user_id)
        if not user:
            return error_response('Not found', 'User not found', 404)

        data = request.get_json()
        schema = UserProfileUpdateSchema()
        validated_data = schema.load(data)

        for key, value in validated_data.items():
            if value is not None:
                setattr(user, key, value)

        db.session.commit()

        # Invalidate user cache
        CacheService.delete(f"user_profile:{user.username}")
        CacheService.invalidate_user(user_id)

        # Emit Socket.IO event for real-time profile updates
        from services.socket_service import SocketService
        SocketService.emit_profile_updated(user_id, user.to_dict())

        return success_response(user.to_dict(include_email=True), 'Profile updated', 200)

    except ValidationError as e:
        return error_response('Validation error', str(e.messages), 400)
    except Exception as e:
        db.session.rollback()
        return error_response('Error', str(e), 500)


@users_bp.route('/stats', methods=['GET'])
@token_required
def get_user_stats(user_id):
    """Get user statistics"""
    try:
        user = User.query.get(user_id)
        if not user:
            return error_response('Not found', 'User not found', 404)

        stats = {
            'user_id': user_id,
            'username': user.username,
            'project_count': user.projects.count(),
            'comment_count': user.comments.count(),
            'karma': user.karma,
            'badges_awarded': user.badges_awarded.count(),
            'intros_sent': user.intros_sent.count(),
            'intros_received': user.intros_received.count(),
        }

        return success_response(stats, 'User stats retrieved', 200)
    except Exception as e:
        return error_response('Error', str(e), 500)


@users_bp.route('/<user_id>/projects', methods=['GET'])
@optional_auth
def get_user_projects(current_user_id, user_id):
    """Get projects by user ID"""
    try:
        page, per_page = get_pagination_params(request)

        # Check cache (5 min TTL)
        cache_key = f"user_projects:{user_id}:page:{page}"
        cached = CacheService.get(cache_key)
        if cached:
            from flask import jsonify
            return jsonify(cached), 200

        # Query projects for this user
        query = Project.query.filter_by(user_id=user_id, is_deleted=False)
        query = query.order_by(Project.created_at.desc())

        total = query.count()
        projects = query.limit(per_page).offset((page - 1) * per_page).all()

        data = [p.to_dict(include_creator=True) for p in projects]

        # Build response data
        total_pages = (total + per_page - 1) // per_page
        response_data = {
            'status': 'success',
            'message': 'Success',
            'data': data,
            'pagination': {
                'total': total,
                'page': page,
                'per_page': per_page,
                'total_pages': total_pages,
            }
        }

        # Cache for 5 minutes
        CacheService.set(cache_key, response_data, ttl=300)

        from flask import jsonify
        return jsonify(response_data), 200
    except Exception as e:
        return error_response('Error', str(e), 500)


@users_bp.route('/leaderboard/projects', methods=['GET'])
@optional_auth
def get_projects_leaderboard(user_id):
    """Get top projects leaderboard sorted by upvotes"""
    try:
        limit = request.args.get('limit', 50, type=int)

        # Check cache (5 min TTL)
        cache_key = f"leaderboard_projects:{limit}"
        cached = CacheService.get(cache_key)
        if cached:
            from flask import jsonify
            return jsonify(cached), 200

        # Get top projects by upvotes (eager load creator to avoid N+1 queries)
        from sqlalchemy.orm import joinedload
        projects = Project.query.filter_by(is_deleted=False)\
            .options(joinedload(Project.creator))\
            .order_by(Project.upvotes.desc())\
            .limit(limit)\
            .all()

        data = []
        for rank, project in enumerate(projects, start=1):
            project_dict = project.to_dict(include_creator=True)
            project_dict['rank'] = rank
            data.append(project_dict)

        # Build response data
        response_data = {
            'status': 'success',
            'message': 'Projects leaderboard retrieved',
            'data': data
        }

        # Cache for 15 minutes (leaderboards don't change often)
        CacheService.set(cache_key, response_data, ttl=3600)  # 1 hour cache (auto-invalidates on changes)

        from flask import jsonify
        return jsonify(response_data), 200
    except Exception as e:
        return error_response('Error', str(e), 500)


@users_bp.route('/leaderboard/builders', methods=['GET'])
@optional_auth
def get_builders_leaderboard(user_id):
    """Get top builders leaderboard sorted by total karma/score"""
    try:
        limit = request.args.get('limit', 50, type=int)

        # Check cache (5 min TTL)
        cache_key = f"leaderboard_builders:{limit}"
        cached = CacheService.get(cache_key)
        if cached:
            from flask import jsonify
            return jsonify(cached), 200

        # Get top users by karma
        from sqlalchemy.orm import joinedload
        users = User.query.order_by(User.karma.desc()).limit(limit).all()

        data = []
        for rank, user in enumerate(users, start=1):
            user_dict = user.to_dict()
            user_dict['rank'] = rank
            user_dict['project_count'] = user.projects.filter_by(is_deleted=False).count()
            data.append(user_dict)

        # Build response data
        response_data = {
            'status': 'success',
            'message': 'Builders leaderboard retrieved',
            'data': data
        }

        # Cache for 15 minutes (leaderboards don't change often)
        CacheService.set(cache_key, response_data, ttl=3600)  # 1 hour cache (auto-invalidates on changes)

        from flask import jsonify
        return jsonify(response_data), 200
    except Exception as e:
        return error_response('Error', str(e), 500)
