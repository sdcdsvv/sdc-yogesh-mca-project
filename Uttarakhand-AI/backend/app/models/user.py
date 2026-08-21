"""
User Model for MongoDB
Handles user authentication and profile data
"""
from datetime import datetime
from typing import Optional, Dict, Any
import bcrypt
from bson import ObjectId


class User:
    """User model for authentication and profile management"""
    
    def __init__(self, db):
        self.collection = db.users
        self._ensure_indexes()
    
    def _ensure_indexes(self):
        """Create indexes for efficient queries"""
        # Unique index on email
        self.collection.create_index("email", unique=True)
        # Index on created_at for sorting
        self.collection.create_index("created_at")
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    
    def create_user(self, email: str, password: str, name: str, 
                   language: str = 'english') -> Dict[str, Any]:
        """Create a new user"""
        # Check if user already exists
        if self.collection.find_one({"email": email}):
            raise ValueError("User with this email already exists")
        
        user_data = {
            "email": email,
            "password": self.hash_password(password),
            "name": name,
            "language": language,
            "avatar": None,  # URL or base64 string
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "last_login": None,
            "login_count": 0,
            "is_first_login": True,
            "is_active": True,
            "preferences": {
                "theme": "light",
                "notifications": True
            },
            "stats": {
                "total_chats": 0,
                "total_feedback": 0,
                "positive_feedback": 0,
                "negative_feedback": 0
            }
        }
        
        result = self.collection.insert_one(user_data)
        user_data['_id'] = result.inserted_id
        
        # Remove password from response
        del user_data['password']
        return user_data
    
    def authenticate(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """Authenticate user with email and password"""
        user = self.collection.find_one({"email": email, "is_active": True})
        
        if not user:
            return None
        
        if not self.verify_password(password, user['password']):
            return None
        
        # Update login tracking
        is_first_login = user.get('is_first_login', True)
        self.collection.update_one(
            {"_id": user['_id']},
            {
                "$set": {
                    "last_login": datetime.utcnow(),
                    "is_first_login": False
                },
                "$inc": {"login_count": 1}
            }
        )
        
        # Update user object with login info
        user['is_first_login'] = is_first_login
        user['login_count'] = user.get('login_count', 0) + 1
        
        # Remove password from response
        del user['password']
        return user
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            user = self.collection.find_one({"_id": ObjectId(user_id), "is_active": True})
            if user:
                del user['password']
            return user
        except:
            return None
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        user = self.collection.find_one({"email": email, "is_active": True})
        if user:
            del user['password']
        return user
    
    def update_user(self, user_id: str, update_data: Dict[str, Any]) -> bool:
        """Update user data"""
        try:
            # Don't allow updating password or email through this method
            update_data.pop('password', None)
            update_data.pop('email', None)
            update_data['updated_at'] = datetime.utcnow()
            
            result = self.collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except:
            return False
    
    def update_password(self, user_id: str, old_password: str, new_password: str) -> bool:
        """Update user password"""
        try:
            user = self.collection.find_one({"_id": ObjectId(user_id)})
            if not user:
                return False
            
            if not self.verify_password(old_password, user['password']):
                return False
            
            result = self.collection.update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$set": {
                        "password": self.hash_password(new_password),
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            return result.modified_count > 0
        except:
            return False
    
    def increment_stat(self, user_id: str, stat_name: str, value: int = 1) -> bool:
        """Increment user statistics"""
        try:
            result = self.collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$inc": {f"stats.{stat_name}": value}}
            )
            return result.modified_count > 0
        except:
            return False
    
    def delete_user(self, user_id: str) -> bool:
        """Soft delete user (mark as inactive)"""
        try:
            result = self.collection.update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$set": {
                        "is_active": False,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            return result.modified_count > 0
        except:
            return False
