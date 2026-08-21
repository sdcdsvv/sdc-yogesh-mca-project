"""
Check all activities for all users
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.config.database import get_database
from app.models.activity import Activity

def check_all_activities():
    """Check activities for all users"""
    try:
        db = get_database()
        activity_model = Activity(db)
        
        print("=" * 70)
        print("ALL ACTIVITIES IN DATABASE")
        print("=" * 70)
        
        # Get all activities
        all_activities = list(activity_model.collection.find().sort("timestamp", -1))
        
        if not all_activities:
            print("\n❌ No activities found in database")
            return
        
        # Group by user
        users = {}
        for activity in all_activities:
            user_id = activity.get('user_id', 'unknown')
            if user_id not in users:
                users[user_id] = []
            users[user_id].append(activity)
        
        # Display for each user
        for user_id, activities in users.items():
            print(f"\n{'='*70}")
            print(f"USER: {user_id}")
            print(f"Total Activities: {len(activities)}")
            print(f"{'='*70}")
            
            # Count by service type
            service_counts = {}
            for activity in activities:
                service = activity.get('service_type', 'unknown')
                service_counts[service] = service_counts.get(service, 0) + 1
            
            print("\nService Breakdown:")
            for service, count in sorted(service_counts.items()):
                print(f"  • {service}: {count}")
            
            print("\nRecent Activities:")
            for i, activity in enumerate(activities[:10], 1):
                service = activity.get('service_type', 'unknown')
                action = activity.get('action', 'unknown')
                timestamp = activity.get('timestamp', 'unknown')
                details = activity.get('details', {})
                description = details.get('description', 'No description')
                
                print(f"\n  {i}. [{service}] {action}")
                print(f"     Time: {timestamp}")
                print(f"     {description}")
        
        print("\n" + "=" * 70)
        print("SUMMARY")
        print("=" * 70)
        print(f"Total Users: {len(users)}")
        print(f"Total Activities: {len(all_activities)}")
        
        # Overall service breakdown
        all_services = {}
        for activity in all_activities:
            service = activity.get('service_type', 'unknown')
            all_services[service] = all_services.get(service, 0) + 1
        
        print("\nOverall Service Usage:")
        for service, count in sorted(all_services.items(), key=lambda x: x[1], reverse=True):
            print(f"  • {service}: {count}")
        
        print("=" * 70)
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_all_activities()
