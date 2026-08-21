"""
Validation and sanitization utilities for backend API
"""
import re
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple
import bleach

class ValidationError(Exception):
    """Custom exception for validation errors"""
    def __init__(self, message: str, field: Optional[str] = None):
        self.message = message
        self.field = field
        super().__init__(self.message)

def sanitize_string(value: str, max_length: Optional[int] = None) -> str:
    """
    Sanitize string input to prevent XSS attacks
    """
    if not isinstance(value, str):
        return str(value)
    
    # Remove leading/trailing whitespace
    value = value.strip()
    
    # Use bleach to clean HTML/script tags
    value = bleach.clean(value, tags=[], strip=True)
    
    # Limit length if specified
    if max_length and len(value) > max_length:
        value = value[:max_length]
    
    return value

def validate_required(value: Any, field_name: str) -> None:
    """
    Validate that a field is not empty
    """
    if value is None or (isinstance(value, str) and not value.strip()):
        raise ValidationError(f'{field_name} is required', field_name)

def validate_string_length(value: str, field_name: str, min_length: Optional[int] = None, max_length: Optional[int] = None) -> None:
    """
    Validate string length
    """
    if not isinstance(value, str):
        raise ValidationError(f'{field_name} must be a string', field_name)
    
    length = len(value.strip())
    
    if min_length and length < min_length:
        raise ValidationError(f'{field_name} must be at least {min_length} characters', field_name)
    
    if max_length and length > max_length:
        raise ValidationError(f'{field_name} must not exceed {max_length} characters', field_name)

def validate_number_range(value: Any, field_name: str, min_value: Optional[float] = None, max_value: Optional[float] = None) -> None:
    """
    Validate number is within range
    """
    try:
        num_value = float(value)
    except (ValueError, TypeError):
        raise ValidationError(f'{field_name} must be a valid number', field_name)
    
    if min_value is not None and num_value < min_value:
        raise ValidationError(f'{field_name} must be at least {min_value}', field_name)
    
    if max_value is not None and num_value > max_value:
        raise ValidationError(f'{field_name} must not exceed {max_value}', field_name)

def validate_integer(value: Any, field_name: str) -> int:
    """
    Validate and convert to integer
    """
    try:
        int_value = int(value)
        if float(value) != int_value:
            raise ValidationError(f'{field_name} must be a whole number', field_name)
        return int_value
    except (ValueError, TypeError):
        raise ValidationError(f'{field_name} must be a valid integer', field_name)

def validate_email(email: str, field_name: str = 'email') -> None:
    """
    Validate email format
    """
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_regex, email):
        raise ValidationError(f'{field_name} format is invalid', field_name)

def validate_date(date_str: str, field_name: str, future_only: bool = False) -> datetime:
    """
    Validate and parse date string
    """
    try:
        date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
    except (ValueError, AttributeError):
        raise ValidationError(f'{field_name} format is invalid', field_name)
    
    if future_only and date_obj <= datetime.utcnow():
        raise ValidationError(f'{field_name} must be in the future', field_name)
    
    return date_obj

def validate_choice(value: Any, field_name: str, choices: List[Any]) -> None:
    """
    Validate value is in allowed choices
    """
    if value not in choices:
        raise ValidationError(f'{field_name} must be one of: {", ".join(map(str, choices))}', field_name)

def validate_file_type(filename: str, allowed_extensions: List[str], field_name: str = 'file') -> None:
    """
    Validate file extension
    """
    if '.' not in filename:
        raise ValidationError(f'{field_name} must have a valid extension', field_name)
    
    extension = filename.rsplit('.', 1)[1].lower()
    if extension not in allowed_extensions:
        raise ValidationError(f'{field_name} type not allowed. Allowed types: {", ".join(allowed_extensions)}', field_name)

def validate_file_size(file_size: int, max_size_mb: int, field_name: str = 'file') -> None:
    """
    Validate file size
    """
    max_size_bytes = max_size_mb * 1024 * 1024
    if file_size > max_size_bytes:
        raise ValidationError(f'{field_name} size must not exceed {max_size_mb}MB', field_name)

def validate_file_path(file_path: str, field_name: str = 'file_path') -> None:
    """
    Validate file path to prevent directory traversal attacks
    Requirement 6.7: Validate all file paths to prevent directory traversal attacks
    """
    if not file_path:
        raise ValidationError(f'{field_name} cannot be empty', field_name)
    
    # Check for directory traversal patterns
    if '..' in file_path:
        raise ValidationError(f'{field_name} contains invalid directory traversal pattern', field_name)
    
    # Check for absolute paths (should be relative)
    if file_path.startswith('/') or file_path.startswith('\\'):
        raise ValidationError(f'{field_name} cannot be an absolute path', field_name)
    
    # Check for Windows drive letters
    if len(file_path) >= 2 and file_path[1] == ':':
        raise ValidationError(f'{field_name} cannot contain drive letters', field_name)
    
    # Check for null bytes
    if '\x00' in file_path:
        raise ValidationError(f'{field_name} contains invalid characters', field_name)

def validate_course_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate and sanitize course creation/update data
    """
    validated = {}
    
    # Title validation
    if 'title' in data:
        validate_required(data['title'], 'title')
        validate_string_length(data['title'], 'title', min_length=5, max_length=200)
        validated['title'] = sanitize_string(data['title'], max_length=200)
    
    # Description validation
    if 'description' in data:
        validate_required(data['description'], 'description')
        validate_string_length(data['description'], 'description', min_length=20, max_length=2000)
        validated['description'] = sanitize_string(data['description'], max_length=2000)
    
    # Category validation
    if 'category' in data:
        validate_required(data['category'], 'category')
        validated['category'] = sanitize_string(data['category'], max_length=100)
    
    # Difficulty validation
    if 'difficulty' in data:
        validate_choice(data['difficulty'], 'difficulty', ['Beginner', 'Intermediate', 'Advanced'])
        validated['difficulty'] = data['difficulty']
    
    # Duration validation
    if 'duration' in data:
        validate_string_length(data['duration'], 'duration', max_length=100)
        validated['duration'] = sanitize_string(data['duration'], max_length=100)
    
    # Max students validation
    if 'max_students' in data:
        max_students = validate_integer(data['max_students'], 'max_students')
        validate_number_range(max_students, 'max_students', min_value=0, max_value=10000)
        validated['max_students'] = max_students
    
    # Prerequisites validation
    if 'prerequisites' in data:
        if not isinstance(data['prerequisites'], list):
            raise ValidationError('prerequisites must be a list', 'prerequisites')
        validated['prerequisites'] = [sanitize_string(p, max_length=200) for p in data['prerequisites'] if p]
    
    # Learning objectives validation
    if 'learning_objectives' in data:
        if not isinstance(data['learning_objectives'], list):
            raise ValidationError('learning_objectives must be a list', 'learning_objectives')
        validated['learning_objectives'] = [sanitize_string(obj, max_length=500) for obj in data['learning_objectives'] if obj]
    
    # Boolean fields
    if 'is_public' in data:
        validated['is_public'] = bool(data['is_public'])
    
    if 'is_active' in data:
        validated['is_active'] = bool(data['is_active'])
    
    # Thumbnail validation
    if 'thumbnail' in data:
        validated['thumbnail'] = sanitize_string(data['thumbnail'], max_length=500)
    
    return validated

def validate_assignment_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate and sanitize assignment creation/update data
    """
    validated = {}
    
    # Title validation
    if 'title' in data:
        validate_required(data['title'], 'title')
        validate_string_length(data['title'], 'title', min_length=3, max_length=200)
        validated['title'] = sanitize_string(data['title'], max_length=200)
    
    # Description validation
    if 'description' in data:
        validate_required(data['description'], 'description')
        validate_string_length(data['description'], 'description', min_length=10, max_length=1000)
        validated['description'] = sanitize_string(data['description'], max_length=1000)
    
    # Instructions validation
    if 'instructions' in data:
        validate_string_length(data['instructions'], 'instructions', max_length=5000)
        validated['instructions'] = sanitize_string(data['instructions'], max_length=5000)
    
    # Course ID validation
    if 'course_id' in data:
        validate_required(data['course_id'], 'course_id')
        validated['course_id'] = str(data['course_id'])
    
    # Due date validation
    if 'due_date' in data:
        validate_required(data['due_date'], 'due_date')
        validated['due_date'] = validate_date(data['due_date'], 'due_date', future_only=True)
    
    # Max points validation
    if 'max_points' in data:
        max_points = validate_integer(data['max_points'], 'max_points')
        validate_number_range(max_points, 'max_points', min_value=1, max_value=1000)
        validated['max_points'] = max_points
    
    # Submission type validation
    if 'submission_type' in data:
        validate_choice(data['submission_type'], 'submission_type', ['file', 'text', 'both'])
        validated['submission_type'] = data['submission_type']
    
    # Allowed file types validation
    if 'allowed_file_types' in data:
        if not isinstance(data['allowed_file_types'], list):
            raise ValidationError('allowed_file_types must be a list', 'allowed_file_types')
        validated['allowed_file_types'] = [sanitize_string(ft, max_length=20) for ft in data['allowed_file_types']]
    
    # Max file size validation
    if 'max_file_size' in data:
        max_file_size = validate_integer(data['max_file_size'], 'max_file_size')
        validate_number_range(max_file_size, 'max_file_size', min_value=1, max_value=100)
        validated['max_file_size'] = max_file_size
    
    # Boolean fields
    if 'is_active' in data:
        validated['is_active'] = bool(data['is_active'])
    
    return validated

def validate_grade_data(data: Dict[str, Any], max_points: float) -> Dict[str, Any]:
    """
    Validate and sanitize grading data
    """
    validated = {}
    
    # Grade validation
    if 'grade' in data:
        validate_required(data['grade'], 'grade')
        try:
            grade = float(data['grade'])
        except (ValueError, TypeError):
            raise ValidationError('grade must be a valid number', 'grade')
        
        validate_number_range(grade, 'grade', min_value=0, max_value=max_points)
        validated['grade'] = grade
    
    # Feedback validation
    if 'feedback' in data:
        validate_string_length(data['feedback'], 'feedback', max_length=2000)
        validated['feedback'] = sanitize_string(data['feedback'], max_length=2000)
    
    return validated

def validate_material_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate and sanitize material data
    """
    validated = {}
    
    # Title validation
    if 'title' in data:
        validate_required(data['title'], 'title')
        validate_string_length(data['title'], 'title', min_length=3, max_length=200)
        validated['title'] = sanitize_string(data['title'], max_length=200)
    
    # Description validation
    if 'description' in data:
        validate_string_length(data['description'], 'description', max_length=1000)
        validated['description'] = sanitize_string(data['description'], max_length=1000)
    
    # Type validation
    if 'type' in data:
        validate_choice(data['type'], 'type', ['video', 'document', 'pdf', 'link', 'assignment'])
        validated['type'] = data['type']
    
    # Content validation
    if 'content' in data:
        validate_required(data['content'], 'content')
        validated['content'] = sanitize_string(data['content'], max_length=1000)
    
    # Order validation
    if 'order' in data:
        order = validate_integer(data['order'], 'order')
        validate_number_range(order, 'order', min_value=0)
        validated['order'] = order
    
    # Boolean fields
    if 'is_required' in data:
        validated['is_required'] = bool(data['is_required'])
    
    return validated
