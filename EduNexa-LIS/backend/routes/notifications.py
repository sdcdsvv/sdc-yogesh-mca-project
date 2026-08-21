from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    """Get all notifications for the current user"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get query parameters
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        limit = int(request.args.get('limit', 50))
        
        # Build query
        query = {'user_id': user_id}
        if unread_only:
            query['read'] = False
        
        # Get notifications
        notifications = list(db.notifications.find(query)
                           .sort('created_at', -1)
                           .limit(limit))
        
        # Convert ObjectId to string
        for notification in notifications:
            notification['_id'] = str(notification['_id'])
        
        # Get unread count
        unread_count = db.notifications.count_documents({
            'user_id': user_id,
            'read': False
        })
        
        return jsonify({
            'notifications': notifications,
            'unread_count': unread_count,
            'total': len(notifications)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/notifications/<notification_id>/read', methods=['POST'])
@jwt_required()
def mark_notification_read(notification_id):
    """Mark a notification as read"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Update notification
        result = db.notifications.update_one(
            {
                '_id': ObjectId(notification_id),
                'user_id': user_id
            },
            {
                '$set': {
                    'read': True,
                    'read_at': datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            return jsonify({'error': 'Notification not found'}), 404
        
        # Get updated unread count
        unread_count = db.notifications.count_documents({
            'user_id': user_id,
            'read': False
        })
        
        return jsonify({
            'message': 'Notification marked as read',
            'unread_count': unread_count
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/notifications/read-all', methods=['POST'])
@jwt_required()
def mark_all_read():
    """Mark all notifications as read"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Update all unread notifications
        result = db.notifications.update_many(
            {
                'user_id': user_id,
                'read': False
            },
            {
                '$set': {
                    'read': True,
                    'read_at': datetime.utcnow()
                }
            }
        )
        
        return jsonify({
            'message': f'Marked {result.modified_count} notifications as read',
            'count': result.modified_count
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/notifications/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    """Get count of unread notifications"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        unread_count = db.notifications.count_documents({
            'user_id': user_id,
            'read': False
        })
        
        return jsonify({
            'unread_count': unread_count
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/notifications/<notification_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notification_id):
    """Delete a notification"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        result = db.notifications.delete_one({
            '_id': ObjectId(notification_id),
            'user_id': user_id
        })
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Notification not found'}), 404
        
        return jsonify({'message': 'Notification deleted'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Helper function to create notifications (can be called from other routes)
def create_notification(db, user_id, title, message, notification_type='info', link=None):
    """
    Create a new notification
    
    Args:
        db: Database instance
        user_id: User ID to send notification to
        title: Notification title
        message: Notification message
        notification_type: Type of notification (info, success, warning, error)
        link: Optional link to navigate to when clicked
    """
    notification = {
        'user_id': user_id,
        'title': title,
        'message': message,
        'type': notification_type,
        'link': link,
        'read': False,
        'created_at': datetime.utcnow(),
        'read_at': None
    }
    
    result = db.notifications.insert_one(notification)
    return str(result.inserted_id)

@notifications_bp.route('/notifications/test', methods=['POST'])
@jwt_required()
def create_test_notifications():
    """Create test notifications for the current user (for testing purposes)"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Create sample notifications
        test_notifications = [
            {
                'title': 'New Assignment Posted',
                'message': 'Your instructor has posted a new assignment in Machine Learning course.',
                'type': 'info',
                'link': '/assignments'
            },
            {
                'title': 'Assignment Graded',
                'message': 'Your Python Basics assignment has been graded. You scored 92/100!',
                'type': 'success',
                'link': '/analytics'
            },
            {
                'title': 'Assignment Due Soon',
                'message': 'Your Data Structures assignment is due in 2 days.',
                'type': 'warning',
                'link': '/assignments'
            },
            {
                'title': 'Welcome to EduNexa!',
                'message': 'Start your learning journey by exploring your courses.',
                'type': 'info',
                'link': '/courses'
            },
        ]
        
        created_ids = []
        for notif in test_notifications:
            notif_id = create_notification(
                db, user_id, notif['title'], notif['message'], 
                notif['type'], notif.get('link')
            )
            created_ids.append(notif_id)
        
        return jsonify({
            'message': f'Created {len(created_ids)} test notifications',
            'notification_ids': created_ids
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
