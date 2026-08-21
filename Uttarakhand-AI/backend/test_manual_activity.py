"""
Manual test to create sample activities for testing
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.config.database import get_database
from app.utils.activity_helper import get_activity_logger

def create_sample_activities():
    """Create sample activities for all services"""
    try:
        logger = get_activity_logger()
        test_user_id = "test_user_123"
        
        print("Creating sample activities...")
        print("=" * 60)
        
        # 1. Chat activity
        print("\n1. Creating chat activity...")
        logger.log(
            user_id=test_user_id,
            service_type='chat',
            action='query',
            details={
                'description': 'Chat interaction',
                'query_preview': 'What are the best places to visit in Uttarakhand?'
            },
            request_data={'query_length': 50, 'language': 'english'},
            response_data={'success': True, 'response_length': 200}
        )
        print("   ✓ Chat activity created")
        
        # 2. Itinerary activity
        print("\n2. Creating itinerary activity...")
        logger.log(
            user_id=test_user_id,
            service_type='itinerary',
            action='generate',
            details={
                'description': 'Generated 3-day itinerary',
                'budget_range': '₹50000'
            },
            request_data={
                'duration': 3,
                'budget': 50000,
                'interests': ['temples', 'trekking']
            },
            response_data={'success': True, 'days_count': 3}
        )
        print("   ✓ Itinerary activity created")
        
        # 3. Vision activity
        print("\n3. Creating vision activity...")
        logger.log(
            user_id=test_user_id,
            service_type='vision',
            action='analyze',
            details={
                'description': 'Analyzed image for place identification',
                'identified_place': 'Kedarnath Temple'
            },
            request_data={'language': 'english'},
            response_data={
                'success': True,
                'identified': True,
                'place_name': 'Kedarnath Temple'
            }
        )
        print("   ✓ Vision activity created")
        
        # 4. Emergency activity
        print("\n4. Creating emergency activity...")
        logger.log(
            user_id=test_user_id,
            service_type='emergency',
            action='contacts_lookup',
            details={
                'description': 'Viewed emergency contacts',
                'category': 'all'
            },
            request_data={'category': ''},
            response_data={'success': True, 'count': 10}
        )
        print("   ✓ Emergency activity created")
        
        # 5. Weather activity
        print("\n5. Creating weather activity...")
        logger.log(
            user_id=test_user_id,
            service_type='weather',
            action='query',
            details={
                'description': 'Checked weather for Dehradun',
                'location': 'Dehradun'
            },
            request_data={'location': 'Dehradun'},
            response_data={'success': True, 'temperature': 25}
        )
        print("   ✓ Weather activity created")
        
        # 6. Places activity
        print("\n6. Creating places activity...")
        logger.log(
            user_id=test_user_id,
            service_type='places',
            action='search',
            details={
                'description': 'Searched for places',
                'query': 'temple'
            },
            request_data={'query': 'temple', 'type': '', 'district': ''},
            response_data={'success': True, 'results_count': 15}
        )
        print("   ✓ Places activity created")
        
        print("\n" + "=" * 60)
        print("✅ All sample activities created successfully!")
        print("\nNow run: python test_activity_logging.py")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    create_sample_activities()
