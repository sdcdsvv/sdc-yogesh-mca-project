"""Itinerary API endpoints"""
from flask import Blueprint, request, jsonify
from app.services.gemini_service import get_gemini_service
from app.models.itinerary import get_itinerary_model
from app.utils.validators import validate_itinerary_request, validate_language
from app.utils.logger import logger
from app.utils.activity_helper import log_itinerary_generation
from app.utils.auth import get_current_user_id
import time

itinerary_bp = Blueprint('itinerary', __name__)

@itinerary_bp.route('/generate', methods=['POST'])
def generate_itinerary():
    """
    Generate AI-powered itinerary
    
    Request body:
    {
        "duration": 3,
        "budget": 50000,
        "interests": ["temples", "trekking"],
        "start_location": "Dehradun",
        "travel_style": "moderate",
        "language": "english"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'Request body is required'
            }), 400
        
        # Validate request
        is_valid, error_msg = validate_itinerary_request(data)
        if not is_valid:
            return jsonify({
                'success': False,
                'message': error_msg
            }), 400
        
        # Get language
        language = data.get('language', 'english').lower()
        if not validate_language(language):
            language = 'english'
        
        # Prepare preferences
        duration = int(data['duration'])
        budget = float(data['budget'])
        
        # Budget validation - minimum budget per day calculation
        # Minimum daily costs: Transport (500) + Food (600) + Accommodation (800) = 1900 per day
        min_budget_per_day = 1900
        min_total_budget = min_budget_per_day * duration
        
        # Check if budget is too low
        if budget < min_total_budget:
            return jsonify({
                'success': False,
                'message': f'यह बजट बहुत कम है। {duration} दिन की यात्रा के लिए कम से कम ₹{min_total_budget} की आवश्यकता है। कृपया अपना बजट बढ़ाएं।',
                'message_en': f'This budget is too low. For a {duration}-day trip, minimum ₹{min_total_budget} is required. Please increase your budget.',
                'minimum_budget': min_total_budget,
                'provided_budget': budget,
                'shortfall': min_total_budget - budget
            }), 400
        
        preferences = {
            'duration': duration,
            'budget': budget,
            'interests': data['interests'],
            'start_location': data.get('start_location', 'Dehradun'),
            'travel_style': data.get('travel_style', 'moderate'),
            'accommodation_type': data.get('accommodation_type', 'hotel'),
            'transport_mode': data.get('transport_mode', 'mixed')
        }
        
        # Get Gemini service
        try:
            gemini_service = get_gemini_service()
        except ValueError as e:
            return jsonify({
                'success': False,
                'message': 'AI service is not configured. Please check GEMINI_API_KEY.'
            }), 500
        
        # Track start time for activity logging
        start_time = time.time()
        
        # Generate itinerary
        result = gemini_service.generate_itinerary(
            preferences=preferences,
            language=language
        )
        
        # Calculate duration
        duration_ms = (time.time() - start_time) * 1000
        
        # Log activity (get user_id from request or use 'anonymous')
        user_id = get_current_user_id() or data.get('user_id', 'anonymous')
        try:
            log_itinerary_generation(
                user_id=user_id,
                preferences=preferences,
                result=result,
                duration_ms=duration_ms
            )
        except Exception as log_error:
            logger.warning(f"Failed to log activity: {str(log_error)}")
        
        if result.get('success'):
            itinerary_data = result.get('itinerary', {})
            
            # Optionally save to database
            save_to_db = data.get('save', False)
            if save_to_db:
                itinerary_model = get_itinerary_model()
                saved = itinerary_model.create_itinerary({
                    'user_id': user_id,
                    'duration': preferences['duration'],
                    'budget': preferences['budget'],
                    'preferences': preferences,
                    'itinerary': itinerary_data
                })
                if saved.get('success'):
                    itinerary_data['_id'] = saved['data']['_id']
            
            return jsonify({
                'success': True,
                'itinerary': itinerary_data,
                'language': language
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': result.get('message', 'Failed to generate itinerary')
            }), 500
            
    except Exception as e:
        logger.error(f"Error in generate_itinerary: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Internal server error'
        }), 500

@itinerary_bp.route('/suggestions', methods=['GET'])
def get_suggestions():
    """
    Get quick itinerary suggestions
    
    Query params:
    - duration: optional, default 3
    - budget: optional, default 50000
    """
    try:
        duration = request.args.get('duration', '3')
        budget = request.args.get('budget', '50000')
        
        try:
            duration = int(duration)
            budget = int(budget)
        except ValueError:
            duration = 3
            budget = 50000
        
        suggestions = {
            'quick_trips': [
                {
                    'name': 'Char Dham Yatra',
                    'duration': 7,
                    'budget': 50000,
                    'description': 'Spiritual journey to four sacred shrines'
                },
                {
                    'name': 'Hill Station Tour',
                    'duration': 5,
                    'budget': 30000,
                    'description': 'Visit Mussoorie, Nainital, and Ranikhet'
                },
                {
                    'name': 'Adventure Trek',
                    'duration': 4,
                    'budget': 25000,
                    'description': 'Trekking in Garhwal Himalayas'
                }
            ],
            'interests': [
                'Temples & Spirituality',
                'Trekking & Adventure',
                'Wildlife & Nature',
                'Hill Stations',
                'Yoga & Wellness',
                'Photography',
                'Local Culture'
            ],
            'travel_styles': [
                'Budget',
                'Moderate',
                'Luxury',
                'Backpacker',
                'Family Friendly'
            ]
        }
        
        return jsonify({
            'success': True,
            'suggestions': suggestions
        }), 200
        
    except Exception as e:
        logger.error(f"Error in get_suggestions: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to get suggestions'
        }), 500

@itinerary_bp.route('/<itinerary_id>', methods=['GET'])
def get_itinerary(itinerary_id: str):
    """Get saved itinerary by ID"""
    try:
        itinerary_model = get_itinerary_model()
        result = itinerary_model.get_itinerary(itinerary_id)
        
        if result.get('success'):
            return jsonify(result), 200
        else:
            return jsonify(result), 404
            
    except Exception as e:
        logger.error(f"Error in get_itinerary: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Internal server error'
        }), 500

