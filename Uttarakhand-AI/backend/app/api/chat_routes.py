"""
Chat API Routes
Chat history, feedback, and conversation management
"""
from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid
from app.config.database import get_database
from app.models.chat import Chat
from app.models.user import User
from app.utils.auth import require_auth

chat_bp = Blueprint('chat_history', __name__, url_prefix='/api/history')


@chat_bp.route('/message', methods=['POST'])
@require_auth
def save_message(current_user):
    """
    Save a chat message
    
    Request Body:
        {
            "session_id": "uuid-string",  # optional, will generate if not provided
            "role": "user" or "assistant",
            "content": "message content",
            "metadata": {
                "language": "english",
                "query_type": "destination",
                "tokens_used": 150,
                "response_time": 1.5
            }
        }
    """
    try:
        data = request.get_json()
        
        session_id = data.get('session_id') or str(uuid.uuid4())
        role = data.get('role', 'user')
        content = data.get('content', '').strip()
        metadata = data.get('metadata', {})
        
        if not content:
            return jsonify({
                'success': False,
                'error': 'Message content is required'
            }), 400
        
        if role not in ['user', 'assistant']:
            return jsonify({
                'success': False,
                'error': 'Role must be either "user" or "assistant"'
            }), 400
        
        # Save message
        db = get_database()
        chat_model = Chat(db)
        
        message = chat_model.create_message(
            user_id=current_user['user_id'],
            session_id=session_id,
            role=role,
            content=content,
            metadata=metadata
        )
        
        # Update user stats
        user_model = User(db)
        user_model.increment_stat(current_user['user_id'], 'total_chats')
        
        # Convert ObjectId to string
        message['_id'] = str(message['_id'])
        
        return jsonify({
            'success': True,
            'message': 'Message saved successfully',
            'data': {
                'message': message,
                'session_id': session_id
            }
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to save message: {str(e)}'
        }), 500


@chat_bp.route('/history', methods=['GET'])
@require_auth
def get_history(current_user):
    """
    Get user's chat history with pagination
    
    Query Parameters:
        limit: Number of messages (default: 50, max: 100)
        skip: Number of messages to skip (default: 0)
        session_id: Filter by session ID (optional)
    """
    try:
        limit = min(int(request.args.get('limit', 50)), 100)
        skip = int(request.args.get('skip', 0))
        session_id = request.args.get('session_id')
        
        db = get_database()
        chat_model = Chat(db)
        
        chats = chat_model.get_user_chats(
            user_id=current_user['user_id'],
            limit=limit,
            skip=skip,
            session_id=session_id
        )
        
        # Convert ObjectIds to strings
        for chat in chats:
            chat['_id'] = str(chat['_id'])
        
        return jsonify({
            'success': True,
            'data': {
                'chats': chats,
                'count': len(chats),
                'limit': limit,
                'skip': skip
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get chat history: {str(e)}'
        }), 500


@chat_bp.route('/sessions', methods=['GET'])
@require_auth
def get_sessions(current_user):
    """
    Get list of user's chat sessions
    
    Query Parameters:
        limit: Number of sessions (default: 20, max: 50)
    """
    try:
        limit = min(int(request.args.get('limit', 20)), 50)
        
        db = get_database()
        chat_model = Chat(db)
        
        sessions = chat_model.get_user_sessions(
            user_id=current_user['user_id'],
            limit=limit
        )
        
        return jsonify({
            'success': True,
            'data': {
                'sessions': sessions,
                'count': len(sessions)
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get sessions: {str(e)}'
        }), 500


@chat_bp.route('/session/<session_id>', methods=['GET'])
@require_auth
def get_session(current_user, session_id):
    """
    Get all messages from a specific session
    """
    try:
        db = get_database()
        chat_model = Chat(db)
        
        chats = chat_model.get_session_chats(
            user_id=current_user['user_id'],
            session_id=session_id
        )
        
        # Convert ObjectIds to strings
        for chat in chats:
            chat['_id'] = str(chat['_id'])
        
        return jsonify({
            'success': True,
            'data': {
                'session_id': session_id,
                'chats': chats,
                'count': len(chats)
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get session: {str(e)}'
        }), 500


@chat_bp.route('/feedback', methods=['POST'])
@require_auth
def add_feedback(current_user):
    """
    Add feedback (like/dislike) to an assistant message
    
    Request Body:
        {
            "message_id": "message-id-string",
            "rating": 1 or -1,  # 1 for like, -1 for dislike
            "comment": "optional feedback comment"
        }
    """
    try:
        data = request.get_json()
        
        message_id = data.get('message_id', '').strip()
        rating = data.get('rating')
        comment = data.get('comment', '').strip()
        
        if not message_id:
            return jsonify({
                'success': False,
                'error': 'Message ID is required'
            }), 400
        
        if rating not in [1, -1]:
            return jsonify({
                'success': False,
                'error': 'Rating must be 1 (like) or -1 (dislike)'
            }), 400
        
        db = get_database()
        chat_model = Chat(db)
        
        success = chat_model.add_feedback(
            message_id=message_id,
            user_id=current_user['user_id'],
            rating=rating,
            comment=comment if comment else None
        )
        
        if not success:
            return jsonify({
                'success': False,
                'error': 'Failed to add feedback. Message not found or not an assistant message.'
            }), 404
        
        # Update user stats
        user_model = User(db)
        user_model.increment_stat(current_user['user_id'], 'total_feedback')
        if rating == 1:
            user_model.increment_stat(current_user['user_id'], 'positive_feedback')
        else:
            user_model.increment_stat(current_user['user_id'], 'negative_feedback')
        
        return jsonify({
            'success': True,
            'message': 'Feedback added successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to add feedback: {str(e)}'
        }), 500


@chat_bp.route('/analytics', methods=['GET'])
@require_auth
def get_analytics(current_user):
    """
    Get chat analytics for current user
    """
    try:
        db = get_database()
        chat_model = Chat(db)
        
        analytics = chat_model.get_chat_analytics(current_user['user_id'])
        feedback_stats = chat_model.get_feedback_stats(current_user['user_id'])
        
        return jsonify({
            'success': True,
            'data': {
                'analytics': analytics,
                'feedback': feedback_stats
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get analytics: {str(e)}'
        }), 500


@chat_bp.route('/message/<message_id>', methods=['DELETE'])
@require_auth
def delete_message(current_user, message_id):
    """
    Delete a specific message
    """
    try:
        db = get_database()
        chat_model = Chat(db)
        
        success = chat_model.delete_message(message_id, current_user['user_id'])
        
        if not success:
            return jsonify({
                'success': False,
                'error': 'Message not found or already deleted'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Message deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to delete message: {str(e)}'
        }), 500


@chat_bp.route('/session/<session_id>', methods=['DELETE'])
@require_auth
def delete_session(current_user, session_id):
    """
    Delete all messages in a session
    """
    try:
        db = get_database()
        chat_model = Chat(db)
        
        deleted_count = chat_model.delete_session(session_id, current_user['user_id'])
        
        return jsonify({
            'success': True,
            'message': f'Session deleted successfully',
            'data': {'deleted_count': deleted_count}
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to delete session: {str(e)}'
        }), 500


@chat_bp.route('/history', methods=['DELETE'])
@require_auth
def delete_all_history(current_user):
    """
    Delete all chat history for current user
    """
    try:
        db = get_database()
        chat_model = Chat(db)
        
        deleted_count = chat_model.delete_user_chats(current_user['user_id'])
        
        return jsonify({
            'success': True,
            'message': 'All chat history deleted successfully',
            'data': {'deleted_count': deleted_count}
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to delete chat history: {str(e)}'
        }), 500
