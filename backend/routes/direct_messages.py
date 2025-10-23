"""
Direct Messages Routes
"""
from flask import Blueprint, request, jsonify
from sqlalchemy import or_, and_
from extensions import db
from models.direct_message import DirectMessage
from models.user import User
from utils.decorators import token_required


direct_messages_bp = Blueprint('direct_messages', __name__, url_prefix='/api/messages')


@direct_messages_bp.route('/send', methods=['POST'])
@token_required
def send_message(current_user):
    """Send a direct message"""
    try:
        data = request.get_json()
        recipient_id = data.get('recipient_id')
        message_text = data.get('message')

        if not recipient_id or not message_text:
            return jsonify({
                'status': 'error',
                'message': 'Recipient ID and message are required'
            }), 400

        # Check if recipient exists
        recipient = User.query.get(recipient_id)
        if not recipient:
            return jsonify({
                'status': 'error',
                'message': 'Recipient not found'
            }), 404

        # Create message
        message = DirectMessage(
            sender_id=current_user.id,
            recipient_id=recipient_id,
            message=message_text
        )

        db.session.add(message)
        db.session.commit()

        return jsonify({
            'status': 'success',
            'message': 'Message sent successfully',
            'data': message.to_dict(include_users=True)
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@direct_messages_bp.route('/conversations', methods=['GET'])
@token_required
def get_conversations(current_user):
    """Get all conversations for current user"""
    try:
        # Get all users current user has conversations with
        conversations = db.session.query(
            User,
            db.func.max(DirectMessage.created_at).label('last_message_time'),
            db.func.count(
                db.case(
                    (and_(DirectMessage.recipient_id == current_user.id, DirectMessage.is_read == False), 1)
                )
            ).label('unread_count')
        ).join(
            DirectMessage,
            or_(
                and_(DirectMessage.sender_id == User.id, DirectMessage.recipient_id == current_user.id),
                and_(DirectMessage.recipient_id == User.id, DirectMessage.sender_id == current_user.id)
            )
        ).filter(
            User.id != current_user.id
        ).group_by(
            User.id
        ).order_by(
            db.desc('last_message_time')
        ).all()

        result = []
        for user, last_message_time, unread_count in conversations:
            # Get last message
            last_message = DirectMessage.query.filter(
                or_(
                    and_(DirectMessage.sender_id == current_user.id, DirectMessage.recipient_id == user.id),
                    and_(DirectMessage.sender_id == user.id, DirectMessage.recipient_id == current_user.id)
                )
            ).order_by(DirectMessage.created_at.desc()).first()

            result.append({
                'user': user.to_dict(),
                'last_message': last_message.to_dict(include_users=False) if last_message else None,
                'last_message_time': last_message_time.isoformat() if last_message_time else None,
                'unread_count': unread_count
            })

        return jsonify({
            'status': 'success',
            'data': result
        }), 200

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@direct_messages_bp.route('/conversation/<user_id>', methods=['GET'])
@token_required
def get_conversation_with_user(current_user, user_id):
    """Get all messages in conversation with specific user"""
    try:
        # Check if user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'User not found'
            }), 404

        # Get all messages between current user and specified user
        messages = DirectMessage.query.filter(
            or_(
                and_(DirectMessage.sender_id == current_user.id, DirectMessage.recipient_id == user_id),
                and_(DirectMessage.sender_id == user_id, DirectMessage.recipient_id == current_user.id)
            )
        ).order_by(DirectMessage.created_at.asc()).all()

        # Mark messages as read
        unread_messages = DirectMessage.query.filter(
            DirectMessage.sender_id == user_id,
            DirectMessage.recipient_id == current_user.id,
            DirectMessage.is_read == False
        ).all()

        for message in unread_messages:
            message.is_read = True

        db.session.commit()

        return jsonify({
            'status': 'success',
            'data': {
                'user': user.to_dict(),
                'messages': [msg.to_dict(include_users=True) for msg in messages]
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@direct_messages_bp.route('/unread-count', methods=['GET'])
@token_required
def get_unread_count(current_user):
    """Get total unread message count"""
    try:
        count = DirectMessage.query.filter(
            DirectMessage.recipient_id == current_user.id,
            DirectMessage.is_read == False
        ).count()

        return jsonify({
            'status': 'success',
            'data': {'unread_count': count}
        }), 200

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@direct_messages_bp.route('/<message_id>/mark-read', methods=['POST'])
@token_required
def mark_as_read(current_user, message_id):
    """Mark a message as read"""
    try:
        message = DirectMessage.query.get(message_id)
        if not message:
            return jsonify({
                'status': 'error',
                'message': 'Message not found'
            }), 404

        # Check if current user is the recipient
        if message.recipient_id != current_user.id:
            return jsonify({
                'status': 'error',
                'message': 'Unauthorized'
            }), 403

        message.is_read = True
        db.session.commit()

        return jsonify({
            'status': 'success',
            'message': 'Message marked as read'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
