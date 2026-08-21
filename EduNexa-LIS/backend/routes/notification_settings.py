"""
Notification Settings and Management Routes
Provides endpoints for managing user notification preferences and sending test notifications.
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
from services.enhanced_notification_service import (
    get_user_notification_settings,
    update_user_notification_settings,
    send_notification,
    send_bulk_notification,
    notify_by_role,
    send_email,
    create_in_app_notification,
    log_notification_history
)

notification_settings_bp = Blueprint('notification_settings', __name__)


@notification_settings_bp.route('/notification-settings', methods=['GET'])
@jwt_required()
def get_settings():
    """Get current user's notification settings"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        settings = get_user_notification_settings(db, user_id)
        
        return jsonify({
            'settings': settings,
            'message': 'Notification settings retrieved successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@notification_settings_bp.route('/notification-settings', methods=['PUT'])
@jwt_required()
def update_settings():
    """Update current user's notification settings"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        data = request.get_json()
        
        email_enabled = data.get('email_enabled')
        in_app_enabled = data.get('in_app_enabled')
        
        if email_enabled is None and in_app_enabled is None:
            return jsonify({'error': 'No settings provided to update'}), 400
        
        success = update_user_notification_settings(
            db, user_id, email_enabled, in_app_enabled
        )
        
        if success:
            settings = get_user_notification_settings(db, user_id)
            return jsonify({
                'message': 'Notification settings updated successfully',
                'settings': settings
            }), 200
        else:
            return jsonify({'error': 'Failed to update settings'}), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@notification_settings_bp.route('/notification-settings/test-email', methods=['POST'])
@jwt_required()
def send_test_email():
    """Send a test email to the current user"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get user details
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if not user.get('email'):
            return jsonify({'error': 'No email address configured'}), 400
        
        # Check user's email notification setting
        settings = get_user_notification_settings(db, user_id)
        if not settings['email_enabled']:
            return jsonify({
                'error': 'Email notifications are disabled in your settings',
                'message': 'Please enable email notifications first'
            }), 400
        
        # Send test email
        subject = f"Test Email from EduNexa LMS"
        body = f"""Hello {user.get('name', 'User')},

This is a test email to verify your email notification settings.

If you received this email, your email notifications are working correctly!

Role: {user.get('role', 'N/A').title()}
Email: {user.get('email')}

Best regards,
EduNexa LMS Team"""
        
        html = f"""<h2>Test Email from EduNexa LMS</h2>
<p>Hello {user.get('name', 'User')},</p>
<p>This is a test email to verify your email notification settings.</p>
<p>If you received this email, your email notifications are working correctly!</p>
<ul>
<li><strong>Role:</strong> {user.get('role', 'N/A').title()}</li>
<li><strong>Email:</strong> {user.get('email')}</li>
</ul>
<p>Best regards,<br>EduNexa LMS Team</p>"""
        
        result = send_email(user['email'], subject, body, html)
        
        # Log the test
        log_notification_history(
            db, user_id, 'test_email', 'email',
            'sent' if result['success'] else 'failed',
            {'subject': subject, 'message': result['message']}
        )
        
        if result['success']:
            return jsonify({
                'message': f'Test email sent successfully to {user["email"]}',
                'email': user['email']
            }), 200
        else:
            return jsonify({
                'error': 'Failed to send test email',
                'details': result['message']
            }), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@notification_settings_bp.route('/notification-settings/test-notification', methods=['POST'])
@jwt_required()
def send_test_notification():
    """Send a test in-app notification to the current user"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get user details
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check user's in-app notification setting
        settings = get_user_notification_settings(db, user_id)
        if not settings['in_app_enabled']:
            return jsonify({
                'error': 'In-app notifications are disabled in your settings',
                'message': 'Please enable in-app notifications first'
            }), 400
        
        # Create test notification
        success = create_in_app_notification(
            db, user_id,
            'Test Notification',
            f'This is a test notification for {user.get("name", "User")}. Your in-app notifications are working!',
            'info',
            '/notifications'
        )
        
        # Log the test
        log_notification_history(
            db, user_id, 'test_notification', 'in_app',
            'sent' if success else 'failed',
            {'title': 'Test Notification'}
        )
        
        if success:
            return jsonify({
                'message': 'Test notification created successfully',
                'user_id': user_id
            }), 200
        else:
            return jsonify({'error': 'Failed to create test notification'}), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@notification_settings_bp.route('/notification-history', methods=['GET'])
@jwt_required()
def get_notification_history():
    """Get notification delivery history for the current user"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get query parameters
        limit = int(request.args.get('limit', 50))
        channel = request.args.get('channel')  # email, in_app
        status = request.args.get('status')  # sent, failed, skipped
        
        # Build query
        query = {'user_id': user_id}
        if channel:
            query['channel'] = channel
        if status:
            query['status'] = status
        
        # Get history
        history = list(db.notification_history.find(query)
                      .sort('timestamp', -1)
                      .limit(limit))
        
        # Convert ObjectId to string
        for entry in history:
            entry['_id'] = str(entry['_id'])
        
        # Get statistics
        total_sent = db.notification_history.count_documents({
            'user_id': user_id,
            'status': 'sent'
        })
        total_failed = db.notification_history.count_documents({
            'user_id': user_id,
            'status': 'failed'
        })
        
        return jsonify({
            'history': history,
            'total': len(history),
            'statistics': {
                'total_sent': total_sent,
                'total_failed': total_failed
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@notification_settings_bp.route('/admin/send-notification', methods=['POST'])
@jwt_required()
def admin_send_notification():
    """Admin endpoint to send notifications to specific users or roles"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is admin
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or user['role'] != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        if not data.get('notification_type'):
            return jsonify({'error': 'notification_type is required'}), 400
        
        if not data.get('context'):
            return jsonify({'error': 'context is required'}), 400
        
        notification_type = data['notification_type']
        context = data['context']
        
        # Send to specific users or roles
        if data.get('user_ids'):
            results = send_bulk_notification(db, data['user_ids'], notification_type, context)
        elif data.get('roles'):
            results = notify_by_role(db, data['roles'], notification_type, context)
        else:
            return jsonify({'error': 'Either user_ids or roles must be provided'}), 400
        
        return jsonify({
            'message': 'Notifications sent successfully',
            'results': results
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@notification_settings_bp.route('/admin/notification-stats', methods=['GET'])
@jwt_required()
def get_notification_stats():
    """Get system-wide notification statistics (admin only)"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is admin
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or user['role'] != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        # Get statistics
        total_sent = db.notification_history.count_documents({'status': 'sent'})
        total_failed = db.notification_history.count_documents({'status': 'failed'})
        total_skipped = db.notification_history.count_documents({'status': 'skipped'})
        
        email_sent = db.notification_history.count_documents({
            'channel': 'email',
            'status': 'sent'
        })
        in_app_sent = db.notification_history.count_documents({
            'channel': 'in_app',
            'status': 'sent'
        })
        
        # Users with email disabled
        users_email_disabled = db.users.count_documents({
            'notification_settings.email_enabled': False
        })
        
        # Users with in-app disabled
        users_in_app_disabled = db.users.count_documents({
            'notification_settings.in_app_enabled': False
        })
        
        return jsonify({
            'statistics': {
                'total_sent': total_sent,
                'total_failed': total_failed,
                'total_skipped': total_skipped,
                'email_sent': email_sent,
                'in_app_sent': in_app_sent,
                'users_email_disabled': users_email_disabled,
                'users_in_app_disabled': users_in_app_disabled
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
