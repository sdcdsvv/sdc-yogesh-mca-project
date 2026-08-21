"""
Pytest configuration for backend tests.
"""

import sys
import os
import pytest
from pymongo import MongoClient
from flask_jwt_extended import create_access_token
from bson import ObjectId
from datetime import datetime

# Add backend directory to path so we can import modules
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

@pytest.fixture
def app():
    """Create Flask app for testing"""
    from app import app as flask_app
    flask_app.config['TESTING'] = True
    flask_app.config['MONGO_URI'] = os.getenv('MONGO_URI', 'mongodb://localhost:27017/edunexa_lms_test')
    
    # Connect to test database
    client = MongoClient(flask_app.config['MONGO_URI'])
    db = client.edunexa_lms_test
    flask_app.db = db
    
    yield flask_app
    
    # Cleanup: drop test database after tests
    # client.drop_database('edunexa_lms_test')

@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()

@pytest.fixture
def db(app):
    """Get database instance"""
    return app.db

@pytest.fixture
def teacher_user(db):
    """Create a test teacher user"""
    teacher_data = {
        '_id': ObjectId(),
        'name': 'Test Teacher',
        'email': 'teacher@test.com',
        'role': 'teacher',
        'created_at': datetime.utcnow()
    }
    
    # Remove existing test teacher
    db.users.delete_many({'email': 'teacher@test.com'})
    
    # Insert new teacher
    db.users.insert_one(teacher_data)
    
    return teacher_data

@pytest.fixture
def teacher_token(app, teacher_user):
    """Create JWT token for teacher"""
    with app.app_context():
        token = create_access_token(identity=str(teacher_user['_id']))
        return token

@pytest.fixture
def student_user(db):
    """Create a test student user"""
    student_data = {
        '_id': ObjectId(),
        'name': 'Test Student',
        'email': 'student@test.com',
        'role': 'student',
        'created_at': datetime.utcnow()
    }
    
    # Remove existing test student
    db.users.delete_many({'email': 'student@test.com'})
    
    # Insert new student
    db.users.insert_one(student_data)
    
    return student_data

@pytest.fixture
def student_token(app, student_user):
    """Create JWT token for student"""
    with app.app_context():
        token = create_access_token(identity=str(student_user['_id']))
        return token
