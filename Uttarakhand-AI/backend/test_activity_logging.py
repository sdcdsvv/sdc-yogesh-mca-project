"""
Test script to verify activity logging is working for all services
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.config.database import get_database
from app.models.activity import Activity

def test_activity_logging():
    """Test if activities are being logged correctly"""
    try:
        db = get_database()
        activity_model = Activity(db)
        
        # Check all activities (not just for one user)
        print("\n🔍 Checking all activities in database...")
        all_activities = list(activity_model.collection.find().sort("timestamp", -1).limit(50))
        print(f"   Total activities in database: {len(all_activities)}")
        
        # Get unique user IDs
        user_ids = set(activity.get('user_id') for activity in all_activities)
        print(f"   Unique users: {user_ids}")
        
        # Use the first user ID found, or 'anonymous' as fallback
        test_user_id = list(user_ids)[0] if user_ids else "anonymous"
        print(f"   Testing with user_id: {test_user_id}")
        
        print("=" * 60)
        print("ACTIVITY LOGGING TEST")
        print("=" * 60)
        
        # Get recent activities
        print("\n1. Fetching recent activities...")
        recent = activity_model.get_recent_activities(test_user_id, limit=20)
        print(f"   Found {len(recent)} recent activities")
        
        # Get service usage summary
        print("\n2. Getting service usage summary...")
        summary = activity_model.get_service_usage_summary(test_user_id, days=30)
        print(f"   Total activities: {summary['total_activities']}")
        print(f"   Services used:")
        for service in summary['services']:
            print(f"      - {service['_id']}: {service['count']} times")
        
        # Show breakdown by service type
        print("\n3. Activity breakdown by service type:")
        service_types = {}
        for activity in recent:
            service_type = activity.get('service_type', 'unknown')
            service_types[service_type] = service_types.get(service_type, 0) + 1
        
        for service_type, count in sorted(service_types.items(), key=lambda x: x[1], reverse=True):
            print(f"   {service_type}: {count}")
        
        # Show recent activities with details
        print("\n4. Recent activities (last 10):")
        for i, activity in enumerate(recent[:10], 1):
            service = activity.get('service_type', 'unknown')
            action = activity.get('action', 'unknown')
            timestamp = activity.get('timestamp', 'unknown')
            details = activity.get('details', {})
            description = details.get('description', 'No description')
            
            print(f"\n   {i}. [{service}] {action}")
            print(f"      Time: {timestamp}")
            print(f"      Description: {description}")
        
        print("\n" + "=" * 60)
        print("TEST COMPLETED")
        print("=" * 60)
        
        # Check if all expected services are present
        expected_services = ['chat', 'itinerary', 'vision', 'emergency', 'weather', 'places']
        missing_services = [s for s in expected_services if s not in service_types]
        
        if missing_services:
            print("\n⚠️  WARNING: The following services have no logged activities:")
            for service in missing_services:
                print(f"   - {service}")
            print("\nThis could mean:")
            print("   1. These services haven't been used yet")
            print("   2. Activity logging is not implemented for these services")
        else:
            print("\n✅ All expected services have logged activities!")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_activity_logging()
