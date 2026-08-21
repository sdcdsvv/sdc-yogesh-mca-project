from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta
import os
import logging
from logging.handlers import RotatingFileHandler
from dotenv import load_dotenv

# Import route modules
from routes.auth import auth_bp
from routes.courses import courses_bp
from routes.assignments import assignments_bp
from routes.grading import grading_bp
from routes.users import users_bp
from routes.ai import ai_bp
from routes.analytics import analytics_bp
from routes.learner_analytics import learner_analytics_bp
from routes.notifications import notifications_bp
from routes.notification_settings import notification_settings_bp
from routes.videos import videos_bp
from routes.documents import documents_bp
from routes.progress import progress_bp
from routes.student_progress import student_progress_bp
from routes.discussions import discussions_bp
from routes.schedule import schedule_bp
from routes.achievements import achievements_bp
from routes.messages import messages_bp


# Import error handler
from utils.error_handler import register_error_handlers

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=2)  # Reduced to 2 hours
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=7)  # Refresh token expires in 7 days
app.config['MONGO_URI'] = os.getenv('MONGO_URI', 'mongodb://localhost:27017/edunexa_lms')

# Configure logging - Requirement 6.8: Log all file operations
# Create logs directory if it doesn't exist
logs_dir = os.path.join(os.path.dirname(__file__), 'logs')
os.makedirs(logs_dir, exist_ok=True)

# Configure file handler for general logs
file_handler = RotatingFileHandler(
    os.path.join(logs_dir, 'edunexa.log'),
    maxBytes=10485760,  # 10MB
    backupCount=10
)
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(logging.Formatter(
    '[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
))

# Configure file handler for file operations specifically
file_ops_handler = RotatingFileHandler(
    os.path.join(logs_dir, 'file_operations.log'),
    maxBytes=10485760,  # 10MB
    backupCount=10
)
file_ops_handler.setLevel(logging.INFO)
file_ops_handler.setFormatter(logging.Formatter(
    '[%(asctime)s] %(levelname)s - User: %(user_id)s - Operation: %(operation)s - File: %(file_path)s - %(message)s',
    defaults={'user_id': 'N/A', 'operation': 'N/A', 'file_path': 'N/A'}
))

# Configure error handler with full stack traces
error_handler = RotatingFileHandler(
    os.path.join(logs_dir, 'errors.log'),
    maxBytes=10485760,  # 10MB
    backupCount=10
)
error_handler.setLevel(logging.ERROR)
error_handler.setFormatter(logging.Formatter(
    '[%(asctime)s] %(levelname)s in %(module)s [%(pathname)s:%(lineno)d]:\n%(message)s\n'
))

# Add handlers to app logger
app.logger.addHandler(file_handler)
app.logger.addHandler(file_ops_handler)
app.logger.addHandler(error_handler)
app.logger.setLevel(logging.INFO)

# Also log to console in development
if app.debug:
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.DEBUG)
    console_handler.setFormatter(logging.Formatter(
        '[%(asctime)s] %(levelname)s: %(message)s'
    ))
    app.logger.addHandler(console_handler)

# Server startup time for session invalidation
SERVER_START_TIME = datetime.utcnow()
app.config['SERVER_START_TIME'] = SERVER_START_TIME.isoformat()

# Initialize extensions
# CORS configuration - supports both local development and production
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:3000",
    "http://192.160.108.56:5173",
    "http://192.160.108.56:5174",
]

# Add production frontend URL if provided
frontend_url = os.getenv('FRONTEND_URL')
if frontend_url:
    allowed_origins.append(frontend_url)

# Enhanced CORS configuration
CORS(app, 
     origins=allowed_origins, 
     supports_credentials=True,
     allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     expose_headers=['Content-Type', 'Authorization'])
jwt = JWTManager(app)

# Token blacklist set (in production, use Redis or database)
blacklisted_tokens = set()

# MongoDB connection
try:
    client = MongoClient(app.config['MONGO_URI'])
    db = client.edunexa_lms
    
    # Test connection
    client.admin.command('ping')
    print("✅ Connected to MongoDB successfully!")
    
    # Make db available to other modules
    app.db = db
    
except Exception as e:
    print(f"❌ Failed to connect to MongoDB: {e}")
    exit(1)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(courses_bp, url_prefix='/api/courses')
app.register_blueprint(assignments_bp, url_prefix='/api/assignments')
app.register_blueprint(grading_bp, url_prefix='/api/grading')
app.register_blueprint(users_bp, url_prefix='/api/users')
app.register_blueprint(ai_bp, url_prefix='/api/ai')
app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
app.register_blueprint(learner_analytics_bp, url_prefix='/api/learner-analytics')
app.register_blueprint(notifications_bp, url_prefix='/api')
app.register_blueprint(notification_settings_bp, url_prefix='/api')
app.register_blueprint(videos_bp, url_prefix='/api/videos')
app.register_blueprint(documents_bp, url_prefix='/api/documents')
app.register_blueprint(progress_bp, url_prefix='/api/progress')
app.register_blueprint(student_progress_bp, url_prefix='/api/student-progress')
app.register_blueprint(discussions_bp, url_prefix='/api/discussions')
app.register_blueprint(schedule_bp, url_prefix='/api/schedule')
app.register_blueprint(achievements_bp, url_prefix='/api/achievements')
app.register_blueprint(messages_bp, url_prefix='/api/messages')


# Register error handlers
register_error_handlers(app)

# Handle OPTIONS requests for CORS preflight
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = app.make_default_options_response()
        response.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'EduNexa LMS Backend is running',
        'timestamp': datetime.utcnow().isoformat()
    })

# Root endpoint
@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'status': 'online',
        'message': 'EduNexa LMS API is running. Please access the frontend application (typically on port 5173) to use the system.',
        'health_check': '/api/health'
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# JWT token blacklist checker
@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload['jti']
    token_issued_at = datetime.fromtimestamp(jwt_payload['iat'])
    user_id = jwt_payload['sub']
    
    # Check if token was issued before server restart
    if token_issued_at < SERVER_START_TIME:
        return True
    
    # Check if token is in blacklist
    if jti in blacklisted_tokens:
        return True
    
    # Check if user has invalidated all tokens after this token was issued
    try:
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user and user.get('tokens_valid_after'):
            if token_issued_at < user['tokens_valid_after']:
                return True
    except Exception:
        pass  # If there's an error checking the database, don't block the token
    
    return False

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Token has expired', 'code': 'TOKEN_EXPIRED'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({'error': 'Invalid token', 'code': 'TOKEN_INVALID'}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({'error': 'Authorization token is required', 'code': 'TOKEN_MISSING'}), 401

@jwt.revoked_token_loader
def revoked_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Token has been revoked', 'code': 'TOKEN_REVOKED'}), 401

if __name__ == '__main__':
    # Initialize database indexes
    from utils.db_init import initialize_database
    initialize_database(db)
    
    # Clean up expired tokens on startup
    from utils.token_cleanup import cleanup_expired_tokens
    cleanup_expired_tokens(db)
    
    # Run the application
    app.run(debug=True, host='0.0.0.0', port=5010)