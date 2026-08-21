#!/usr/bin/env python3
"""
EduNexa LMS Backend Startup Script
"""

import os
import sys
from app import app

def main():
    """Main function to run the Flask application"""
    
    print("🚀 Starting EduNexa LMS Backend...")
    print("=" * 50)
    
    # Check if MongoDB is accessible
    try:
        from pymongo import MongoClient
        mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/edunexa_lms')
        client = MongoClient(mongo_uri)
        client.admin.command('ping')
        print("✅ MongoDB connection successful")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        print("Please ensure MongoDB is running and accessible")
        sys.exit(1)
    
    # Check environment variables
    required_env_vars = ['JWT_SECRET_KEY']
    missing_vars = []
    
    for var in required_env_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"⚠️  Warning: Missing environment variables: {', '.join(missing_vars)}")
        print("Using default values for development")
    
    # Display configuration
    print(f"🌐 Server will start on: http://localhost:5010")
    print(f"🔧 Environment: {os.getenv('FLASK_ENV', 'development')}")
    print(f"🗄️  Database: {os.getenv('MONGO_URI', 'mongodb://localhost:27017/edunexa_lms')}")
    print("=" * 50)
    
    # Start the application
    try:
        app.run(
            debug=os.getenv('FLASK_DEBUG', 'True').lower() == 'true',
            host='0.0.0.0',
            port=int(os.getenv('PORT', 5000))
        )
    except KeyboardInterrupt:
        print("\n👋 Shutting down EduNexa LMS Backend...")
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()