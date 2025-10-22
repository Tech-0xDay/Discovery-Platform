"""
User routes
"""
from flask import Blueprint, request
from marshmallow import ValidationError

from app import db
from models.user import User
from schemas.user import UserProfileUpdateSchema
from utils.decorators import token_required, optional_auth
from utils.helpers import success_response, error_response

users_bp = Blueprint('users', __name__)


@users_bp.route('/<username>', methods=['GET'])
@optional_auth
def get_user_profile(user_id, username):
    """Get user profile by username"""
    try:
        user = User.query.filter_by(username=username).first()
        if not user:
            return error_response('Not found', 'User not found', 404)

        profile = user.to_dict()
        profile['project_count'] = user.projects.count()
        profile['karma'] = user.karma

        return success_response(profile, 'User profile retrieved', 200)
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
