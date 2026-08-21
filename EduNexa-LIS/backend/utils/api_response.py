"""
API response utilities for consistent field naming
Implements Requirement 7.6: API field naming conventions
"""
from functools import wraps
from flask import jsonify
from utils.case_converter import convert_dict_keys_to_camel


def camelcase_response(f):
    """
    Decorator to automatically convert API response keys from snake_case to camelCase
    
    Usage:
        @app.route('/api/users')
        @camelcase_response
        def get_users():
            # Return data with snake_case keys from database
            return {'user_id': '123', 'created_at': '2024-01-01'}, 200
            # Client receives: {'userId': '123', 'createdAt': '2024-01-01'}
    
    This ensures:
    - Database uses snake_case (course_id, student_id, created_at)
    - API responses use camelCase (courseId, studentId, createdAt)
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        result = f(*args, **kwargs)
        
        # Handle different return formats
        if isinstance(result, tuple):
            # Format: (data, status_code) or (data, status_code, headers)
            data = result[0]
            status_code = result[1] if len(result) > 1 else 200
            headers = result[2] if len(result) > 2 else {}
            
            # Convert response data if it's a dict
            if hasattr(data, 'get_json'):
                # Already a Response object, extract JSON
                json_data = data.get_json()
                converted_data = convert_dict_keys_to_camel(json_data)
                return jsonify(converted_data), status_code, headers
            elif isinstance(data, dict):
                converted_data = convert_dict_keys_to_camel(data)
                return jsonify(converted_data), status_code, headers
            else:
                return result
        else:
            # Single return value
            if hasattr(result, 'get_json'):
                json_data = result.get_json()
                converted_data = convert_dict_keys_to_camel(json_data)
                return jsonify(converted_data)
            elif isinstance(result, dict):
                converted_data = convert_dict_keys_to_camel(result)
                return jsonify(converted_data)
            else:
                return result
    
    return decorated_function


def prepare_api_response(data, message=None, status_code=200):
    """
    Prepare a standardized API response with camelCase keys
    
    Args:
        data: Dictionary or list to include in response
        message: Optional success/error message
        status_code: HTTP status code
        
    Returns:
        Tuple of (jsonified_response, status_code)
        
    Example:
        >>> prepare_api_response({'user_id': '123'}, 'User found', 200)
        ({'userId': '123', 'message': 'User found'}, 200)
    """
    response = {}
    
    if message:
        response['message'] = message
    
    if data is not None:
        if isinstance(data, dict):
            # Merge converted data into response
            converted_data = convert_dict_keys_to_camel(data)
            response.update(converted_data)
        elif isinstance(data, list):
            # Convert list items
            response['data'] = convert_dict_keys_to_camel(data)
        else:
            response['data'] = data
    
    return jsonify(response), status_code


def error_response(message, status_code=400, **kwargs):
    """
    Create a standardized error response
    
    Args:
        message: Error message
        status_code: HTTP status code
        **kwargs: Additional fields to include in response
        
    Returns:
        Tuple of (jsonified_response, status_code)
        
    Example:
        >>> error_response('User not found', 404, user_id='123')
        ({'error': 'User not found', 'userId': '123'}, 404)
    """
    response = {'error': message}
    
    if kwargs:
        converted_kwargs = convert_dict_keys_to_camel(kwargs)
        response.update(converted_kwargs)
    
    return jsonify(response), status_code


def success_response(message, data=None, status_code=200):
    """
    Create a standardized success response
    
    Args:
        message: Success message
        data: Optional data to include
        status_code: HTTP status code
        
    Returns:
        Tuple of (jsonified_response, status_code)
        
    Example:
        >>> success_response('User created', {'user_id': '123'}, 201)
        ({'message': 'User created', 'userId': '123'}, 201)
    """
    return prepare_api_response(data, message, status_code)
