"""
Authentication routes
"""
from flask import Blueprint, request, jsonify, redirect, current_app
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from marshmallow import ValidationError
from datetime import datetime
import requests
import secrets

from extensions import db
from models.user import User
from schemas.user import UserRegisterSchema, UserLoginSchema
from utils.validators import validate_email, validate_username, validate_password
from utils.helpers import success_response, error_response
from utils.decorators import token_required

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


# GitHub OAuth Routes
@auth_bp.route('/github/connect', methods=['GET'])
@jwt_required()
def github_connect():
    """Initiate GitHub OAuth flow for connecting GitHub account"""
    try:
        user_id = get_jwt_identity()

        # Store user_id in state parameter for security
        state = secrets.token_urlsafe(32)
        # In production, store state in Redis with user_id
        # For now, we'll encode user_id in the state (not recommended for production)
        state_with_user = f"{state}:{user_id}"

        github_auth_url = (
            f"https://github.com/login/oauth/authorize"
            f"?client_id={current_app.config['GITHUB_CLIENT_ID']}"
            f"&redirect_uri={current_app.config['GITHUB_REDIRECT_URI']}"
            f"&scope=read:user user:email"
            f"&state={state_with_user}"
        )

        return success_response({
            'auth_url': github_auth_url
        }, 'GitHub authorization URL generated', 200)

    except Exception as e:
        return error_response('Error', str(e), 500)


@auth_bp.route('/github/callback', methods=['GET'])
def github_callback():
    """Handle GitHub OAuth callback"""
    try:
        code = request.args.get('code')
        state = request.args.get('state')
        error = request.args.get('error')

        # Handle error from GitHub
        if error:
            frontend_url = current_app.config.get('CORS_ORIGINS', ['http://localhost:8080'])[0]
            return redirect(f"{frontend_url}/publish?github_error={error}")

        if not code:
            return error_response('Error', 'No authorization code provided', 400)

        # Extract user_id from state
        try:
            state_parts = state.split(':')
            if len(state_parts) == 2:
                user_id = state_parts[1]
            else:
                return error_response('Error', 'Invalid state parameter', 400)
        except:
            return error_response('Error', 'Invalid state parameter', 400)

        # Exchange code for access token
        token_response = requests.post(
            'https://github.com/login/oauth/access_token',
            headers={'Accept': 'application/json'},
            data={
                'client_id': current_app.config['GITHUB_CLIENT_ID'],
                'client_secret': current_app.config['GITHUB_CLIENT_SECRET'],
                'code': code,
            },
        )

        token_data = token_response.json()
        access_token = token_data.get('access_token')

        if not access_token:
            # Log the error for debugging
            error_msg = token_data.get('error', 'unknown')
            error_desc = token_data.get('error_description', 'No description')
            print(f"GitHub OAuth Error: {error_msg} - {error_desc}")
            print(f"Full response: {token_data}")
            frontend_url = current_app.config.get('CORS_ORIGINS', ['http://localhost:8080'])[0]
            return redirect(f"{frontend_url}/publish?github_error=token_failed&details={error_msg}")

        # Get user info from GitHub
        user_response = requests.get(
            'https://api.github.com/user',
            headers={'Authorization': f'token {access_token}'},
        )
        github_data = user_response.json()
        github_username = github_data.get('login')

        if not github_username:
            frontend_url = current_app.config.get('CORS_ORIGINS', ['http://localhost:8080'])[0]
            return redirect(f"{frontend_url}/publish?github_error=user_fetch_failed")

        # Update user with GitHub info
        user = User.query.get(user_id)
        if not user:
            return error_response('Error', 'User not found', 404)

        user.github_username = github_username
        user.github_connected = True
        db.session.commit()

        # Redirect back to frontend with success
        frontend_url = current_app.config.get('CORS_ORIGINS', ['http://localhost:8080'])[0]
        return redirect(f"{frontend_url}/publish?github_success=true&github_username={github_username}")

    except Exception as e:
        db.session.rollback()
        frontend_url = current_app.config.get('CORS_ORIGINS', ['http://localhost:8080'])[0]
        return redirect(f"{frontend_url}/publish?github_error=connection_failed")


@auth_bp.route('/github/disconnect', methods=['POST'])
@jwt_required()
def github_disconnect():
    """Disconnect GitHub account"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return error_response('Error', 'User not found', 404)

        user.github_username = None
        user.github_connected = False
        db.session.commit()

        return success_response(None, 'GitHub account disconnected', 200)

    except Exception as e:
        db.session.rollback()
        return error_response('Error', str(e), 500)
