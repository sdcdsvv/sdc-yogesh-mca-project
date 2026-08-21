"""
Database Initialization and Migration Script
Creates collections, indexes, and seed data
"""
import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.config.database import get_database, get_client
from app.models.user import User
from app.models.chat import Chat


def init_database():
    """Initialize database with collections and indexes"""
    print("=" * 60)
    print("Uttarakhand Tourism AI - Database Initialization")
    print("=" * 60)
    print()
    
    try:
        # Get database connection
        print("→ Connecting to MongoDB...")
        db = get_database()
        client = get_client()
        print("✓ Connected successfully")
        print()
        
        # List existing collections
        existing_collections = db.list_collection_names()
        print(f"→ Existing collections: {existing_collections}")
        print()
        
        # Initialize Users collection
        print("→ Initializing Users collection...")
        user_model = User(db)
        print("✓ Users collection ready")
        print("  - Indexes: email (unique), created_at")
        print()
        
        # Initialize Chats collection
        print("→ Initializing Chats collection...")
        chat_model = Chat(db)
        print("✓ Chats collection ready")
        print("  - Indexes: (user_id, timestamp), session_id, feedback.rating, content (text)")
        print()
        
        # Display collection stats
        print("→ Collection Statistics:")
        users_count = db.users.count_documents({})
        chats_count = db.chats.count_documents({})
        print(f"  - Users: {users_count}")
        print(f"  - Chats: {chats_count}")
        print()
        
        # Display indexes
        print("→ Indexes Created:")
        print("\n  Users Collection:")
        for index in db.users.list_indexes():
            print(f"    - {index['name']}: {index.get('key', {})}")
        
        print("\n  Chats Collection:")
        for index in db.chats.list_indexes():
            print(f"    - {index['name']}: {index.get('key', {})}")
        print()
        
        print("=" * 60)
        print("✓ Database initialization completed successfully!")
        print("=" * 60)
        print()
        print("Next steps:")
        print("1. Update .env file with your MongoDB connection string")
        print("2. Start the Flask server: python run.py")
        print("3. Test authentication endpoints")
        print()
        
        return True
        
    except Exception as e:
        print(f"\n✗ Error during initialization: {e}")
        print()
        return False


def seed_test_data():
    """Seed database with test data (optional)"""
    print("=" * 60)
    print("Seeding Test Data")
    print("=" * 60)
    print()
    
    try:
        db = get_database()
        user_model = User(db)
        chat_model = Chat(db)
        
        # Create test user
        print("→ Creating test user...")
        try:
            test_user = user_model.create_user(
                email="test@uttarakhand.com",
                password="test123",
                name="Test User",
                language="english"
            )
            print(f"✓ Test user created: {test_user['email']}")
            user_id = str(test_user['_id'])
        except ValueError:
            print("  Test user already exists, fetching...")
            test_user = user_model.get_user_by_email("test@uttarakhand.com")
            user_id = str(test_user['_id'])
            print(f"✓ Using existing test user: {test_user['email']}")
        
        print()
        
        # Create sample chat messages
        print("→ Creating sample chat messages...")
        session_id = "test-session-001"
        
        messages = [
            {
                "role": "user",
                "content": "Tell me about Kedarnath Temple",
                "metadata": {"language": "english", "query_type": "destination"}
            },
            {
                "role": "assistant",
                "content": "Kedarnath Temple is one of the twelve Jyotirlingas of Lord Shiva, located at an altitude of 3,583 meters in the Garhwal Himalayas. It's a sacred pilgrimage site with stunning mountain views.",
                "metadata": {"language": "english", "tokens_used": 45, "response_time": 1.2}
            },
            {
                "role": "user",
                "content": "How can I reach there?",
                "metadata": {"language": "english", "query_type": "travel"}
            },
            {
                "role": "assistant",
                "content": "You can reach Kedarnath by trekking 16 km from Gaurikund, or by helicopter from Phata, Sersi, or Guptkashi. The trek takes about 6-8 hours.",
                "metadata": {"language": "english", "tokens_used": 38, "response_time": 0.9}
            }
        ]
        
        for msg in messages:
            chat_model.create_message(
                user_id=user_id,
                session_id=session_id,
                role=msg["role"],
                content=msg["content"],
                metadata=msg["metadata"]
            )
        
        print(f"✓ Created {len(messages)} sample messages")
        print()
        
        print("=" * 60)
        print("✓ Test data seeded successfully!")
        print("=" * 60)
        print()
        print("Test credentials:")
        print("  Email: test@uttarakhand.com")
        print("  Password: test123")
        print()
        
        return True
        
    except Exception as e:
        print(f"\n✗ Error during seeding: {e}")
        print()
        return False


def drop_database():
    """Drop all collections (use with caution!)"""
    print("=" * 60)
    print("⚠️  WARNING: Database Drop Operation")
    print("=" * 60)
    print()
    
    confirm = input("Are you sure you want to drop all collections? (yes/no): ")
    
    if confirm.lower() != 'yes':
        print("Operation cancelled.")
        return False
    
    try:
        db = get_database()
        
        print("\n→ Dropping collections...")
        db.users.drop()
        print("✓ Dropped users collection")
        
        db.chats.drop()
        print("✓ Dropped chats collection")
        
        print()
        print("=" * 60)
        print("✓ All collections dropped successfully!")
        print("=" * 60)
        print()
        
        return True
        
    except Exception as e:
        print(f"\n✗ Error during drop: {e}")
        print()
        return False


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Database initialization script')
    parser.add_argument('--init', action='store_true', help='Initialize database')
    parser.add_argument('--seed', action='store_true', help='Seed test data')
    parser.add_argument('--drop', action='store_true', help='Drop all collections')
    parser.add_argument('--all', action='store_true', help='Initialize and seed')
    
    args = parser.parse_args()
    
    if args.drop:
        drop_database()
    elif args.all:
        if init_database():
            seed_test_data()
    elif args.seed:
        seed_test_data()
    else:
        # Default: just initialize
        init_database()
