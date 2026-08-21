#!/usr/bin/env python3
"""
Debug Login Script
Tests the login process step by step
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from pymongo import MongoClient
from werkzeug.security import check_password_hash
from dotenv import load_dotenv

load_dotenv()

def debug_login():
    """Debug the login process"""
    
    # MongoDB connection
    try:
        mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
        client = MongoClient(mongo_uri)
        db = client['datams_lms']
        print("✅ Connected to MongoDB")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        return False
    
    # Test email
    test_email = "admin@datams.edu"
    test_password = "Yogi@#2025"
    
    print(f"\n🔍 Testing Login:")
    print(f"   Email: {test_email}")
    print(f"   Password: {test_password}")
    
    # Step 1: Find user by email (lowercase)
    print(f"\n1️⃣ Finding user by email (lowercase)...")
    user = db.users.find_one({'email': test_email.lower()})
    
    if not user:
        print(f"   ❌ User not found with email: {test_email.lower()}")
        
        # Try without lowercase
        print(f"\n   Trying without lowercase...")
        user = db.users.find_one({'email': test_email})
        
        if not user:
            print(f"   ❌ User not found with email: {test_email}")
            
            # List all admin users
            print(f"\n   📋 All users with 'admin' in email:")
            admin_users = db.users.find({'email': {'$regex': 'admin', '$options': 'i'}})
            for u in admin_users:
                print(f"      - {u.get('email')} (role: {u.get('role')})")
            return False
        else:
            print(f"   ✅ User found (without lowercase)")
    else:
        print(f"   ✅ User found")
    
    print(f"\n2️⃣ User Details:")
    print(f"   ID: {user.get('_id')}")
    print(f"   Name: {user.get('name')}")
    print(f"   Email: {user.get('email')}")
    print(f"   Role: {user.get('role')}")
    print(f"   Active: {user.get('is_active')}")
    
    # Step 2: Check if user is active
    print(f"\n3️⃣ Checking if user is active...")
    if not user.get('is_active', True):
        print(f"   ❌ User is not active")
        return False
    print(f"   ✅ User is active")
    
    # Step 3: Verify password
    print(f"\n4️⃣ Verifying password...")
    password_hash = user.get('password')
    print(f"   Password Hash: {password_hash[:50]}...")
    
    is_correct = check_password_hash(password_hash, test_password)
    if not is_correct:
        print(f"   ❌ Password is incorrect")
        
        # Try other passwords
        print(f"\n   Trying other passwords...")
        other_passwords = ["Admin@2025", "Admin@123456", "admin@2025"]
        for pwd in other_passwords:
            if check_password_hash(password_hash, pwd):
                print(f"   ✅ Found working password: {pwd}")
                return False
        
        print(f"   ❌ None of the test passwords work")
        return False
    
    print(f"   ✅ Password is correct")
    
    print(f"\n✅ Login should work!")
    print(f"\n📋 Credentials:")
    print(f"   Email: {user.get('email')}")
    print(f"   Password: {test_password}")
    
    return True

if __name__ == '__main__':
    try:
        print("\n" + "="*60)
        print("DEBUG LOGIN SCRIPT")
        print("="*60)
        
        debug_login()
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Script cancelled by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
