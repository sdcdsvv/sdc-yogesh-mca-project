from flask import Flask, jsonify
from flask_cors import CORS
from app.config.settings import Config
from app.config.database import get_database
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Configure CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Initialize database connection
    try:
        db = get_database()
        print("✓ Database connected successfully")
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
    
    # Register blueprints
    from app.api.auth_routes import auth_bp
    from app.api.chat_routes import chat_bp as chat_history_bp
    from app.api.activity_routes import activity_bp
    
    # Register authentication, chat history, and activity routes
    app.register_blueprint(auth_bp)
    app.register_blueprint(chat_history_bp)
    app.register_blueprint(activity_bp)
    
    # Register existing blueprints
    try:
        from app.api.chat import chat_bp
        from app.api.vision import vision_bp
        from app.api.itinerary import itinerary_bp
        from app.api.emergency import emergency_bp
        
        app.register_blueprint(chat_bp, url_prefix='/api/chat')
        app.register_blueprint(vision_bp, url_prefix='/api/vision')
        app.register_blueprint(itinerary_bp, url_prefix='/api/itinerary')
        app.register_blueprint(emergency_bp, url_prefix='/api/emergency')
    except ImportError as e:
        print(f"Warning: Some API routes not found: {e}")
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        try:
            db = get_database()
            db.command('ping')
            db_status = "connected"
        except:
            db_status = "disconnected"
        
        return jsonify({
            'success': True,
            'status': 'healthy',
            'database': db_status
        }), 200
    
    # Root endpoint
    @app.route('/', methods=['GET'])
    def root():
        return jsonify({
            'success': True,
            'message': 'Uttarakhand Tourism AI API',
            'version': '2.0',
            'endpoints': {
                'auth': '/api/auth',
                'chat': '/api/chat',
                'vision': '/api/vision',
                'itinerary': '/api/itinerary',
                'emergency': '/api/emergency',
                'activity': '/api/activity',
                'health': '/api/health'
            }
        }), 200
    
    return app