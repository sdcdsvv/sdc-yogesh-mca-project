"""
Script to seed sample data into the database
This script creates sample users, courses, enrollments, and assignments for development/testing

Usage:
    python backend/scripts/seeders/seed_sample_data.py
"""
import sys
import os

# Add backend directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
from bson import ObjectId
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def create_sample_users(db):
    """Create sample users as specified in the documentation"""
    
    sample_users = [
        # Students
        {
            'name': 'Ravi Kumar',
            'email': 'student01@datams.edu',
            'password': generate_password_hash('Stud@2025'),
            'role': 'student',
            'phone': '9876543210',
            'roll_number': 'MCA2025_001',
            'department': 'Data Science',
            'year': 'Final',
            'semester': '4th',
            'profile_pic': '',
            'enrolled_courses': [],
            'completed_courses': [],
            'total_points': 0,
            'badges': [],
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'is_active': True
        },
        {
            'name': 'Priya Sharma',
            'email': 'student02@datams.edu',
            'password': generate_password_hash('Stud@2025'),
            'role': 'student',
            'phone': '9876543211',
            'roll_number': 'MCA2025_002',
            'department': 'Data Science',
            'year': 'Final',
            'semester': '4th',
            'profile_pic': '',
            'enrolled_courses': [],
            'completed_courses': [],
            'total_points': 0,
            'badges': [],
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'is_active': True
        },
        {
            'name': 'Aman Verma',
            'email': 'student03@datams.edu',
            'password': generate_password_hash('Stud@2025'),
            'role': 'student',
            'phone': '9876543212',
            'roll_number': 'MCA2025_003',
            'department': 'Data Science',
            'year': 'Final',
            'semester': '4th',
            'profile_pic': '',
            'enrolled_courses': [],
            'completed_courses': [],
            'total_points': 0,
            'badges': [],
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'is_active': True
        },
        
        # Teachers
        {
            'name': 'Dr. Seema Singh',
            'email': 'teacher01@datams.edu',
            'password': generate_password_hash('Teach@2025'),
            'role': 'teacher',
            'phone': '9876543213',
            'employee_id': 'FAC1001',
            'department': 'Data Science',
            'designation': 'Associate Professor',
            'profile_pic': '',
            'courses_created': [],
            'specializations': ['Machine Learning', 'Data Analytics'],
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'is_active': True
        },
        {
            'name': 'Prof. Anil Mehta',
            'email': 'teacher02@datams.edu',
            'password': generate_password_hash('Teach@2025'),
            'role': 'teacher',
            'phone': '9876543214',
            'employee_id': 'FAC1002',
            'department': 'Computer Science',
            'designation': 'Professor',
            'profile_pic': '',
            'courses_created': [],
            'specializations': ['Web Development', 'Database Systems'],
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'is_active': True
        },
        
        # Admins
        {
            'name': 'Super Admin',
            'email': 'superadmin@datams.edu',
            'password': generate_password_hash('Admin@123456'),
            'role': 'super_admin',
            'phone': '9876543216',
            'employee_id': 'SUPER001',
            'department': 'System Administration',
            'designation': 'Super Administrator',
            'permissions': ['all'],
            'profile_pic': '',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'is_active': True
        }
    ]
    
    # Insert users and store their IDs
    user_ids = {}
    for user in sample_users:
        result = db.users.insert_one(user)
        user_ids[user['email']] = str(result.inserted_id)
    
    print(f"👥 Created {len(sample_users)} sample users")
    return user_ids


def create_sample_courses(db):
    """Create sample courses"""
    
    # Get teacher IDs
    teacher1 = db.users.find_one({'email': 'teacher01@datams.edu'})
    teacher2 = db.users.find_one({'email': 'teacher02@datams.edu'})
    
    sample_courses = [
        {
            'title': 'Introduction to Machine Learning',
            'description': 'Learn the fundamentals of machine learning with hands-on projects and real-world applications.',
            'category': 'AI & Machine Learning',
            'teacher_id': str(teacher1['_id']),
            'difficulty': 'Intermediate',
            'duration': '12 weeks',
            'prerequisites': ['Basic Python', 'Statistics'],
            'learning_objectives': [
                'Understand ML algorithms',
                'Implement ML models',
                'Evaluate model performance',
                'Apply ML to real problems'
            ],
            'thumbnail': 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400',
            'is_active': True,
            'is_public': True,
            'max_students': 50,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            'title': 'Advanced Python Programming',
            'description': 'Master advanced Python concepts, design patterns, and best practices for professional development.',
            'category': 'Programming',
            'teacher_id': str(teacher2['_id']),
            'difficulty': 'Advanced',
            'duration': '10 weeks',
            'prerequisites': ['Basic Python', 'Object-Oriented Programming'],
            'learning_objectives': [
                'Master advanced Python features',
                'Understand design patterns',
                'Write clean, maintainable code',
                'Optimize Python performance'
            ],
            'thumbnail': 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400',
            'is_active': True,
            'is_public': True,
            'max_students': 30,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            'title': 'Data Science Fundamentals',
            'description': 'Explore data analysis, visualization, and statistical modeling using Python and popular libraries.',
            'category': 'Data Science',
            'teacher_id': str(teacher1['_id']),
            'difficulty': 'Beginner',
            'duration': '8 weeks',
            'prerequisites': ['Basic Mathematics'],
            'learning_objectives': [
                'Understand data science workflow',
                'Learn data visualization',
                'Perform statistical analysis',
                'Build predictive models'
            ],
            'thumbnail': 'https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=400',
            'is_active': True,
            'is_public': True,
            'max_students': 40,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            'title': 'Web Development with React',
            'description': 'Build modern, responsive web applications using React, JavaScript, and modern web technologies.',
            'category': 'Web Development',
            'teacher_id': str(teacher2['_id']),
            'difficulty': 'Intermediate',
            'duration': '14 weeks',
            'prerequisites': ['HTML', 'CSS', 'JavaScript'],
            'learning_objectives': [
                'Master React fundamentals',
                'Build interactive UIs',
                'Manage application state',
                'Deploy web applications'
            ],
            'thumbnail': 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=400',
            'is_active': True,
            'is_public': True,
            'max_students': 35,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
    ]
    
    # Insert courses and update teacher records
    course_ids = {}
    for course in sample_courses:
        result = db.courses.insert_one(course)
        course_id = str(result.inserted_id)
        course_ids[course['title']] = course_id
        
        # Update teacher's courses_created list
        db.users.update_one(
            {'_id': ObjectId(course['teacher_id'])},
            {'$push': {'courses_created': course_id}}
        )
    
    print(f"📚 Created {len(sample_courses)} sample courses")
    return course_ids


def create_sample_enrollments(db):
    """Create sample enrollments"""
    
    # Get students
    students = list(db.users.find({'role': 'student'}))
    courses = list(db.courses.find())
    
    enrollments = []
    
    # Enroll each student in 2-3 courses
    for student in students:
        student_id = str(student['_id'])
        
        # Enroll in first 2-3 courses
        for i, course in enumerate(courses[:3]):
            course_id = str(course['_id'])
            
            enrollment = {
                'course_id': course_id,
                'student_id': student_id,
                'enrolled_at': datetime.utcnow() - timedelta(days=30-i*5),
                'progress': 25 + (i * 25),  # Varying progress
                'completed_materials': [],
                'completed_assignments': [],
                'is_active': True
            }
            
            enrollments.append(enrollment)
            
            # Update student's enrolled_courses
            db.users.update_one(
                {'_id': student['_id']},
                {'$push': {'enrolled_courses': course_id}}
            )
    
    # Insert enrollments
    if enrollments:
        db.enrollments.insert_many(enrollments)
    
    print(f"📝 Created {len(enrollments)} sample enrollments")


def create_sample_assignments(db):
    """Create sample assignments"""
    
    courses = list(db.courses.find())
    
    # Create assignments
    assignments = []
    
    for course in courses:
        course_id = str(course['_id'])
        teacher_id = course['teacher_id']
        
        # Create 2 assignments per course
        for i in range(2):
            assignment = {
                'title': f'{course["title"]} - Assignment {i+1}',
                'description': f'Complete the assignment for {course["title"]} module {i+1}',
                'course_id': course_id,
                'instructions': f'Please complete all tasks related to {course["title"]} concepts covered in module {i+1}.',
                'due_date': datetime.utcnow() + timedelta(days=7+i*7),
                'max_points': 100,
                'submission_type': 'file',
                'allowed_file_types': ['pdf', 'doc', 'docx'],
                'max_file_size': 10,
                'is_active': True,
                'created_by': teacher_id,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            assignments.append(assignment)
    
    # Insert assignments
    if assignments:
        db.assignments.insert_many(assignments)
        print(f"📋 Created {len(assignments)} sample assignments")


def main():
    """Main execution function"""
    print("=" * 60)
    print("🌱 Seeding Sample Data")
    print("=" * 60)
    
    # Connect to MongoDB
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/edunexa_lms')
    client = MongoClient(MONGO_URI)
    db = client.edunexa_lms
    
    try:
        # Test connection
        client.admin.command('ping')
        print("✅ Connected to MongoDB successfully!\n")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        sys.exit(1)
    
    # Check if data already exists
    user_count = db.users.count_documents({})
    if user_count > 0:
        print(f"⚠️  Database already contains {user_count} users")
        response = input("Do you want to continue and add more data? (y/n): ")
        if response.lower() != 'y':
            print("❌ Seeding cancelled")
            sys.exit(0)
        print()
    
    try:
        # Create sample data
        print("Creating sample users...")
        create_sample_users(db)
        print()
        
        print("Creating sample courses...")
        create_sample_courses(db)
        print()
        
        print("Creating sample enrollments...")
        create_sample_enrollments(db)
        print()
        
        print("Creating sample assignments...")
        create_sample_assignments(db)
        print()
        
        print("=" * 60)
        print("✅ Sample data seeded successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error seeding data: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
