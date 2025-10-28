"""
Vote routes
"""
from flask import Blueprint, request

from extensions import db
from models.vote import Vote
from models.project import Project
from schemas.vote import VoteCreateSchema
from utils.decorators import token_required
from utils.helpers import success_response, error_response
from utils.scores import ProofScoreCalculator
from utils.cache import CacheService
from marshmallow import ValidationError

votes_bp = Blueprint('votes', __name__)


@votes_bp.route('', methods=['POST'])
@token_required
def cast_vote(user_id):
    """Cast or remove vote"""
    try:
        data = request.get_json()
        schema = VoteCreateSchema()
        validated_data = schema.load(data)

        project_id = validated_data['project_id']
        vote_type = validated_data['vote_type']

        project = Project.query.get(project_id)
        if not project:
            return error_response('Not found', 'Project not found', 404)

        # Check if vote exists
        existing_vote = Vote.query.filter_by(user_id=user_id, project_id=project_id).first()

        if existing_vote:
            # If same type, remove vote
            if existing_vote.vote_type == vote_type:
                if vote_type == 'up':
                    project.upvotes = max(0, project.upvotes - 1)
                else:
                    project.downvotes = max(0, project.downvotes - 1)

                db.session.delete(existing_vote)
                db.session.commit()
                CacheService.invalidate_project(project_id)
                CacheService.invalidate_leaderboard()  # Vote removal affects leaderboard

                # Emit Socket.IO event for real-time vote removal
                from services.socket_service import SocketService
                SocketService.emit_vote_removed(project_id)
                SocketService.emit_leaderboard_updated()

                return success_response(None, 'Vote removed', 200)
            else:
                # Change vote type
                if existing_vote.vote_type == 'up':
                    project.upvotes = max(0, project.upvotes - 1)
                else:
                    project.downvotes = max(0, project.downvotes - 1)

                existing_vote.vote_type = vote_type

                if vote_type == 'up':
                    project.upvotes += 1
                else:
                    project.downvotes += 1
        else:
            # Create new vote
            vote = Vote(user_id=user_id, project_id=project_id, vote_type=vote_type)

            if vote_type == 'up':
                project.upvotes += 1
            else:
                project.downvotes += 1

            db.session.add(vote)

        # Recalculate scores
        ProofScoreCalculator.update_project_scores(project)

        db.session.commit()
        CacheService.invalidate_project(project_id)
        CacheService.invalidate_leaderboard()  # Vote affects leaderboard

        # Emit Socket.IO event for real-time vote updates
        from services.socket_service import SocketService
        new_score = project.upvotes - project.downvotes
        SocketService.emit_vote_cast(project_id, vote_type, new_score)
        SocketService.emit_leaderboard_updated()

        return success_response(project.to_dict(include_creator=False, user_id=user_id), 'Vote recorded', 200)

    except ValidationError as e:
        return error_response('Validation error', str(e.messages), 400)
    except Exception as e:
        db.session.rollback()
        return error_response('Error', str(e), 500)


@votes_bp.route('/user', methods=['GET'])
@token_required
def get_user_votes(user_id):
    """Get user's votes"""
    try:
        votes = Vote.query.filter_by(user_id=user_id).all()
        data = [v.to_dict() for v in votes]

        return success_response(data, 'User votes retrieved', 200)
    except Exception as e:
        return error_response('Error', str(e), 500)
