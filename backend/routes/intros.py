"""
Intro request routes
"""
from flask import Blueprint, request
from datetime import datetime
from marshmallow import ValidationError

from app import db
from models.intro import Intro
from models.project import Project
from models.user import User
from schemas.intro import IntroCreateSchema, IntroUpdateSchema
from utils.decorators import token_required
from utils.helpers import success_response, error_response, paginated_response, get_pagination_params

intros_bp = Blueprint('intros', __name__)


@intros_bp.route('/request', methods=['POST'])
@token_required
def request_intro(user_id):
    """Request intro to a project creator"""
    try:
        data = request.get_json()
        schema = IntroCreateSchema()
        validated_data = schema.load(data)

        project = Project.query.get(validated_data['project_id'])
        if not project:
            return error_response('Not found', 'Project not found', 404)

        recipient = User.query.get(validated_data['recipient_id'])
        if not recipient:
            return error_response('Not found', 'Recipient not found', 404)

        # Create intro request
        intro = Intro(
            project_id=validated_data['project_id'],
            requester_id=user_id,
            recipient_id=validated_data['recipient_id'],
            message=validated_data.get('message'),
            requester_contact=validated_data.get('requester_contact')
        )

        db.session.add(intro)
        db.session.commit()

        return success_response(intro.to_dict(include_users=True), 'Intro requested', 201)

    except ValidationError as e:
        return error_response('Validation error', str(e.messages), 400)
    except Exception as e:
        db.session.rollback()
        return error_response('Error', str(e), 500)


@intros_bp.route('/<intro_id>/accept', methods=['PUT'])
@token_required
def accept_intro(user_id, intro_id):
    """Accept intro request"""
    try:
        intro = Intro.query.get(intro_id)
        if not intro:
            return error_response('Not found', 'Intro request not found', 404)

        if intro.recipient_id != user_id:
            return error_response('Forbidden', 'You can only accept intros addressed to you', 403)

        intro.status = 'accepted'
        intro.accepted_at = datetime.utcnow()

        db.session.commit()

        return success_response(intro.to_dict(include_users=True), 'Intro accepted', 200)

    except Exception as e:
        db.session.rollback()
        return error_response('Error', str(e), 500)


@intros_bp.route('/<intro_id>/decline', methods=['PUT'])
@token_required
def decline_intro(user_id, intro_id):
    """Decline intro request"""
    try:
        intro = Intro.query.get(intro_id)
        if not intro:
            return error_response('Not found', 'Intro request not found', 404)

        if intro.recipient_id != user_id:
            return error_response('Forbidden', 'You can only decline intros addressed to you', 403)

        intro.status = 'declined'
        intro.declined_at = datetime.utcnow()

        db.session.commit()

        return success_response(intro.to_dict(include_users=True), 'Intro declined', 200)

    except Exception as e:
        db.session.rollback()
        return error_response('Error', str(e), 500)


@intros_bp.route('/received', methods=['GET'])
@token_required
def get_received_intros(user_id):
    """Get intros received by user"""
    try:
        page, per_page = get_pagination_params(request)

        query = Intro.query.filter_by(recipient_id=user_id).order_by(Intro.created_at.desc())
        total = query.count()
        intros = query.limit(per_page).offset((page - 1) * per_page).all()

        data = [i.to_dict(include_users=True) for i in intros]

        return paginated_response(data, total, page, per_page)
    except Exception as e:
        return error_response('Error', str(e), 500)


@intros_bp.route('/sent', methods=['GET'])
@token_required
def get_sent_intros(user_id):
    """Get intros sent by user"""
    try:
        page, per_page = get_pagination_params(request)

        query = Intro.query.filter_by(requester_id=user_id).order_by(Intro.created_at.desc())
        total = query.count()
        intros = query.limit(per_page).offset((page - 1) * per_page).all()

        data = [i.to_dict(include_users=True) for i in intros]

        return paginated_response(data, total, page, per_page)
    except Exception as e:
        return error_response('Error', str(e), 500)
