#!/usr/bin/env python3
"""
Fix Admin Password Script
Ensures admin@datams.edu has the correct password: Yogi@#2025
"""

import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv

load_dotenv()

def fix_admin_password():
    """Fix admin password to Yogi@#2025"""
    
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
    
    # Check if admin exists
    existing_admin = db.users.find_one({'email': 'admin@datams.edu'})
    
    if not existing_admin:
        print("\n❌ Admin user not found!")
        print("Run this script to create admin: python backend/scripts/create_single_admin.py")
        return False
    
    print("\n📋 Current Admin User:")
    print(f"   Email: {existing_admin.get('email')}")
    print(f"   Name: {existing_admin.get('name')}")
    print(f"   Role: {existing_admin.get('role')}")
    print(f"   Active: {existing_admin.get('is_active')}")
    
    # Update password
    correct_password = "Yogi@#2025"
    
    result = db.users.update_one(
        {'email': 'admin@datams.edu'},
        {'$set': {
            'password': generate_password_hash(correct_password),
            'role': 'admin',
            'is_active': True,
            'updated_at': datetime.utcnow()
        }}
    )
    
    if result.modified_count > 0:
        print("\n✅ Admin password updated successfully!")
    else:
        print("\n✅ Admin password is already correct!")
    
    print("\n" + "="*60)
    print("ADMIN LOGIN CREDENTIALS")
    print("="*60)
    print(f"Email:    admin@datams.edu")
    print(f"Password: {correct_password}")
    print(f"Role:     admin")
    print("="*60)
    print("\n🚀 You can now login at: http://localhost:5173/auth")
    print("   Select role: Administrator")
    print("   Use the credentials above")
    print("\n")
    
    return True

if __name__ == '__main__':
    try:
        print("\n" + "="*60)
        print("FIX ADMIN PASSWORD SCRIPT")
        print("="*60)
        print("\nThis script will set admin password to: Yogi@#2025\n")
        
        fix_admin_password()
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Script cancelled by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
