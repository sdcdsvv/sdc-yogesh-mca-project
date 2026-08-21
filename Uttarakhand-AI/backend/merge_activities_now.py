"""
Merge anonymous activities to real user - Auto mode
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.config.database import get_database

def merge_now():
    """Merge anonymous activities automatically"""
    try:
        db = get_database()
        activities = db.activities
        
        print("=" * 70)
        print("AUTO-MERGING ANONYMOUS ACTIVITIES")
        print("=" * 70)
        
        # Find users
        pipeline = [
            {"$group": {
                "_id": "$user_id",
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1}}
        ]
        users = list(activities.aggregate(pipeline))
        
        # Find anonymous and real user
        anonymous_count = 0
        target_user_id = None
        
        for user in users:
            if user['_id'] == 'anonymous':
                anonymous_count = user['count']
            elif user['_id'] not in ['test_user_123', 'anonymous']:
                target_user_id = user['_id']
        
        if anonymous_count == 0:
            print("\n✅ No anonymous activities found!")
            return
        
        if not target_user_id:
            print("\n❌ No real user found!")
            return
        
        print(f"\nMerging {anonymous_count} anonymous activities")
        print(f"Target user: {target_user_id}")
        
        # Show breakdown before
        print("\nAnonymous activities by service:")
        pipeline = [
            {"$match": {"user_id": "anonymous"}},
            {"$group": {"_id": "$service_type", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        breakdown = list(activities.aggregate(pipeline))
        for item in breakdown:
            print(f"  • {item['_id']}: {item['count']}")
        
        # Perform merge
        print("\nMerging...")
        result = activities.update_many(
            {"user_id": "anonymous"},
            {"$set": {"user_id": target_user_id}}
        )
        
        print(f"\n✅ Merged {result.modified_count} activities!")
        
        # Show final stats
        total = activities.count_documents({"user_id": target_user_id})
        print(f"\nTotal activities for user {target_user_id}: {total}")
        
        pipeline = [
            {"$match": {"user_id": target_user_id}},
            {"$group": {"_id": "$service_type", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        breakdown = list(activities.aggregate(pipeline))
        print("\nFinal service breakdown:")
        for item in breakdown:
            print(f"  • {item['_id']}: {item['count']}")
        
        print("\n" + "=" * 70)
        print("✅ MERGE COMPLETE!")
        print("Refresh your Activity Dashboard to see all activities.")
        print("=" * 70)
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    merge_now()
