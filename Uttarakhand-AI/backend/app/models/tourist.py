"""Tourist model for MongoDB"""
from typing import Optional, Dict, Any
from datetime import datetime
from pymongo import MongoClient
from app.config.settings import Config
from app.utils.logger import logger

class TouristModel:
    """Model for tourist/user data"""
    
    def __init__(self):
        """Initialize MongoDB connection"""
        try:
            self.client = MongoClient(Config.MONGO_URI)
            self.db = self.client[Config.DB_NAME]
            self.collection = self.db['tourists']
            logger.info("Tourist model initialized")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            self.client = None
            self.db = None
            self.collection = None
    
    def create_tourist(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new tourist record
        
        Args:
            data: Tourist data dictionary
            
        Returns:
            Created tourist document
        """
        if not self.collection:
            return {'success': False, 'message': 'Database not available'}
        
        try:
            tourist_data = {
                'name': data.get('name', ''),
                'email': data.get('email', ''),
                'phone': data.get('phone', ''),
                'preferred_language': data.get('preferred_language', 'english'),
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            
            result = self.collection.insert_one(tourist_data)
            tourist_data['_id'] = str(result.inserted_id)
            
            return {
                'success': True,
                'data': tourist_data
            }
        except Exception as e:
            logger.error(f"Error creating tourist: {str(e)}")
            return {
                'success': False,
                'message': str(e)
            }
    
    def get_tourist(self, tourist_id: str) -> Dict[str, Any]:
        """Get tourist by ID"""
        if not self.collection:
            return {'success': False, 'message': 'Database not available'}
        
        try:
            from bson import ObjectId
            tourist = self.collection.find_one({'_id': ObjectId(tourist_id)})
            if tourist:
                tourist['_id'] = str(tourist['_id'])
                return {'success': True, 'data': tourist}
            return {'success': False, 'message': 'Tourist not found'}
        except Exception as e:
            logger.error(f"Error getting tourist: {str(e)}")
            return {'success': False, 'message': str(e)}
    
    def update_tourist(self, tourist_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update tourist data"""
        if not self.collection:
            return {'success': False, 'message': 'Database not available'}
        
        try:
            from bson import ObjectId
            data['updated_at'] = datetime.utcnow()
            result = self.collection.update_one(
                {'_id': ObjectId(tourist_id)},
                {'$set': data}
            )
            if result.modified_count > 0:
                return {'success': True, 'message': 'Tourist updated'}
            return {'success': False, 'message': 'Tourist not found'}
        except Exception as e:
            logger.error(f"Error updating tourist: {str(e)}")
            return {'success': False, 'message': str(e)}

# Singleton instance
_tourist_model: Optional[TouristModel] = None

def get_tourist_model() -> TouristModel:
    """Get or create tourist model instance"""
    global _tourist_model
    if _tourist_model is None:
        _tourist_model = TouristModel()
    return _tourist_model

