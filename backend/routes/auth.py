"""
Authentication routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from marshmallow import ValidationError
from datetime import datetime

from extensions import db
from models.user import User
from schemas.user import UserRegisterSchema, UserLoginSchema
from utils.validators import validate_email, validate_username, validate_password
from utils.helpers import success_response, error_response

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        schema = UserRegisterSchema()
        validated_data = schema.load(data)

        # Check if user already exists
        if User.query.filter_by(email=validated_data['email']).first():
            return error_response('User already exists', 'Email is already registered', 409)

        if User.query.filter_by(username=validated_data['username']).first():
            return error_response('Username taken', 'Username is already in use', 409)

        # Validate password strength
        is_valid, msg = validate_password(validated_data['password'])
        if not is_valid:
            return error_response('Weak password', msg, 400)

        # Create user
        user = User(
            email=validated_data['email'],
            username=validated_data['username'],
            display_name=validated_data.get('display_name', validated_data['username']),
            email_verified=True  # Auto-verify for MVP (no email service yet)
        )
        user.set_password(validated_data['password']) 

        db.session.add(user)
        db.session.commit()

        # Generate tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)

        return success_response({
            'user': user.to_dict(include_email=True),
            'tokens': {
                'access': access_token,
                'refresh': refresh_token
            }
        }, 'User registered successfully', 201)

    except ValidationError as e:
        return error_response('Validation error', str(e.messages), 400)
    except Exception as e:
        db.session.rollback()
        return error_response('Registration failed', str(e), 500)


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        schema = UserLoginSchema()
        validated_data = schema.load(data)

        # Find user
        user = User.query.filter_by(email=validated_data['email']).first()
        if not user or not user.check_password(validated_data['password']):
            return error_response('Invalid credentials', 'Email or password is incorrect', 401)

        if not user.is_active:
            return error_response('Account disabled', 'This account has been disabled', 403)

        # Generate tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)

        return success_response({
            'user': user.to_dict(include_email=True),
            'tokens': {
                'access': access_token,
                'refresh': refresh_token
            }
        }, 'Login successful', 200)

    except ValidationError as e:
        return error_response('Validation error', str(e.messages), 400)
    except Exception as e:
        return error_response('Login failed', str(e), 500)


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user info"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return error_response('User not found', 'User account not found', 404)

        return success_response(user.to_dict(include_email=True), 'User retrieved successfully', 200)

    except Exception as e:
        return error_response('Error', str(e), 500)


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh_token():
    """Refresh access token"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user or not user.is_active:
            return error_response('Invalid user', 'User not found or inactive', 401)

        access_token = create_access_token(identity=user.id)

        return success_response({
            'access': access_token
        }, 'Token refreshed successfully', 200)

    except Exception as e:
        return error_response('Error', str(e), 500)


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user (token blacklist - implement if needed)"""
    return success_response(None, 'Logged out successfully', 200)


@auth_bp.route('/verify-email', methods=['POST'])
def verify_email():
    """Verify email address (placeholder)"""
    try:
        data = request.get_json()
        token = data.get('token')

        # TODO: Implement email verification token logic
        # For MVP, just mark email as verified directly
        return success_response(None, 'Email verification not yet implemented', 501)

    except Exception as e:
        return error_response('Error', str(e), 500)
