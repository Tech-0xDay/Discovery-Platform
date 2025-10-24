"""
Investor Request Routes
"""
from flask import Blueprint, request, jsonify
from datetime import datetime
from extensions import db
from models.investor_request import InvestorRequest
from models.user import User
from utils.decorators import token_required


investor_requests_bp = Blueprint('investor_requests', __name__, url_prefix='/api/investor-requests')


@investor_requests_bp.route('/apply', methods=['POST'])
@token_required
def apply_for_investor(user_id):
    """Apply for investor account"""
    try:
        data = request.get_json()

        # Check if user already has a pending or approved request
        existing_request = InvestorRequest.query.filter_by(user_id=user_id).first()
        if existing_request:
            if existing_request.status == 'pending':
                return jsonify({
                    'status': 'error',
                    'message': 'You already have a pending investor request'
                }), 400
            elif existing_request.status == 'approved':
                return jsonify({
                    'status': 'error',
                    'message': 'You are already an approved investor'
                }), 400

        # Create new investor request
        investor_request = InvestorRequest(
            user_id=user_id,
            plan_type=data.get('plan_type', 'free'),
            company_name=data.get('company_name'),
            linkedin_url=data.get('linkedin_url'),
            reason=data.get('reason'),
        )

        db.session.add(investor_request)
        db.session.commit()

        return jsonify({
            'status': 'success',
            'message': 'Investor request submitted successfully',
            'data': investor_request.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@investor_requests_bp.route('/pending', methods=['GET'])
def get_pending_requests():
    """Get all pending investor requests"""
    try:
        requests = InvestorRequest.query.filter_by(status='pending').order_by(
            InvestorRequest.created_at.desc()
        ).all()

        return jsonify({
            'status': 'success',
            'data': [req.to_dict() for req in requests]
        }), 200

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@investor_requests_bp.route('/all', methods=['GET'])
def get_all_requests():
    """Get all investor requests"""
    try:
        status_filter = request.args.get('status')  # pending, approved, rejected
        query = InvestorRequest.query

        if status_filter:
            query = query.filter_by(status=status_filter)

        requests = query.order_by(InvestorRequest.created_at.desc()).all()

        return jsonify({
            'status': 'success',
            'data': [req.to_dict() for req in requests]
        }), 200

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@investor_requests_bp.route('/<request_id>/approve', methods=['POST'])
def approve_request(request_id):
    """Approve investor request"""
    try:
        investor_request = InvestorRequest.query.get(request_id)
        if not investor_request:
            return jsonify({
                'status': 'error',
                'message': 'Request not found'
            }), 404

        # Update request status
        investor_request.status = 'approved'
        investor_request.reviewed_by = None
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
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@investor_requests_bp.route('/<request_id>/reject', methods=['POST'])
def reject_request(request_id):
    """Reject investor request"""
    try:
        investor_request = InvestorRequest.query.get(request_id)
        if not investor_request:
            return jsonify({
                'status': 'error',
                'message': 'Request not found'
            }), 404

        # Update request status
        investor_request.status = 'rejected'
        investor_request.reviewed_by = None
        investor_request.reviewed_at = datetime.utcnow()

        db.session.commit()

        return jsonify({
            'status': 'success',
            'message': 'Investor request rejected',
            'data': investor_request.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@investor_requests_bp.route('/my-request', methods=['GET'])
@token_required
def get_my_request(user_id):
    """Get current user's investor request status"""
    try:
        investor_request = InvestorRequest.query.filter_by(user_id=user_id).first()

        if not investor_request:
            return jsonify({
                'status': 'success',
                'data': None
            }), 200

        return jsonify({
            'status': 'success',
            'data': investor_request.to_dict()
        }), 200

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
