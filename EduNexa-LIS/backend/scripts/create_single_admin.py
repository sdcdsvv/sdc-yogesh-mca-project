#!/usr/bin/env python3
"""
Single Admin User Creation Script
Creates ONE admin user with full system access
"""

import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()

def create_admin_user():
    """Create single admin user with full access"""
    
    # MongoDB connection
    try:
        mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/edunexa_lms')
        client = MongoClient(mongo_uri)
        # Extract database name from URI or use default
        if '/' in mongo_uri.split('://')[1]:
            db_name = mongo_uri.split('/')[-1].split('?')[0] or 'edunexa_lms'
        else:
            db_name = 'edunexa_lms'
        db = client[db_name]
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
                    'role': 'admin',  # Ensure role is admin
                    'updated_at': datetime.utcnow()
                }}
            )
            print(f"\n✅ Admin password reset successfully!")
            print(f"   Email: admin@datams.edu")
            print(f"   Password: {new_password}")
            print(f"   Role: admin")
        return True
    
    # Create new admin user
    print("\n📝 Creating new admin user...")
    
    admin_data = {
        "_id": ObjectId(),
        "name": "System Administrator",
        "email": "admin@datams.edu",
        "password": generate_password_hash("Yogi@#2025"),
        "role": "admin",  # Single admin role
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
        print("\n" + "="*60)
        print("ADMIN LOGIN CREDENTIALS")
        print("="*60)
        print(f"Email:    admin@datams.edu")
        print(f"Password: Yogi@#2025")
        print(f"Role:     admin (Full System Access)")
        print("="*60)
        print("\n🎯 Admin Capabilities:")
        print("   ✅ User Management (Create, Edit, Delete, Reset Passwords)")
        print("   ✅ Course Management (Full Access)")
        print("   ✅ Video Management (Upload, Delete)")
        print("   ✅ Assignment Oversight (View All, Grade)")
        print("   ✅ Student Tracking (Progress, Grades)")
        print("   ✅ Analytics & Reports (System-wide)")
        print("   ✅ Notification System (Send to All)")
        print("   ✅ System Settings (Configure)")
        print("   ✅ Database Management (Backup, Restore)")
        print("\n🚀 You can now login with these credentials!")
        print("   Frontend: http://localhost:5173/auth")
        print("   Backend:  http://localhost:5010/api/auth/login")
        return True
    except Exception as e:
        print(f"\n❌ Failed to create admin user: {e}")
        return False

def remove_super_admins():
    """Remove any super_admin users and convert them to admin"""
    try:
        mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/edunexa_lms')
        client = MongoClient(mongo_uri)
        # Extract database name from URI or use default
        if '/' in mongo_uri.split('://')[1]:
            db_name = mongo_uri.split('/')[-1].split('?')[0] or 'edunexa_lms'
        else:
            db_name = 'edunexa_lms'
        db = client[db_name]
        
        # Find all super_admin users
        super_admins = list(db.users.find({'role': 'super_admin'}))
        
        if super_admins:
            print(f"\n📋 Found {len(super_admins)} super_admin user(s)")
            convert = input("Convert them to regular admin? (yes/no): ").lower()
            
            if convert == 'yes':
                result = db.users.update_many(
                    {'role': 'super_admin'},
                    {'$set': {'role': 'admin', 'updated_at': datetime.utcnow()}}
                )
                print(f"✅ Converted {result.modified_count} user(s) to admin role")
        else:
            print("\n✅ No super_admin users found")
            
    except Exception as e:
        print(f"❌ Error checking super_admin users: {e}")

def main():
    """Main function"""
    print("\n" + "="*60)
    print("SINGLE ADMIN USER CREATION SCRIPT")
    print("="*60)
    print("\nThis script creates ONE admin user with full system access.")
    print("No separate super_admin - just one unified admin role.\n")
    
    # Remove/convert super admins
    remove_super_admins()
    
    # Create admin
    admin_created = create_admin_user()
    
    if admin_created:
        print("\n✅ Setup Complete!")
        print("\nNext steps:")
        print("1. Start the backend: cd backend && python run.py")
        print("2. Start the frontend: cd frontend && npm run dev")
        print("3. Login at: http://localhost:5173/auth")
        print("4. Access Admin Panel: /dashboard")
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
