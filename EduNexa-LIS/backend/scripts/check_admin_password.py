#!/usr/bin/env python3
"""
Check Admin Password Script
Verifies if the admin password hash is correct
"""

import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from pymongo import MongoClient
from werkzeug.security import check_password_hash
from dotenv import load_dotenv

load_dotenv()

def check_admin_password():
    """Check if admin password is correct"""
    
    # MongoDB connection
    try:
        mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
        client = MongoClient(mongo_uri)
        db = client['datams_lms']
        print("✅ Connected to MongoDB")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        return False
    
    # Get admin user
    admin = db.users.find_one({'email': 'admin@datams.edu'})
    
    if not admin:
        print("\n❌ Admin user not found!")
        return False
    
    print("\n📋 Admin User Info:")
    print(f"   Email: {admin.get('email')}")
    print(f"   Name: {admin.get('name')}")
    print(f"   Role: {admin.get('role')}")
    print(f"   Active: {admin.get('is_active')}")
    print(f"   Password Hash: {admin.get('password')[:50]}...")
    
    # Test passwords
    test_passwords = [
        "Yogi@#2025",
        "Admin@2025",
        "Admin@123456"
    ]
    
    print("\n🔍 Testing Passwords:")
    for pwd in test_passwords:
        is_correct = check_password_hash(admin['password'], pwd)
        status = "✅ CORRECT" if is_correct else "❌ WRONG"
        print(f"   {pwd}: {status}")
        if is_correct:
            print(f"\n✅ Working password found: {pwd}")
            return True
    
    print("\n❌ None of the test passwords work!")
    print("   Run: python backend/scripts/fix_admin_password.py")
    return False

if __name__ == '__main__':
    try:
        print("\n" + "="*60)
        print("CHECK ADMIN PASSWORD SCRIPT")
        print("="*60)
        
        check_admin_password()
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Script cancelled by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
