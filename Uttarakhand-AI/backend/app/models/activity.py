"""
User Activity Model for MongoDB
Tracks user's service usage history and activities
"""
from datetime import datetime
from typing import List, Dict, Any, Optional
from bson import ObjectId


class Activity:
    """Activity model for tracking user service usage"""
    
    def __init__(self, db):
        self.collection = db.activities
        self._ensure_indexes()
    
    def _ensure_indexes(self):
        """Create indexes for efficient queries"""
        # Compound index for user_id and timestamp
        self.collection.create_index([("user_id", 1), ("timestamp", -1)])
        # Index on service_type for filtering
        self.collection.create_index("service_type")
        # Index on action for analytics
        self.collection.create_index("action")
        # Compound index for service usage analytics
        self.collection.create_index([("user_id", 1), ("service_type", 1)])
    
    def log_activity(self, user_id: str, service_type: str, action: str,
                    details: Optional[Dict] = None, 
                    request_data: Optional[Dict] = None,
                    response_data: Optional[Dict] = None,
                    metadata: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Log a user activity
        
        Args:
            user_id: User ID
            service_type: Type of service (itinerary, vision, chat, emergency, etc.)
            action: Action performed (generate, analyze, search, etc.)
            details: Brief description or summary of the activity
            request_data: Request parameters (sanitized, no sensitive info)
            response_data: Response summary (sanitized)
            metadata: Additional metadata (IP, user agent, response time, etc.)
        
        Service Types:
            - itinerary: Itinerary generation
            - vision: Image analysis
            - chat: Chat interactions
            - emergency: Emergency services lookup
            - places: Place information queries
            - weather: Weather queries
            - translation: Translation requests
        """
        activity_data = {
            "user_id": user_id,
            "service_type": service_type,
            "action": action,
            "details": details or {},
            "request_data": request_data or {},
            "response_data": response_data or {},
            "metadata": metadata or {},
            "timestamp": datetime.utcnow(),
            "status": "success",  # success, failed, partial
            "duration_ms": metadata.get('duration_ms', 0) if metadata else 0
        }
        
        result = self.collection.insert_one(activity_data)
        activity_data['_id'] = result.inserted_id
        return activity_data
    
    def get_user_activities(self, user_id: str, limit: int = 50, skip: int = 0,
                           service_type: Optional[str] = None,
                           start_date: Optional[datetime] = None,
                           end_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """
        Get user's activity history with pagination and filtering
        
        Args:
            user_id: User ID
            limit: Number of activities to return
            skip: Number of activities to skip
            service_type: Optional filter by service type
            start_date: Optional start date filter
            end_date: Optional end date filter
        """
        query = {"user_id": user_id}
        
        if service_type:
            query["service_type"] = service_type
        
        if start_date or end_date:
            query["timestamp"] = {}
            if start_date:
                query["timestamp"]["$gte"] = start_date
            if end_date:
                query["timestamp"]["$lte"] = end_date
        
        activities = list(
            self.collection.find(query)
            .sort("timestamp", -1)
            .skip(skip)
            .limit(limit)
        )
        
        return activities
    
    def get_service_usage_summary(self, user_id: str, 
                                 days: int = 30) -> Dict[str, Any]:
        """
        Get summary of service usage over a period
        
        Returns count by service type, most used services, etc.
        """
        start_date = datetime.utcnow()
        from datetime import timedelta
        start_date = start_date - timedelta(days=days)
        
        pipeline = [
            {
                "$match": {
                    "user_id": user_id,
                    "timestamp": {"$gte": start_date}
                }
            },
            {
                "$group": {
                    "_id": "$service_type",
                    "count": {"$sum": 1},
                    "last_used": {"$max": "$timestamp"},
                    "avg_duration": {"$avg": "$duration_ms"}
                }
            },
            {"$sort": {"count": -1}}
        ]
        
        services = list(self.collection.aggregate(pipeline))
        
        # Get total count
        total_activities = self.collection.count_documents({
            "user_id": user_id,
            "timestamp": {"$gte": start_date}
        })
        
        return {
            "total_activities": total_activities,
            "period_days": days,
            "services": services,
            "most_used_service": services[0]["_id"] if services else None
        }
    
    def get_activity_timeline(self, user_id: str, 
                             group_by: str = "day",
                             days: int = 30) -> List[Dict[str, Any]]:
        """
        Get activity timeline grouped by day/week/month
        
        Args:
            user_id: User ID
            group_by: day, week, or month
            days: Number of days to look back
        """
        from datetime import timedelta
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Date format based on grouping
        date_format = {
            "day": "%Y-%m-%d",
            "week": "%Y-W%V",
            "month": "%Y-%m"
        }.get(group_by, "%Y-%m-%d")
        
        pipeline = [
            {
                "$match": {
                    "user_id": user_id,
                    "timestamp": {"$gte": start_date}
                }
            },
            {
                "$group": {
                    "_id": {
                        "$dateToString": {
                            "format": date_format,
                            "date": "$timestamp"
                        }
                    },
                    "count": {"$sum": 1},
                    "services": {"$addToSet": "$service_type"}
                }
            },
            {"$sort": {"_id": 1}}
        ]
        
        timeline = list(self.collection.aggregate(pipeline))
        return timeline
    
    def get_recent_activities(self, user_id: str, 
                             limit: int = 10) -> List[Dict[str, Any]]:
        """Get most recent activities for quick view"""
        activities = list(
            self.collection.find({"user_id": user_id})
            .sort("timestamp", -1)
            .limit(limit)
        )
        return activities
    
    def get_service_analytics(self, user_id: str,
                             service_type: str) -> Dict[str, Any]:
        """
        Get detailed analytics for a specific service
        """
        pipeline = [
            {
                "$match": {
                    "user_id": user_id,
                    "service_type": service_type
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total_uses": {"$sum": 1},
                    "unique_actions": {"$addToSet": "$action"},
                    "avg_duration": {"$avg": "$duration_ms"},
                    "first_used": {"$min": "$timestamp"},
                    "last_used": {"$max": "$timestamp"}
                }
            }
        ]
        
        result = list(self.collection.aggregate(pipeline))
        if result:
            data = result[0]
            data['unique_actions'] = list(data['unique_actions'])
            return data
        
        return {
            "total_uses": 0,
            "unique_actions": [],
            "avg_duration": 0,
            "first_used": None,
            "last_used": None
        }
    
    def delete_user_activities(self, user_id: str) -> int:
        """Delete all activities for a user"""
        try:
            result = self.collection.delete_many({"user_id": user_id})
            return result.deleted_count
        except:
            return 0
    
    def get_popular_services(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get most popular services across all users (for admin analytics)"""
        pipeline = [
            {
                "$group": {
                    "_id": "$service_type",
                    "total_uses": {"$sum": 1},
                    "unique_users": {"$addToSet": "$user_id"}
                }
            },
            {
                "$project": {
                    "service_type": "$_id",
                    "total_uses": 1,
                    "unique_users": {"$size": "$unique_users"}
                }
            },
            {"$sort": {"total_uses": -1}},
            {"$limit": limit}
        ]
        
        services = list(self.collection.aggregate(pipeline))
        return services
