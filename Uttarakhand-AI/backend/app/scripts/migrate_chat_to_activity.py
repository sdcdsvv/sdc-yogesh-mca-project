"""
Migration Script: Chat History to Activity Tracking
====================================================

Ye script existing chat history ko activity tracking me convert karta hai.
Optional migration hai - agar purani chat history ko activity format me save karna ho to.

Run kaise kare:
    python -m app.scripts.migrate_chat_to_activity
"""

from app.config.database import get_database
from app.models.chat import Chat
from app.models.activity import Activity
from datetime import datetime


def migrate_chat_history_to_activities():
    """
    Migrate existing chat history to activity tracking system
    
    Ye function:
    1. Saare chat messages ko read karega
    2. Har chat message ko activity format me convert karega
    3. Activities collection me save karega
    """
    print("🔄 Starting migration: Chat History → Activity Tracking")
    print("-" * 60)
    
    try:
        db = get_database()
        chat_model = Chat(db)
        activity_model = Activity(db)
        
        # Get all chat messages
        chat_collection = db.chats
        all_chats = list(chat_collection.find({}))
        
        print(f"📊 Found {len(all_chats)} chat messages to migrate")
        
        migrated_count = 0
        skipped_count = 0
        
        for chat in all_chats:
            try:
                # Only migrate user queries (not assistant responses)
                # Assistant responses are already linked to user queries
                if chat.get('role') != 'user':
                    skipped_count += 1
                    continue
                
                # Create activity from chat
                activity_data = {
                    'user_id': chat.get('user_id'),
                    'service_type': 'chat',
                    'action': 'query',
                    'details': {
                        'description': 'Chat interaction',
                        'query_preview': chat.get('content', '')[:100]
                    },
                    'request_data': {
                        'query_length': len(chat.get('content', '')),
                        'language': chat.get('metadata', {}).get('language', 'english'),
                        'session_id': chat.get('session_id')
                    },
                    'response_data': {
                        'success': True,
                        'tokens_used': chat.get('tokens_used', 0)
                    },
                    'metadata': {
                        'language': chat.get('metadata', {}).get('language', 'english'),
                        'query_type': chat.get('metadata', {}).get('query_type'),
                        'migrated_from': 'chat_history',
                        'original_chat_id': str(chat.get('_id'))
                    },
                    'timestamp': chat.get('timestamp', datetime.utcnow()),
                    'status': 'success',
                    'duration_ms': chat.get('response_time', 0) * 1000
                }
                
                # Check if already migrated
                existing = activity_model.collection.find_one({
                    'metadata.original_chat_id': str(chat.get('_id'))
                })
                
                if existing:
                    skipped_count += 1
                    continue
                
                # Insert activity
                activity_model.collection.insert_one(activity_data)
                migrated_count += 1
                
                if migrated_count % 100 == 0:
                    print(f"  ✓ Migrated {migrated_count} messages...")
                
            except Exception as e:
                print(f"  ✗ Error migrating chat {chat.get('_id')}: {str(e)}")
                skipped_count += 1
                continue
        
        print("-" * 60)
        print(f"✅ Migration completed!")
        print(f"   Migrated: {migrated_count}")
        print(f"   Skipped:  {skipped_count}")
        print(f"   Total:    {len(all_chats)}")
        
        return {
            'success': True,
            'migrated': migrated_count,
            'skipped': skipped_count,
            'total': len(all_chats)
        }
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }


def rollback_migration():
    """
    Rollback migration - delete all migrated activities
    
    Ye function saare migrated activities ko delete karega.
    Use with caution!
    """
    print("⚠️  WARNING: This will delete all migrated activities!")
    confirm = input("Type 'YES' to confirm rollback: ")
    
    if confirm != 'YES':
        print("❌ Rollback cancelled")
        return
    
    try:
        db = get_database()
        activity_collection = db.activities
        
        # Delete all activities that were migrated from chat history
        result = activity_collection.delete_many({
            'metadata.migrated_from': 'chat_history'
        })
        
        print(f"✅ Rollback completed! Deleted {result.deleted_count} activities")
        
    except Exception as e:
        print(f"❌ Rollback failed: {str(e)}")


def migrate_with_options():
    """
    Interactive migration with options
    """
    print("\n" + "=" * 60)
    print("  Chat History to Activity Tracking Migration")
    print("=" * 60 + "\n")
    
    print("Options:")
    print("  1. Migrate chat history to activities")
    print("  2. Rollback migration (delete migrated activities)")
    print("  3. View migration stats")
    print("  4. Exit")
    print()
    
    choice = input("Enter your choice (1-4): ")
    
    if choice == '1':
        result = migrate_chat_history_to_activities()
        
    elif choice == '2':
        rollback_migration()
        
    elif choice == '3':
        db = get_database()
        
        # Get stats
        total_activities = db.activities.count_documents({})
        migrated_activities = db.activities.count_documents({
            'metadata.migrated_from': 'chat_history'
        })
        
        print("\n📊 Migration Stats:")
        print(f"   Total Activities: {total_activities}")
        print(f"   Migrated from Chat: {migrated_activities}")
        print(f"   New Activities: {total_activities - migrated_activities}")
        
    elif choice == '4':
        print("👋 Goodbye!")
        
    else:
        print("❌ Invalid choice")


if __name__ == '__main__':
    # Run migration
    migrate_with_options()
