"""
Merge anonymous activities to a real user
This script moves all 'anonymous' activities to a specific user ID
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.config.database import get_database

def merge_anonymous_to_user(target_user_id: str):
    """
    Merge all anonymous activities to a target user
    
    Args:
        target_user_id: The user ID to merge anonymous activities into
    """
    try:
        db = get_database()
        activities = db.activities
        
        print("=" * 70)
        print("MERGING ANONYMOUS ACTIVITIES")
        print("=" * 70)
        
        # Count anonymous activities
        anonymous_count = activities.count_documents({"user_id": "anonymous"})
        print(f"\nFound {anonymous_count} anonymous activities")
        
        if anonymous_count == 0:
            print("No anonymous activities to merge!")
            return
        
        # Show breakdown
        print("\nAnonymous Activity Breakdown:")
        pipeline = [
            {"$match": {"user_id": "anonymous"}},
            {"$group": {"_id": "$service_type", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        breakdown = list(activities.aggregate(pipeline))
        for item in breakdown:
            print(f"  • {item['_id']}: {item['count']}")
        
        # Confirm
        print(f"\n⚠️  This will move all {anonymous_count} anonymous activities to user:")
        print(f"   {target_user_id}")
        
        response = input("\nProceed? (yes/no): ").strip().lower()
        
        if response != 'yes':
            print("Operation cancelled.")
            return
        
        # Perform merge
        result = activities.update_many(
            {"user_id": "anonymous"},
            {"$set": {"user_id": target_user_id}}
        )
        
        print(f"\n✅ Successfully merged {result.modified_count} activities!")
        
        # Show updated stats
        print("\n" + "=" * 70)
        print("UPDATED USER STATS")
        print("=" * 70)
        
        total = activities.count_documents({"user_id": target_user_id})
        print(f"\nTotal activities for user {target_user_id}: {total}")
        
        pipeline = [
            {"$match": {"user_id": target_user_id}},
            {"$group": {"_id": "$service_type", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        breakdown = list(activities.aggregate(pipeline))
        print("\nService Breakdown:")
        for item in breakdown:
            print(f"  • {item['_id']}: {item['count']}")
        
        print("\n" + "=" * 70)
        print("✅ MERGE COMPLETE!")
        print("Now refresh your Activity Dashboard to see all activities.")
        print("=" * 70)
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

def list_users():
    """List all users with activity counts"""
    try:
        db = get_database()
        activities = db.activities
        
        print("=" * 70)
        print("USERS WITH ACTIVITIES")
        print("=" * 70)
        
        pipeline = [
            {"$group": {
                "_id": "$user_id",
                "count": {"$sum": 1},
                "services": {"$addToSet": "$service_type"}
            }},
            {"$sort": {"count": -1}}
        ]
        
        users = list(activities.aggregate(pipeline))
        
        for i, user in enumerate(users, 1):
            print(f"\n{i}. User ID: {user['_id']}")
            print(f"   Total Activities: {user['count']}")
            print(f"   Services: {', '.join(user['services'])}")
        
        print("\n" + "=" * 70)
        
        return users
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return []

if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("ACTIVITY MERGE UTILITY")
    print("=" * 70)
    
    # List users first
    users = list_users()
    
    if not users:
        print("\nNo users found with activities!")
        sys.exit(0)
    
    # Find anonymous user
    anonymous_user = next((u for u in users if u['_id'] == 'anonymous'), None)
    
    if not anonymous_user:
        print("\n✅ No anonymous activities found. Nothing to merge!")
        sys.exit(0)
    
    print(f"\n⚠️  Found {anonymous_user['count']} anonymous activities")
    
    # Find real user (not anonymous or test_user)
    real_users = [u for u in users if u['_id'] not in ['anonymous', 'test_user_123']]
    
    if not real_users:
        print("\n❌ No real user found! Please login first and create some activities.")
        sys.exit(1)
    
    # Use the first real user
    target_user_id = real_users[0]['_id']
    
    print(f"\nTarget user for merge: {target_user_id}")
    print(f"Current activities: {real_users[0]['count']}")
    
    # Perform merge
    merge_anonymous_to_user(target_user_id)
