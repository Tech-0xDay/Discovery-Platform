"""
Admin Authentication Routes
"""
from flask import Blueprint, request, jsonify, session
import os

admin_auth_bp = Blueprint('admin_auth', __name__, url_prefix='/api/admin')

# Admin password from environment or default
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'Admin')


@admin_auth_bp.route('/login', methods=['POST'])
def admin_login():
    """Admin login endpoint"""
    try:
        data = request.get_json()
        password = data.get('password')

        if not password:
            return jsonify({
                'status': 'error',
                'message': 'Password is required'
            }), 400

        if password == ADMIN_PASSWORD:
            session['admin_authenticated'] = True
            return jsonify({
                'status': 'success',
                'message': 'Admin authenticated successfully'
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': 'Invalid password'
            }), 401

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@admin_auth_bp.route('/logout', methods=['POST'])
def admin_logout():
    """Admin logout endpoint"""
    try:
        session.pop('admin_authenticated', None)
        return jsonify({
            'status': 'success',
            'message': 'Logged out successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@admin_auth_bp.route('/check', methods=['GET'])
def check_admin():
    """Check if admin is authenticated"""
    is_authenticated = session.get('admin_authenticated', False)
    return jsonify({
        'status': 'success',
        'authenticated': is_authenticated,
        'session_data': dict(session)  # Debug: show session contents
    }), 200
