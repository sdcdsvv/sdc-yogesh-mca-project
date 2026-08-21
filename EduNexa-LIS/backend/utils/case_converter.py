"""
Utility functions for converting between snake_case and camelCase
Implements Requirement 7.6: API field naming conventions
"""
import re
from typing import Any, Dict, List, Union


def snake_to_camel(snake_str: str) -> str:
    """
    Convert snake_case string to camelCase
    
    Args:
        snake_str: String in snake_case format
        
    Returns:
        String in camelCase format
        
    Examples:
        >>> snake_to_camel('user_id')
        'userId'
        >>> snake_to_camel('created_at')
        'createdAt'
        >>> snake_to_camel('_id')
        'id'
    """
    # Handle special case for MongoDB _id field
    if snake_str == '_id':
        return 'id'
    
    # Handle leading underscore
    if snake_str.startswith('_'):
        snake_str = snake_str[1:]
    
    components = snake_str.split('_')
    # Keep first component lowercase, capitalize the rest
    return components[0] + ''.join(x.title() for x in components[1:])


def camel_to_snake(camel_str: str) -> str:
    """
    Convert camelCase string to snake_case
    
    Args:
        camel_str: String in camelCase format
        
    Returns:
        String in snake_case format
        
    Examples:
        >>> camel_to_snake('userId')
        'user_id'
        >>> camel_to_snake('createdAt')
        'created_at'
        >>> camel_to_snake('id')
        '_id'
    """
    # Handle special case for MongoDB id field
    if camel_str == 'id':
        return '_id'
    
    # Insert underscore before uppercase letters and convert to lowercase
    snake_str = re.sub('([A-Z])', r'_\1', camel_str).lower()
    
    # Remove leading underscore if present
    if snake_str.startswith('_'):
        snake_str = snake_str[1:]
    
    return snake_str


def convert_dict_keys_to_camel(data: Union[Dict, List, Any]) -> Union[Dict, List, Any]:
    """
    Recursively convert all dictionary keys from snake_case to camelCase
    
    Args:
        data: Dictionary, list, or primitive value to convert
        
    Returns:
        Data structure with all keys converted to camelCase
        
    Examples:
        >>> convert_dict_keys_to_camel({'user_id': '123', 'created_at': '2024-01-01'})
        {'userId': '123', 'createdAt': '2024-01-01'}
        >>> convert_dict_keys_to_camel([{'user_id': '1'}, {'user_id': '2'}])
        [{'userId': '1'}, {'userId': '2'}]
    """
    if isinstance(data, dict):
        return {snake_to_camel(key): convert_dict_keys_to_camel(value) 
                for key, value in data.items()}
    elif isinstance(data, list):
        return [convert_dict_keys_to_camel(item) for item in data]
    else:
        return data


def convert_dict_keys_to_snake(data: Union[Dict, List, Any]) -> Union[Dict, List, Any]:
    """
    Recursively convert all dictionary keys from camelCase to snake_case
    
    Args:
        data: Dictionary, list, or primitive value to convert
        
    Returns:
        Data structure with all keys converted to snake_case
        
    Examples:
        >>> convert_dict_keys_to_snake({'userId': '123', 'createdAt': '2024-01-01'})
        {'user_id': '123', 'created_at': '2024-01-01'}
        >>> convert_dict_keys_to_snake([{'userId': '1'}, {'userId': '2'}])
        [{'user_id': '1'}, {'user_id': '2'}]
    """
    if isinstance(data, dict):
        return {camel_to_snake(key): convert_dict_keys_to_snake(value) 
                for key, value in data.items()}
    elif isinstance(data, list):
        return [convert_dict_keys_to_snake(item) for item in data]
    else:
        return data


def is_camel_case(s: str) -> bool:
    """
    Check if a string follows camelCase convention
    
    Args:
        s: String to check
        
    Returns:
        True if string is in camelCase, False otherwise
        
    Examples:
        >>> is_camel_case('userId')
        True
        >>> is_camel_case('user_id')
        False
        >>> is_camel_case('id')
        True
    """
    # Empty string or single character is considered camelCase
    if len(s) <= 1:
        return True
    
    # Should not contain underscores
    if '_' in s:
        return False
    
    # Should start with lowercase letter
    if not s[0].islower():
        return False
    
    return True


def is_snake_case(s: str) -> bool:
    """
    Check if a string follows snake_case convention
    
    Args:
        s: String to check
        
    Returns:
        True if string is in snake_case, False otherwise
        
    Examples:
        >>> is_snake_case('user_id')
        True
        >>> is_snake_case('userId')
        False
        >>> is_snake_case('_id')
        True
    """
    # Empty string or single character is considered snake_case
    if len(s) <= 1:
        return True
    
    # Should be all lowercase with underscores
    if s != s.lower():
        return False
    
    # Should not have consecutive underscores
    if '__' in s:
        return False
    
    return True
