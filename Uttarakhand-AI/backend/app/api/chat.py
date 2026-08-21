"""Chat API endpoints"""
from flask import Blueprint, request, jsonify
from app.services.gemini_service import get_gemini_service
from app.services.translation_service import get_translation_service
from app.utils.validators import validate_language, sanitize_input
from app.utils.logger import logger
from app.utils.activity_helper import log_chat_interaction
from app.utils.auth import get_current_user_id
import time

chat_bp = Blueprint('chat_ai', __name__)

@chat_bp.route('/message', methods=['POST'])
def send_message():
    """
    Send a chat message to AI guide
    
    Request body:
    {
        "message": "string",
        "language": "english|hindi|garhwali|kumaoni",
        "conversation_history": [{"role": "user|assistant", "content": "string"}]
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'Request body is required'
            }), 400
        
        message = data.get('message', '').strip()
        if not message:
            return jsonify({
                'success': False,
                'message': 'Message is required'
            }), 400
        
        # Sanitize input
        message = sanitize_input(message, max_length=1000)
        
        # Validate and get language
        language = data.get('language', 'english').lower()
        if not validate_language(language):
            language = 'english'
        
        # Get conversation history
        conversation_history = data.get('conversation_history', [])
        
        # Get Gemini service
        try:
            gemini_service = get_gemini_service()
        except ValueError as e:
            return jsonify({
                'success': False,
                'message': 'AI service is not configured. Please check GEMINI_API_KEY.'
            }), 500
        
        # Track start time
        start_time = time.time()
        
        # Get AI response
        response = gemini_service.chat_with_context(
            message=message,
            language=language,
            conversation_history=conversation_history
        )
        
        # Calculate duration
        duration_ms = (time.time() - start_time) * 1000
        
        # Log activity
        user_id = get_current_user_id() or 'anonymous'
        try:
            log_chat_interaction(
                user_id=user_id,
                query=message,
                response=response.get('message', ''),
                language=language,
                duration_ms=duration_ms
            )
        except Exception as log_error:
            logger.warning(f"Failed to log activity: {str(log_error)}")
        
        if response.get('success'):
            return jsonify({
                'success': True,
                'response': response.get('message', ''),
                'language': language
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': response.get('message', 'Failed to get response')
            }), 500
            
    except Exception as e:
        logger.error(f"Error in send_message: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Internal server error'
        }), 500

@chat_bp.route('/translate', methods=['POST'])
def translate():
    """
    Translate text between supported languages
    
    Request body:
    {
        "text": "string",
        "source_language": "english|hindi|garhwali|kumaoni",
        "target_language": "english|hindi|garhwali|kumaoni"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'Request body is required'
            }), 400
        
        text = data.get('text', '').strip()
        if not text:
            return jsonify({
                'success': False,
                'message': 'Text is required'
            }), 400
        
        source_language = data.get('source_language', 'english').lower()
        target_language = data.get('target_language', 'hindi').lower()
        
        # Validate languages
        if not validate_language(source_language):
            source_language = 'english'
        if not validate_language(target_language):
            target_language = 'hindi'
        
        # Get translation service
        translation_service = get_translation_service()
        
        # Translate
        result = translation_service.translate(
            text=text,
            source_language=source_language,
            target_language=target_language
        )
        
        return jsonify(result), 200 if result.get('success') else 500
        
    except Exception as e:
        logger.error(f"Error in translate: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Translation failed'
        }), 500

@chat_bp.route('/suggestions', methods=['GET'])
def get_suggestions():
    """
    Get quick suggestion chips for chat
    
    Query params:
    - language: optional, default 'english'
    """
    try:
        language = request.args.get('language', 'english').lower()
        if not validate_language(language):
            language = 'english'
        
        suggestions = {
            'english': [
                "Best places to visit in Uttarakhand",
                "Adventure activities",
                "Best time to visit",
                "Local food recommendations",
                "Trekking routes",
                "Temple information",
                "Weather conditions"
            ],
            'hindi': [
                "उत्तराखंड में घूमने की जगहें",
                "रोमांचक गतिविधियाँ",
                "सबसे अच्छा समय",
                "स्थानीय भोजन",
                "ट्रेकिंग रूट",
                "मंदिर जानकारी",
                "मौसम की स्थिति"
            ],
            'garhwali': [
                "उत्तराखंड मा घूमण कि जगह",
                "रोमांचक गतिविधि",
                "सबसे अच्छा समय",
                "स्थानीय खाना",
                "ट्रेकिंग रूट",
                "मंदिर जानकारी",
                "मौसम"
            ],
            'kumaoni': [
                "उत्तराखंड मा घूमण कि जगह",
                "रोमांचक गतिविधि",
                "सबसे अच्छा समय",
                "स्थानीय खाना",
                "ट्रेकिंग रूट",
                "मंदिर जानकारी",
                "मौसम"
            ]
        }
        
        return jsonify({
            'success': True,
            'suggestions': suggestions.get(language, suggestions['english']),
            'language': language
        }), 200
        
    except Exception as e:
        logger.error(f"Error in get_suggestions: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to get suggestions'
        }), 500

