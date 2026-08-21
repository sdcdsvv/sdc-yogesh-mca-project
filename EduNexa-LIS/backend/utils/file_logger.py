"""
File operation logging utilities.

Implements Requirement 6.8: Log all file upload and access operations
with user ID, file path, and timestamp.
"""

import logging
from datetime import datetime
from flask import current_app
import traceback


def log_file_upload(user_id, file_path, file_size, file_type, operation_type='upload'):
    """
    Log a file upload operation.
    
    Args:
        user_id: ID of the user performing the upload
        file_path: Path where the file was stored
        file_size: Size of the file in bytes
        file_type: Type of file (thumbnail, video, document)
        operation_type: Type of operation (default: 'upload')
    """
    try:
        current_app.logger.info(
            f"File {operation_type}: {file_type}",
            extra={
                'user_id': user_id,
                'operation': f'{file_type}_{operation_type}',
                'file_path': file_path,
                'file_size': file_size,
                'timestamp': datetime.utcnow().isoformat()
            }
        )
    except Exception as e:
        # Fallback logging if structured logging fails
        current_app.logger.error(f"Failed to log file upload: {str(e)}")


def log_file_access(user_id, file_path, file_type, operation_type='access'):
    """
    Log a file access operation.
    
    Args:
        user_id: ID of the user accessing the file
        file_path: Path of the file being accessed
        file_type: Type of file (thumbnail, video, document)
        operation_type: Type of operation (default: 'access')
    """
    try:
        current_app.logger.info(
            f"File {operation_type}: {file_type}",
            extra={
                'user_id': user_id,
                'operation': f'{file_type}_{operation_type}',
                'file_path': file_path,
                'timestamp': datetime.utcnow().isoformat()
            }
        )
    except Exception as e:
        # Fallback logging if structured logging fails
        current_app.logger.error(f"Failed to log file access: {str(e)}")


def log_file_error(user_id, file_path, error_message, file_type, operation_type='error'):
    """
    Log a file operation error with full stack trace.
    
    Args:
        user_id: ID of the user who encountered the error
        file_path: Path of the file involved in the error
        error_message: Error message or exception
        file_type: Type of file (thumbnail, video, document)
        operation_type: Type of operation that failed
    """
    try:
        # Get full stack trace
        stack_trace = traceback.format_exc()
        
        current_app.logger.error(
            f"File operation error: {file_type} - {error_message}\nStack trace:\n{stack_trace}",
            extra={
                'user_id': user_id,
                'operation': f'{file_type}_{operation_type}',
                'file_path': file_path,
                'timestamp': datetime.utcnow().isoformat()
            }
        )
    except Exception as e:
        # Fallback logging if structured logging fails
        current_app.logger.error(f"Failed to log file error: {str(e)}")


def log_file_deletion(user_id, file_path, file_type):
    """
    Log a file deletion operation.
    
    Args:
        user_id: ID of the user performing the deletion
        file_path: Path of the file being deleted
        file_type: Type of file (thumbnail, video, document)
    """
    try:
        current_app.logger.info(
            f"File deletion: {file_type}",
            extra={
                'user_id': user_id,
                'operation': f'{file_type}_deletion',
                'file_path': file_path,
                'timestamp': datetime.utcnow().isoformat()
            }
        )
    except Exception as e:
        # Fallback logging if structured logging fails
        current_app.logger.error(f"Failed to log file deletion: {str(e)}")


def log_file_validation_failure(user_id, filename, reason, file_type):
    """
    Log a file validation failure.
    
    Args:
        user_id: ID of the user who attempted the upload
        filename: Name of the file that failed validation
        reason: Reason for validation failure
        file_type: Type of file (thumbnail, video, document)
    """
    try:
        current_app.logger.warning(
            f"File validation failed: {file_type} - {reason}",
            extra={
                'user_id': user_id,
                'operation': f'{file_type}_validation_failure',
                'file_path': filename,
                'timestamp': datetime.utcnow().isoformat()
            }
        )
    except Exception as e:
        # Fallback logging if structured logging fails
        current_app.logger.error(f"Failed to log validation failure: {str(e)}")
