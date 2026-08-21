import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv

load_dotenv()

def main():
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/edunexa_lms')
    client = MongoClient(MONGO_URI)
    db = client.edunexa_lms

    student_pw = generate_password_hash('Student@123')
    teacher_pw = generate_password_hash('Teacher@123')
    admin_pw = generate_password_hash('Admin@123')

    # Update students
    students_res = db.users.update_many(
        {'role': 'student'},
        {'$set': {'password': student_pw}}
    )
    print(f"Updated {students_res.modified_count} student passwords to Student@123")

    # Update teachers
    teachers_res = db.users.update_many(
        {'role': 'teacher'},
        {'$set': {'password': teacher_pw}}
    )
    print(f"Updated {teachers_res.modified_count} teacher passwords to Teacher@123")

    # Update admins
    admins_res = db.users.update_many(
        {'role': 'admin'},
        {'$set': {'password': admin_pw}}
    )
    print(f"Updated {admins_res.modified_count} admin passwords to Admin@123")

if __name__ == '__main__':
    main()
