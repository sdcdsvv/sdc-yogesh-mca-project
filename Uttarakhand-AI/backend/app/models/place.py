"""Place model for MongoDB"""
from typing import Optional, Dict, Any, List
from datetime import datetime
from pymongo import MongoClient
from app.config.settings import Config
from app.utils.logger import logger

class PlaceModel:
    """Model for places/tourist spots"""
    
    def __init__(self):
        """Initialize MongoDB connection"""
        try:
            self.client = MongoClient(Config.MONGO_URI)
            self.db = self.client[Config.DB_NAME]
            self.collection = self.db['places']
            logger.info("Place model initialized")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            self.client = None
            self.db = None
            self.collection = None
    
    def create_place(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new place record
        
        Args:
            data: Place data dictionary
            
        Returns:
            Created place document
        """
        if not self.collection:
            return {'success': False, 'message': 'Database not available'}
        
        try:
            place_data = {
                'name': data.get('name', ''),
                'description': data.get('description', ''),
                'location': data.get('location', ''),
                'district': data.get('district', ''),
                'category': data.get('category', ''),
                'best_time_to_visit': data.get('best_time_to_visit', ''),
                'entry_fee': data.get('entry_fee', 0),
                'coordinates': data.get('coordinates', {}),
                'nearby_places': data.get('nearby_places', []),
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            
            result = self.collection.insert_one(place_data)
            place_data['_id'] = str(result.inserted_id)
            
            return {
                'success': True,
                'data': place_data
            }
        except Exception as e:
            logger.error(f"Error creating place: {str(e)}")
            return {
                'success': False,
                'message': str(e)
            }
    
    def get_place(self, place_id: str) -> Dict[str, Any]:
        """Get place by ID"""
        if not self.collection:
            return {'success': False, 'message': 'Database not available'}
        
        try:
            from bson import ObjectId
            place = self.collection.find_one({'_id': ObjectId(place_id)})
            if place:
                place['_id'] = str(place['_id'])
                return {'success': True, 'data': place}
            return {'success': False, 'message': 'Place not found'}
        except Exception as e:
            logger.error(f"Error getting place: {str(e)}")
            return {'success': False, 'message': str(e)}
    
    def search_places(
        self, 
        query: Optional[str] = None,
        district: Optional[str] = None,
        category: Optional[str] = None,
        limit: int = 20
    ) -> Dict[str, Any]:
        """
        Search places with filters
        
        Args:
            query: Search query string
            district: Filter by district
            category: Filter by category
            limit: Maximum results
            
        Returns:
            List of matching places
        """
        if not self.collection:
            return {'success': False, 'message': 'Database not available', 'data': []}
        
        try:
            filter_dict = {}
            
            if query:
                filter_dict['$or'] = [
                    {'name': {'$regex': query, '$options': 'i'}},
                    {'description': {'$regex': query, '$options': 'i'}},
                    {'location': {'$regex': query, '$options': 'i'}}
                ]
            
            if district:
                filter_dict['district'] = {'$regex': district, '$options': 'i'}
            
            if category:
                filter_dict['category'] = {'$regex': category, '$options': 'i'}
            
            places = list(self.collection.find(filter_dict).limit(limit))
            
            # Convert ObjectId to string
            for place in places:
                place['_id'] = str(place['_id'])
            
            return {
                'success': True,
                'data': places,
                'count': len(places)
            }
        except Exception as e:
            logger.error(f"Error searching places: {str(e)}")
            return {
                'success': False,
                'message': str(e),
                'data': []
            }
    
    def get_popular_places(self, limit: int = 10) -> Dict[str, Any]:
        """Get popular places"""
        if not self.collection:
            return {'success': False, 'message': 'Database not available', 'data': []}
        
        try:
            places = list(self.collection.find().limit(limit))
            for place in places:
                place['_id'] = str(place['_id'])
            return {
                'success': True,
                'data': places
            }
        except Exception as e:
            logger.error(f"Error getting popular places: {str(e)}")
            return {
                'success': False,
                'message': str(e),
                'data': []
            }

# Singleton instance
_place_model: Optional[PlaceModel] = None

def get_place_model() -> PlaceModel:
    """Get or create place model instance"""
    global _place_model
    if _place_model is None:
        _place_model = PlaceModel()
    return _place_model

