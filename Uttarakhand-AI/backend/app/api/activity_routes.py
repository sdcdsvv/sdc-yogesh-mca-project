"""
Activity API Routes
Track and retrieve user service usage history
"""
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from app.config.database import get_database
from app.models.activity import Activity
from app.utils.auth import require_auth

activity_bp = Blueprint('activity', __name__, url_prefix='/api/activity')


@activity_bp.route('/log', methods=['POST'])
@require_auth
def log_activity(current_user):
    """
    Log a user activity
    
    Request Body:
        {
            "service_type": "itinerary|vision|chat|emergency|places|weather",
            "action": "generate|analyze|search|lookup",
            "details": {
                "description": "Generated itinerary for 3 days",
                "summary": "Brief summary"
            },
            "request_data": {
                "duration": 3,
                "budget": 50000
            },
            "response_data": {
                "success": true,
                "items_count": 5
            },
            "metadata": {
                "language": "english",
                "duration_ms": 1500
            }
        }
    """
    try:
        data = request.get_json()
        
        service_type = data.get('service_type', '').strip()
        action = data.get('action', '').strip()
        
        if not service_type or not action:
            return jsonify({
                'success': False,
                'error': 'service_type and action are required'
            }), 400
        
        # Validate service type
        valid_services = ['itinerary', 'vision', 'chat', 'emergency', 
                         'places', 'weather', 'translation', 'other']
        if service_type not in valid_services:
            return jsonify({
                'success': False,
                'error': f'Invalid service_type. Must be one of: {", ".join(valid_services)}'
            }), 400
        
        db = get_database()
        activity_model = Activity(db)
        
        activity = activity_model.log_activity(
            user_id=current_user['user_id'],
            service_type=service_type,
            action=action,
            details=data.get('details', {}),
            request_data=data.get('request_data', {}),
            response_data=data.get('response_data', {}),
            metadata=data.get('metadata', {})
        )
        
        # Convert ObjectId to string
        activity['_id'] = str(activity['_id'])
        
        return jsonify({
            'success': True,
            'message': 'Activity logged successfully',
            'data': activity
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to log activity: {str(e)}'
        }), 500


@activity_bp.route('/history', methods=['GET'])
@require_auth
def get_activity_history(current_user):
    """
    Get user's activity history with pagination and filtering
    
    Query Parameters:
        limit: Number of activities (default: 50, max: 100)
        skip: Number of activities to skip (default: 0)
        service_type: Filter by service type (optional)
        days: Number of days to look back (optional)
    """
    try:
        limit = min(int(request.args.get('limit', 50)), 100)
        skip = int(request.args.get('skip', 0))
        service_type = request.args.get('service_type')
        days = request.args.get('days')
        
        start_date = None
        end_date = None
        
        if days:
            try:
                days_int = int(days)
                start_date = datetime.utcnow() - timedelta(days=days_int)
                end_date = datetime.utcnow()
            except ValueError:
                pass
        
        db = get_database()
        activity_model = Activity(db)
        
        activities = activity_model.get_user_activities(
            user_id=current_user['user_id'],
            limit=limit,
            skip=skip,
            service_type=service_type,
            start_date=start_date,
            end_date=end_date
        )
        
        # Convert ObjectIds to strings
        for activity in activities:
            activity['_id'] = str(activity['_id'])
        
        return jsonify({
            'success': True,
            'data': {
                'activities': activities,
                'count': len(activities),
                'limit': limit,
                'skip': skip,
                'filters': {
                    'service_type': service_type,
                    'days': days
                }
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get activity history: {str(e)}'
        }), 500


@activity_bp.route('/recent', methods=['GET'])
@require_auth
def get_recent_activities(current_user):
    """
    Get recent activities for quick view
    
    Query Parameters:
        limit: Number of activities (default: 10, max: 20)
    """
    try:
        limit = min(int(request.args.get('limit', 10)), 20)
        
        db = get_database()
        activity_model = Activity(db)
        
        activities = activity_model.get_recent_activities(
            user_id=current_user['user_id'],
            limit=limit
        )
        
        # Convert ObjectIds to strings
        for activity in activities:
            activity['_id'] = str(activity['_id'])
        
        return jsonify({
            'success': True,
            'data': {
                'activities': activities,
                'count': len(activities)
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get recent activities: {str(e)}'
        }), 500


@activity_bp.route('/summary', methods=['GET'])
@require_auth
def get_usage_summary(current_user):
    """
    Get summary of service usage
    
    Query Parameters:
        days: Number of days to analyze (default: 30)
    """
    try:
        days = int(request.args.get('days', 30))
        days = min(days, 365)  # Max 1 year
        
        db = get_database()
        activity_model = Activity(db)
        
        summary = activity_model.get_service_usage_summary(
            user_id=current_user['user_id'],
            days=days
        )
        
        return jsonify({
            'success': True,
            'data': summary
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get usage summary: {str(e)}'
        }), 500


@activity_bp.route('/timeline', methods=['GET'])
@require_auth
def get_activity_timeline(current_user):
    """
    Get activity timeline
    
    Query Parameters:
        group_by: day|week|month (default: day)
        days: Number of days to look back (default: 30)
    """
    try:
        group_by = request.args.get('group_by', 'day')
        days = int(request.args.get('days', 30))
        
        if group_by not in ['day', 'week', 'month']:
            group_by = 'day'
        
        days = min(days, 365)
        
        db = get_database()
        activity_model = Activity(db)
        
        timeline = activity_model.get_activity_timeline(
            user_id=current_user['user_id'],
            group_by=group_by,
            days=days
        )
        
        return jsonify({
            'success': True,
            'data': {
                'timeline': timeline,
                'group_by': group_by,
                'days': days
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get activity timeline: {str(e)}'
        }), 500


@activity_bp.route('/analytics/<service_type>', methods=['GET'])
@require_auth
def get_service_analytics(current_user, service_type):
    """
    Get detailed analytics for a specific service
    """
    try:
        db = get_database()
        activity_model = Activity(db)
        
        analytics = activity_model.get_service_analytics(
            user_id=current_user['user_id'],
            service_type=service_type
        )
        
        return jsonify({
            'success': True,
            'data': {
                'service_type': service_type,
                'analytics': analytics
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get service analytics: {str(e)}'
        }), 500


@activity_bp.route('/history', methods=['DELETE'])
@require_auth
def delete_activity_history(current_user):
    """
    Delete all activity history for current user
    """
    try:
        db = get_database()
        activity_model = Activity(db)
        
        deleted_count = activity_model.delete_user_activities(
            current_user['user_id']
        )
        
        return jsonify({
            'success': True,
            'message': 'Activity history deleted successfully',
            'data': {'deleted_count': deleted_count}
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to delete activity history: {str(e)}'
        }), 500
