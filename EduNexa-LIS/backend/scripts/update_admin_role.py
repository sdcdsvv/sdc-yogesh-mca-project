#!/usr/bin/env python3
"""
Script to update all super_admin references to single admin role
"""

import os
import re

def update_file(filepath):
    """Update a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Replace patterns
        replacements = [
            (r"user\['role'\] not in \['admin', 'super_admin'\]", "user['role'] != 'admin'"),
            (r"user\.get\('role'\) not in \['admin', 'super_admin'\]", "user.get('role') != 'admin'"),
            (r"me\.get\('role'\) not in \['admin', 'super_admin'\]", "me.get('role') != 'admin'"),
            (r"user\['role'\] in \['admin', 'super_admin'\]", "user['role'] == 'admin'"),
            (r"user\.get\('role'\) in \['admin', 'super_admin'\]", "user.get('role') == 'admin'"),
            (r"me\.get\('role'\) in \['admin', 'super_admin'\]", "me.get('role') == 'admin'"),
            (r"user\['role'\] != 'super_admin'", "user['role'] != 'admin'"),
            (r"user\.get\('role'\) != 'super_admin'", "user.get('role') != 'admin'"),
            (r"me\.get\('role'\) != 'super_admin'", "me.get('role') != 'admin'"),
            (r"user\['role'\] == 'super_admin'", "user['role'] == 'admin'"),
            (r"'Super Admin access required'", "'Admin access required'"),
            (r"Super Admin access required", "Admin access required"),
            (r"super_admin", "admin"),
            (r"Super Admin", "Admin"),
            (r"SuperAdmin", "Admin"),
        ]
        
        for pattern, replacement in replacements:
            content = re.sub(pattern, replacement, content)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Updated: {filepath}")
            return True
        else:
            print(f"⏭️  No changes: {filepath}")
            return False
            
    except Exception as e:
        print(f"❌ Error updating {filepath}: {e}")
        return False

def main():
    """Main function"""
    print("\n" + "="*60)
    print("UPDATING ADMIN ROLE REFERENCES")
    print("="*60 + "\n")
    
    # Files to update
    backend_routes = [
        'backend/routes/users.py',
        'backend/routes/auth.py',
        'backend/routes/videos.py',
        'backend/routes/courses.py',
        'backend/routes/assignments.py',
        'backend/routes/learner_analytics.py',
        'backend/routes/notification_settings.py',
        'backend/routes/progress.py',
    ]
    
    updated_count = 0
    for filepath in backend_routes:
        if os.path.exists(filepath):
            if update_file(filepath):
                updated_count += 1
        else:
            print(f"⚠️  File not found: {filepath}")
    
    print(f"\n✅ Updated {updated_count} files")
    print("\nDone! All super_admin references have been replaced with admin.")

if __name__ == '__main__':
    main()
