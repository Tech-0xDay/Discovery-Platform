"""
Admin Routes - Comprehensive admin panel
"""
from flask import Blueprint, request, jsonify
from datetime import datetime
from extensions import db
from models.user import User
from models.project import Project
from models.badge import ValidationBadge
from models.investor_request import InvestorRequest
from models.validator_permissions import ValidatorPermissions
from utils.decorators import admin_required
from utils.cache import CacheService
from services.socket_service import SocketService
from utils.scores import ProofScoreCalculator

admin_bp = Blueprint('admin', __name__)


# ============================================================================
# USER MANAGEMENT
# ============================================================================

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users(user_id):
    """Get all users with pagination and filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        search = request.args.get('search', '')
        role_filter = request.args.get('role', '')  # 'admin', 'validator', 'investor', 'regular'

        query = User.query

        # Search filter
        if search:
            query = query.filter(
                db.or_(
                    User.username.ilike(f'%{search}%'),
                    User.email.ilike(f'%{search}%'),
                    User.display_name.ilike(f'%{search}%')
                )
            )

        # Role filter
        if role_filter == 'admin':
            query = query.filter(User.is_admin == True)
        elif role_filter == 'validator':
            query = query.filter(User.is_validator == True)
        elif role_filter == 'investor':
            query = query.filter(User.is_investor == True)
        elif role_filter == 'regular':
            query = query.filter(
                User.is_admin == False,
                User.is_validator == False,
                User.is_investor == False
            )

        # Pagination
        users = query.order_by(User.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

        return jsonify({
            'status': 'success',
            'data': {
                'users': [user.to_dict(include_email=True) for user in users.items],
                'total': users.total,
                'pages': users.pages,
                'current_page': page,
            }
        }), 200

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@admin_bp.route('/users/<user_id>/toggle-admin', methods=['POST'])
@admin_required
def toggle_admin(admin_id, user_id):
    """Make user admin or remove admin status"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404

        user.is_admin = not user.is_admin
        db.session.commit()

        action = 'granted' if user.is_admin else 'removed'
        return jsonify({
            'status': 'success',
            'message': f'Admin access {action} for {user.username}',
            'data': user.to_dict(include_email=True)
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500


@admin_bp.route('/users/<user_id>/toggle-active', methods=['POST'])
@admin_required
def toggle_user_active(admin_id, user_id):
    """Ban or unban a user"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404

        # Prevent self-ban
        if user_id == admin_id:
            return jsonify({'status': 'error', 'message': 'Cannot ban yourself'}), 400

        user.is_active = not user.is_active
        db.session.commit()

        action = 'activated' if user.is_active else 'banned'
        return jsonify({
            'status': 'success',
            'message': f'User {action} successfully',
            'data': user.to_dict(include_email=True)
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500


@admin_bp.route('/users/<user_id>', methods=['DELETE'])
@admin_required
def delete_user(admin_id, user_id):
    """Delete a user and all their data"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404

        # Prevent self-deletion
        if user_id == admin_id:
            return jsonify({'status': 'error', 'message': 'Cannot delete yourself'}), 400

        username = user.username
        db.session.delete(user)
        db.session.commit()

        return jsonify({
            'status': 'success',
            'message': f'User {username} deleted successfully'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500


# ============================================================================
# VALIDATOR MANAGEMENT
# ============================================================================

@admin_bp.route('/validators', methods=['GET'])
@admin_required
def get_all_validators(user_id):
    """Get all validators with their permissions"""
    try:
        validators = User.query.filter(User.is_validator == True).all()

        validators_data = []
        for validator in validators:
            validator_dict = validator.to_dict(include_email=True)

            # Get permissions if exists
            permissions = ValidatorPermissions.query.filter_by(validator_id=validator.id).first()
            if permissions:
                validator_dict['permissions'] = permissions.to_dict()
            else:
                validator_dict['permissions'] = {
                    'can_validate_all': False,
                    'allowed_badge_types': [],
                    'allowed_project_ids': []
                }

            validators_data.append(validator_dict)

        return jsonify({
            'status': 'success',
            'data': validators_data
        }), 200

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@admin_bp.route('/validators/add-email', methods=['POST'])
@admin_required
def add_validator_by_email(user_id):
    """Add validator by email - create account if doesn't exist"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()

        if not email:
            return jsonify({'status': 'error', 'message': 'Email is required'}), 400

        # Check if user exists
        user = User.query.filter_by(email=email).first()

        if not user:
            # User doesn't exist - return message to create account first
            return jsonify({
                'status': 'pending',
                'message': 'No account found with this email. Please ask the user to create an account first.',
                'email': email
            }), 404

        # User exists - make them validator
        if user.is_validator:
            return jsonify({
                'status': 'info',
                'message': f'{user.username} is already a validator'
            }), 200

        user.is_validator = True
        user.validator_approved_at = datetime.utcnow()
        user.validator_approved_by = user_id

        # Create default permissions
        permissions = ValidatorPermissions(
            validator_id=user.id,
            can_validate_all=False,
            allowed_badge_types=['stone', 'silver', 'gold', 'platinum', 'demerit'],
            allowed_project_ids=[]
        )
        db.session.add(permissions)
        db.session.commit()

        return jsonify({
            'status': 'success',
            'message': f'{user.username} is now a validator',
            'data': user.to_dict(include_email=True)
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500


@admin_bp.route('/validators/<validator_id>/remove', methods=['POST'])
@admin_required
def remove_validator(user_id, validator_id):
    """Remove validator status"""
    try:
        validator = User.query.get(validator_id)
        if not validator:
            return jsonify({'status': 'error', 'message': 'Validator not found'}), 404

        validator.is_validator = False

        # Delete permissions
        permissions = ValidatorPermissions.query.filter_by(validator_id=validator_id).first()
        if permissions:
            db.session.delete(permissions)

        db.session.commit()

        return jsonify({
            'status': 'success',
            'message': f'Validator access removed from {validator.username}'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500


@admin_bp.route('/validators/<validator_id>/permissions', methods=['POST'])
@admin_required
def update_validator_permissions(user_id, validator_id):
    """Update validator permissions"""
    try:
        data = request.get_json()

        validator = User.query.get(validator_id)
        if not validator or not validator.is_validator:
            return jsonify({'status': 'error', 'message': 'Validator not found'}), 404

        # Get or create permissions
        permissions = ValidatorPermissions.query.filter_by(validator_id=validator_id).first()
        if not permissions:
            permissions = ValidatorPermissions(validator_id=validator_id)
            db.session.add(permissions)

        # Update permissions
        if 'can_validate_all' in data:
            permissions.can_validate_all = data['can_validate_all']

        if 'allowed_badge_types' in data:
            permissions.allowed_badge_types = data['allowed_badge_types']

        if 'allowed_project_ids' in data:
            permissions.allowed_project_ids = data['allowed_project_ids']

        permissions.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            'status': 'success',
            'message': 'Permissions updated successfully',
            'data': permissions.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500


# ============================================================================
# PROJECT MANAGEMENT
# ============================================================================

@admin_bp.route('/projects', methods=['GET'])
@admin_required
def get_all_projects(user_id):
    """Get all projects with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        search = request.args.get('search', '')

        query = Project.query

        if search:
            query = query.filter(
                db.or_(
                    Project.title.ilike(f'%{search}%'),
                    Project.description.ilike(f'%{search}%')
                )
            )

        projects = query.order_by(Project.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

        return jsonify({
            'status': 'success',
            'data': {
                'projects': [project.to_dict(include_creator=True) for project in projects.items],
                'total': projects.total,
                'pages': projects.pages,
                'current_page': page,
            }
        }), 200

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@admin_bp.route('/projects/<project_id>', methods=['PUT'])
@admin_required
def update_project(user_id, project_id):
    """Edit any project"""
    try:
        project = Project.query.get(project_id)
        if not project:
            return jsonify({'status': 'error', 'message': 'Project not found'}), 404

        data = request.get_json()

        # Update allowed fields
        allowed_fields = ['title', 'description', 'demo_url', 'github_url', 'category', 'tags']
        for field in allowed_fields:
            if field in data:
                setattr(project, field, data[field])

        project.updated_at = datetime.utcnow()
        db.session.commit()

        # Invalidate cache
        CacheService.invalidate_project(project_id)

        return jsonify({
            'status': 'success',
            'message': 'Project updated successfully',
            'data': project.to_dict(include_creator=True)
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500


@admin_bp.route('/projects/<project_id>', methods=['DELETE'])
@admin_required
def delete_project(user_id, project_id):
    """Delete any project"""
    try:
        project = Project.query.get(project_id)
        if not project:
            return jsonify({'status': 'error', 'message': 'Project not found'}), 404

        title = project.title
        db.session.delete(project)
        db.session.commit()

        # Invalidate cache
        CacheService.invalidate_project(project_id)

        return jsonify({
            'status': 'success',
            'message': f'Project "{title}" deleted successfully'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500


@admin_bp.route('/projects/<project_id>/feature', methods=['POST'])
@admin_required
def feature_project(user_id, project_id):
    """Feature or unfeature a project"""
    try:
        project = Project.query.get(project_id)
        if not project:
            return jsonify({'status': 'error', 'message': 'Project not found'}), 404

        project.is_featured = not project.is_featured
        db.session.commit()

        # Invalidate cache
        CacheService.invalidate_project(project_id)

        action = 'featured' if project.is_featured else 'unfeatured'
        return jsonify({
            'status': 'success',
            'message': f'Project {action} successfully',
            'data': project.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500


# ============================================================================
# BADGE MANAGEMENT
# ============================================================================

@admin_bp.route('/badges', methods=['GET'])
@admin_required
def get_all_badges(user_id):
    """Get all badges with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        project_id = request.args.get('project_id', '')

        query = ValidationBadge.query

        if project_id:
            query = query.filter_by(project_id=project_id)

        badges = query.order_by(ValidationBadge.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

        return jsonify({
            'status': 'success',
            'data': {
                'badges': [badge.to_dict(include_validator=True) for badge in badges.items],
                'total': badges.total,
                'pages': badges.pages,
                'current_page': page,
            }
        }), 200

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@admin_bp.route('/badges/award', methods=['POST'])
@admin_required
def award_badge_admin(user_id):
    """Award badge (standard or custom)"""
    try:
        data = request.get_json()
        project_id = data.get('project_id')
        badge_type = data.get('badge_type')
        rationale = data.get('rationale', '')
        custom_name = data.get('custom_name')
        custom_image = data.get('custom_image')
        points = data.get('points', 0)

        if not project_id or not badge_type:
            return jsonify({'status': 'error', 'message': 'project_id and badge_type required'}), 400

        project = Project.query.get(project_id)
        if not project:
            return jsonify({'status': 'error', 'message': 'Project not found'}), 404

        # Handle custom badge
        if badge_type == 'custom':
            if not custom_name:
                return jsonify({'status': 'error', 'message': 'custom_name required for custom badges'}), 400

            badge = ValidationBadge(
                project_id=project_id,
                validator_id=user_id,
                badge_type='custom',
                rationale=rationale,
                points=points,
                custom_badge_name=custom_name,
                custom_badge_image_url=custom_image
            )
        else:
            # Standard badge
            if badge_type not in ValidationBadge.BADGE_POINTS:
                return jsonify({'status': 'error', 'message': 'Invalid badge type'}), 400

            badge = ValidationBadge(
                project_id=project_id,
                validator_id=user_id,
                badge_type=badge_type,
                rationale=rationale,
                points=ValidationBadge.BADGE_POINTS[badge_type]
            )

        db.session.add(badge)

        # Update project scores
        ProofScoreCalculator.update_project_scores(project)

        db.session.commit()

        # Invalidate cache and emit real-time update
        CacheService.invalidate_project(project_id)
        SocketService.emit_badge_awarded(project_id, badge.to_dict(include_validator=True))

        return jsonify({
            'status': 'success',
            'message': 'Badge awarded successfully',
            'data': badge.to_dict(include_validator=True)
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500


@admin_bp.route('/badges/<badge_id>', methods=['DELETE'])
@admin_required
def delete_badge(user_id, badge_id):
    """Delete any badge"""
    try:
        badge = ValidationBadge.query.get(badge_id)
        if not badge:
            return jsonify({'status': 'error', 'message': 'Badge not found'}), 404

        project_id = badge.project_id
        project = badge.project

        db.session.delete(badge)

        # Recalculate project scores
        if project:
            ProofScoreCalculator.update_project_scores(project)

        db.session.commit()

        # Invalidate cache
        CacheService.invalidate_project(project_id)

        return jsonify({
            'status': 'success',
            'message': 'Badge deleted successfully'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500


# ============================================================================
# INVESTOR REQUEST MANAGEMENT
# ============================================================================

@admin_bp.route('/investor-requests', methods=['GET'])
@admin_required
def get_investor_requests(user_id):
    """Get all investor requests"""
    try:
        status_filter = request.args.get('status', '')  # 'pending', 'approved', 'rejected'

        query = InvestorRequest.query

        if status_filter:
            query = query.filter_by(status=status_filter)

        requests = query.order_by(InvestorRequest.created_at.desc()).all()

        return jsonify({
            'status': 'success',
            'data': [req.to_dict() for req in requests]
        }), 200

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@admin_bp.route('/investor-requests/<request_id>/approve', methods=['POST'])
@admin_required
def approve_investor_request(user_id, request_id):
    """Approve investor request"""
    try:
        investor_request = InvestorRequest.query.get(request_id)
        if not investor_request:
            return jsonify({'status': 'error', 'message': 'Request not found'}), 404

        investor_request.status = 'approved'
        investor_request.reviewed_by = user_id
        investor_request.reviewed_at = datetime.utcnow()

        # Update user to investor
        user = User.query.get(investor_request.user_id)
        if user:
            user.is_investor = True

        db.session.commit()

        return jsonify({
            'status': 'success',
            'message': 'Investor request approved',
            'data': investor_request.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500


@admin_bp.route('/investor-requests/<request_id>/reject', methods=['POST'])
@admin_required
def reject_investor_request(user_id, request_id):
    """Reject investor request"""
    try:
        investor_request = InvestorRequest.query.get(request_id)
        if not investor_request:
            return jsonify({'status': 'error', 'message': 'Request not found'}), 404

        investor_request.status = 'rejected'
        investor_request.reviewed_by = user_id
        investor_request.reviewed_at = datetime.utcnow()

        db.session.commit()

        return jsonify({
            'status': 'success',
            'message': 'Investor request rejected',
            'data': investor_request.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500


# ============================================================================
# ANALYTICS & STATS
# ============================================================================

@admin_bp.route('/stats', methods=['GET'])
@admin_required
def get_platform_stats(user_id):
    """Get platform statistics"""
    try:
        # User stats
        total_users = User.query.count()
        active_users = User.query.filter_by(is_active=True).count()
        admins = User.query.filter_by(is_admin=True).count()
        validators = User.query.filter_by(is_validator=True).count()
        investors = User.query.filter_by(is_investor=True).count()

        # Project stats
        total_projects = Project.query.count()
        featured_projects = Project.query.filter_by(is_featured=True).count()

        # Badge stats
        total_badges = ValidationBadge.query.count()
        badge_breakdown = {}
        for badge_type in ['stone', 'silver', 'gold', 'platinum', 'demerit', 'custom']:
            count = ValidationBadge.query.filter_by(badge_type=badge_type).count()
            badge_breakdown[badge_type] = count

        # Investor request stats
        pending_investor_requests = InvestorRequest.query.filter_by(status='pending').count()
        approved_investor_requests = InvestorRequest.query.filter_by(status='approved').count()

        return jsonify({
            'status': 'success',
            'data': {
                'users': {
                    'total': total_users,
                    'active': active_users,
                    'admins': admins,
                    'validators': validators,
                    'investors': investors,
                },
                'projects': {
                    'total': total_projects,
                    'featured': featured_projects,
                },
                'badges': {
                    'total': total_badges,
                    'breakdown': badge_breakdown,
                },
                'investor_requests': {
                    'pending': pending_investor_requests,
                    'approved': approved_investor_requests,
                }
            }
        }), 200

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
