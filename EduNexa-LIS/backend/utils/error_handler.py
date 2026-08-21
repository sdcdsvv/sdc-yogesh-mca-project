"""
Centralized error handling for Flask application
"""
from flask import jsonify
from werkzeug.exceptions import HTTPException
import traceback
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class APIError(Exception):
    """Custom API error class"""
    def __init__(self, message, status_code=400, field=None, code=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.field = field
        self.code = code

def register_error_handlers(app):
    """Register error handlers with Flask app"""
    
    @app.errorhandler(APIError)
    def handle_api_error(error):
        """Handle custom API errors"""
        response = {
            'error': error.message,
            'status': error.status_code
        }
        if error.field:
            response['field'] = error.field
        if error.code:
            response['code'] = error.code
        
        logger.warning(f"API Error: {error.message} (Status: {error.status_code})")
        return jsonify(response), error.status_code
    
    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        """Handle HTTP exceptions"""
        response = {
            'error': error.description or 'An error occurred',
            'status': error.code
        }
        
        logger.warning(f"HTTP Error: {error.description} (Status: {error.code})")
        return jsonify(response), error.code
    
    @app.errorhandler(ValueError)
    def handle_value_error(error):
        """Handle value errors"""
        response = {
            'error': str(error),
            'status': 400
        }
        
        logger.warning(f"Value Error: {str(error)}")
        return jsonify(response), 400
    
    @app.errorhandler(KeyError)
    def handle_key_error(error):
        """Handle missing key errors"""
        response = {
            'error': f'Missing required field: {str(error)}',
            'status': 400
        }
        
        logger.warning(f"Key Error: {str(error)}")
        return jsonify(response), 400
    
    @app.errorhandler(Exception)
    def handle_generic_error(error):
        """Handle all other exceptions"""
        # Log the full traceback for debugging
        logger.error(f"Unhandled Exception: {str(error)}")
        logger.error(traceback.format_exc())
        
        # Don't expose internal errors in production
        if app.config.get('DEBUG', False):
            response = {
                'error': str(error),
                'status': 500,
                'traceback': traceback.format_exc()
            }
        else:
            response = {
                'error': 'An internal server error occurred. Please try again later.',
                'status': 500
            }
        
        return jsonify(response), 500
    
    @app.errorhandler(404)
    def handle_not_found(error):
        """Handle 404 errors"""
        response = {
            'error': 'Resource not found',
            'status': 404
        }
        return jsonify(response), 404
    
    @app.errorhandler(405)
    def handle_method_not_allowed(error):
        """Handle 405 errors"""
        response = {
            'error': 'Method not allowed',
            'status': 405
        }
        return jsonify(response), 405
    
    @app.errorhandler(500)
    def handle_internal_error(error):
        """Handle 500 errors"""
        logger.error(f"Internal Server Error: {str(error)}")
        logger.error(traceback.format_exc())
        
        response = {
            'error': 'An internal server error occurred. Please try again later.',
            'status': 500
        }
        return jsonify(response), 500

def log_request_error(error, context=None):
    """Log request errors with context"""
    error_msg = f"Error: {str(error)}"
    if context:
        error_msg = f"{context} - {error_msg}"
    
    logger.error(error_msg)
    logger.error(traceback.format_exc())

def create_error_response(message, status_code=400, field=None, code=None):
    """Create a standardized error response"""
    response = {
        'error': message,
        'status': status_code
    }
    if field:
        response['field'] = field
    if code:
        response['code'] = code
    
    return jsonify(response), status_code

def validate_request_data(data, required_fields):
    """Validate that required fields are present in request data"""
    missing_fields = []
    for field in required_fields:
        if field not in data or data[field] is None or (isinstance(data[field], str) and not data[field].strip()):
            missing_fields.append(field)
    
    if missing_fields:
        raise APIError(
            f"Missing required fields: {', '.join(missing_fields)}",
            status_code=400,
            code='MISSING_FIELDS'
        )

def handle_database_error(error, operation='database operation'):
    """Handle database errors"""
    logger.error(f"Database error during {operation}: {str(error)}")
    logger.error(traceback.format_exc())
    
    raise APIError(
        f"Database error occurred during {operation}. Please try again.",
        status_code=500,
        code='DATABASE_ERROR'
    )

def handle_validation_error(error, field=None):
    """Handle validation errors"""
    logger.warning(f"Validation error: {str(error)}")
    
    raise APIError(
        str(error),
        status_code=400,
        field=field,
        code='VALIDATION_ERROR'
    )
