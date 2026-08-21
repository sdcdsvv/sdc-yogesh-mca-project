"""
Authentication API Routes
Signup, Login, Profile Management
"""
from flask import Blueprint, request, jsonify
from app.config.database import get_database
from app.models.user import User
from app.utils.auth import generate_token, require_auth
import re

# Try to import email_validator, use regex fallback if not available
try:
    from email_validator import validate_email, EmailNotValidError
    EMAIL_VALIDATOR_AVAILABLE = True
except ImportError:
    EMAIL_VALIDATOR_AVAILABLE = False
    print("Warning: email-validator not installed. Using basic email validation.")

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


def validate_email_format(email):
    """Basic email validation using regex"""
    if EMAIL_VALIDATOR_AVAILABLE:
        try:
            validate_email(email)
            return True
        except EmailNotValidError:
            return False
    else:
        # Basic regex validation
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None


@auth_bp.route('/signup', methods=['POST'])
def signup():
    """
    User signup endpoint
    
    Request Body:
        {
            "email": "user@example.com",
            "password": "password123",
            "name": "User Name",
            "language": "english"  # optional
        }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        email = data.get('email', '').strip()
        password = data.get('password', '')
        name = data.get('name', '').strip()
        language = data.get('language', 'english')
        
        if not email or not password or not name:
            return jsonify({
                'success': False,
                'error': 'Email, password, and name are required'
            }), 400
        
        # Validate email format
        if not validate_email_format(email):
            return jsonify({
                'success': False,
                'error': 'Invalid email format'
            }), 400
        
        # Validate password strength
        if len(password) < 6:
            return jsonify({
                'success': False,
                'error': 'Password must be at least 6 characters long'
            }), 400
        
        # Create user
        db = get_database()
        user_model = User(db)
        
        try:
            user = user_model.create_user(email, password, name, language)
        except ValueError as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 409
        
        # Generate JWT token
        token = generate_token(str(user['_id']), user['email'])
        
        # Convert ObjectId to string
        user['_id'] = str(user['_id'])
        
        return jsonify({
            'success': True,
            'message': f'Welcome to Uttarakhand Tourism, {user["name"]}!',
            'is_new_user': True,
            'data': {
                'user': user,
                'token': token
            }
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Signup failed: {str(e)}'
        }), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    User login endpoint
    
    Request Body:
        {
            "email": "user@example.com",
            "password": "password123"
        }
    """
    try:
        data = request.get_json()
        
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({
                'success': False,
                'error': 'Email and password are required'
            }), 400
        
        # Authenticate user
        db = get_database()
        user_model = User(db)
        
        user = user_model.authenticate(email, password)
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'Invalid email or password'
            }), 401
        
        # Generate JWT token
        token = generate_token(str(user['_id']), user['email'])
        
        # Determine welcome message
        is_first_login = user.get('is_first_login', False)
        if is_first_login:
            welcome_message = f'Welcome to Uttarakhand Tourism, {user["name"]}!'
        else:
            welcome_message = f'Welcome back, {user["name"]}!'
        
        # Convert ObjectId to string
        user['_id'] = str(user['_id'])
        
        return jsonify({
            'success': True,
            'message': welcome_message,
            'is_new_user': is_first_login,
            'data': {
                'user': user,
                'token': token
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Login failed: {str(e)}'
        }), 500


@auth_bp.route('/profile', methods=['GET'])
@require_auth
def get_profile(current_user):
    """
    Get current user profile
    Requires authentication
    """
    try:
        db = get_database()
        user_model = User(db)
        
        user = user_model.get_user_by_id(current_user['user_id'])
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        # Convert ObjectId to string
        user['_id'] = str(user['_id'])
        
        return jsonify({
            'success': True,
            'data': {'user': user}
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get profile: {str(e)}'
        }), 500


@auth_bp.route('/profile', methods=['PUT'])
@require_auth
def update_profile(current_user):
    """
    Update user profile
    Requires authentication
    
    Request Body:
        {
            "name": "New Name",
            "language": "hindi",
            "preferences": {...}
        }
    """
    try:
        data = request.get_json()
        
        # Remove sensitive fields
        data.pop('email', None)
        data.pop('password', None)
        data.pop('_id', None)
        
        db = get_database()
        user_model = User(db)
        
        success = user_model.update_user(current_user['user_id'], data)
        
        if not success:
            return jsonify({
                'success': False,
                'error': 'Failed to update profile'
            }), 400
        
        # Get updated user
        user = user_model.get_user_by_id(current_user['user_id'])
        user['_id'] = str(user['_id'])
        
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully',
            'data': {'user': user}
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to update profile: {str(e)}'
        }), 500


@auth_bp.route('/change-password', methods=['POST'])
@require_auth
def change_password(current_user):
    """
    Change user password
    Requires authentication
    
    Request Body:
        {
            "old_password": "oldpass123",
            "new_password": "newpass123"
        }
    """
    try:
        data = request.get_json()
        
        old_password = data.get('old_password', '')
        new_password = data.get('new_password', '')
        
        if not old_password or not new_password:
            return jsonify({
                'success': False,
                'error': 'Old and new passwords are required'
            }), 400
        
        if len(new_password) < 6:
            return jsonify({
                'success': False,
                'error': 'New password must be at least 6 characters long'
            }), 400
        
        db = get_database()
        user_model = User(db)
        
        success = user_model.update_password(
            current_user['user_id'],
            old_password,
            new_password
        )
        
        if not success:
            return jsonify({
                'success': False,
                'error': 'Failed to change password. Check your old password.'
            }), 400
        
        return jsonify({
            'success': True,
            'message': 'Password changed successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to change password: {str(e)}'
        }), 500


@auth_bp.route('/verify', methods=['GET'])
@require_auth
def verify_token(current_user):
    """
    Verify JWT token validity
    Requires authentication
    """
    return jsonify({
        'success': True,
        'message': 'Token is valid',
        'data': {
            'user_id': current_user['user_id'],
            'email': current_user['email']
        }
    }), 200
