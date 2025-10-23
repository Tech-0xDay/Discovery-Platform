"""
Intro Request Routes
"""
from flask import Blueprint, request, jsonify
from extensions import db
from models.intro_request import IntroRequest
from models.project import Project
from models.direct_message import DirectMessage
from utils.decorators import token_required


intro_requests_bp = Blueprint('intro_requests', __name__, url_prefix='/api/intro-requests')


@intro_requests_bp.route('/send', methods=['POST'])
@token_required
def send_intro_request(current_user):
    """Send intro request from investor to project builder"""
    try:
        # Check if user is investor
        if not current_user.is_investor:
            return jsonify({
                'status': 'error',
                'message': 'Only investors can request intros'
            }), 403

        data = request.get_json()
        project_id = data.get('project_id')
        message = data.get('message', '')

        if not project_id:
            return jsonify({
                'status': 'error',
                'message': 'Project ID is required'
            }), 400

        # Get project
        project = Project.query.get(project_id)
        if not project:
            return jsonify({
                'status': 'error',
                'message': 'Project not found'
            }), 404

        # Check if intro request already exists
        existing_request = IntroRequest.query.filter_by(
            project_id=project_id,
            investor_id=current_user.id
        ).first()

        if existing_request:
            if existing_request.status == 'pending':
                return jsonify({
                    'status': 'error',
                    'message': 'You already have a pending intro request for this project'
                }), 400
            elif existing_request.status == 'accepted':
                return jsonify({
                    'status': 'error',
                    'message': 'You already have an accepted intro request for this project'
                }), 400

        # Create intro request
        intro_request = IntroRequest(
            project_id=project_id,
            investor_id=current_user.id,
            builder_id=project.user_id,
            message=message
        )

        db.session.add(intro_request)
        db.session.commit()

        return jsonify({
            'status': 'success',
            'message': 'Intro request sent successfully',
            'data': intro_request.to_dict(include_project=True, include_users=True)
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@intro_requests_bp.route('/received', methods=['GET'])
@token_required
def get_received_requests(current_user):
    """Get intro requests received by current user (as builder)"""
    try:
        status_filter = request.args.get('status')  # pending, accepted, declined
        query = IntroRequest.query.filter_by(builder_id=current_user.id)

        if status_filter:
            query = query.filter_by(status=status_filter)

        requests = query.order_by(IntroRequest.created_at.desc()).all()

        return jsonify({
            'status': 'success',
            'data': [req.to_dict(include_project=True, include_users=True) for req in requests]
        }), 200

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@intro_requests_bp.route('/sent', methods=['GET'])
@token_required
def get_sent_requests(current_user):
    """Get intro requests sent by current user (as investor)"""
    try:
        status_filter = request.args.get('status')  # pending, accepted, declined
        query = IntroRequest.query.filter_by(investor_id=current_user.id)

        if status_filter:
            query = query.filter_by(status=status_filter)

        requests = query.order_by(IntroRequest.created_at.desc()).all()

        return jsonify({
            'status': 'success',
            'data': [req.to_dict(include_project=True, include_users=True) for req in requests]
        }), 200

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@intro_requests_bp.route('/<request_id>/accept', methods=['POST'])
@token_required
def accept_request(current_user, request_id):
    """Accept intro request (builder only)"""
    try:
        intro_request = IntroRequest.query.get(request_id)
        if not intro_request:
            return jsonify({
                'status': 'error',
                'message': 'Request not found'
            }), 404

        # Check if current user is the builder
        if intro_request.builder_id != current_user.id:
            return jsonify({
                'status': 'error',
                'message': 'You are not authorized to accept this request'
            }), 403

        # Update status
        intro_request.status = 'accepted'

        # Create initial direct message to start the conversation
        # Send from builder to investor to initialize the conversation
        initial_message = DirectMessage(
            sender_id=current_user.id,  # Builder
            recipient_id=intro_request.investor_id,
            message=f"Hi! I accepted your intro request. Looking forward to connecting!"
        )

        db.session.add(initial_message)
        db.session.commit()

        return jsonify({
            'status': 'success',
            'message': 'Intro request accepted and conversation started',
            'data': intro_request.to_dict(include_project=True, include_users=True)
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@intro_requests_bp.route('/<request_id>/decline', methods=['POST'])
@token_required
def decline_request(current_user, request_id):
    """Decline intro request (builder only)"""
    try:
        intro_request = IntroRequest.query.get(request_id)
        if not intro_request:
            return jsonify({
                'status': 'error',
                'message': 'Request not found'
            }), 404

        # Check if current user is the builder
        if intro_request.builder_id != current_user.id:
            return jsonify({
                'status': 'error',
                'message': 'You are not authorized to decline this request'
            }), 403

        # Update status
        intro_request.status = 'declined'
        db.session.commit()

        return jsonify({
            'status': 'success',
            'message': 'Intro request declined',
            'data': intro_request.to_dict(include_project=True, include_users=True)
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
