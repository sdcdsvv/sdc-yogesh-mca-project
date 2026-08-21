"""
Enhanced data models for Alumni Event Scheduler
"""
from datetime import datetime
from bson import ObjectId
from pymongo import MongoClient
import pytz
from typing import List, Dict, Optional, Any
import re

class BaseModel:
    """Base model class with common functionality"""
    
    def __init__(self, collection):
        self.collection = collection
    
    def create_indexes(self):
        """Create database indexes for better performance"""
        pass
    
    def validate_required_fields(self, data: Dict, required_fields: List[str]) -> List[str]:
        """Validate that all required fields are present"""
        missing_fields = []
        for field in required_fields:
            if field not in data or data[field] is None or data[field] == '':
                missing_fields.append(field)
        return missing_fields

class UserModel(BaseModel):
    """User model with enhanced functionality"""
    
    def __init__(self, collection):
        super().__init__(collection)
        self.required_fields = ['name', 'email', 'password_hash', 'role']
    
    def create_indexes(self):
        """Create indexes for users collection"""
        self.collection.create_index("email", unique=True)
        self.collection.create_index("role")
        self.collection.create_index("created_at")
    
    def validate_user_data(self, data: Dict) -> List[str]:
        """Validate user data"""
        errors = []
        
        # Check required fields
        missing_fields = self.validate_required_fields(data, self.required_fields)
        if missing_fields:
            errors.append(f"Missing required fields: {', '.join(missing_fields)}")
        
        # Validate email format
        if 'email' in data and not self._is_valid_email(data['email']):
            errors.append("Invalid email format")
        
        # Validate role
        if 'role' in data and data['role'] not in ['admin', 'alumni']:
            errors.append("Role must be 'admin' or 'alumni'")
        
        # Validate phone format if provided
        if 'phone' in data and data['phone'] and not self._is_valid_phone(data['phone']):
            errors.append("Invalid phone number format")
        
        return errors
    
    def _is_valid_email(self, email: str) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    def _is_valid_phone(self, phone: str) -> bool:
        """Validate phone number format"""
        pattern = r'^\+?[\d\s\-\(\)]{10,}$'
        return re.match(pattern, phone) is not None
    
    def create_user(self, user_data: Dict) -> Dict:
        """Create a new user"""
        # Add timestamps
        user_data['created_at'] = datetime.utcnow()
        user_data['updated_at'] = datetime.utcnow()
        
        # Set default preferences
        if 'preferences' not in user_data:
            user_data['preferences'] = {
                'email': True,
                'sms': False,
                'push': True
            }
        
        # Set default role if not provided
        if 'role' not in user_data:
            user_data['role'] = 'alumni'
        
        result = self.collection.insert_one(user_data)
        user_data['_id'] = result.inserted_id
        return user_data
    
    def get_user_by_email(self, email: str) -> Optional[Dict]:
        """Get user by email"""
        return self.collection.find_one({"email": email})
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        """Get user by ID"""
        return self.collection.find_one({"_id": ObjectId(user_id)})
    
    def update_user(self, user_id: str, update_data: Dict) -> bool:
        """Update user data"""
        update_data['updated_at'] = datetime.utcnow()
        result = self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        return result.modified_count > 0
    
    def delete_user(self, user_id: str) -> bool:
        """Delete user (GDPR compliance)"""
        result = self.collection.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0

class EventModel(BaseModel):
    """Event model with enhanced functionality"""
    
    def __init__(self, collection):
        super().__init__(collection)
        self.required_fields = ['title', 'description', 'start_time', 'end_time', 'venue', 'capacity', 'created_by']
    
    def create_indexes(self):
        """Create indexes for events collection"""
        self.collection.create_index("start_time")
        self.collection.create_index("created_by")
        self.collection.create_index("tags")
        self.collection.create_index("rsvp_deadline")
        self.collection.create_index([("start_time", 1), ("end_time", 1)])
    
    def validate_event_data(self, data: Dict) -> List[str]:
        """Validate event data"""
        errors = []
        
        # Check required fields
        missing_fields = self.validate_required_fields(data, self.required_fields)
        if missing_fields:
            errors.append(f"Missing required fields: {', '.join(missing_fields)}")
        
        # Validate datetime fields
        if 'start_time' in data and 'end_time' in data:
            if data['start_time'] >= data['end_time']:
                errors.append("End time must be after start time")
        
        # Validate capacity
        if 'capacity' in data and (not isinstance(data['capacity'], int) or data['capacity'] <= 0):
            errors.append("Capacity must be a positive integer")
        
        # Validate timezone
        if 'timezone' in data and data['timezone'] not in pytz.all_timezones:
            errors.append("Invalid timezone")
        
        return errors
    
    def create_event(self, event_data: Dict) -> Dict:
        """Create a new event"""
        # Add timestamps
        event_data['created_at'] = datetime.utcnow()
        event_data['updated_at'] = datetime.utcnow()
        
        # Set default timezone if not provided
        if 'timezone' not in event_data:
            event_data['timezone'] = 'UTC'
        
        # Set default tags if not provided
        if 'tags' not in event_data:
            event_data['tags'] = []
        
        # Set default attachments if not provided
        if 'attachments' not in event_data:
            event_data['attachments'] = []
        
        result = self.collection.insert_one(event_data)
        event_data['_id'] = result.inserted_id
        return event_data
    
    def get_event_by_id(self, event_id: str) -> Optional[Dict]:
        """Get event by ID"""
        return self.collection.find_one({"_id": ObjectId(event_id)})
    
    def get_upcoming_events(self, limit: int = 10) -> List[Dict]:
        """Get upcoming events"""
        now = datetime.utcnow()
        return list(self.collection.find(
            {"start_time": {"$gte": now}}
        ).sort("start_time", 1).limit(limit))
    
    def search_events(self, query: Dict, page: int = 1, per_page: int = 10) -> Dict:
        """Search events with pagination"""
        skip = (page - 1) * per_page
        
        # Build search query
        search_query = {}
        
        if 'search' in query and query['search']:
            search_query['$or'] = [
                {"title": {"$regex": query['search'], "$options": "i"}},
                {"description": {"$regex": query['search'], "$options": "i"}},
                {"venue": {"$regex": query['search'], "$options": "i"}}
            ]
        
        if 'tags' in query and query['tags']:
            search_query['tags'] = {"$in": query['tags']}
        
        if 'date_from' in query and query['date_from']:
            search_query['start_time'] = {"$gte": query['date_from']}
        
        if 'date_to' in query and query['date_to']:
            if 'start_time' in search_query:
                search_query['start_time']['$lte'] = query['date_to']
            else:
                search_query['start_time'] = {"$lte": query['date_to']}
        
        # Get total count
        total = self.collection.count_documents(search_query)
        
        # Get events
        events = list(self.collection.find(search_query)
                     .sort("start_time", 1)
                     .skip(skip)
                     .limit(per_page))
        
        return {
            'events': events,
            'total': total,
            'page': page,
            'per_page': per_page,
            'pages': (total + per_page - 1) // per_page
        }
    
    def update_event(self, event_id: str, update_data: Dict) -> bool:
        """Update event data"""
        update_data['updated_at'] = datetime.utcnow()
        result = self.collection.update_one(
            {"_id": ObjectId(event_id)},
            {"$set": update_data}
        )
        return result.modified_count > 0
    
    def delete_event(self, event_id: str) -> bool:
        """Delete event"""
        result = self.collection.delete_one({"_id": ObjectId(event_id)})
        return result.deleted_count > 0

class RSVPModel(BaseModel):
    """RSVP model with enhanced functionality"""
    
    def __init__(self, collection):
        super().__init__(collection)
        self.required_fields = ['event_id', 'user_id', 'status']
    
    def create_indexes(self):
        """Create indexes for RSVPs collection"""
        self.collection.create_index([("event_id", 1), ("user_id", 1)], unique=True)
        self.collection.create_index("event_id")
        self.collection.create_index("user_id")
        self.collection.create_index("status")
        self.collection.create_index("created_at")
    
    def validate_rsvp_data(self, data: Dict) -> List[str]:
        """Validate RSVP data"""
        errors = []
        
        # Check required fields
        missing_fields = self.validate_required_fields(data, self.required_fields)
        if missing_fields:
            errors.append(f"Missing required fields: {', '.join(missing_fields)}")
        
        # Validate status
        valid_statuses = ['going', 'maybe', 'not_going', 'waitlist']
        if 'status' in data and data['status'] not in valid_statuses:
            errors.append(f"Status must be one of: {', '.join(valid_statuses)}")
        
        # Validate guests count
        if 'guests' in data and (not isinstance(data['guests'], int) or data['guests'] < 0):
            errors.append("Guests count must be a non-negative integer")
        
        return errors
    
    def create_rsvp(self, rsvp_data: Dict) -> Dict:
        """Create a new RSVP"""
        rsvp_data['created_at'] = datetime.utcnow()
        rsvp_data['updated_at'] = datetime.utcnow()
        
        result = self.collection.insert_one(rsvp_data)
        rsvp_data['_id'] = result.inserted_id
        return rsvp_data
    
    def get_rsvp_by_event_and_user(self, event_id: str, user_id: str) -> Optional[Dict]:
        """Get RSVP by event and user"""
        return self.collection.find_one({
            "event_id": ObjectId(event_id),
            "user_id": ObjectId(user_id)
        })
    
    def get_rsvps_by_event(self, event_id: str) -> List[Dict]:
        """Get all RSVPs for an event"""
        return list(self.collection.find({"event_id": ObjectId(event_id)}))
    
    def get_rsvp_stats(self, event_id: str) -> Dict:
        """Get RSVP statistics for an event"""
        pipeline = [
            {"$match": {"event_id": ObjectId(event_id)}},
            {"$group": {
                "_id": "$status",
                "count": {"$sum": 1},
                "total_guests": {"$sum": "$guests"}
            }}
        ]
        
        stats = list(self.collection.aggregate(pipeline))
        
        result = {
            'going': 0,
            'maybe': 0,
            'not_going': 0,
            'waitlist': 0,
            'total_guests': 0
        }
        
        for stat in stats:
            status = stat['_id']
            if status in result:
                result[status] = stat['count']
                result['total_guests'] += stat['total_guests']
        
        return result
    
    def update_rsvp(self, rsvp_id: str, update_data: Dict) -> bool:
        """Update RSVP data"""
        update_data['updated_at'] = datetime.utcnow()
        result = self.collection.update_one(
            {"_id": ObjectId(rsvp_id)},
            {"$set": update_data}
        )
        return result.modified_count > 0
    
    def delete_rsvp(self, rsvp_id: str) -> bool:
        """Delete RSVP"""
        result = self.collection.delete_one({"_id": ObjectId(rsvp_id)})
        return result.deleted_count > 0

class NotificationModel(BaseModel):
    """Notification model for tracking sent notifications"""
    
    def __init__(self, collection):
        super().__init__(collection)
        self.required_fields = ['user_id', 'type', 'subject', 'content']
    
    def create_indexes(self):
        """Create indexes for notifications collection"""
        self.collection.create_index("user_id")
        self.collection.create_index("type")
        self.collection.create_index("sent_at")
        self.collection.create_index("status")
    
    def create_notification(self, notification_data: Dict) -> Dict:
        """Create a new notification record"""
        notification_data['created_at'] = datetime.utcnow()
        notification_data['status'] = 'pending'
        
        result = self.collection.insert_one(notification_data)
        notification_data['_id'] = result.inserted_id
        return notification_data
    
    def mark_sent(self, notification_id: str) -> bool:
        """Mark notification as sent"""
        result = self.collection.update_one(
            {"_id": ObjectId(notification_id)},
            {
                "$set": {
                    "status": "sent",
                    "sent_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
    
    def mark_failed(self, notification_id: str, error_message: str) -> bool:
        """Mark notification as failed"""
        result = self.collection.update_one(
            {"_id": ObjectId(notification_id)},
            {
                "$set": {
                    "status": "failed",
                    "error_message": error_message,
                    "failed_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
