"""
Comment routes
"""
from flask import Blueprint, request
from datetime import datetime
from marshmallow import ValidationError

from extensions import db
from models.comment import Comment
from models.project import Project
from schemas.comment import CommentCreateSchema, CommentUpdateSchema
from utils.decorators import token_required, optional_auth
from utils.helpers import success_response, error_response, paginated_response, get_pagination_params

comments_bp = Blueprint('comments', __name__)


@comments_bp.route('', methods=['GET'])
@optional_auth
def get_comments(user_id):
    """Get project comments"""
    try:
        project_id = request.args.get('project_id')
        if not project_id:
            return error_response('Bad request', 'project_id required', 400)

        page, per_page = get_pagination_params(request)

        project = Project.query.get(project_id)
        if not project:
            return error_response('Not found', 'Project not found', 404)

        # Get root-level comments (not replies)
        query = Comment.query.filter_by(project_id=project_id, parent_id=None, is_deleted=False)
        total = query.count()
        comments = query.order_by(Comment.created_at.desc()).limit(per_page).offset((page - 1) * per_page).all()

        data = [c.to_dict(include_author=True) for c in comments]

        return paginated_response(data, total, page, per_page)
    except Exception as e:
        return error_response('Error', str(e), 500)


@comments_bp.route('', methods=['POST'])
@token_required
def create_comment(user_id):
    """Create comment"""
    try:
        data = request.get_json()
        schema = CommentCreateSchema()
        validated_data = schema.load(data)

        project = Project.query.get(validated_data['project_id'])
        if not project:
            return error_response('Not found', 'Project not found', 404)

        comment = Comment(
            project_id=validated_data['project_id'],
            user_id=user_id,
            parent_id=validated_data.get('parent_id'),
            content=validated_data['content']
        )

        project.comment_count += 1

        db.session.add(comment)
        db.session.commit()

        return success_response(comment.to_dict(include_author=True), 'Comment created', 201)

    except ValidationError as e:
        return error_response('Validation error', str(e.messages), 400)
    except Exception as e:
        db.session.rollback()
        return error_response('Error', str(e), 500)


@comments_bp.route('/<comment_id>', methods=['PUT'])
@token_required
def update_comment(user_id, comment_id):
    """Update comment"""
    try:
        comment = Comment.query.get(comment_id)
        if not comment:
            return error_response('Not found', 'Comment not found', 404)

        if comment.user_id != user_id:
            return error_response('Forbidden', 'You can only edit your own comments', 403)

        data = request.get_json()
        schema = CommentUpdateSchema()
        validated_data = schema.load(data)

        comment.content = validated_data['content']
        comment.updated_at = datetime.utcnow()

        db.session.commit()

        return success_response(comment.to_dict(include_author=True), 'Comment updated', 200)

    except ValidationError as e:
        return error_response('Validation error', str(e.messages), 400)
    except Exception as e:
        db.session.rollback()
        return error_response('Error', str(e), 500)


@comments_bp.route('/<comment_id>', methods=['DELETE'])
@token_required
def delete_comment(user_id, comment_id):
    """Delete comment (soft delete)"""
    try:
        comment = Comment.query.get(comment_id)
        if not comment:
            return error_response('Not found', 'Comment not found', 404)

        if comment.user_id != user_id:
            return error_response('Forbidden', 'You can only delete your own comments', 403)

        comment.is_deleted = True
        db.session.commit()

        return success_response(None, 'Comment deleted', 200)
    except Exception as e:
        db.session.rollback()
        return error_response('Error', str(e), 500)


@comments_bp.route('/<comment_id>/vote', methods=['POST'])
@token_required
def vote_comment(user_id, comment_id):
    """Vote on a comment (upvote/downvote)"""
    try:
        comment = Comment.query.get(comment_id)
        if not comment:
            return error_response('Not found', 'Comment not found', 404)

        data = request.get_json()
        vote_type = data.get('vote_type', 'up')  # 'up' or 'down'

        if vote_type == 'up':
            comment.upvotes += 1
        elif vote_type == 'down':
            comment.downvotes += 1
        else:
            return error_response('Bad request', 'Invalid vote_type. Use "up" or "down"', 400)

        db.session.commit()

        return success_response(comment.to_dict(include_author=True), f'Comment {vote_type}voted', 200)
    except Exception as e:
        db.session.rollback()
        return error_response('Error', str(e), 500)
