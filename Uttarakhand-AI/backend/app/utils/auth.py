"""
Authentication Utilities
JWT token generation and validation
"""
import os
import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
from dotenv import load_dotenv

load_dotenv()

# JWT Configuration
JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24  # 1 day

# Server start time for session invalidation
SERVER_START_TIME = datetime.utcnow()


def generate_token(user_id: str, email: str) -> str:
    """
    Generate JWT token for user
    Token expires in 24 hours
    
    Args:
        user_id: User ID
        email: User email
    
    Returns:
        JWT token string
    """
    payload = {
        'user_id': str(user_id),
        'email': email,
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        'iat': datetime.utcnow(),
        'server_start': SERVER_START_TIME.isoformat()  # Track server session
    }
    
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


def decode_token(token: str) -> dict:
    """
    Decode and validate JWT token
    Checks both expiration and server restart
    
    Args:
        token: JWT token string
    
    Returns:
        Decoded payload dict
    
    Raises:
        jwt.ExpiredSignatureError: Token has expired
        jwt.InvalidTokenError: Token is invalid
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        # Check if token was issued before server restart
        token_server_start = payload.get('server_start')
        if token_server_start:
            token_start_time = datetime.fromisoformat(token_server_start)
            if token_start_time < SERVER_START_TIME:
                raise ValueError("Session expired. Please login again.")
        
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired. Please login again.")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token")


def get_token_from_header() -> str:
    """
    Extract JWT token from Authorization header
    
    Returns:
        Token string
    
    Raises:
        ValueError: If token is missing or invalid format
    """
    auth_header = request.headers.get('Authorization')
    
    if not auth_header:
        raise ValueError("Authorization header is missing")
    
    parts = auth_header.split()
    
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        raise ValueError("Invalid authorization header format. Use: Bearer <token>")
    
    return parts[1]


def require_auth(f):
    """
    Decorator to require authentication for routes
    Adds 'current_user' to kwargs with user_id and email
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            # Get token from header
            token = get_token_from_header()
            
            # Decode token
            payload = decode_token(token)
            
            # Add user info to kwargs
            kwargs['current_user'] = {
                'user_id': payload['user_id'],
                'email': payload['email']
            }
            
            return f(*args, **kwargs)
            
        except ValueError as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 401
        except Exception as e:
            return jsonify({
                'success': False,
                'error': 'Authentication failed'
            }), 401
    
    return decorated_function


def optional_auth(f):
    """
    Decorator for optional authentication
    Adds 'current_user' to kwargs if authenticated, None otherwise
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            # Try to get token
            token = get_token_from_header()
            payload = decode_token(token)
            
            kwargs['current_user'] = {
                'user_id': payload['user_id'],
                'email': payload['email']
            }
        except:
            # No authentication, continue without user
            kwargs['current_user'] = None
        
        return f(*args, **kwargs)
    
    return decorated_function


def get_current_user_id() -> str:
    """
    Get current user ID from request context
    Returns 'anonymous' if not authenticated
    
    Returns:
        User ID string or 'anonymous'
    """
    try:
        token = get_token_from_header()
        payload = decode_token(token)
        return payload.get('user_id', 'anonymous')
    except:
        return None
