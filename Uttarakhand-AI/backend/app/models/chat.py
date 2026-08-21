"""
Chat Model for MongoDB
Handles chat message storage and retrieval
"""
from datetime import datetime
from typing import List, Dict, Any, Optional
from bson import ObjectId


class Chat:
    """Chat model for storing conversation history"""
    
    def __init__(self, db):
        self.collection = db.chats
        self._ensure_indexes()
    
    def _ensure_indexes(self):
        """Create indexes for efficient queries"""
        # Compound index for user_id and timestamp
        self.collection.create_index([("user_id", 1), ("timestamp", -1)])
        # Index on session_id for grouping conversations
        self.collection.create_index("session_id")
        # Index on feedback for analytics
        self.collection.create_index("feedback.rating")
    
    def create_message(self, user_id: str, session_id: str, role: str, 
                      content: str, metadata: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Create a new chat message
        
        Args:
            user_id: User ID
            session_id: Session/conversation ID
            role: 'user' or 'assistant'
            content: Message content
            metadata: Additional metadata (language, query_type, etc.)
        """
        message_data = {
            "user_id": user_id,
            "session_id": session_id,
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow(),
            "metadata": metadata or {},
            "feedback": {
                "rating": None,  # 1 for like, -1 for dislike, None for no feedback
                "comment": None,
                "timestamp": None
            },
            "tokens_used": metadata.get('tokens_used', 0) if metadata else 0,
            "response_time": metadata.get('response_time', 0) if metadata else 0,
            "reinforcement_weight": 1.0  # Increased when liked, used for response prioritization
        }
        
        result = self.collection.insert_one(message_data)
        message_data['_id'] = result.inserted_id
        return message_data
    
    def get_user_chats(self, user_id: str, limit: int = 50, skip: int = 0,
                      session_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get user's chat history with pagination
        
        Args:
            user_id: User ID
            limit: Number of messages to return
            skip: Number of messages to skip
            session_id: Optional session ID to filter by
        """
        query = {"user_id": user_id}
        if session_id:
            query["session_id"] = session_id
        
        chats = list(
            self.collection.find(query)
            .sort("timestamp", -1)
            .skip(skip)
            .limit(limit)
        )
        
        return chats
    
    def get_session_chats(self, user_id: str, session_id: str) -> List[Dict[str, Any]]:
        """Get all messages from a specific session"""
        chats = list(
            self.collection.find({
                "user_id": user_id,
                "session_id": session_id
            })
            .sort("timestamp", 1)
        )
        return chats
    
    def get_user_sessions(self, user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Get list of user's chat sessions with summary"""
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$sort": {"timestamp": -1}},
            {
                "$group": {
                    "_id": "$session_id",
                    "last_message": {"$first": "$content"},
                    "last_timestamp": {"$first": "$timestamp"},
                    "message_count": {"$sum": 1},
                    "first_message": {"$last": "$content"}
                }
            },
            {"$sort": {"last_timestamp": -1}},
            {"$limit": limit}
        ]
        
        sessions = list(self.collection.aggregate(pipeline))
        return sessions
    
    def add_feedback(self, message_id: str, user_id: str, rating: int, 
                    comment: Optional[str] = None) -> bool:
        """
        Add feedback to a message and update reinforcement weight
        
        Args:
            message_id: Message ID
            user_id: User ID (for verification)
            rating: 1 for like, -1 for dislike
            comment: Optional feedback comment
            
        Reinforcement Learning:
            - When liked (rating=1): weight *= 1.2 (boost for future similarity matching)
            - When disliked (rating=-1): weight *= 0.8 (reduce priority)
        """
        try:
            # Calculate new reinforcement weight
            weight_multiplier = 1.2 if rating == 1 else 0.8
            
            result = self.collection.update_one(
                {
                    "_id": ObjectId(message_id),
                    "user_id": user_id,
                    "role": "assistant"  # Only assistant messages can be rated
                },
                {
                    "$set": {
                        "feedback.rating": rating,
                        "feedback.comment": comment,
                        "feedback.timestamp": datetime.utcnow()
                    },
                    "$mul": {
                        "reinforcement_weight": weight_multiplier
                    }
                }
            )
            return result.modified_count > 0
        except:
            return False
    
    def get_feedback_stats(self, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Get feedback statistics"""
        match_stage = {"role": "assistant"}
        if user_id:
            match_stage["user_id"] = user_id
        
        pipeline = [
            {"$match": match_stage},
            {
                "$group": {
                    "_id": None,
                    "total": {"$sum": 1},
                    "liked": {
                        "$sum": {
                            "$cond": [{"$eq": ["$feedback.rating", 1]}, 1, 0]
                        }
                    },
                    "disliked": {
                        "$sum": {
                            "$cond": [{"$eq": ["$feedback.rating", -1]}, 1, 0]
                        }
                    },
                    "no_feedback": {
                        "$sum": {
                            "$cond": [{"$eq": ["$feedback.rating", None]}, 1, 0]
                        }
                    }
                }
            }
        ]
        
        result = list(self.collection.aggregate(pipeline))
        if result:
            return result[0]
        return {"total": 0, "liked": 0, "disliked": 0, "no_feedback": 0}
    
    def get_similar_liked_responses(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Get similar responses that were liked by users
        Used for reinforcement learning
        """
        # Simple text search - can be enhanced with embeddings
        liked_responses = list(
            self.collection.find({
                "role": "assistant",
                "feedback.rating": 1,
                "$text": {"$search": query}
            })
            .sort("feedback.timestamp", -1)
            .limit(limit)
        )
        return liked_responses
    
    def delete_message(self, message_id: str, user_id: str) -> bool:
        """Delete a specific message"""
        try:
            result = self.collection.delete_one({
                "_id": ObjectId(message_id),
                "user_id": user_id
            })
            return result.deleted_count > 0
        except:
            return False
    
    def delete_session(self, session_id: str, user_id: str) -> int:
        """Delete all messages in a session"""
        try:
            result = self.collection.delete_many({
                "session_id": session_id,
                "user_id": user_id
            })
            return result.deleted_count
        except:
            return 0
    
    def delete_user_chats(self, user_id: str) -> int:
        """Delete all chats for a user"""
        try:
            result = self.collection.delete_many({"user_id": user_id})
            return result.deleted_count
        except:
            return 0
    
    def get_chat_analytics(self, user_id: str) -> Dict[str, Any]:
        """Get analytics for user's chat history"""
        pipeline = [
            {"$match": {"user_id": user_id}},
            {
                "$group": {
                    "_id": None,
                    "total_messages": {"$sum": 1},
                    "total_sessions": {"$addToSet": "$session_id"},
                    "avg_response_time": {"$avg": "$response_time"},
                    "total_tokens": {"$sum": "$tokens_used"},
                    "messages_by_role": {
                        "$push": "$role"
                    }
                }
            }
        ]
        
        result = list(self.collection.aggregate(pipeline))
        if result:
            data = result[0]
            data['total_sessions'] = len(data['total_sessions'])
            # Count messages by role
            user_messages = data['messages_by_role'].count('user')
            assistant_messages = data['messages_by_role'].count('assistant')
            data['user_messages'] = user_messages
            data['assistant_messages'] = assistant_messages
            del data['messages_by_role']
            return data
        
        return {
            "total_messages": 0,
            "total_sessions": 0,
            "avg_response_time": 0,
            "total_tokens": 0,
            "user_messages": 0,
            "assistant_messages": 0
        }
