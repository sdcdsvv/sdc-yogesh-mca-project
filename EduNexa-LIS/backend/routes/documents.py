from flask import Blueprint, request, jsonify, current_app, Response
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from bson import ObjectId
from datetime import datetime
import os
import uuid
from utils.validation import validate_file_path, ValidationError
from utils.file_logger import (
    log_file_upload,
    log_file_access,
    log_file_error,
    log_file_validation_failure
)

documents_bp = Blueprint('documents', __name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads', 'documents')
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'pptx', 'txt'}
MAX_FILE_SIZE = 50 * 1024 * 1024

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def require_teacher(f):
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        db = current_app.db
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        if user.get('role') != 'teacher':
            return jsonify({'error': 'Only teachers can upload documents'}), 403
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

@documents_bp.route('/upload', methods=['POST'])
@require_teacher
def upload_document():
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        if 'document' not in request.files:
            return jsonify({'error': 'No document file provided'}), 400
        
        file = request.files['document']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            # Requirement 6.8: Log validation failure
            log_file_validation_failure(
                user_id=user_id,
                filename=file.filename,
                reason=f'Invalid file type. Allowed: {", ".join(ALLOWED_EXTENSIONS)}',
                file_type='document'
            )
            return jsonify({'error': f'Invalid file type. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'}), 400
        
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            # Requirement 6.8: Log validation failure
            log_file_validation_failure(
                user_id=user_id,
                filename=file.filename,
                reason=f'File size {file_size} bytes exceeds 50MB limit',
                file_type='document'
            )
            return jsonify({'error': f'File size exceeds maximum allowed size of 50MB'}), 413
        
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        file.save(file_path)
        
        mime_types = {
            'pdf': 'application/pdf',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'txt': 'text/plain'
        }
        mime_type = mime_types.get(file_extension, 'application/octet-stream')
        
        document_doc = {
            'filename': unique_filename,
            'original_filename': secure_filename(file.filename),
            'file_path': file_path,
            'file_size': file_size,
            'mime_type': mime_type,
            'uploaded_by': user_id,
            'created_at': datetime.utcnow()
        }
        
        result = db.documents.insert_one(document_doc)
        document_id = str(result.inserted_id)
        
        # Requirement 6.8: Log file upload operation with user ID, file path, and timestamp
        log_file_upload(
            user_id=user_id,
            file_path=file_path,
            file_size=file_size,
            file_type='document',
            operation_type='upload'
        )
        
        return jsonify({
            'message': 'Document uploaded successfully',
            'documentId': document_id,
            'document_id': document_id,
            'filename': unique_filename,
            'originalFilename': secure_filename(file.filename),
            'original_filename': secure_filename(file.filename),
            'fileSize': file_size,
            'file_size': file_size,
            'mimeType': mime_type,
            'mime_type': mime_type,
            'documentUrl': f'/api/documents/{document_id}',
            'document_url': f'/api/documents/{document_id}'
        }), 201
        
    except Exception as e:
        # Requirement 6.8: Log errors with full stack traces
        log_file_error(
            user_id=user_id if 'user_id' in locals() else 'unknown',
            file_path=file.filename if 'file' in locals() and file else 'unknown',
            error_message=str(e),
            file_type='document',
            operation_type='upload'
        )
        current_app.logger.error(f"Error uploading document: {str(e)}")
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/<document_id>', methods=['GET'])
@jwt_required()
def serve_document(document_id):
    """
    Serve document file with proper MIME type and Content-Disposition headers.
    Implements user authorization check (enrollment verification).
    """
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get document from database
        try:
            document = db.documents.find_one({'_id': ObjectId(document_id)})
        except:
            return jsonify({'error': 'Invalid document ID'}), 400
        
        if not document:
            return jsonify({'error': 'Document not found'}), 404
        
        # Get user to check role
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Find which course this document belongs to
        # Documents are linked to materials, materials are linked to courses
        material = db.materials.find_one({'content': document_id, 'type': 'document'})
        
        if not material:
            # If not found by content field, try finding by document_id in materials
            material = db.materials.find_one({'document_id': document_id})
        
        if not material:
            # Document exists but not linked to any course material
            # Allow teachers and admins to access, deny students
            if user.get('role') not in ['teacher', 'admin']:
                return jsonify({'error': 'Access denied'}), 403
        else:
            # Check if user has access to the course
            course_id = material.get('course_id')
            
            if user.get('role') == 'student':
                # Check enrollment
                enrollment = db.enrollments.find_one({
                    'course_id': course_id,
                    'student_id': user_id
                })
                if not enrollment:
                    return jsonify({'error': 'Access denied. You must be enrolled in this course.'}), 403
            elif user.get('role') == 'teacher':
                # Check if teacher owns the course
                course = db.courses.find_one({'_id': ObjectId(course_id)})
                if course and course.get('teacher_id') != user_id:
                    return jsonify({'error': 'Access denied'}), 403
            # Admins have access to all documents
        
        # Get file path
        file_path = document.get('file_path')
        
        # Requirement 6.4: Return 404 for non-existent files
        if not file_path:
            current_app.logger.error(f"Document {document_id} has no file_path in database")
            return jsonify({'error': 'Document file path not found'}), 404
        
        # Requirement 6.7: Validate file path to prevent directory traversal
        try:
            # Extract just the filename from the full path for validation
            filename = os.path.basename(file_path)
            validate_file_path(filename)
        except ValidationError as e:
            current_app.logger.warning(f"Invalid file path for document {document_id}: {file_path}")
            return jsonify({'error': 'Invalid file path'}), 400
        
        # Requirement 6.5: Handle missing files with clear error
        if not os.path.exists(file_path):
            current_app.logger.error(f"Document file not found on disk: {file_path}")
            return jsonify({'error': 'Document file not found on server'}), 404
        
        # Get filename and MIME type
        filename = document.get('filename')
        original_filename = document.get('original_filename', filename)
        mime_type = document.get('mime_type', 'application/octet-stream')
        
        # Create response with file
        response = Response()
        response.headers['Content-Type'] = mime_type
        response.headers['Content-Disposition'] = f'attachment; filename="{original_filename}"'
        
        # Read and send file
        with open(file_path, 'rb') as f:
            response.data = f.read()
        
        # Requirement 6.8: Log file access operation with user ID, file path, and timestamp
        log_file_access(
            user_id=user_id,
            file_path=file_path,
            file_type='document',
            operation_type='download'
        )
        
        return response
        
    except Exception as e:
        # Requirement 6.8: Log errors with full stack traces
        log_file_error(
            user_id=user_id if 'user_id' in locals() else 'unknown',
            file_path=document_id if 'document_id' in locals() else 'unknown',
            error_message=str(e),
            file_type='document',
            operation_type='download'
        )
        current_app.logger.error(f"Error serving document: {str(e)}")
        return jsonify({'error': str(e)}), 500
