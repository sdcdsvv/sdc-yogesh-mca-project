"""Vision API endpoints for image analysis"""
from flask import Blueprint, request, jsonify
from app.services.gemini_service import get_gemini_service
from app.utils.validators import validate_language, validate_image_format
from app.utils.logger import logger
from app.config.settings import Config
from app.utils.activity_helper import log_vision_analysis
from app.utils.auth import get_current_user_id
import base64
import time

vision_bp = Blueprint('vision', __name__)

@vision_bp.route('/analyze', methods=['POST'])
def analyze_image():
    """
    Analyze uploaded image file
    
    Request: multipart/form-data
    - file: image file
    - language: optional, default 'english'
    """
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'message': 'No file provided'
            }), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'message': 'No file selected'
            }), 400
        
        # Validate file format
        if not validate_image_format(file.filename):
            return jsonify({
                'success': False,
                'message': 'Invalid image format. Supported: JPG, PNG, WEBP, GIF'
            }), 400
        
        # Get language
        language = request.form.get('language', 'english').lower()
        if not validate_language(language):
            language = 'english'
        
        # Read file data
        image_data = file.read()
        
        # Check file size (16MB max)
        if len(image_data) > Config.MAX_CONTENT_LENGTH:
            return jsonify({
                'success': False,
                'message': f'File too large. Maximum size: {Config.MAX_CONTENT_LENGTH / (1024*1024)}MB'
            }), 400
        
        # Get Gemini service
        try:
            gemini_service = get_gemini_service()
        except ValueError as e:
            return jsonify({
                'success': False,
                'message': 'AI service is not configured. Please check GEMINI_API_KEY.'
            }), 500
        
        # Get enhanced recognition flag
        use_enhanced = request.form.get('enhanced', 'true').lower() == 'true'
        
        # Track start time
        start_time = time.time()
        
        # Analyze image
        result = gemini_service.analyze_image(
            image_data=image_data,
            language=language,
            use_enhanced_recognition=use_enhanced
        )
        
        # Calculate duration
        duration_ms = (time.time() - start_time) * 1000
        
        # Log activity
        user_id = get_current_user_id() or 'anonymous'
        try:
            log_vision_analysis(
                user_id=user_id,
                language=language,
                result=result,
                duration_ms=duration_ms
            )
        except Exception as log_error:
            logger.warning(f"Failed to log activity: {str(log_error)}")
        
        if result.get('success'):
            return jsonify({
                'success': True,
                'identified': result.get('identified', False),
                'confidence': result.get('confidence', 'medium'),
                'database_matched': result.get('database_matched', False),
                'landmarks_detected': result.get('landmarks_detected', 0),
                'data': result.get('data', {}),
                'raw_response': result.get('raw_response', ''),
                'language': language
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': result.get('message', 'Failed to analyze image')
            }), 500
            
    except Exception as e:
        logger.error(f"Error in analyze_image: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Internal server error'
        }), 500

@vision_bp.route('/places/search', methods=['GET'])
def search_places():
    """
    Search for places in database
    
    Query params:
    - q: search query
    - type: filter by type (temple, hill_station, etc.)
    - district: filter by district
    """
    try:
        from app.services.place_matcher import get_place_matcher
        
        query = request.args.get('q', '').strip()
        place_type = request.args.get('type', '').strip()
        district = request.args.get('district', '').strip()
        
        place_matcher = get_place_matcher()
        
        if query:
            # Search by name
            results = place_matcher.get_suggestions(query, limit=10)
        elif place_type:
            # Filter by type
            results = place_matcher.get_places_by_type(place_type)
        elif district:
            # Filter by district
            results = place_matcher.get_places_by_district(district)
        else:
            # Return all places
            results = list(place_matcher.KNOWN_PLACES.values())
        
        # Log activity
        user_id = get_current_user_id() or 'anonymous'
        try:
            from app.utils.activity_helper import get_activity_logger
            activity_logger = get_activity_logger()
            activity_logger.log(
                user_id=user_id,
                service_type='places',
                action='search',
                details={
                    'description': 'Searched for places',
                    'query': query or place_type or district or 'all'
                },
                request_data={
                    'query': query,
                    'type': place_type,
                    'district': district
                },
                response_data={'success': True, 'results_count': len(results)}
            )
        except Exception as log_error:
            logger.warning(f"Failed to log activity: {str(log_error)}")
        
        return jsonify({
            'success': True,
            'count': len(results),
            'places': results
        }), 200
        
    except Exception as e:
        logger.error(f"Error in search_places: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to search places'
        }), 500

@vision_bp.route('/analyze-base64', methods=['POST'])
def analyze_image_base64():
    """
    Analyze image from base64 string
    
    Request body:
    {
        "image": "data:image/jpeg;base64,...",
        "language": "english|hindi|garhwali|kumaoni"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'Request body is required'
            }), 400
        
        image_base64 = data.get('image', '')
        if not image_base64:
            return jsonify({
                'success': False,
                'message': 'Image data is required'
            }), 400
        
        # Validate base64 format
        if not image_base64.startswith('data:image/'):
            return jsonify({
                'success': False,
                'message': 'Invalid image format. Expected data:image/...;base64,...'
            }), 400
        
        # Get language
        language = data.get('language', 'english').lower()
        if not validate_language(language):
            language = 'english'
        
        # Get Gemini service
        try:
            gemini_service = get_gemini_service()
        except ValueError as e:
            return jsonify({
                'success': False,
                'message': 'AI service is not configured. Please check GEMINI_API_KEY.'
            }), 500
        
        # Get enhanced recognition flag
        use_enhanced = data.get('enhanced', True)
        
        # Analyze image
        result = gemini_service.analyze_image_base64(
            base64_data=image_base64,
            language=language
        )
        
        if result.get('success'):
            return jsonify({
                'success': True,
                'identified': result.get('identified', False),
                'confidence': result.get('confidence', 'medium'),
                'database_matched': result.get('database_matched', False),
                'landmarks_detected': result.get('landmarks_detected', 0),
                'data': result.get('data', {}),
                'raw_response': result.get('raw_response', ''),
                'language': language
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': result.get('message', 'Failed to analyze image')
            }), 500
            
    except Exception as e:
        logger.error(f"Error in analyze_image_base64: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Internal server error'
        }), 500

