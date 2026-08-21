from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from bson import ObjectId

messages_bp = Blueprint('messages', __name__)

def get_db():
    """Get MongoDB database instance"""
    return current_app.db

@messages_bp.route('/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    """Get all conversations for the current user"""
    try:
        current_user_id = get_jwt_identity()
        db = get_db()
        
        # Get all messages where user is sender or receiver
        messages = list(db.messages.find({
            '$or': [
                {'sender_id': current_user_id},
                {'receiver_id': current_user_id}
            ]
        }).sort('timestamp', -1))
        
        # Group by conversation partner
        conversations_dict = {}
        
        for msg in messages:
            # Determine partner ID
            partner_id = msg['receiver_id'] if msg['sender_id'] == current_user_id else msg['sender_id']
            
            if partner_id not in conversations_dict:
                # Get partner details
                partner = db.users.find_one({'_id': ObjectId(partner_id)})
                
                if not partner:
                    continue
                
                # Count unread messages from this partner
                unread_count = db.messages.count_documents({
                    'sender_id': partner_id,
                    'receiver_id': current_user_id,
                    'read': False
                })
                
                # Get sender name for last message
                sender = db.users.find_one({'_id': ObjectId(msg['sender_id'])})
                
                conversations_dict[partner_id] = {
                    'id': f"{current_user_id}_{partner_id}",
                    'participants': [{
                        'id': str(partner['_id']),
                        'name': partner.get('name', 'Unknown'),
                        'role': partner.get('role', 'user'),
                        'online': False
                    }],
                    'lastMessage': {
                        'id': str(msg['_id']),
                        'senderId': msg['sender_id'],
                        'senderName': sender.get('name', 'Unknown') if sender else 'Unknown',
                        'content': msg['content'],
                        'timestamp': msg['timestamp'].isoformat() if isinstance(msg['timestamp'], datetime) else msg['timestamp'],
                        'read': msg.get('read', False)
                    },
                    'unreadCount': unread_count
                }
        
        conversations = list(conversations_dict.values())
        return jsonify(conversations), 200
        
    except Exception as e:
        print(f"Error fetching conversations: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/conversation/<partner_id>', methods=['GET'])
@jwt_required()
def get_conversation_messages(partner_id):
    """Get all messages in a conversation with a specific user"""
    try:
        current_user_id = get_jwt_identity()
        db = get_db()
        
        # Get all messages between current user and partner
        messages = list(db.messages.find({
            '$or': [
                {'sender_id': current_user_id, 'receiver_id': partner_id},
                {'sender_id': partner_id, 'receiver_id': current_user_id}
            ]
        }).sort('timestamp', 1))
        
        # Mark messages as read
        db.messages.update_many(
            {'sender_id': partner_id, 'receiver_id': current_user_id, 'read': False},
            {'$set': {'read': True}}
        )
        
        result = []
        for msg in messages:
            # Get sender name
            sender = db.users.find_one({'_id': ObjectId(msg['sender_id'])})
            
            result.append({
                'id': str(msg['_id']),
                'senderId': msg['sender_id'],
                'senderName': sender.get('name', 'Unknown') if sender else 'Unknown',
                'content': msg['content'],
                'timestamp': msg['timestamp'].isoformat() if isinstance(msg['timestamp'], datetime) else msg['timestamp'],
                'read': msg.get('read', False)
            })
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Error fetching messages: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/send', methods=['POST'])
@jwt_required()
def send_message():
    """Send a message to another user"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        receiver_id = data.get('receiver_id')
        content = data.get('content')
        
        if not receiver_id or not content:
            return jsonify({'error': 'Receiver ID and content are required'}), 400
        
        db = get_db()
        
        # Create message document
        message = {
            'sender_id': current_user_id,
            'receiver_id': str(receiver_id),
            'content': content.strip(),
            'timestamp': datetime.utcnow(),
            'read': False
        }
        
        result = db.messages.insert_one(message)
        
        # Get sender name
        sender = db.users.find_one({'_id': ObjectId(current_user_id)})
        
        return jsonify({
            'id': str(result.inserted_id),
            'senderId': current_user_id,
            'senderName': sender.get('name', 'Unknown') if sender else 'Unknown',
            'content': content.strip(),
            'timestamp': message['timestamp'].isoformat(),
            'read': False
        }), 201
        
    except Exception as e:
        print(f"Error sending message: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    """Get count of unread messages for current user"""
    try:
        current_user_id = get_jwt_identity()
        db = get_db()
        
        unread_count = db.messages.count_documents({
            'receiver_id': current_user_id,
            'read': False
        })
        
        return jsonify({'unread_count': unread_count}), 200
        
    except Exception as e:
        print(f"Error fetching unread count: {str(e)}")
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/users', methods=['GET'])
@jwt_required()
def get_available_users():
    """Get list of users available for messaging"""
    try:
        current_user_id = get_jwt_identity()
        db = get_db()
        
        # Get all users except current user
        users = list(db.users.find(
            {'_id': {'$ne': ObjectId(current_user_id)}},
            {'name': 1, 'email': 1, 'role': 1}
        ).sort('name', 1))
        
        result = [{
            '_id': str(user['_id']),
            'name': user.get('name', 'Unknown'),
            'email': user.get('email', ''),
            'role': user.get('role', 'user')
        } for user in users]
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Error fetching users: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
