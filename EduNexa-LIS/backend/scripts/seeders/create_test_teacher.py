"""
Script to create a test teacher account for integration testing
"""
import sys
import os
from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from datetime import datetime
from dotenv import load_dotenv

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

# Load environment variables
load_dotenv()

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/edunexa_lms')
client = MongoClient(MONGO_URI)
db = client.get_database()

def create_test_teacher():
    """Create a test teacher account"""
    
    # Check if teacher already exists
    existing_teacher = db.users.find_one({'email': 'teacher@test.com'})
    
    if existing_teacher:
        print('✅ Test teacher already exists')
        print(f'   Email: teacher@test.com')
        print(f'   ID: {existing_teacher["_id"]}')
        return existing_teacher
    
    # Create new teacher
    teacher_data = {
        'name': 'Test Teacher',
        'email': 'teacher@test.com',
        'password': generate_password_hash('test123'),
        'role': 'teacher',
        'department': 'Computer Science',
        'employee_id': 'TCH-TEST-001',
        'phone': '+1234567890',
        'is_active': True,
        'created_at': datetime.utcnow()
    }
    
    result = db.users.insert_one(teacher_data)
    teacher_data['_id'] = result.inserted_id
    
    print('✅ Test teacher created successfully!')
    print(f'   Email: teacher@test.com')
    print(f'   Password: test123')
    print(f'   ID: {result.inserted_id}')
    
    return teacher_data

if __name__ == '__main__':
    try:
        print('Creating test teacher account...')
        create_test_teacher()
        print('\n✅ Test teacher setup complete!')
    except Exception as e:
        print(f'❌ Error creating test teacher: {e}')
        sys.exit(1)
