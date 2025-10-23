"""
Custom decorators for authentication and authorization
"""
from functools import wraps
from flask import jsonify, session, request
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models.user import User
from app import db


def token_required(f):
    """Decorator to require JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if not user or not user.is_active:
                return jsonify({'error': 'User not found or inactive'}), 401
        except Exception as e:
            return jsonify({'error': 'Unauthorized', 'message': str(e)}), 401

        return f(user_id, *args, **kwargs)

    return decorated


def admin_required(f):
    """Decorator to require admin role"""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if not user or not user.is_active:
                return jsonify({'error': 'User not found or inactive'}), 401
            if not user.is_admin:
                return jsonify({'error': 'Admin access required'}), 403
        except Exception as e:
            return jsonify({'error': 'Unauthorized', 'message': str(e)}), 401

        return f(user_id, *args, **kwargs)

    return decorated


def optional_auth(f):
    """Decorator for optional authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        user_id = None
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if user and not user.is_active:
                user_id = None
        except Exception:
            pass

        return f(user_id, *args, **kwargs)

    return decorated


def admin_or_session_required(f):
    """Decorator that accepts both JWT admin token OR session-based admin auth OR password in header"""
    @wraps(f)
    def decorated(*args, **kwargs):
        # Check for admin password in header (for admin+validator page)
        admin_password = request.headers.get('X-Admin-Password')
        if admin_password == 'Admin':
            # Return special admin_session ID
            return f('admin_session', *args, **kwargs)

        # Check for session-based admin authentication
        if session.get('admin_authenticated'):
            # Return special admin_session ID
            return f('admin_session', *args, **kwargs)

        # If no session/password, check for JWT token
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if not user or not user.is_active:
                return jsonify({'error': 'User not found or inactive'}), 401
            if not user.is_admin:
                return jsonify({'error': 'Admin access required'}), 403
            return f(user_id, *args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Unauthorized', 'message': str(e)}), 401

    return decorated
