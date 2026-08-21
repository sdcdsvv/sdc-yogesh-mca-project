from flask import Blueprint, request, jsonify, current_app, send_from_directory, Response
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
    log_file_validation_failure,
    log_file_deletion
)
from utils.case_converter import convert_dict_keys_to_camel
from utils.api_response import error_response, success_response

videos_bp = Blueprint('videos', __name__)

# Configuration - Updated to match requirements 3.1, 3.2
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads', 'videos')
ALLOWED_EXTENSIONS = {'mp4', 'webm', 'ogg'}  # Requirement 3.1: MP4, WebM, OGG
MAX_FILE_SIZE = 500 * 1024 * 1024  # Requirement 3.1: 500MB max

# Ensure upload directory exists - Requirement 3.2
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def require_teacher(f):
    """Decorator to ensure only teachers can access the endpoint"""
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        db = current_app.db
        
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user.get('role') != 'teacher':
            return jsonify({'error': 'Only teachers can upload videos'}), 403
        
        return f(*args, **kwargs)
    
    decorated_function.__name__ = f.__name__
    return decorated_function

@videos_bp.route('/upload', methods=['POST'])
@require_teacher
def upload_video():
    """
    Upload a video file (teachers only)
    Implements Requirements 3.1, 3.2, 3.3
    """
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if file is in request
        if 'video' not in request.files:
            return error_response('No video file provided', 400)
        
        file = request.files['video']
        
        if file.filename == '':
            return error_response('No file selected', 400)
        
        # Requirement 3.1: Validate file type (MP4, WebM, OGG)
        if not allowed_file(file.filename):
            # Requirement 6.8: Log validation failure
            log_file_validation_failure(
                user_id=user_id,
                filename=file.filename,
                reason=f'Invalid file type. Allowed: {", ".join(ALLOWED_EXTENSIONS)}',
                file_type='video'
            )
            return error_response(
                f'Invalid file type. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}',
                400
            )
        
        # Requirement 3.1: Validate file size (max 500MB)
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)  # Reset file pointer
        
        if file_size > MAX_FILE_SIZE:
            # Requirement 6.8: Log validation failure
            log_file_validation_failure(
                user_id=user_id,
                filename=file.filename,
                reason=f'File size {file_size} bytes exceeds 500MB limit',
                file_type='video'
            )
            return error_response(
                'File size exceeds maximum allowed size of 500MB',
                413
            )
        
        # Get additional metadata from form data
        title = request.form.get('title', '')
        description = request.form.get('description', '')
        course_id = request.form.get('courseId', '')
        
        # Requirement 3.3: Generate unique filename using UUID and preserve extension
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        
        # Requirement 3.2: Store in backend/uploads/videos/
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        # Save file
        file.save(file_path)
        
        # Determine MIME type based on extension
        mime_types = {
            'mp4': 'video/mp4',
            'webm': 'video/webm',
            'ogg': 'video/ogg'
        }
        mime_type = mime_types.get(file_extension, 'video/mp4')
        
        # Create video document in videos collection (as per design)
        video_doc = {
            'filename': unique_filename,
            'original_filename': secure_filename(file.filename),
            'file_path': file_path,
            'file_size': file_size,
            'mime_type': mime_type,
            'duration': None,  # Optional field for future enhancement
            'uploaded_by': user_id,
            'created_at': datetime.utcnow()
        }
        
        result = db.videos.insert_one(video_doc)
        video_id = str(result.inserted_id)
        
        # Requirement 6.8: Log file upload operation with user ID, file path, and timestamp
        log_file_upload(
            user_id=user_id,
            file_path=file_path,
            file_size=file_size,
            file_type='video',
            operation_type='upload'
        )
        
        # Return video ID and metadata to frontend
        # Using camelCase for API response (Requirement 7.6)
        response_data = {
            'video_id': video_id,
            'filename': unique_filename,
            'original_filename': secure_filename(file.filename),
            'file_size': file_size,
            'mime_type': mime_type,
            'video_url': f'/api/videos/{video_id}/stream'
        }
        return success_response('Video uploaded successfully', response_data, 201)
        
    except Exception as e:
        # Requirement 6.8: Log errors with full stack traces
        log_file_error(
            user_id=user_id if 'user_id' in locals() else 'unknown',
            file_path=file.filename if 'file' in locals() and file else 'unknown',
            error_message=str(e),
            file_type='video',
            operation_type='upload'
        )
        return error_response(str(e), 500)

@videos_bp.route('/<video_id>/stream', methods=['GET'])
@jwt_required(optional=True)
def stream_video(video_id):
    """
    Stream a video file with authorization and HTTP range support
    Implements Requirements 3.6, 3.7, 3.8
    
    - Requirement 3.6: Fetch video via API endpoint
    - Requirement 3.7: Serve with proper MIME type headers
    - Requirement 3.8: Support HTTP range requests for seeking
    """
    try:
        db = current_app.db
        
        # Try to get user_id from JWT, or from query parameter token
        user_id = get_jwt_identity()
        
        if not user_id:
            # Try to get token from query parameter
            token = request.args.get('token')
            if token:
                from flask_jwt_extended import decode_token
                try:
                    decoded = decode_token(token)
                    user_id = decoded['sub']
                except Exception as e:
                    return error_response('Invalid or expired token', 401)
            else:
                return error_response('Authentication required', 401)
        
        # Get video document
        video = db.videos.find_one({'_id': ObjectId(video_id)})
        if not video:
            return error_response('Video not found', 404)
        
        # Requirement 3.6: Implement user authorization check (enrollment verification)
        # Find which course this video belongs to
        material = db.materials.find_one({'content': video_id, 'type': 'video'})
        
        if material:
            course_id = material.get('course_id')
            
            # Get user to check role
            user = db.users.find_one({'_id': ObjectId(user_id)})
            if not user:
                return error_response('User not found', 404)
            
            # Teachers can access their own videos
            course = db.courses.find_one({'_id': ObjectId(course_id)})
            if course and course.get('teacher_id') == user_id:
                pass  # Teacher has access
            # Students must be enrolled
            elif user.get('role') == 'student':
                enrollment = db.enrollments.find_one({
                    'student_id': user_id,
                    'course_id': course_id
                })
                if not enrollment:
                    return error_response('You must be enrolled in this course to access this video', 403)
            # Admins have access
            elif user.get('role') != 'admin':
                return error_response('Unauthorized access', 403)
        
        # Get the file path first
        file_path = video.get('file_path')
        
        # Track view count on video access
        db.videos.update_one(
            {'_id': ObjectId(video_id)},
            {'$inc': {'view_count': 1}}
        )
        
        # Requirement 6.8: Log file access operation with user ID, file path, and timestamp
        log_file_access(
            user_id=user_id,
            file_path=file_path if file_path else video_id,
            file_type='video',
            operation_type='stream'
        )
        
        # Requirement 6.4: Return 404 for non-existent files
        if not file_path:
            current_app.logger.error(f"Video {video_id} has no file_path in database")
            return error_response('Video file path not found', 404)
        
        # Requirement 6.7: Validate file path to prevent directory traversal
        try:
            # Extract just the filename from the full path for validation
            filename = os.path.basename(file_path)
            validate_file_path(filename)
        except ValidationError as e:
            current_app.logger.warning(f"Invalid file path for video {video_id}: {file_path}")
            return error_response('Invalid file path', 400)
        
        # Requirement 6.5: Handle missing files with clear error
        if not os.path.exists(file_path):
            current_app.logger.error(f"Video file not found on disk: {file_path}")
            return error_response('Video file not found on server', 404)
        
        # Get file size for range requests
        file_size = os.path.getsize(file_path)
        
        # Requirement 3.7: Serve video with proper MIME type headers
        mime_type = video.get('mime_type', 'video/mp4')
        
        # Requirement 3.8: Support HTTP range requests for video seeking
        range_header = request.headers.get('Range')
        
        if range_header:
            # Parse range header (format: "bytes=start-end")
            byte_range = range_header.replace('bytes=', '').split('-')
            start = int(byte_range[0]) if byte_range[0] else 0
            end = int(byte_range[1]) if len(byte_range) > 1 and byte_range[1] else file_size - 1
            
            # Ensure valid range
            if start >= file_size or end >= file_size or start > end:
                return error_response('Invalid range', 416)
            
            # Calculate content length
            content_length = end - start + 1
            
            # Read the requested byte range
            with open(file_path, 'rb') as f:
                f.seek(start)
                data = f.read(content_length)
            
            # Return partial content with 206 status
            from flask import Response
            response = Response(
                data,
                206,
                mimetype=mime_type,
                direct_passthrough=True
            )
            response.headers['Content-Range'] = f'bytes {start}-{end}/{file_size}'
            response.headers['Accept-Ranges'] = 'bytes'
            response.headers['Content-Length'] = str(content_length)
            
            return response
        else:
            # No range request, serve entire file
            from flask import Response
            
            def generate():
                with open(file_path, 'rb') as f:
                    while True:
                        chunk = f.read(8192)  # 8KB chunks
                        if not chunk:
                            break
                        yield chunk
            
            response = Response(
                generate(),
                mimetype=mime_type,
                direct_passthrough=True
            )
            response.headers['Content-Length'] = str(file_size)
            response.headers['Accept-Ranges'] = 'bytes'
            
            return response
        
    except Exception as e:
        # Requirement 6.8: Log errors with full stack traces
        log_file_error(
            user_id=user_id if 'user_id' in locals() else 'unknown',
            file_path=video_id,
            error_message=str(e),
            file_type='video',
            operation_type='stream'
        )
        current_app.logger.error(f"Error streaming video {video_id}: {str(e)}")
        return error_response(str(e), 500)

@videos_bp.route('/', methods=['GET'])
@jwt_required()
def get_all_videos():
    """Get all videos or video count (for admin dashboard)"""
    try:
        db = current_app.db
        user_id = get_jwt_identity()
        
        # Get user to check role
        user = db.users.find_one({'_id': ObjectId(user_id)})
        
        # If requesting just count (for dashboard stats)
        if request.args.get('count_only') == 'true':
            total = db.videos.count_documents({})
            return jsonify({'count': total}), 200
        
        # Otherwise return list (same as /list endpoint)
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        
        query = {}
        
        # If student, only show videos uploaded by their teachers
        if user.get('role') == 'student':
            enrollments = list(db.enrollments.find({'student_id': user_id}))
            enrolled_course_ids = [e['course_id'] for e in enrollments]
            courses = list(db.courses.find({'_id': {'$in': [ObjectId(cid) for cid in enrolled_course_ids]}}))
            teacher_ids = [c['teacher_id'] for c in courses]
            query['uploaded_by'] = {'$in': teacher_ids}
        
        total = db.videos.count_documents(query)
        videos = list(db.videos.find(query)
                     .sort('created_at', -1)
                     .skip((page - 1) * limit)
                     .limit(limit))
        
        video_list = []
        for video in videos:
            uploader = db.users.find_one({'_id': ObjectId(video['uploaded_by'])}) if 'uploaded_by' in video else None
            video_list.append({
                '_id': str(video['_id']),
                'filename': video['filename'],
                'original_filename': video.get('original_filename', ''),
                'file_size': video.get('file_size', 0),
                'mime_type': video.get('mime_type', ''),
                'uploaded_by': video.get('uploaded_by', ''),
                'uploader_name': uploader.get('name', 'Unknown') if uploader else 'Unknown',
                'created_at': video['created_at'].isoformat() if 'created_at' in video else None,
                'video_url': f'/api/videos/{str(video["_id"])}/stream'
            })
        
        response_data = {
            'videos': video_list,
            'total': total,
            'page': page,
            'limit': limit,
            'total_pages': (total + limit - 1) // limit
        }
        response_camel = convert_dict_keys_to_camel(response_data)
        return jsonify(response_camel), 200
        
    except Exception as e:
        return error_response(str(e), 500)

@videos_bp.route('/list', methods=['GET'])
@jwt_required()
def list_videos():
    """List all videos (with optional filters)"""
    try:
        db = current_app.db
        user_id = get_jwt_identity()
        
        # Get query parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        
        # Build query
        query = {}
        
        # Get user to check role
        user = db.users.find_one({'_id': ObjectId(user_id)})
        
        # If student, only show videos uploaded by their teachers
        if user.get('role') == 'student':
            # Get enrolled courses
            enrollments = list(db.enrollments.find({'student_id': user_id}))
            enrolled_course_ids = [e['course_id'] for e in enrollments]
            
            # Get teachers of those courses
            courses = list(db.courses.find({'_id': {'$in': [ObjectId(cid) for cid in enrolled_course_ids]}}))
            teacher_ids = [c['teacher_id'] for c in courses]
            
            query['uploaded_by'] = {'$in': teacher_ids}
        
        # Get total count
        total = db.videos.count_documents(query)
        
        # Get videos with pagination
        videos = list(db.videos.find(query)
                     .sort('created_at', -1)
                     .skip((page - 1) * limit)
                     .limit(limit))
        
        # Format response (using snake_case internally)
        video_list = []
        for video in videos:
            uploader = db.users.find_one({'_id': ObjectId(video['uploaded_by'])}) if 'uploaded_by' in video else None
            video_list.append({
                '_id': str(video['_id']),
                'filename': video['filename'],
                'original_filename': video.get('original_filename', ''),
                'file_size': video.get('file_size', 0),
                'mime_type': video.get('mime_type', ''),
                'uploaded_by': video.get('uploaded_by', ''),
                'uploader_name': uploader.get('name', 'Unknown') if uploader else 'Unknown',
                'created_at': video['created_at'].isoformat() if 'created_at' in video else None,
                'video_url': f'/api/videos/{str(video["_id"])}/stream'
            })
        
        # Convert to camelCase for API response (Requirement 7.6)
        response_data = {
            'videos': video_list,
            'total': total,
            'page': page,
            'limit': limit,
            'total_pages': (total + limit - 1) // limit
        }
        response_camel = convert_dict_keys_to_camel(response_data)
        
        return jsonify(response_camel), 200
        
    except Exception as e:
        return error_response(str(e), 500)

@videos_bp.route('/<video_id>', methods=['GET'])
@jwt_required()
def get_video(video_id):
    """Get video details"""
    try:
        db = current_app.db
        
        video = db.videos.find_one({'_id': ObjectId(video_id)})
        if not video:
            return error_response('Video not found', 404)
        
        uploader = db.users.find_one({'_id': ObjectId(video['uploaded_by'])}) if 'uploaded_by' in video else None
        
        video_data = {
            '_id': str(video['_id']),
            'filename': video['filename'],
            'original_filename': video.get('original_filename', ''),
            'file_path': video.get('file_path', ''),
            'file_size': video.get('file_size', 0),
            'mime_type': video.get('mime_type', ''),
            'duration': video.get('duration'),
            'uploaded_by': video.get('uploaded_by', ''),
            'uploader_name': uploader.get('name', 'Unknown') if uploader else 'Unknown',
            'created_at': video['created_at'].isoformat() if 'created_at' in video else None,
            'video_url': f'/api/videos/{video_id}/stream'
        }
        return prepare_api_response(video_data, status_code=200)
        
    except Exception as e:
        return error_response(str(e), 500)

@videos_bp.route('/<video_id>', methods=['DELETE'])
@require_teacher
def delete_video(video_id):
    """Delete a video (teachers only)"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        video = db.videos.find_one({'_id': ObjectId(video_id)})
        if not video:
            return error_response('Video not found', 404)
        
        # Check if user is the uploader
        if video.get('uploaded_by') != user_id:
            return error_response('You can only delete your own videos', 403)
        
        # Delete file from filesystem
        file_path = video.get('file_path')
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
            
            # Requirement 6.8: Log file deletion operation
            log_file_deletion(
                user_id=user_id,
                file_path=file_path,
                file_type='video'
            )
        
        # Delete from database
        db.videos.delete_one({'_id': ObjectId(video_id)})
        
        # Remove references from materials collection
        db.materials.delete_many({'content': video_id, 'type': 'video'})
        
        return success_response('Video deleted successfully', status_code=200)
        
    except Exception as e:
        return error_response(str(e), 500)

@videos_bp.route('/<video_id>', methods=['PUT'])
@require_teacher
def update_video(video_id):
    """Update video metadata (teachers only)"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        data = request.get_json()
        
        video = db.videos.find_one({'_id': ObjectId(video_id)})
        if not video:
            return error_response('Video not found', 404)
        
        # Check if user is the uploader
        if video.get('uploaded_by') != user_id:
            return error_response('You can only update your own videos', 403)
        
        # Update fields
        update_data = {}
        if 'duration' in data:
            update_data['duration'] = data['duration']
        
        if update_data:
            db.videos.update_one(
                {'_id': ObjectId(video_id)},
                {'$set': update_data}
            )
        
        return success_response('Video updated successfully', status_code=200)
        
    except Exception as e:
        return error_response(str(e), 500)

# Video Progress Tracking Endpoints
# Implements Requirement 5.7: Track video watch progress

@videos_bp.route('/<video_id>/progress', methods=['POST'])
@jwt_required()
def update_video_progress(video_id):
    """
    Update video watch progress for a student
    Implements Requirement 5.7: Track watch time, mark completion at >80%
    """
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        data = request.get_json()
        
        # Validate input
        watch_time = data.get('watchTime', data.get('watch_time', 0))
        duration = data.get('duration', 0)
        
        if watch_time < 0:
            return error_response('Watch time cannot be negative', 400)
        
        # Get user to verify they're a student
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return error_response('User not found', 404)
        
        # Get video to verify it exists
        video = db.videos.find_one({'_id': ObjectId(video_id)})
        if not video:
            return error_response('Video not found', 404)
        
        # Find which course this video belongs to
        # Support both local videos (content field) and YouTube videos (material_id directly)
        material = db.materials.find_one({'content': video_id, 'type': 'video'})
        if not material:
            # Try finding by material_id for YouTube videos
            try:
                material = db.materials.find_one({'_id': ObjectId(video_id), 'type': 'video'})
            except:
                pass
        
        if not material:
            return error_response('Video not linked to any course material', 404)
        
        course_id = material.get('course_id')
        
        # Verify student is enrolled in the course
        if user.get('role') == 'student':
            enrollment = db.enrollments.find_one({
                'student_id': user_id,
                'course_id': course_id
            })
            if not enrollment:
                return error_response('Not enrolled in this course', 403)
        
        # Calculate completion status (>80% watched = completed)
        completed = False
        if duration > 0:
            watch_percentage = (watch_time / duration) * 100
            completed = watch_percentage > 80
        
        current_time = datetime.utcnow()
        
        # Update or create video_progress record
        video_progress = db.video_progress.find_one({
            'student_id': user_id,
            'video_id': video_id
        })
        
        if video_progress:
            # Update existing record
            update_data = {
                'watch_time': watch_time,
                'last_watched': current_time,
                'updated_at': current_time
            }
            
            # Only update completed status if it's being set to True
            # (don't allow unmarking as completed)
            if completed and not video_progress.get('completed', False):
                update_data['completed'] = True
            
            db.video_progress.update_one(
                {'_id': video_progress['_id']},
                {'$set': update_data}
            )
        else:
            # Create new record
            video_progress_data = {
                'student_id': user_id,
                'video_id': video_id,
                'course_id': course_id,
                'watch_time': watch_time,
                'last_watched': current_time,
                'completed': completed,
                'created_at': current_time,
                'updated_at': current_time
            }
            db.video_progress.insert_one(video_progress_data)
        
        # Update overall course progress based on video completion
        if completed:
            _update_course_progress(db, user_id, course_id)
        
        progress_data = {
            'watch_time': watch_time,
            'completed': completed
        }
        return success_response('Video progress updated', progress_data, 200)
        
    except Exception as e:
        current_app.logger.error(f"Error updating video progress: {str(e)}")
        return error_response(str(e), 500)

@videos_bp.route('/<video_id>/progress', methods=['GET'])
@jwt_required()
def get_video_progress(video_id):
    """
    Get video watch progress for the current student
    """
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get video progress
        video_progress = db.video_progress.find_one({
            'student_id': user_id,
            'video_id': video_id
        })
        
        if not video_progress:
            default_progress = {
                'video_id': video_id,
                'watch_time': 0,
                'completed': False,
                'last_watched': None
            }
            return prepare_api_response({'progress': default_progress}, status_code=200)
        
        progress_data = {
            'video_id': video_id,
            'watch_time': video_progress.get('watch_time', 0),
            'completed': video_progress.get('completed', False),
            'last_watched': video_progress.get('last_watched').isoformat() if video_progress.get('last_watched') else None
        }
        return prepare_api_response({'progress': progress_data}, status_code=200)
        
    except Exception as e:
        return error_response(str(e), 500)

def _update_course_progress(db, student_id, course_id):
    """
    Helper function to update overall course progress based on completed materials
    Implements Requirement 5.7: Update overall course progress based on video completion
    """
    try:
        # Get all materials for the course
        materials = list(db.materials.find({'course_id': course_id}))
        
        if not materials:
            return
        
        # Count completed materials
        completed_count = 0
        
        for material in materials:
            material_id = str(material['_id'])
            material_type = material.get('type')
            
            if material_type == 'video':
                # Check video_progress for completion
                video_id = material.get('content')
                if video_id:
                    video_progress = db.video_progress.find_one({
                        'student_id': student_id,
                        'video_id': video_id,
                        'completed': True
                    })
                    if video_progress:
                        completed_count += 1
            else:
                # Check if material is in completed_materials list
                progress = db.progress.find_one({
                    'student_id': student_id,
                    'course_id': course_id
                })
                if progress and material_id in progress.get('completed_materials', []):
                    completed_count += 1
        
        # Calculate overall progress percentage
        overall_progress = (completed_count / len(materials)) * 100 if materials else 0
        
        # Update progress record
        db.progress.update_one(
            {
                'student_id': student_id,
                'course_id': course_id
            },
            {
                '$set': {
                    'overall_progress': round(overall_progress, 2),
                    'updated_at': datetime.utcnow()
                }
            },
            upsert=True
        )
        
        # IMPORTANT: Also update enrollment record to keep progress in sync
        db.enrollments.update_one(
            {
                'student_id': student_id,
                'course_id': course_id
            },
            {
                '$set': {
                    'progress': round(overall_progress, 2),
                    'updated_at': datetime.utcnow()
                }
            }
        )
        
    except Exception as e:
        current_app.logger.error(f"Error updating course progress: {str(e)}")
        # Don't raise exception, just log it
