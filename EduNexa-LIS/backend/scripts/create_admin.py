#!/usr/bin/env python3
"""
Quick Admin User Creation Script
Creates an admin user if it doesn't exist
"""

import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from bson import ObjectId

def create_admin_user():
    """Create admin user in the database"""
    
    # MongoDB connection
    try:
        client = MongoClient('mongodb://localhost:27017/')
        db = client['datams_lms']
        print("✅ Connected to MongoDB")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        print("Make sure MongoDB is running: mongod")
        return False
    
    # Check if admin already exists
    existing_admin = db.users.find_one({'email': 'admin@datams.edu'})
    
    if existing_admin:
        print("\n⚠️  Admin user already exists!")
        print(f"   Email: admin@datams.edu")
        print(f"   Name: {existing_admin.get('name', 'N/A')}")
        print(f"   Role: {existing_admin.get('role', 'N/A')}")
        print(f"   Active: {existing_admin.get('is_active', False)}")
        
        # Ask if user wants to reset password
        reset = input("\nDo you want to reset the admin password? (yes/no): ").lower()
        if reset == 'yes':
            new_password = input("Enter new password (or press Enter for 'Yogi@#2025'): ").strip()
            if not new_password:
                new_password = "Yogi@#2025"
            
            db.users.update_one(
                {'email': 'admin@datams.edu'},
                {'$set': {
                    'password': generate_password_hash(new_password),
                    'updated_at': datetime.utcnow()
                }}
            )
            print(f"\n✅ Admin password reset successfully!")
            print(f"   Email: admin@datams.edu")
            print(f"   Password: {new_password}")
        return True
    
    # Create new admin user
    print("\n📝 Creating new admin user...")
    
    admin_data = {
        "_id": ObjectId(),
        "name": "System Administrator",
        "email": "admin@datams.edu",
        "password": generate_password_hash("Yogi@#2025"),
        "role": "admin",
        "phone": "+91-98765-00000",
        "department": "Administration",
        "designation": "System Administrator",
        "is_active": True,
        "is_verified": True,
        "profile_pic": "",
        "bio": "System administrator with full access to all features",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "last_login": None,
        "enrolled_courses": [],
        "courses_created": [],
        "total_points": 0,
        "achievements": []
    }
    
    try:
        result = db.users.insert_one(admin_data)
        print("\n✅ Admin user created successfully!")
        print("\n" + "="*50)
        print("ADMIN LOGIN CREDENTIALS")
        print("="*50)
        print(f"Email:    admin@datams.edu")
        print(f"Password: Yogi@#2025")
        print(f"Role:     admin")
        print("="*50)
        print("\n🚀 You can now login with these credentials!")
        print("   Frontend: http://localhost:5173/auth")
        print("   Backend:  http://localhost:5010/api/auth/login")
        return True
    except Exception as e:
        print(f"\n❌ Failed to create admin user: {e}")
        return False

def create_super_admin():
    """Create super admin user"""
    
    try:
        client = MongoClient('mongodb://localhost:27017/')
        db = client['datams_lms']
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        return False
    
    # Check if super admin already exists
    existing_super_admin = db.users.find_one({'email': 'superadmin@datams.edu'})
    
    if existing_super_admin:
        print("\n⚠️  Super Admin user already exists!")
        return True
    
    print("\n📝 Creating super admin user...")
    
    super_admin_data = {
        "_id": ObjectId(),
        "name": "Super Administrator",
        "email": "superadmin@datams.edu",
        "password": generate_password_hash("Admin@123456"),
        "role": "super_admin",
        "phone": "+91-98765-11111",
        "department": "Administration",
        "designation": "Super Administrator",
        "is_active": True,
        "is_verified": True,
        "profile_pic": "",
        "bio": "Super administrator with highest level access",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "last_login": None,
        "enrolled_courses": [],
        "courses_created": [],
        "total_points": 0,
        "achievements": []
    }
    
    try:
        result = db.users.insert_one(super_admin_data)
        print("\n✅ Super Admin user created successfully!")
        print("\n" + "="*50)
        print("SUPER ADMIN LOGIN CREDENTIALS")
        print("="*50)
        print(f"Email:    superadmin@datams.edu")
        print(f"Password: Admin@123456")
        print(f"Role:     super_admin")
        print("="*50)
        return True
    except Exception as e:
        print(f"\n❌ Failed to create super admin user: {e}")
        return False

def main():
    """Main function"""
    print("\n" + "="*50)
    print("ADMIN USER CREATION SCRIPT")
    print("="*50)
    
    # Create admin
    admin_created = create_admin_user()
    
    # Ask if user wants to create super admin
    if admin_created:
        create_super = input("\nDo you want to create a Super Admin user too? (yes/no): ").lower()
        if create_super == 'yes':
            create_super_admin()
    
    print("\n✅ Done!")
    print("\nNext steps:")
    print("1. Start the backend: cd backend && python run.py")
    print("2. Start the frontend: cd frontend && npm run dev")
    print("3. Login at: http://localhost:5173/auth")
    print("\n")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Script cancelled by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
