"""
Activity Helper Utilities
Helper functions to easily log activities from anywhere in the app
"""
from datetime import datetime
from typing import Dict, Any, Optional
from app.config.database import get_database
from app.models.activity import Activity
import time


class ActivityLogger:
    """Helper class to log activities easily"""
    
    def __init__(self):
        self.db = get_database()
        self.activity_model = Activity(self.db)
    
    def log(self, user_id: str, service_type: str, action: str,
            details: Optional[Dict] = None,
            request_data: Optional[Dict] = None,
            response_data: Optional[Dict] = None,
            metadata: Optional[Dict] = None):
        """
        Quick log activity
        """
        try:
            return self.activity_model.log_activity(
                user_id=user_id,
                service_type=service_type,
                action=action,
                details=details,
                request_data=request_data,
                response_data=response_data,
                metadata=metadata
            )
        except Exception as e:
            print(f"Failed to log activity: {str(e)}")
            return None


# Singleton instance
_activity_logger = None

def get_activity_logger() -> ActivityLogger:
    """Get singleton activity logger instance"""
    global _activity_logger
    if _activity_logger is None:
        _activity_logger = ActivityLogger()
    return _activity_logger


def log_itinerary_generation(user_id: str, preferences: Dict, 
                             result: Dict, duration_ms: float = 0):
    """
    Log itinerary generation activity
    
    Args:
        user_id: User ID
        preferences: Itinerary preferences (duration, budget, interests, etc.)
        result: Generation result
        duration_ms: Time taken in milliseconds
    """
    logger = get_activity_logger()
    
    # Sanitize request data
    request_data = {
        'duration': preferences.get('duration'),
        'budget': preferences.get('budget'),
        'interests': preferences.get('interests', []),
        'start_location': preferences.get('start_location'),
        'travel_style': preferences.get('travel_style')
    }
    
    # Sanitize response data
    response_data = {
        'success': result.get('success', False),
        'days_count': len(result.get('itinerary', {}).get('days', [])) if result.get('success') else 0
    }
    
    details = {
        'description': f"Generated {preferences.get('duration', 0)}-day itinerary",
        'budget_range': f"₹{preferences.get('budget', 0)}"
    }
    
    metadata = {
        'language': preferences.get('language', 'english'),
        'duration_ms': duration_ms
    }
    
    logger.log(
        user_id=user_id,
        service_type='itinerary',
        action='generate',
        details=details,
        request_data=request_data,
        response_data=response_data,
        metadata=metadata
    )


def log_vision_analysis(user_id: str, language: str, result: Dict, 
                       duration_ms: float = 0):
    """
    Log vision/image analysis activity
    
    Args:
        user_id: User ID
        language: Language used
        result: Analysis result
        duration_ms: Time taken in milliseconds
    """
    logger = get_activity_logger()
    
    request_data = {
        'language': language
    }
    
    response_data = {
        'success': result.get('success', False),
        'identified': result.get('identified', False),
        'place_name': result.get('data', {}).get('name', 'Unknown')
    }
    
    details = {
        'description': 'Analyzed image for place identification',
        'identified_place': result.get('data', {}).get('name', 'Not identified')
    }
    
    metadata = {
        'language': language,
        'duration_ms': duration_ms
    }
    
    logger.log(
        user_id=user_id,
        service_type='vision',
        action='analyze',
        details=details,
        request_data=request_data,
        response_data=response_data,
        metadata=metadata
    )


def log_chat_interaction(user_id: str, query: str, response: str,
                        language: str = 'english', duration_ms: float = 0):
    """
    Log chat interaction activity
    
    Args:
        user_id: User ID
        query: User query
        response: Assistant response
        language: Language used
        duration_ms: Time taken in milliseconds
    """
    logger = get_activity_logger()
    
    request_data = {
        'query_length': len(query),
        'language': language
    }
    
    response_data = {
        'success': True,
        'response_length': len(response)
    }
    
    details = {
        'description': 'Chat interaction',
        'query_preview': query[:100] + '...' if len(query) > 100 else query
    }
    
    metadata = {
        'language': language,
        'duration_ms': duration_ms
    }
    
    logger.log(
        user_id=user_id,
        service_type='chat',
        action='query',
        details=details,
        request_data=request_data,
        response_data=response_data,
        metadata=metadata
    )


def log_emergency_lookup(user_id: str, service_type: str, location: str = None):
    """
    Log emergency service lookup activity
    
    Args:
        user_id: User ID
        service_type: Type of emergency service
        location: Location for the lookup
    """
    logger = get_activity_logger()
    
    request_data = {
        'service_type': service_type,
        'location': location
    }
    
    response_data = {
        'success': True
    }
    
    details = {
        'description': f'Looked up {service_type} emergency services',
        'location': location or 'General'
    }
    
    logger.log(
        user_id=user_id,
        service_type='emergency',
        action='lookup',
        details=details,
        request_data=request_data,
        response_data=response_data
    )


def log_weather_query(user_id: str, location: str, result: Dict):
    """
    Log weather query activity
    
    Args:
        user_id: User ID
        location: Location for weather query
        result: Weather data result
    """
    logger = get_activity_logger()
    
    request_data = {
        'location': location
    }
    
    response_data = {
        'success': result.get('success', False),
        'temperature': result.get('data', {}).get('temperature')
    }
    
    details = {
        'description': f'Checked weather for {location}',
        'location': location
    }
    
    logger.log(
        user_id=user_id,
        service_type='weather',
        action='query',
        details=details,
        request_data=request_data,
        response_data=response_data
    )


class ActivityTimer:
    """Context manager to time activities and auto-log"""
    
    def __init__(self, user_id: str, service_type: str, action: str,
                 details: Dict = None, request_data: Dict = None):
        self.user_id = user_id
        self.service_type = service_type
        self.action = action
        self.details = details or {}
        self.request_data = request_data or {}
        self.start_time = None
        self.response_data = {}
    
    def __enter__(self):
        self.start_time = time.time()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        duration_ms = (time.time() - self.start_time) * 1000
        
        # If exception occurred, mark as failed
        if exc_type is not None:
            self.response_data['success'] = False
            self.response_data['error'] = str(exc_val)
        else:
            self.response_data['success'] = True
        
        # Log activity
        logger = get_activity_logger()
        logger.log(
            user_id=self.user_id,
            service_type=self.service_type,
            action=self.action,
            details=self.details,
            request_data=self.request_data,
            response_data=self.response_data,
            metadata={'duration_ms': duration_ms}
        )
    
    def set_response_data(self, data: Dict):
        """Set response data before exiting context"""
        self.response_data.update(data)
