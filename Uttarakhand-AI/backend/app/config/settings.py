import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application configuration"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://admin:password123@localhost:27017/uttarakhand_tourism')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    WEATHER_API_KEY = os.getenv('WEATHER_API_KEY')
    
    # Application settings
    DEBUG = os.getenv('FLASK_ENV') == 'development'
    UPLOAD_FOLDER = 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    
    # Gemini settings
    GEMINI_MODEL = 'gemini-2.0-flash'
    GEMINI_VISION_MODEL = 'gemini-2.0-flash'
    
    # Database settings
    DB_NAME = 'uttarakhand_tourism'