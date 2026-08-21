"""
Script to create test data for teacher endpoint testing
Creates a course, assignment, and student submission
"""
import sys
import os
from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
from bson import ObjectId
from dotenv import load_dotenv

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

# Load environment variables
load_dotenv()

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/edunexa_lms')
client = MongoClient(MONGO_URI)
db = client.get_database()

def create_test_student():
    """Create a test student account"""
    existing_student = db.users.find_one({'email': 'student@test.com'})
    
    if existing_student:
        print('✅ Test student already exists')
        return str(existing_student['_id'])
    
    student_data = {
        'name': 'Test Student',
        'email': 'student@test.com',
        'password': generate_password_hash('test123'),
        'role': 'student',
        'department': 'Computer Science',
        'roll_no': 'STU-TEST-001',
        'phone': '+1234567891',
        'is_active': True,
        'total_points': 0,
        'created_at': datetime.utcnow()
    }
    
    result = db.users.insert_one(student_data)
    print(f'✅ Test student created: {result.inserted_id}')
    return str(result.inserted_id)

def create_test_course(teacher_id):
    """Create a test course"""
    existing_course = db.courses.find_one({'title': 'Test Course for Grading'})
    
    if existing_course:
        print('✅ Test course already exists')
        return str(existing_course['_id'])
    
    course_data = {
        'title': 'Test Course for Grading',
        'description': 'A test course for testing grading functionality',
        'category': 'Computer Science',
        'teacher_id': teacher_id,
        'difficulty': 'Beginner',
        'is_active': True,
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }
    
    result = db.courses.insert_one(course_data)
    print(f'✅ Test course created: {result.inserted_id}')
    return str(result.inserted_id)

def enroll_student(course_id, student_id):
    """Enroll student in course"""
    existing_enrollment = db.enrollments.find_one({
        'course_id': course_id,
        'student_id': student_id
    })
    
    if existing_enrollment:
        print('✅ Student already enrolled')
        return
    
    enrollment_data = {
        'course_id': course_id,
        'student_id': student_id,
        'enrolled_at': datetime.utcnow(),
        'progress': 0,
        'completed_materials': [],
        'is_active': True
    }
    
    db.enrollments.insert_one(enrollment_data)
    print('✅ Student enrolled in course')

def create_test_assignment(course_id):
    """Create a test assignment"""
    existing_assignment = db.assignments.find_one({
        'course_id': course_id,
        'title': 'Test Assignment for Grading'
    })
    
    if existing_assignment:
        print('✅ Test assignment already exists')
        return str(existing_assignment['_id'])
    
    assignment_data = {
        'title': 'Test Assignment for Grading',
        'description': 'A test assignment to verify grading functionality',
        'course_id': course_id,
        'due_date': datetime.utcnow() + timedelta(days=7),
        'max_points': 100,
        'submission_type': 'text',
        'is_active': True,
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }
    
    result = db.assignments.insert_one(assignment_data)
    print(f'✅ Test assignment created: {result.inserted_id}')
    return str(result.inserted_id)

def create_test_submission(assignment_id, student_id, course_id):
    """Create a test submission"""
    existing_submission = db.submissions.find_one({
        'assignment_id': assignment_id,
        'student_id': student_id
    })
    
    if existing_submission:
        print('✅ Test submission already exists')
        return str(existing_submission['_id'])
    
    submission_data = {
        'assignment_id': assignment_id,
        'student_id': student_id,
        'course_id': course_id,
        'text_content': 'This is a test submission for grading functionality testing.',
        'file_path': '',
        'file_name': '',
        'submitted_at': datetime.utcnow(),
        'status': 'submitted',
        'grade': None,
        'feedback': '',
        'graded_at': None,
        'graded_by': None
    }
    
    result = db.submissions.insert_one(submission_data)
    print(f'✅ Test submission created: {result.inserted_id}')
    return str(result.inserted_id)

def main():
    print('Creating test data for teacher endpoint testing...\n')
    
    # Get teacher ID
    teacher = db.users.find_one({'email': 'teacher@test.com'})
    if not teacher:
        print('❌ Test teacher not found. Run create_test_teacher.py first.')
        return
    
    teacher_id = str(teacher['_id'])
    print(f'✅ Found test teacher: {teacher_id}\n')
    
    # Create test student
    student_id = create_test_student()
    
    # Create test course
    course_id = create_test_course(teacher_id)
    
    # Enroll student
    enroll_student(course_id, student_id)
    
    # Create test assignment
    assignment_id = create_test_assignment(course_id)
    
    # Create test submission
    submission_id = create_test_submission(assignment_id, student_id, course_id)
    
    print('\n✅ Test data setup complete!')
    print(f'\nTest IDs:')
    print(f'  Teacher ID: {teacher_id}')
    print(f'  Student ID: {student_id}')
    print(f'  Course ID: {course_id}')
    print(f'  Assignment ID: {assignment_id}')
    print(f'  Submission ID: {submission_id}')

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f'❌ Error creating test data: {e}')
        import traceback
        traceback.print_exc()
        sys.exit(1)
