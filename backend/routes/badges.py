"""
Badge routes
"""
from flask import Blueprint, request
from datetime import datetime
from marshmallow import ValidationError

from app import db
from models.badge import ValidationBadge
from models.project import Project
from schemas.badge import BadgeAwardSchema
from utils.decorators import admin_required
from utils.helpers import success_response, error_response
from utils.scores import ProofScoreCalculator
from utils.cache import CacheService

badges_bp = Blueprint('badges', __name__)


@badges_bp.route('/award', methods=['POST'])
@admin_required
def award_badge(user_id):
    """Award validation badge (admin only)"""
    try:
        data = request.get_json()
        schema = BadgeAwardSchema()
        validated_data = schema.load(data)

        project = Project.query.get(validated_data['project_id'])
        if not project:
            return error_response('Not found', 'Project not found', 404)

        # Create badge
        badge = ValidationBadge(
            project_id=validated_data['project_id'],
            validator_id=user_id,
            badge_type=validated_data['badge_type'],
            rationale=validated_data.get('rationale'),
            points=ValidationBadge.BADGE_POINTS[validated_data['badge_type']]
        )

        db.session.add(badge)

        # Recalculate project scores
        ProofScoreCalculator.update_project_scores(project)

        db.session.commit()
        CacheService.invalidate_project(validated_data['project_id'])

        return success_response(badge.to_dict(include_validator=True), 'Badge awarded', 201)

    except ValidationError as e:
        return error_response('Validation error', str(e.messages), 400)
    except Exception as e:
        db.session.rollback()
        return error_response('Error', str(e), 500)


@badges_bp.route('/<project_id>', methods=['GET'])
def get_project_badges(project_id):
    """Get badges for a project"""
    try:
        badges = ValidationBadge.query.filter_by(project_id=project_id).all()
        data = [b.to_dict(include_validator=True) for b in badges]

        return success_response(data, 'Badges retrieved', 200)
    except Exception as e:
        return error_response('Error', str(e), 500)
