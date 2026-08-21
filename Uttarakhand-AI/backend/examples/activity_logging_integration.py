"""
Example: How to Integrate Activity Logging in Existing Services

This file shows examples of how to add activity logging to your existing API endpoints.
"""

# ============================================================================
# Example 1: Itinerary Generation with Activity Logging
# ============================================================================

from flask import Blueprint, request, jsonify
from app.services.gemini_service import get_gemini_service
from app.utils.activity_helper import log_itinerary_generation, ActivityTimer
from app.utils.auth import require_auth
import time

itinerary_bp = Blueprint('itinerary', __name__)

@itinerary_bp.route('/generate', methods=['POST'])
@require_auth
def generate_itinerary_with_logging(current_user):
    """
    Example of itinerary generation WITH activity logging
    """
    try:
        data = request.get_json()
        start_time = time.time()
        
        # Prepare preferences
        preferences = {
            'duration': int(data['duration']),
            'budget': float(data['budget']),
            'interests': data['interests'],
            'start_location': data.get('start_location', 'Dehradun'),
            'travel_style': data.get('travel_style', 'moderate'),
            'language': data.get('language', 'english')
        }
        
        # Get Gemini service and generate itinerary
        gemini_service = get_gemini_service()
        result = gemini_service.generate_itinerary(
            preferences=preferences,
            language=preferences['language']
        )
        
        # Calculate duration
        duration_ms = (time.time() - start_time) * 1000
        
        # ✨ LOG THE ACTIVITY ✨
        log_itinerary_generation(
            user_id=current_user['user_id'],
            preferences=preferences,
            result=result,
            duration_ms=duration_ms
        )
        
        if result.get('success'):
            return jsonify({
                'success': True,
                'itinerary': result.get('itinerary', {}),
                'language': preferences['language']
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': result.get('message', 'Failed to generate itinerary')
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Internal server error'
        }), 500


# ============================================================================
# Example 2: Vision Analysis with Activity Logging (Using ActivityTimer)
# ============================================================================

from app.utils.activity_helper import log_vision_analysis

vision_bp = Blueprint('vision', __name__)

@vision_bp.route('/analyze', methods=['POST'])
@require_auth
def analyze_image_with_logging(current_user):
    """
    Example of vision analysis WITH activity logging using ActivityTimer
    """
    try:
        file = request.files['file']
        language = request.form.get('language', 'english').lower()
        image_data = file.read()
        
        start_time = time.time()
        
        # Get Gemini service
        gemini_service = get_gemini_service()
        
        # Analyze image
        result = gemini_service.analyze_image(
            image_data=image_data,
            language=language
        )
        
        duration_ms = (time.time() - start_time) * 1000
        
        # ✨ LOG THE ACTIVITY ✨
        log_vision_analysis(
            user_id=current_user['user_id'],
            language=language,
            result=result,
            duration_ms=duration_ms
        )
        
        if result.get('success'):
            return jsonify({
                'success': True,
                'identified': result.get('identified', False),
                'data': result.get('data', {}),
                'language': language
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': result.get('message', 'Failed to analyze image')
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Internal server error'
        }), 500


# ============================================================================
# Example 3: Using ActivityTimer Context Manager (Automatic logging with timing)
# ============================================================================

@itinerary_bp.route('/generate-v2', methods=['POST'])
@require_auth
def generate_itinerary_with_timer(current_user):
    """
    Example using ActivityTimer for automatic logging
    """
    try:
        data = request.get_json()
        
        preferences = {
            'duration': int(data['duration']),
            'budget': float(data['budget']),
            'interests': data['interests']
        }
        
        # ✨ USING ACTIVITY TIMER - Automatically logs with duration ✨
        with ActivityTimer(
            user_id=current_user['user_id'],
            service_type='itinerary',
            action='generate',
            details={
                'description': f"Generated {preferences['duration']}-day itinerary"
            },
            request_data={
                'duration': preferences['duration'],
                'budget': preferences['budget']
            }
        ) as timer:
            
            # Your service logic here
            gemini_service = get_gemini_service()
            result = gemini_service.generate_itinerary(
                preferences=preferences,
                language='english'
            )
            
            # Set response data before timer exits
            timer.set_response_data({
                'success': result.get('success', False),
                'days_count': len(result.get('itinerary', {}).get('days', []))
            })
            
            if result.get('success'):
                return jsonify({
                    'success': True,
                    'itinerary': result.get('itinerary', {})
                }), 200
            else:
                return jsonify({
                    'success': False,
                    'message': 'Failed to generate'
                }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


# ============================================================================
# Example 4: Manual Activity Logging (for custom scenarios)
# ============================================================================

from app.utils.activity_helper import get_activity_logger

emergency_bp = Blueprint('emergency', __name__)

@emergency_bp.route('/services', methods=['GET'])
@require_auth
def get_emergency_services_with_logging(current_user):
    """
    Example of manual activity logging
    """
    try:
        service_type = request.args.get('type', 'all')
        location = request.args.get('location', 'general')
        
        # Your service logic here
        # ... fetch emergency services ...
        
        # ✨ MANUAL ACTIVITY LOGGING ✨
        logger = get_activity_logger()
        logger.log(
            user_id=current_user['user_id'],
            service_type='emergency',
            action='lookup',
            details={
                'description': f'Looked up {service_type} emergency services',
                'location': location
            },
            request_data={
                'service_type': service_type,
                'location': location
            },
            response_data={
                'success': True,
                'services_count': 5  # example
            },
            metadata={
                'language': 'english'
            }
        )
        
        return jsonify({
            'success': True,
            'services': []  # your data
        }), 200
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


# ============================================================================
# USAGE SUMMARY:
# ============================================================================
"""
Choose the method that fits your needs:

1. Helper Functions (Recommended for specific services):
   - log_itinerary_generation()
   - log_vision_analysis()
   - log_chat_interaction()
   - log_emergency_lookup()
   - log_weather_query()
   
   Use when: You want pre-defined logging for common services

2. ActivityTimer Context Manager (Recommended for automatic timing):
   with ActivityTimer(user_id, service_type, action, ...) as timer:
       # your code
       timer.set_response_data({...})
   
   Use when: You want automatic timing and clean code

3. Manual Logging (For custom scenarios):
   logger = get_activity_logger()
   logger.log(user_id, service_type, action, ...)
   
   Use when: You need full control over all parameters

"""

# ============================================================================
# INTEGRATION STEPS:
# ============================================================================
"""
To integrate activity logging in your existing endpoints:

1. Import the helper:
   from app.utils.activity_helper import log_itinerary_generation
   # or
   from app.utils.activity_helper import ActivityTimer
   # or
   from app.utils.activity_helper import get_activity_logger

2. Add logging call after your service logic:
   result = your_service_call()
   log_your_activity(user_id, params, result)

3. That's it! Activity will be automatically tracked in the database.

4. Users can view their activity history via:
   GET /api/activity/history
   GET /api/activity/recent
   GET /api/activity/summary
   GET /api/activity/timeline
"""
