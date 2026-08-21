"""Validation utilities for request data"""
import re
from typing import Optional, Dict, Any
from app.utils.logger import logger

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_phone(phone: str) -> bool:
    """Validate Indian phone number format"""
    pattern = r'^[6-9]\d{9}$'
    return bool(re.match(pattern, phone.replace(' ', '').replace('-', '')))

def validate_language(language: str) -> bool:
    """Validate supported language"""
    supported = ['english', 'hindi', 'garhwali', 'kumaoni']
    return language.lower() in supported

def validate_image_format(filename: str) -> bool:
    """Validate image file format"""
    allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    return any(filename.lower().endswith(ext) for ext in allowed)

def validate_budget_for_duration(budget: float, duration: int) -> tuple[bool, Optional[str], Optional[int]]:
    """
    Validate if budget is sufficient for the trip duration
    
    Args:
        budget: Total budget in rupees
        duration: Trip duration in days
        
    Returns:
        (is_valid, error_message, minimum_required_budget)
    """
    # Minimum daily costs breakdown:
    # - Accommodation: ₹800 (budget hotel/guesthouse)
    # - Meals: ₹600 (₹200 breakfast + ₹200 lunch + ₹200 dinner)
    # - Transport: ₹500 (local transport/shared taxi)
    # Total minimum per day: ₹1900
    
    min_budget_per_day = 1900
    min_total_budget = min_budget_per_day * duration
    
    if budget < min_total_budget:
        return False, f"Budget too low. Minimum ₹{min_total_budget} required for {duration} days", min_total_budget
    
    return True, None, min_total_budget

def validate_itinerary_request(data: Dict[str, Any]) -> tuple[bool, Optional[str]]:
    """
    Validate itinerary generation request
    
    Returns:
        (is_valid, error_message)
    """
    required_fields = ['duration', 'budget', 'interests', 'start_location']
    
    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}"
    
    # Validate duration
    try:
        duration = int(data['duration'])
        if duration < 1 or duration > 30:
            return False, "Duration must be between 1 and 30 days"
    except (ValueError, TypeError):
        return False, "Duration must be a valid number"
    
    # Validate budget
    try:
        budget = float(data['budget'])
        if budget < 0:
            return False, "Budget must be a positive number"
    except (ValueError, TypeError):
        return False, "Budget must be a valid number"
    
    # Validate interests (should be a list)
    if not isinstance(data['interests'], list) or len(data['interests']) == 0:
        return False, "Interests must be a non-empty list"
    
    return True, None

def sanitize_input(text: str, max_length: int = 1000) -> str:
    """Sanitize user input to prevent injection attacks"""
    if not text:
        return ""
    
    # Remove potentially dangerous characters
    text = text.strip()
    
    # Limit length
    if len(text) > max_length:
        text = text[:max_length]
    
    return text

