#!/usr/bin/env python3
"""
Script to reset the super admin password
"""

from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from datetime import datetime
import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def reset_admin_password():
    """Reset the super admin password"""
    
    # Connect to MongoDB
    mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/edunexa_lms')
    client = MongoClient(mongo_uri)
    db = client.edunexa_lms
    
    # New password
    new_password = 'Admin@123456'
    password_hash = generate_password_hash(new_password)
    
    # Update the super admin password
    result = db.users.update_one(
        {'email': 'superadmin@datams.edu'},
        {
            '$set': {
                'password': password_hash,
                'updated_at': datetime.utcnow()
            }
        }
    )
    
    if result.matched_count > 0:
        print("✅ Super admin password updated successfully!")
        print(f"📧 Email: superadmin@datams.edu")
        print(f"🔑 Password: {new_password}")
    else:
        print("❌ Super admin user not found!")
        
        # Create the super admin user if it doesn't exist
        print("🔧 Creating super admin user...")
        
        admin_user = {
            'name': 'Super Admin',
            'email': 'superadmin@datams.edu',
            'password': password_hash,
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
        
        db.users.insert_one(admin_user)
        print("✅ Super admin user created successfully!")
        print(f"📧 Email: superadmin@datams.edu")
        print(f"🔑 Password: {new_password}")
    
    client.close()

if __name__ == '__main__':
    reset_admin_password()
