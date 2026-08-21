"""
MongoDB Database Configuration and Connection
"""
import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from dotenv import load_dotenv

load_dotenv()


class Database:
    """MongoDB Database Connection Manager"""
    
    _instance = None
    _client = None
    _db = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._client is None:
            self.connect()
    
    def connect(self):
        """Establish MongoDB connection"""
        try:
            # Get MongoDB URI from environment
            mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
            db_name = os.getenv('MONGODB_DB_NAME', 'uttarakhand_tourism')
            
            # Create MongoDB client
            self._client = MongoClient(
                mongo_uri,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=10000,
                socketTimeoutMS=10000
            )
            
            # Test connection
            self._client.admin.command('ping')
            
            # Get database
            self._db = self._client[db_name]
            
            print(f"✓ Connected to MongoDB: {db_name}")
            
            # Initialize collections and indexes
            self._initialize_collections()
            
        except ConnectionFailure as e:
            print(f"✗ Failed to connect to MongoDB: {e}")
            raise
        except Exception as e:
            print(f"✗ Database error: {e}")
            raise
    
    def _initialize_collections(self):
        """Initialize collections and create indexes"""
        # Users collection
        users = self._db.users
        users.create_index("email", unique=True)
        users.create_index("created_at")
        
        # Chats collection
        chats = self._db.chats
        chats.create_index([("user_id", 1), ("timestamp", -1)])
        chats.create_index("session_id")
        chats.create_index("feedback.rating")
        
        # Create text index for content search
        try:
            chats.create_index([("content", "text")])
        except:
            pass  # Index might already exist
        
        print("✓ Database collections and indexes initialized")
    
    def get_db(self):
        """Get database instance"""
        if self._db is None:
            self.connect()
        return self._db
    
    def get_client(self):
        """Get MongoDB client"""
        if self._client is None:
            self.connect()
        return self._client
    
    def close(self):
        """Close database connection"""
        if self._client:
            self._client.close()
            self._client = None
            self._db = None
            print("✓ MongoDB connection closed")
    
    def health_check(self):
        """Check database health"""
        try:
            self._client.admin.command('ping')
            return True
        except:
            return False


# Global database instance
db_instance = Database()


def get_database():
    """Get database instance"""
    return db_instance.get_db()


def get_client():
    """Get MongoDB client"""
    return db_instance.get_client()
