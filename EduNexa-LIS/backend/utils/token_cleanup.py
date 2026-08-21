from datetime import datetime, timedelta
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

def cleanup_expired_tokens(db):
    """Clean up expired refresh tokens and password reset tokens"""
    try:
        current_time = datetime.utcnow()
        
        # Remove expired refresh tokens
        refresh_result = db.refresh_tokens.delete_many({
            'expires_at': {'$lt': current_time}
        })
        
        # Remove expired password reset tokens
        reset_result = db.password_resets.delete_many({
            'expires_at': {'$lt': current_time}
        })
        
        print(f"Cleaned up {refresh_result.deleted_count} expired refresh tokens")
        print(f"Cleaned up {reset_result.deleted_count} expired password reset tokens")
        
        return {
            'refresh_tokens_cleaned': refresh_result.deleted_count,
            'reset_tokens_cleaned': reset_result.deleted_count
        }
        
    except Exception as e:
        print(f"Error during token cleanup: {e}")
        return None

def cleanup_inactive_refresh_tokens(db, days_old=30):
    """Clean up inactive refresh tokens older than specified days"""
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days_old)
        
        result = db.refresh_tokens.delete_many({
            'is_active': False,
            'revoked_at': {'$lt': cutoff_date}
        })
        
        print(f"Cleaned up {result.deleted_count} old inactive refresh tokens")
        return result.deleted_count
        
    except Exception as e:
        print(f"Error during inactive token cleanup: {e}")
        return 0

if __name__ == '__main__':
    # Connect to MongoDB
    mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/edunexa_lms')
    client = MongoClient(mongo_uri)
    db = client.edunexa_lms
    
    # Run cleanup
    cleanup_expired_tokens(db)
    cleanup_inactive_refresh_tokens(db)
    
    client.close()