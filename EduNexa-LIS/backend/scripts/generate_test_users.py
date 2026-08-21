#!/usr/bin/env python3
"""
Test User Generator Script
Generates 100 unique students and 10 unique teachers with realistic data.
Saves directly to MongoDB database.

Usage:
    python backend/scripts/generate_test_users.py
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
from dotenv import load_dotenv
import random
import string

# Load environment variables
load_dotenv()


# Realistic data pools
FIRST_NAMES = [
    "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
    "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
    "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
    "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
    "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
    "Kenneth", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa",
    "Edward", "Deborah", "Ronald", "Stephanie", "Timothy", "Rebecca", "Jason", "Sharon",
    "Jeffrey", "Laura", "Ryan", "Cynthia", "Jacob", "Kathleen", "Gary", "Amy",
    "Nicholas", "Shirley", "Eric", "Angela", "Jonathan", "Helen", "Stephen", "Anna",
    "Larry", "Brenda", "Justin", "Pamela", "Scott", "Nicole", "Brandon", "Emma",
    "Benjamin", "Samantha", "Samuel", "Katherine", "Raymond", "Christine", "Gregory", "Debra",
    "Frank", "Rachel", "Alexander", "Catherine", "Patrick", "Carolyn", "Raymond", "Janet",
    "Jack", "Ruth", "Dennis", "Maria", "Jerry", "Heather", "Tyler", "Diane"
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
    "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
    "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
    "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
    "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
    "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker",
    "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy",
    "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey",
    "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson",
    "Watson", "Brooks", "Chavez", "Wood", "James", "Bennett", "Gray", "Mendoza",
    "Ruiz", "Hughes", "Price", "Alvarez", "Castillo", "Sanders", "Patel", "Myers",
    "Long", "Ross", "Foster", "Jimenez", "Powell", "Jenkins", "Perry", "Russell"
]

DEPARTMENTS = [
    "Computer Science", "Information Technology", "Software Engineering",
    "Data Science", "Artificial Intelligence", "Cybersecurity",
    "Electrical Engineering", "Mechanical Engineering", "Civil Engineering",
    "Business Administration", "Mathematics", "Physics"
]

YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"]

SEMESTERS = ["Fall 2024", "Spring 2024", "Fall 2023", "Spring 2023"]

DESIGNATIONS = [
    "Professor", "Associate Professor", "Assistant Professor",
    "Senior Lecturer", "Lecturer", "Instructor"
]

SPECIALIZATIONS = [
    ["Machine Learning", "Deep Learning", "Neural Networks"],
    ["Web Development", "Mobile Development", "Cloud Computing"],
    ["Database Systems", "Data Mining", "Big Data"],
    ["Network Security", "Cryptography", "Ethical Hacking"],
    ["Software Architecture", "Design Patterns", "Agile Methodologies"],
    ["Computer Vision", "Natural Language Processing", "Robotics"],
    ["Algorithms", "Data Structures", "Computational Theory"],
    ["Operating Systems", "Distributed Systems", "Parallel Computing"]
]

# Avatar URLs (using UI Avatars service)
def generate_avatar_url(name):
    """Generate avatar URL based on name"""
    return f"https://ui-avatars.com/api/?name={name.replace(' ', '+')}&background=random&size=200"


def generate_unique_email(first_name, last_name, role, existing_emails):
    """Generate unique email address"""
    base_email = f"{first_name.lower()}.{last_name.lower()}"
    domain = "student.edu" if role == "student" else "faculty.edu"
    
    email = f"{base_email}@{domain}"
    counter = 1
    
    while email in existing_emails:
        email = f"{base_email}{counter}@{domain}"
        counter += 1
    
    existing_emails.add(email)
    return email


def generate_unique_roll_number(existing_rolls):
    """Generate unique roll number for students"""
    year = datetime.now().year
    
    while True:
        number = random.randint(1000, 9999)
        roll_number = f"STU{year}{number}"
        
        if roll_number not in existing_rolls:
            existing_rolls.add(roll_number)
            return roll_number


def generate_unique_employee_id(existing_ids):
    """Generate unique employee ID for teachers"""
    while True:
        number = random.randint(10000, 99999)
        employee_id = f"FAC{number}"
        
        if employee_id not in existing_ids:
            existing_ids.add(employee_id)
            return employee_id


def generate_phone_number():
    """Generate realistic phone number"""
    area_code = random.randint(200, 999)
    exchange = random.randint(200, 999)
    number = random.randint(1000, 9999)
    return f"+1-{area_code}-{exchange}-{number}"


def generate_date_of_birth(min_age, max_age):
    """Generate random date of birth"""
    today = datetime.now()
    age = random.randint(min_age, max_age)
    birth_year = today.year - age
    birth_month = random.randint(1, 12)
    birth_day = random.randint(1, 28)  # Safe day for all months
    
    return datetime(birth_year, birth_month, birth_day)


def generate_student(existing_emails, existing_rolls):
    """Generate a single student record"""
    first_name = random.choice(FIRST_NAMES)
    last_name = random.choice(LAST_NAMES)
    full_name = f"{first_name} {last_name}"
    
    email = generate_unique_email(first_name, last_name, "student", existing_emails)
    roll_number = generate_unique_roll_number(existing_rolls)
    department = random.choice(DEPARTMENTS)
    year = random.choice(YEARS)
    semester = random.choice(SEMESTERS)
    dob = generate_date_of_birth(18, 25)
    
    student = {
        "name": full_name,
        "email": email,
        "password": generate_password_hash("Student@123"),  # Default password
        "role": "student",
        "roll_number": roll_number,
        "department": department,
        "year": year,
        "semester": semester,
        "phone": generate_phone_number(),
        "profile_pic": generate_avatar_url(full_name),
        "date_of_birth": dob,
        "enrolled_courses": [],
        "completed_courses": [],
        "total_points": random.randint(0, 500),
        "badges": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "is_active": True,
        "address": {
            "street": f"{random.randint(100, 9999)} {random.choice(['Main', 'Oak', 'Maple', 'Cedar', 'Pine'])} St",
            "city": random.choice(["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia"]),
            "state": random.choice(["NY", "CA", "IL", "TX", "AZ", "PA"]),
            "zip_code": f"{random.randint(10000, 99999)}"
        },
        "emergency_contact": {
            "name": f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
            "relationship": random.choice(["Parent", "Guardian", "Sibling"]),
            "phone": generate_phone_number()
        }
    }
    
    return student


def generate_teacher(existing_emails, existing_ids):
    """Generate a single teacher record"""
    first_name = random.choice(FIRST_NAMES)
    last_name = random.choice(LAST_NAMES)
    full_name = f"Dr. {first_name} {last_name}"
    
    email = generate_unique_email(first_name, last_name, "teacher", existing_emails)
    employee_id = generate_unique_employee_id(existing_ids)
    department = random.choice(DEPARTMENTS)
    designation = random.choice(DESIGNATIONS)
    specializations = random.choice(SPECIALIZATIONS)
    dob = generate_date_of_birth(30, 65)
    
    teacher = {
        "name": full_name,
        "email": email,
        "password": generate_password_hash("Teacher@123"),  # Default password
        "role": "teacher",
        "employee_id": employee_id,
        "department": department,
        "designation": designation,
        "specializations": specializations,
        "phone": generate_phone_number(),
        "profile_pic": generate_avatar_url(full_name),
        "date_of_birth": dob,
        "courses_created": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "is_active": True,
        "office": {
            "building": random.choice(["Engineering", "Science", "Technology", "Administration"]),
            "room": f"{random.randint(100, 999)}",
            "hours": "Mon-Fri 9:00 AM - 5:00 PM"
        },
        "education": {
            "highest_degree": random.choice(["Ph.D.", "M.S.", "M.Tech"]),
            "university": random.choice([
                "MIT", "Stanford", "Harvard", "Berkeley", "Carnegie Mellon",
                "Georgia Tech", "University of Washington", "Cornell"
            ]),
            "year": random.randint(2000, 2020)
        },
        "years_of_experience": random.randint(5, 30)
    }
    
    return teacher


def print_header(title):
    """Print formatted header"""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)


def print_success(message):
    """Print success message"""
    print(f"✅ {message}")


def print_error(message):
    """Print error message"""
    print(f"❌ {message}")


def print_info(message):
    """Print info message"""
    print(f"ℹ️  {message}")


def main():
    """Main execution function"""
    print_header("Test User Generator")
    
    # Connect to MongoDB
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/edunexa_lms')
    
    try:
        client = MongoClient(MONGO_URI)
        db = client.edunexa_lms
        client.admin.command('ping')
        print_success(f"Connected to MongoDB: {MONGO_URI}")
    except Exception as e:
        print_error(f"Failed to connect to MongoDB: {e}")
        sys.exit(1)
    
    # Check if users already exist
    existing_count = db.users.count_documents({"email": {"$regex": "@(student|faculty)\\.edu$"}})
    
    if existing_count > 0:
        print_info(f"Found {existing_count} existing test users")
        response = input("Do you want to delete existing test users and regenerate? (y/n): ").strip().lower()
        
        if response == 'y':
            print_info("Deleting existing test users...")
            result = db.users.delete_many({"email": {"$regex": "@(student|faculty)\\.edu$"}})
            print_success(f"Deleted {result.deleted_count} existing test users")
        else:
            print_info("Keeping existing users. Exiting...")
            sys.exit(0)
    
    # Generate users
    print_header("Generating Users")
    
    existing_emails = set()
    existing_rolls = set()
    existing_ids = set()
    
    students = []
    teachers = []
    
    # Generate 100 students
    print_info("Generating 100 students...")
    for i in range(100):
        student = generate_student(existing_emails, existing_rolls)
        students.append(student)
        if (i + 1) % 20 == 0:
            print_info(f"  Generated {i + 1}/100 students...")
    
    print_success(f"Generated {len(students)} students")
    
    # Generate 10 teachers
    print_info("Generating 10 teachers...")
    for i in range(10):
        teacher = generate_teacher(existing_emails, existing_ids)
        teachers.append(teacher)
    
    print_success(f"Generated {len(teachers)} teachers")
    
    # Insert into database
    print_header("Saving to Database")
    
    try:
        # Insert students
        print_info("Inserting students into database...")
        student_result = db.users.insert_many(students)
        print_success(f"Inserted {len(student_result.inserted_ids)} students")
        
        # Insert teachers
        print_info("Inserting teachers into database...")
        teacher_result = db.users.insert_many(teachers)
        print_success(f"Inserted {len(teacher_result.inserted_ids)} teachers")
        
    except Exception as e:
        print_error(f"Failed to insert users: {e}")
        sys.exit(1)
    
    # Summary
    print_header("Generation Summary")
    
    # Count only test users
    test_students = db.users.count_documents({
        "role": "student",
        "email": {"$regex": "@student\\.edu$"}
    })
    test_teachers = db.users.count_documents({
        "role": "teacher",
        "email": {"$regex": "@faculty\\.edu$"}
    })
    
    # Count all users
    total_students = db.users.count_documents({"role": "student"})
    total_teachers = db.users.count_documents({"role": "teacher"})
    total_users = db.users.count_documents({})
    
    print_info(f"Test Students Generated: {test_students}")
    print_info(f"Test Teachers Generated: {test_teachers}")
    print_info(f"Total Students in DB: {total_students}")
    print_info(f"Total Teachers in DB: {total_teachers}")
    print_info(f"Total Users in DB: {total_users}")
    
    # Sample data - only show newly generated test users
    print_header("Sample Generated Data")
    
    print("\n📚 Sample Students (first 3 generated):")
    sample_students = list(db.users.find({
        "role": "student",
        "email": {"$regex": "@student\\.edu$"}
    }).limit(3))
    
    if sample_students:
        for i, student in enumerate(sample_students, 1):
            print(f"\n{i}. {student['name']}")
            print(f"   Email: {student['email']}")
            print(f"   Roll Number: {student.get('roll_number', 'N/A')}")
            print(f"   Department: {student.get('department', 'N/A')}")
            print(f"   Year: {student.get('year', 'N/A')}")
            if 'date_of_birth' in student and student['date_of_birth']:
                print(f"   DOB: {student['date_of_birth'].strftime('%Y-%m-%d')}")
            print(f"   Phone: {student.get('phone', 'N/A')}")
    else:
        print("   No test students found")
    
    print("\n👨‍🏫 Sample Teachers (first 3 generated):")
    sample_teachers = list(db.users.find({
        "role": "teacher",
        "email": {"$regex": "@faculty\\.edu$"}
    }).limit(3))
    
    if sample_teachers:
        for i, teacher in enumerate(sample_teachers, 1):
            print(f"\n{i}. {teacher['name']}")
            print(f"   Email: {teacher['email']}")
            print(f"   Employee ID: {teacher.get('employee_id', 'N/A')}")
            print(f"   Department: {teacher.get('department', 'N/A')}")
            print(f"   Designation: {teacher.get('designation', 'N/A')}")
            if 'specializations' in teacher and teacher['specializations']:
                print(f"   Specializations: {', '.join(teacher['specializations'])}")
            if 'date_of_birth' in teacher and teacher['date_of_birth']:
                print(f"   DOB: {teacher['date_of_birth'].strftime('%Y-%m-%d')}")
            print(f"   Experience: {teacher.get('years_of_experience', 'N/A')} years")
    else:
        print("   No test teachers found")
    
    # Next steps
    print_header("Next Steps")
    
    print("\n🔍 View All Users:")
    print("   python backend/scripts/view_test_users.py")
    
    print("\n🌐 API Endpoints:")
    print("   GET /api/test-users/students - Get all students")
    print("   GET /api/test-users/teachers - Get all teachers")
    print("   GET /api/test-users/stats - Get statistics")
    
    print("\n🧪 Test Login:")
    print("   Student: Any student email with password 'Student@123'")
    print("   Teacher: Any teacher email with password 'Teacher@123'")
    
    print("\n📊 Database Queries:")
    print("   mongo edunexa_lms --eval \"db.users.find({role:'student'}).limit(5)\"")
    print("   mongo edunexa_lms --eval \"db.users.find({role:'teacher'}).limit(5)\"")
    
    print("\n" + "=" * 70)
    print("  ✅ User Generation Complete!")
    print("=" * 70)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Generation cancelled by user")
        sys.exit(0)
    except Exception as e:
        print_error(f"\nGeneration error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
