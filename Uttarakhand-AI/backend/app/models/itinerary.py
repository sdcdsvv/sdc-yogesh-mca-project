"""Itinerary model for MongoDB"""
from typing import Optional, Dict, Any
from datetime import datetime
from pymongo import MongoClient
from app.config.settings import Config
from app.utils.logger import logger

class ItineraryModel:
    """Model for user itineraries"""
    
    def __init__(self):
        """Initialize MongoDB connection"""
        try:
            self.client = MongoClient(Config.MONGO_URI)
            self.db = self.client[Config.DB_NAME]
            self.collection = self.db['itineraries']
            logger.info("Itinerary model initialized")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            self.client = None
            self.db = None
            self.collection = None
    
    def create_itinerary(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new itinerary
        
        Args:
            data: Itinerary data dictionary
            
        Returns:
            Created itinerary document
        """
        if not self.collection:
            return {'success': False, 'message': 'Database not available'}
        
        try:
            itinerary_data = {
                'user_id': data.get('user_id', ''),
                'duration': data.get('duration', 3),
                'budget': data.get('budget', 0),
                'preferences': data.get('preferences', {}),
                'itinerary': data.get('itinerary', {}),
                'status': 'active',
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            
            result = self.collection.insert_one(itinerary_data)
            itinerary_data['_id'] = str(result.inserted_id)
            
            return {
                'success': True,
                'data': itinerary_data
            }
        except Exception as e:
            logger.error(f"Error creating itinerary: {str(e)}")
            return {
                'success': False,
                'message': str(e)
            }
    
    def get_itinerary(self, itinerary_id: str) -> Dict[str, Any]:
        """Get itinerary by ID"""
        if not self.collection:
            return {'success': False, 'message': 'Database not available'}
        
        try:
            from bson import ObjectId
            itinerary = self.collection.find_one({'_id': ObjectId(itinerary_id)})
            if itinerary:
                itinerary['_id'] = str(itinerary['_id'])
                return {'success': True, 'data': itinerary}
            return {'success': False, 'message': 'Itinerary not found'}
        except Exception as e:
            logger.error(f"Error getting itinerary: {str(e)}")
            return {'success': False, 'message': str(e)}
    
    def get_user_itineraries(self, user_id: str, limit: int = 10) -> Dict[str, Any]:
        """Get all itineraries for a user"""
        if not self.collection:
            return {'success': False, 'message': 'Database not available', 'data': []}
        
        try:
            itineraries = list(
                self.collection.find({'user_id': user_id})
                .sort('created_at', -1)
                .limit(limit)
            )
            
            for itinerary in itineraries:
                itinerary['_id'] = str(itinerary['_id'])
            
            return {
                'success': True,
                'data': itineraries
            }
        except Exception as e:
            logger.error(f"Error getting user itineraries: {str(e)}")
            return {
                'success': False,
                'message': str(e),
                'data': []
            }

# Singleton instance
_itinerary_model: Optional[ItineraryModel] = None

def get_itinerary_model() -> ItineraryModel:
    """Get or create itinerary model instance"""
    global _itinerary_model
    if _itinerary_model is None:
        _itinerary_model = ItineraryModel()
    return _itinerary_model

