"""
MongoDB Migration Script
Creates collections, indexes, and seeds initial data
"""
import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.config.database import get_database, get_client
from pymongo import ASCENDING, DESCENDING, TEXT


def create_collections_and_indexes():
    """Create all collections with proper indexes"""
    print("🔧 Starting MongoDB migration...")
    
    try:
        db = get_database()
        client = get_client()
        
        # Test connection
        client.admin.command('ping')
        print("✓ Connected to MongoDB")
        
        # Users Collection
        print("\n📦 Setting up 'users' collection...")
        users = db.users
        users.create_index("email", unique=True)
        users.create_index("created_at", name="idx_created_at")
        users.create_index("is_active", name="idx_is_active")
        print("  ✓ Created indexes: email (unique), created_at, is_active")
        
        # Chats Collection
        print("\n💬 Setting up 'chats' collection...")
        chats = db.chats
        
        # Compound index for user queries (most common)
        chats.create_index(
            [("user_id", ASCENDING), ("timestamp", DESCENDING)],
            name="idx_user_timestamp"
        )
        
        # Session index for conversation grouping
        chats.create_index("session_id", name="idx_session")
        
        # Feedback index for analytics
        chats.create_index("feedback.rating", name="idx_feedback_rating")
        
        # Role index for filtering
        chats.create_index("role", name="idx_role")
        
        # Text index for content search (for reinforcement learning)
        try:
            chats.create_index([("content", TEXT)], name="idx_content_text")
            print("  ✓ Created text search index on content")
        except Exception as e:
            print(f"  ⚠ Text index might already exist: {e}")
        
        # Compound index for liked responses (reinforcement learning)
        chats.create_index(
            [("feedback.rating", ASCENDING), ("timestamp", DESCENDING)],
            name="idx_feedback_timestamp"
        )
        
        print("  ✓ Created indexes: user_id+timestamp, session_id, feedback.rating, role, content (text)")
        
        # Get collection stats
        user_count = users.count_documents({})
        chat_count = chats.count_documents({})
        
        print(f"\n📊 Database Statistics:")
        print(f"  Users: {user_count}")
        print(f"  Chats: {chat_count}")
        
        print("\n✅ Migration completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        return False


def seed_sample_data():
    """Seed sample data for testing (optional)"""
    print("\n🌱 Seeding sample data...")
    
    try:
        db = get_database()
        
        # Check if data already exists
        if db.users.count_documents({}) > 0:
            print("  ⚠ Data already exists. Skipping seed.")
            return True
        
        # Sample user (password: demo123)
        from app.models.user import User
        user_model = User(db)
        
        try:
            demo_user = user_model.create_user(
                email="demo@uttarakhand.com",
                password="demo123",
                name="Demo User",
                language="english"
            )
            print(f"  ✓ Created demo user: demo@uttarakhand.com (password: demo123)")
        except ValueError:
            print("  ⚠ Demo user already exists")
        
        print("✅ Seeding completed!")
        return True
        
    except Exception as e:
        print(f"❌ Seeding failed: {e}")
        return False


def show_schema():
    """Display database schema documentation"""
    schema_doc = """
    
📋 DATABASE SCHEMA
==================

1. USERS COLLECTION
-------------------
{
    "_id": ObjectId,
    "email": String (unique, indexed),
    "password": String (bcrypt hashed),
    "name": String,
    "language": String (default: "english"),
    "avatar": String (optional, URL or base64),
    "created_at": DateTime (indexed),
    "updated_at": DateTime,
    "is_active": Boolean (indexed, default: true),
    "preferences": {
        "theme": String (default: "light"),
        "notifications": Boolean (default: true)
    },
    "stats": {
        "total_chats": Number,
        "total_feedback": Number,
        "positive_feedback": Number,
        "negative_feedback": Number
    }
}

Indexes:
- email (unique)
- created_at
- is_active

2. CHATS COLLECTION
--------------------
{
    "_id": ObjectId,
    "user_id": String (indexed),
    "session_id": String (indexed, UUID),
    "role": String ("user" | "assistant", indexed),
    "content": String (text indexed for search),
    "timestamp": DateTime (indexed with user_id),
    "metadata": {
        "language": String,
        "query_type": String,
        "intent": String,
        "model_version": String,
        "tokens_used": Number,
        "response_time": Number
    },
    "feedback": {
        "rating": Number (1=like, -1=dislike, null=no feedback, indexed),
        "comment": String (optional),
        "timestamp": DateTime
    },
    "tokens_used": Number,
    "response_time": Number,
    "reinforcement_weight": Number (default: 1.0, increased for liked responses)
}

Indexes:
- user_id + timestamp (compound, for user history queries)
- session_id (for conversation grouping)
- feedback.rating (for analytics)
- role (for filtering)
- content (text search, for finding similar responses)
- feedback.rating + timestamp (for reinforcement learning)

3. REINFORCEMENT LEARNING MECHANISM
------------------------------------
When a response is liked (feedback.rating = 1):
1. The response is marked with higher reinforcement_weight
2. Similar future queries search for liked responses using text search
3. Liked responses are used as examples/templates for new responses
4. The system prioritizes patterns from liked responses

Implementation:
- get_similar_liked_responses() finds similar liked responses
- Response generation can boost/prioritize similar patterns
- Weight increases with each like (multiplicative: weight *= 1.2)
- Auditable through feedback.timestamp and reinforcement_weight field
"""
    print(schema_doc)


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='MongoDB Migration Script')
    parser.add_argument('--seed', action='store_true', help='Seed sample data')
    parser.add_argument('--schema', action='store_true', help='Show schema documentation')
    
    args = parser.parse_args()
    
    if args.schema:
        show_schema()
    else:
        success = create_collections_and_indexes()
        
        if success and args.seed:
            seed_sample_data()
        
        if success:
            print("\n🎉 All done! You can now start the application.")
            print("\n📝 To see schema documentation, run:")
            print("   python scripts/migrate_db.py --schema")
