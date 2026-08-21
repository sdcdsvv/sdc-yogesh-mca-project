#!/usr/bin/env python3
"""
Notification System CLI Tool
Simple command-line interface for testing notifications.

Usage:
    python backend/scripts/notification_cli.py
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from pymongo import MongoClient
from dotenv import load_dotenv
from services.enhanced_notification_service import (
    send_notification,
    get_user_notification_settings,
    update_user_notification_settings,
    send_email,
    create_in_app_notification
)
from datetime import datetime

# Load environment variables
load_dotenv()


def print_menu():
    """Display main menu"""
    print("\n" + "=" * 60)
    print("  📧 Notification System CLI")
    print("=" * 60)
    print("\n1. Send test email to user")
    print("2. Send test in-app notification to user")
    print("3. View user notification settings")
    print("4. Toggle user email notifications")
    print("5. Toggle user in-app notifications")
    print("6. Send notification by role")
    print("7. View notification history")
    print("8. Test SMTP connection")
    print("9. Exit")
    print("\n" + "=" * 60)


def get_user_by_email(db):
    """Get user by email"""
    email = input("Enter user email: ").strip()
    user = db.users.find_one({"email": email.lower()})
    
    if not user:
        print(f"❌ User not found: {email}")
        return None
    
    print(f"✅ Found user: {user.get('name')} ({user.get('role')})")
    return user


def send_test_email_to_user(db):
    """Send test email to a user"""
    print("\n--- Send Test Email ---")
    user = get_user_by_email(db)
    if not user:
        return
    
    user_id = str(user["_id"])
    
    # Check settings
    settings = get_user_notification_settings(db, user_id)
    if not settings["email_enabled"]:
        print("⚠️  Email notifications are disabled for this user")
        enable = input("Enable email notifications? (y/n): ").strip().lower()
        if enable == 'y':
            update_user_notification_settings(db, user_id, email_enabled=True)
            print("✅ Email notifications enabled")
        else:
            print("❌ Cannot send email - notifications disabled")
            return
    
    # Send test email
    result = send_email(
        user["email"],
        "Test Email from EduNexa LMS",
        f"Hello {user.get('name')},\n\nThis is a test email.\n\nBest regards,\nEduNexa LMS",
        f"<h2>Test Email</h2><p>Hello {user.get('name')},</p><p>This is a test email.</p>"
    )
    
    if result["success"]:
        print(f"✅ Test email sent to {user['email']}")
    else:
        print(f"❌ Failed to send email: {result['message']}")


def send_test_notification_to_user(db):
    """Send test in-app notification to a user"""
    print("\n--- Send Test In-App Notification ---")
    user = get_user_by_email(db)
    if not user:
        return
    
    user_id = str(user["_id"])
    
    # Check settings
    settings = get_user_notification_settings(db, user_id)
    if not settings["in_app_enabled"]:
        print("⚠️  In-app notifications are disabled for this user")
        enable = input("Enable in-app notifications? (y/n): ").strip().lower()
        if enable == 'y':
            update_user_notification_settings(db, user_id, in_app_enabled=True)
            print("✅ In-app notifications enabled")
        else:
            print("❌ Cannot send notification - notifications disabled")
            return
    
    # Send test notification
    success = create_in_app_notification(
        db, user_id,
        "Test Notification",
        f"This is a test notification for {user.get('name')}",
        "info",
        "/notifications"
    )
    
    if success:
        print(f"✅ Test notification created for {user.get('name')}")
    else:
        print("❌ Failed to create notification")


def view_user_settings(db):
    """View user notification settings"""
    print("\n--- View User Settings ---")
    user = get_user_by_email(db)
    if not user:
        return
    
    user_id = str(user["_id"])
    settings = get_user_notification_settings(db, user_id)
    
    print(f"\nNotification Settings for {user.get('name')}:")
    print(f"  Email Notifications: {'✅ Enabled' if settings['email_enabled'] else '❌ Disabled'}")
    print(f"  In-App Notifications: {'✅ Enabled' if settings['in_app_enabled'] else '❌ Disabled'}")


def toggle_email_notifications(db):
    """Toggle user email notifications"""
    print("\n--- Toggle Email Notifications ---")
    user = get_user_by_email(db)
    if not user:
        return
    
    user_id = str(user["_id"])
    settings = get_user_notification_settings(db, user_id)
    
    current = settings["email_enabled"]
    new_value = not current
    
    success = update_user_notification_settings(db, user_id, email_enabled=new_value)
    
    if success:
        status = "enabled" if new_value else "disabled"
        print(f"✅ Email notifications {status} for {user.get('name')}")
    else:
        print("❌ Failed to update settings")


def toggle_in_app_notifications(db):
    """Toggle user in-app notifications"""
    print("\n--- Toggle In-App Notifications ---")
    user = get_user_by_email(db)
    if not user:
        return
    
    user_id = str(user["_id"])
    settings = get_user_notification_settings(db, user_id)
    
    current = settings["in_app_enabled"]
    new_value = not current
    
    success = update_user_notification_settings(db, user_id, in_app_enabled=new_value)
    
    if success:
        status = "enabled" if new_value else "disabled"
        print(f"✅ In-app notifications {status} for {user.get('name')}")
    else:
        print("❌ Failed to update settings")


def send_notification_by_role(db):
    """Send notification to all users of a role"""
    print("\n--- Send Notification by Role ---")
    print("Available roles: student, teacher, admin")
    role = input("Enter role: ").strip().lower()
    
    if role not in ["student", "teacher", "admin"]:
        print("❌ Invalid role")
        return
    
    # Count users
    count = db.users.count_documents({"role": role, "is_active": True})
    print(f"Found {count} active {role}s")
    
    if count == 0:
        print("❌ No users found with this role")
        return
    
    confirm = input(f"Send test notification to all {count} {role}s? (y/n): ").strip().lower()
    if confirm != 'y':
        print("❌ Cancelled")
        return
    
    # Get users
    users = list(db.users.find({"role": role, "is_active": True}))
    
    # Send notifications
    email_sent = 0
    in_app_sent = 0
    
    for user in users:
        user_id = str(user["_id"])
        result = send_notification(
            db, user_id, "assignment_created",
            {
                "title": "Test Assignment",
                "course_title": "Test Course",
                "due_date": "2024-12-31",
                "points": "100",
                "message": "This is a test notification"
            },
            in_app_title="Test Notification"
        )
        
        if result["email"]["sent"]:
            email_sent += 1
        if result["in_app"]["sent"]:
            in_app_sent += 1
    
    print(f"\n✅ Notifications sent:")
    print(f"   Email: {email_sent}/{count}")
    print(f"   In-App: {in_app_sent}/{count}")


def view_notification_history(db):
    """View notification history for a user"""
    print("\n--- View Notification History ---")
    user = get_user_by_email(db)
    if not user:
        return
    
    user_id = str(user["_id"])
    
    # Get history
    history = list(db.notification_history.find({"user_id": user_id})
                  .sort("timestamp", -1)
                  .limit(10))
    
    if not history:
        print(f"No notification history found for {user.get('name')}")
        return
    
    print(f"\nNotification History for {user.get('name')} (last 10):")
    print("-" * 80)
    
    for i, entry in enumerate(history, 1):
        timestamp = entry.get("timestamp", "N/A")
        notif_type = entry.get("notification_type", "N/A")
        channel = entry.get("channel", "N/A")
        status = entry.get("status", "N/A")
        
        status_icon = "✅" if status == "sent" else "❌" if status == "failed" else "⏭️"
        
        print(f"{i}. {status_icon} {timestamp} | {notif_type} | {channel} | {status}")
        
        if entry.get("details"):
            details = entry["details"]
            if "subject" in details:
                print(f"   Subject: {details['subject']}")
            if "error" in details:
                print(f"   Error: {details['error']}")


def test_smtp_connection():
    """Test SMTP connection"""
    print("\n--- Test SMTP Connection ---")
    
    EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
    EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
    
    if not EMAIL_ADDRESS or not EMAIL_PASSWORD:
        print("❌ Email credentials not configured in .env file")
        return
    
    print(f"Email Address: {EMAIL_ADDRESS}")
    print(f"Email Password: {'*' * len(EMAIL_PASSWORD)}")
    
    test_email = input("Enter test email address: ").strip()
    
    result = send_email(
        test_email,
        "SMTP Connection Test",
        "This is a test email to verify SMTP connection.",
        "<h2>SMTP Connection Test</h2><p>This is a test email to verify SMTP connection.</p>"
    )
    
    if result["success"]:
        print(f"✅ SMTP connection successful! Email sent to {test_email}")
    else:
        print(f"❌ SMTP connection failed: {result['message']}")


def main():
    """Main CLI loop"""
    # Connect to MongoDB
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/edunexa_lms')
    
    try:
        client = MongoClient(MONGO_URI)
        db = client.edunexa_lms
        client.admin.command('ping')
        print(f"✅ Connected to MongoDB")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        sys.exit(1)
    
    # Main loop
    while True:
        print_menu()
        choice = input("Enter choice (1-9): ").strip()
        
        try:
            if choice == '1':
                send_test_email_to_user(db)
            elif choice == '2':
                send_test_notification_to_user(db)
            elif choice == '3':
                view_user_settings(db)
            elif choice == '4':
                toggle_email_notifications(db)
            elif choice == '5':
                toggle_in_app_notifications(db)
            elif choice == '6':
                send_notification_by_role(db)
            elif choice == '7':
                view_notification_history(db)
            elif choice == '8':
                test_smtp_connection()
            elif choice == '9':
                print("\n👋 Goodbye!")
                break
            else:
                print("❌ Invalid choice. Please enter 1-9.")
        
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")
            import traceback
            traceback.print_exc()
        
        input("\nPress Enter to continue...")


if __name__ == '__main__':
    main()
