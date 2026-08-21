from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime, timedelta
import os
import uuid
from werkzeug.utils import secure_filename
from routes.notifications import create_notification
from utils.validation import (
    validate_course_data,
    validate_material_data,
    validate_file_type,
    validate_file_size,
    validate_file_path,
    ValidationError
)
from utils.file_logger import (
    log_file_upload,
    log_file_access,
    log_file_error,
    log_file_validation_failure
)
from utils.case_converter import convert_dict_keys_to_camel
from utils.api_response import error_response, success_response, prepare_api_response

courses_bp = Blueprint('courses', __name__)

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'ppt', 'pptx', 'mp4', 'avi', 'mov', 'mkv', 'webm', 'jpg', 'jpeg', 'png'}
VIDEO_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv', 'webm'}

# Create uploads directory if it doesn't exist
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
VIDEO_FOLDER = os.path.join(UPLOAD_FOLDER, 'videos')
os.makedirs(VIDEO_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def is_video_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in VIDEO_EXTENSIONS

@courses_bp.route('/', methods=['GET'])
@jwt_required()
def get_courses():
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get user to check role
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return error_response('User not found', 404)
        
        # Build query based on user role
        query = {}
        if user['role'] == 'teacher':
            query['teacher_id'] = user_id
        elif user['role'] == 'student':
            # Get all active courses or enrolled courses
            query = {'is_active': True}
        
        # Get courses
        courses = list(db.courses.find(query))
        
        # Convert ObjectId to string and add teacher info
        for course in courses:
            course['_id'] = str(course['_id'])
            course['course_id'] = str(course['_id'])
            
            # Ensure thumbnail is present
            if 'thumbnail' not in course or not course['thumbnail']:
                course['thumbnail'] = 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400'
            
            # Get teacher info
            teacher = db.users.find_one({'_id': ObjectId(course['teacher_id'])})
            if teacher:
                course['teacher_name'] = teacher['name']
                course['teacher_email'] = teacher['email']
            
            # Get enrollment statistics
            enrollments = list(db.enrollments.find({'course_id': str(course['_id'])}))
            course['enrolled_students'] = len(enrollments)
            
            # Calculate enrollment statistics and student progress data
            if user['role'] == 'teacher' and enrollments:
                # Calculate average progress
                total_progress = sum([e.get('progress', 0) for e in enrollments])
                course['average_progress'] = round(total_progress / len(enrollments), 2) if enrollments else 0
                
                # Calculate active students (students with recent activity)
                seven_days_ago = datetime.utcnow() - timedelta(days=7)
                active_students = 0
                
                # Get assignments for this course
                assignments = list(db.assignments.find({'course_id': str(course['_id'])}))
                assignment_ids = [str(a['_id']) for a in assignments]
                
                if assignment_ids:
                    # Count students with recent submissions
                    recent_submissions = db.submissions.find({
                        'assignment_id': {'$in': assignment_ids},
                        'submitted_at': {'$gte': seven_days_ago}
                    })
                    active_student_ids = set([s['student_id'] for s in recent_submissions])
                    active_students = len(active_student_ids)
                
                course['active_students'] = active_students
                course['engagement_rate'] = round((active_students / len(enrollments)) * 100, 2) if enrollments else 0
                
                # Calculate completion rate
                completed_students = len([e for e in enrollments if e.get('progress', 0) >= 100])
                course['completion_rate'] = round((completed_students / len(enrollments)) * 100, 2) if enrollments else 0
                
                # Get assignment statistics
                course['total_assignments'] = len(assignments)
                
                if assignment_ids:
                    total_submissions = db.submissions.count_documents({'assignment_id': {'$in': assignment_ids}})
                    graded_submissions = db.submissions.count_documents({
                        'assignment_id': {'$in': assignment_ids},
                        'grade': {'$ne': None}
                    })
                    pending_submissions = db.submissions.count_documents({
                        'assignment_id': {'$in': assignment_ids},
                        'grade': None
                    })
                    
                    course['total_submissions'] = total_submissions
                    course['graded_submissions'] = graded_submissions
                    course['pending_submissions'] = pending_submissions
                    
                    # Calculate average grade
                    graded_subs = list(db.submissions.find({
                        'assignment_id': {'$in': assignment_ids},
                        'grade': {'$ne': None}
                    }))
                    if graded_subs:
                        avg_grade = sum([s['grade'] for s in graded_subs]) / len(graded_subs)
                        course['average_grade'] = round(avg_grade, 2)
                    else:
                        course['average_grade'] = 0
                else:
                    course['total_submissions'] = 0
                    course['graded_submissions'] = 0
                    course['pending_submissions'] = 0
                    course['average_grade'] = 0
                
                # Student engagement metrics
                course['student_performance'] = {
                    'excellent': len([e for e in enrollments if e.get('progress', 0) >= 90]),
                    'good': len([e for e in enrollments if 70 <= e.get('progress', 0) < 90]),
                    'average': len([e for e in enrollments if 50 <= e.get('progress', 0) < 70]),
                    'needs_improvement': len([e for e in enrollments if e.get('progress', 0) < 50])
                }
            
            # Check if current user is enrolled (for students)
            if user['role'] == 'student':
                enrollment = db.enrollments.find_one({
                    'course_id': str(course['_id']),
                    'student_id': user_id
                })
                course['is_enrolled'] = enrollment is not None
                if enrollment:
                    course['enrollment_date'] = enrollment['enrolled_at']
                    course['progress'] = enrollment.get('progress', 0)
        
        # Convert to camelCase for API response
        return prepare_api_response({'courses': courses}, status_code=200)
        
    except Exception as e:
        return error_response(str(e), 500)

@courses_bp.route('/<course_id>', methods=['GET'])
@jwt_required()
def get_course(course_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get course
        course = db.courses.find_one({'_id': ObjectId(course_id)})
        if not course:
            return error_response('Course not found', 404)
        
        # Get user to check permissions
        user = db.users.find_one({'_id': ObjectId(user_id)})
        
        # Check if user has access to this course
        if user['role'] == 'student':
            enrollment = db.enrollments.find_one({
                'course_id': course_id,
                'student_id': user_id
            })
            
            # Debug logging for troubleshooting
            current_app.logger.info(f"Student {user_id} accessing course {course_id}")
            current_app.logger.info(f"Enrollment found: {enrollment is not None}")
            
            if not enrollment and not course.get('is_public', False):
                # Log the issue for debugging
                current_app.logger.warning(f"Access denied for student {user_id} to course {course_id} - Not enrolled")
                return error_response('Access denied - You are not enrolled in this course', 403)
        elif user['role'] == 'teacher' and course['teacher_id'] != user_id:
            return error_response('Access denied', 403)
        
        # Convert ObjectId to string
        course['_id'] = str(course['_id'])
        course['course_id'] = str(course['_id'])
        
        # Ensure thumbnail is present
        if 'thumbnail' not in course or not course['thumbnail']:
            course['thumbnail'] = 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400'
        
        # Get teacher info
        teacher = db.users.find_one({'_id': ObjectId(course['teacher_id'])})
        if teacher:
            course['teacher_name'] = teacher['name']
            course['teacher_email'] = teacher['email']
        
        # Get modules sorted by order field (Requirement 5.5)
        modules = list(db.modules.find({'course_id': course_id}).sort('order', 1))
        for module in modules:
            module['_id'] = str(module['_id'])
            module_id = module['_id']
            
            # Get materials for this module sorted by order field (Requirement 5.6)
            module_materials = list(db.materials.find({'module_id': module_id}).sort('order', 1))
            for material in module_materials:
                material['_id'] = str(material['_id'])
            module['materials'] = module_materials
        
        course['modules'] = modules
        
        # Also get all materials for backward compatibility
        materials = list(db.materials.find({'course_id': course_id}).sort('order', 1))
        for material in materials:
            material['_id'] = str(material['_id'])
        course['materials'] = materials
        
        # Get assignments
        assignments = list(db.assignments.find({'course_id': course_id}))
        for assignment in assignments:
            assignment['_id'] = str(assignment['_id'])
        course['assignments'] = assignments
        


        
        # Convert to camelCase for API response
        return prepare_api_response({'course': course}, status_code=200)
        
    except Exception as e:
        return error_response(str(e), 500)

@courses_bp.route('/', methods=['POST'])
@jwt_required()
def create_course():
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is teacher or admin
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] not in ['teacher', 'admin']:
            return error_response('Only teachers and admins can create courses', 403)
        
        data = request.get_json()
        
        # Validate and sanitize course data
        try:
            validated_data = validate_course_data(data)
        except ValidationError as e:
            return jsonify({'error': e.message, 'field': e.field}), 400
        
        # Ensure required fields are present
        required_fields = ['title', 'description', 'category']
        for field in required_fields:
            if field not in validated_data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Create course with validated data
        # Handle thumbnail - use provided thumbnail or default
        thumbnail_url = validated_data.get('thumbnail', '')
        if not thumbnail_url or thumbnail_url.startswith('data:image'):
            # If no thumbnail or base64 provided, use default
            thumbnail_url = 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400'
        
        course_data = {
            **validated_data,
            'teacher_id': user_id,
            'difficulty': validated_data.get('difficulty', 'Beginner'),
            'duration': validated_data.get('duration', ''),
            'prerequisites': validated_data.get('prerequisites', []),
            'learning_objectives': validated_data.get('learning_objectives', []),
            'thumbnail': thumbnail_url,
            'is_active': True,
            'is_public': validated_data.get('is_public', True),
            'max_students': validated_data.get('max_students', 0),  # 0 means unlimited
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = db.courses.insert_one(course_data)
        course_id = str(result.inserted_id)
        
        # Process modules and create materials
        # Requirement 5.2: Store module metadata (title, order, description) to the database
        # Requirement 5.3: Store material metadata (type, filename, file_path, title) to the database
        # Requirement 3.4: Store video_id in content field and set type to 'video'
        modules = data.get('modules', [])
        for module_index, module in enumerate(modules):
            # Create module record with metadata
            module_data = {
                'course_id': course_id,
                'title': module.get('title', f'Module {module_index + 1}'),
                'description': module.get('description', ''),
                'order': module_index + 1,
                'created_at': datetime.utcnow()
            }
            module_result = db.modules.insert_one(module_data)
            module_id = str(module_result.inserted_id)
            
            # Create materials for this module
            for lesson in module.get('lessons', []):
                if (lesson.get('content') or lesson.get('youtube_url')) and lesson.get('title'):
                    # Determine material type based on content or explicit type
                    material_type = lesson.get('type', 'video')
                    
                    # Ensure type is set to 'video' for video materials
                    # Video content will be a video_id (ObjectId string) or YouTube URL
                    if material_type == 'video' or (not lesson.get('type') and (lesson.get('content') or lesson.get('youtube_url'))):
                        material_type = 'video'
                    
                    material_data = {
                        'course_id': course_id,
                        'module_id': module_id,
                        'title': lesson['title'],
                        'description': lesson.get('description', ''),
                        'type': material_type,  # Ensure type is 'video' for video materials
                        'content': lesson.get('content', ''),  # Store video_id in content field (for local videos)
                        'youtube_url': lesson.get('youtube_url', ''),  # Store YouTube URL
                        'order': lesson.get('order', 0),
                        'is_required': lesson.get('is_required', False),
                        'uploaded_by': user_id,
                        'created_at': datetime.utcnow()
                    }
                    db.materials.insert_one(material_data)
        
        # Update teacher's courses_created list
        db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$push': {'courses_created': course_id}}
        )
        
        course_data['_id'] = course_id
        course_data['course_id'] = course_id
        
        return jsonify({
            'message': 'Course created successfully',
            'course': course_data
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/<course_id>', methods=['PUT'])
@jwt_required()
def update_course(course_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get course and check permissions
        course = db.courses.find_one({'_id': ObjectId(course_id)})
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] != 'admin' and course['teacher_id'] != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json()
        
        # Validate and sanitize course data
        try:
            validated_data = validate_course_data(data)
        except ValidationError as e:
            return jsonify({'error': e.message, 'field': e.field}), 400
        
        if not validated_data:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        validated_data['updated_at'] = datetime.utcnow()
        update_data = validated_data
        
        # Update course
        db.courses.update_one(
            {'_id': ObjectId(course_id)},
            {'$set': update_data}
        )
        
        # Get updated course
        updated_course = db.courses.find_one({'_id': ObjectId(course_id)})
        updated_course['_id'] = str(updated_course['_id'])
        
        return jsonify({
            'message': 'Course updated successfully',
            'course': updated_course
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/<course_id>/enroll', methods=['POST'])
@jwt_required()
def enroll_course(course_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is student
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] != 'student':
            return jsonify({'error': 'Only students can enroll in courses'}), 403
        
        # Check if course exists
        course = db.courses.find_one({'_id': ObjectId(course_id)})
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        if not course.get('is_active', True):
            return jsonify({'error': 'Course is not active'}), 400
        
        # Check if already enrolled
        existing_enrollment = db.enrollments.find_one({
            'course_id': course_id,
            'student_id': user_id
        })
        if existing_enrollment:
            return jsonify({'error': 'Already enrolled in this course'}), 409
        
        # Check max students limit
        if course.get('max_students', 0) > 0:
            current_enrollments = db.enrollments.count_documents({'course_id': course_id})
            if current_enrollments >= course['max_students']:
                return jsonify({'error': 'Course is full'}), 400
        
        # Create enrollment
        enrollment_data = {
            'course_id': course_id,
            'student_id': user_id,
            'enrolled_at': datetime.utcnow(),
            'progress': 0,
            'completed_materials': [],
            'completed_assignments': [],

            'is_active': True
        }
        
        db.enrollments.insert_one(enrollment_data)
        
        # Update user's enrolled courses
        db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$push': {'enrolled_courses': course_id}}
        )
        
        # Create notification for student
        try:
            create_notification(
                db=db,
                user_id=user_id,
                title='Course Enrollment Successful',
                message=f'You have successfully enrolled in "{course["title"]}". Start learning now!',
                notification_type='success',
                link=f'/courses/detail?id={course_id}'
            )
        except Exception as notif_error:
            print(f"Failed to create notification: {notif_error}")
        
        return jsonify({'message': 'Successfully enrolled in course'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/<course_id>/unenroll', methods=['POST'])
@jwt_required()
def unenroll_course(course_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if enrolled
        enrollment = db.enrollments.find_one({
            'course_id': course_id,
            'student_id': user_id
        })
        if not enrollment:
            return jsonify({'error': 'Not enrolled in this course'}), 404
        
        # Remove enrollment
        db.enrollments.delete_one({
            'course_id': course_id,
            'student_id': user_id
        })
        
        # Update user's enrolled courses
        db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$pull': {'enrolled_courses': course_id}}
        )
        
        return jsonify({'message': 'Successfully unenrolled from course'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/<course_id>/upload-video', methods=['POST'])
@jwt_required()
def upload_video(course_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check permissions
        course = db.courses.find_one({'_id': ObjectId(course_id)})
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] != 'admin' and course['teacher_id'] != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Check if video file is present
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        video_file = request.files['video']
        if video_file.filename == '':
            return jsonify({'error': 'No video file selected'}), 400
        
        if not is_video_file(video_file.filename):
            return jsonify({'error': 'Invalid video file format'}), 400
        
        # Get form data
        title = request.form.get('title')
        description = request.form.get('description', '')
        order = request.form.get('order', 0)
        duration = request.form.get('duration', '')
        
        if not title:
            return jsonify({'error': 'Video title is required'}), 400
        
        # Save video file
        filename = secure_filename(video_file.filename)
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{course_id}_{timestamp}_{filename}"
        video_path = os.path.join(VIDEO_FOLDER, unique_filename)
        video_file.save(video_path)
        
        # Create video material record
        video_data = {
            'course_id': course_id,
            'title': title,
            'description': description,
            'type': 'video',
            'filename': unique_filename,
            'file_path': video_path,
            'url': f'/api/courses/videos/{unique_filename}',
            'youtube_url': '',  # Empty for local videos
            'duration': duration,
            'order': int(order),
            'is_required': True,
            'uploaded_by': user_id,
            'created_at': datetime.utcnow(),
            'views': 0,
            'completed_by': []
        }
        
        result = db.materials.insert_one(video_data)
        video_data['_id'] = str(result.inserted_id)
        video_data['material_id'] = str(result.inserted_id)
        
        # Notify enrolled students
        enrollments = db.enrollments.find({'course_id': course_id})
        for enrollment in enrollments:
            try:
                create_notification(
                    db=db,
                    user_id=enrollment['student_id'],
                    title='New Video Added',
                    message=f'A new video "{title}" has been added to {course["title"]}',
                    notification_type='info',
                    link=f'/courses/detail?id={course_id}'
                )
            except:
                pass
        
        return jsonify({
            'message': 'Video uploaded successfully',
            'video': video_data
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/videos/<filename>', methods=['GET'])
@jwt_required()
def serve_video(filename):
    """
    Serve video file with authorization check
    Implements Requirements 6.3, 6.4, 6.7
    """
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Requirement 6.7: Validate file path to prevent directory traversal
        try:
            validate_file_path(filename)
        except ValidationError as e:
            current_app.logger.warning(f"Invalid video filename: {filename}")
            return jsonify({'error': 'Invalid file path'}), 400
        
        # Find the video material
        video = db.materials.find_one({'filename': filename, 'type': 'video'})
        
        # Requirement 6.4: Return 404 for non-existent files
        if not video:
            return jsonify({'error': 'Video not found'}), 404
        
        # Check if user has access to this video's course
        course = db.courses.find_one({'_id': ObjectId(video['course_id'])})
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        user = db.users.find_one({'_id': ObjectId(user_id)})
        
        # Check access permissions
        has_access = False
        if user['role'] == 'teacher' and course['teacher_id'] == user_id:
            has_access = True
        elif user['role'] == 'student':
            # Requirement 6.3: Check enrollment before serving materials
            enrollment = db.enrollments.find_one({
                'course_id': video['course_id'],
                'student_id': user_id
            })
            has_access = enrollment is not None
        elif user['role'] == 'admin':
            has_access = True
        
        # Requirement 6.3: Return 403 for unauthorized access
        if not has_access:
            return jsonify({'error': 'Access denied. You must be enrolled in this course.'}), 403
        
        # Check if file exists on disk
        file_path = os.path.join(VIDEO_FOLDER, filename)
        if not os.path.exists(file_path):
            current_app.logger.error(f"Video file not found on disk: {filename}")
            return jsonify({'error': 'Video file not found on server'}), 404
        
        # Increment view count
        db.materials.update_one(
            {'_id': video['_id']},
            {'$inc': {'views': 1}}
        )
        
        # Requirement 6.8: Log file access operation
        current_app.logger.info(f"Video accessed: {filename} by user {user_id}")
        
        return send_from_directory(VIDEO_FOLDER, filename)
        
    except Exception as e:
        current_app.logger.error(f"Error serving video {filename}: {str(e)}")
        return jsonify({'error': 'Failed to serve video'}), 500

@courses_bp.route('/upload-thumbnail', methods=['POST'])
@jwt_required()
def upload_thumbnail():
    """Upload course thumbnail image"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is teacher or admin
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] not in ['teacher', 'admin']:
            return jsonify({'error': 'Only teachers and admins can upload thumbnails'}), 403
        
        # Check if file is present
        if 'thumbnail' not in request.files:
            return jsonify({'error': 'No thumbnail file provided'}), 400
        
        file = request.files['thumbnail']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate file type (JPEG, PNG, GIF, WebP)
        allowed_extensions = {'jpg', 'jpeg', 'png', 'gif', 'webp'}
        if not ('.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
            # Requirement 6.8: Log validation failure
            log_file_validation_failure(
                user_id=user_id,
                filename=file.filename,
                reason=f'Invalid file type. Allowed: {", ".join(allowed_extensions)}',
                file_type='thumbnail'
            )
            return jsonify({
                'error': f'Invalid image file format. Allowed types: {", ".join(allowed_extensions)}'
            }), 400
        
        # Get file extension
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        
        # Validate file size (max 5MB)
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)  # Reset file pointer
        
        max_size_mb = 5
        max_size_bytes = max_size_mb * 1024 * 1024
        if file_size > max_size_bytes:
            # Requirement 6.8: Log validation failure
            log_file_validation_failure(
                user_id=user_id,
                filename=file.filename,
                reason=f'File size {file_size} bytes exceeds {max_size_mb}MB limit',
                file_type='thumbnail'
            )
            return jsonify({
                'error': f'File size exceeds maximum allowed size of {max_size_mb}MB'
            }), 413
        
        # Create thumbnails directory if it doesn't exist
        thumbnails_folder = os.path.join(UPLOAD_FOLDER, 'thumbnails')
        os.makedirs(thumbnails_folder, exist_ok=True)
        
        # Generate unique filename using UUID + timestamp
        unique_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{unique_id}_{timestamp}.{file_extension}"
        file_path = os.path.join(thumbnails_folder, unique_filename)
        
        # Save file
        file.save(file_path)
        
        # Requirement 6.8: Log file upload operation with user ID, file path, and timestamp
        log_file_upload(
            user_id=user_id,
            file_path=file_path,
            file_size=file_size,
            file_type='thumbnail',
            operation_type='upload'
        )
        
        # Return URL path
        thumbnail_url = f'/api/courses/thumbnails/{unique_filename}'
        
        return jsonify({
            'message': 'Thumbnail uploaded successfully',
            'thumbnailUrl': thumbnail_url,
            'filename': unique_filename,
            'size': file_size
        }), 201
        
    except Exception as e:
        # Requirement 6.8: Log errors with full stack traces
        log_file_error(
            user_id=user_id if 'user_id' in locals() else 'unknown',
            file_path=file.filename if 'file' in locals() and file else 'unknown',
            error_message=str(e),
            file_type='thumbnail',
            operation_type='upload'
        )
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/thumbnails/<filename>', methods=['GET'])
def serve_thumbnail(filename):
    """
    Serve course thumbnail image
    Implements Requirements 6.4, 6.7, 6.8
    """
    try:
        # Requirement 6.7: Validate file path to prevent directory traversal
        try:
            validate_file_path(filename)
        except ValidationError as e:
            current_app.logger.warning(f"Invalid thumbnail filename: {filename}")
            return jsonify({'error': 'Invalid file path'}), 400
        
        thumbnails_folder = os.path.join(UPLOAD_FOLDER, 'thumbnails')
        file_path = os.path.join(thumbnails_folder, filename)
        
        # Requirement 6.4: Return 404 for non-existent files
        if not os.path.exists(file_path):
            current_app.logger.error(f"Thumbnail file not found: {filename}")
            return jsonify({'error': 'Thumbnail not found'}), 404
        
        # Requirement 6.8: Log file access operation
        # Note: For thumbnails, we don't require authentication, so user_id may be 'anonymous'
        log_file_access(
            user_id='anonymous',
            file_path=file_path,
            file_type='thumbnail',
            operation_type='access'
        )
        
        return send_from_directory(thumbnails_folder, filename)
    except Exception as e:
        # Requirement 6.8: Log errors with full stack traces
        log_file_error(
            user_id='anonymous',
            file_path=filename,
            error_message=str(e),
            file_type='thumbnail',
            operation_type='access'
        )
        current_app.logger.error(f"Error serving thumbnail {filename}: {str(e)}")
        return jsonify({'error': 'Failed to serve thumbnail'}), 500

@courses_bp.route('/<course_id>/materials', methods=['POST'])
@jwt_required()
def upload_material(course_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check permissions
        course = db.courses.find_one({'_id': ObjectId(course_id)})
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] != 'admin' and course['teacher_id'] != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json()
        
        # Validate and sanitize material data
        try:
            validated_data = validate_material_data(data)
        except ValidationError as e:
            return jsonify({'error': e.message, 'field': e.field}), 400
        
        # Ensure required fields are present
        required_fields = ['title', 'type', 'content']
        for field in required_fields:
            if field not in validated_data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Requirement 3.4: Ensure material.type is set to 'video' for video materials
        # and video_id is stored in content field
        material_type = validated_data.get('type', 'video')
        content = validated_data.get('content', '')
        
        # If type is 'video', ensure content contains video_id
        if material_type == 'video':
            # Content should be a video_id (ObjectId string)
            # Validate that the video exists
            try:
                video = db.videos.find_one({'_id': ObjectId(content)})
                if not video:
                    return jsonify({'error': 'Video not found'}), 404
            except:
                return jsonify({'error': 'Invalid video ID'}), 400
        
        # Create material with validated data
        material_data = {
            'course_id': course_id,
            'title': validated_data.get('title'),
            'description': validated_data.get('description', ''),
            'type': material_type,  # Ensure type is 'video' for video materials
            'content': content,  # Store video_id in content field
            'order': validated_data.get('order', 0),
            'is_required': validated_data.get('is_required', False),
            'uploaded_by': user_id,
            'created_at': datetime.utcnow()
        }
        
        result = db.materials.insert_one(material_data)
        material_data['_id'] = str(result.inserted_id)
        
        return jsonify({
            'message': 'Material uploaded successfully',
            'material': material_data
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/<course_id>/progress', methods=['POST'])
@jwt_required()
def update_progress(course_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if student is enrolled
        enrollment = db.enrollments.find_one({
            'course_id': course_id,
            'student_id': user_id
        })
        if not enrollment:
            return jsonify({'error': 'Not enrolled in this course'}), 403
        
        data = request.get_json()
        material_id = data.get('material_id')
        completed = data.get('completed', False)
        watch_time = data.get('watch_time', 0)
        
        if not material_id:
            return jsonify({'error': 'Material ID is required'}), 400
        
        # Update completed materials
        if completed:
            db.enrollments.update_one(
                {'_id': enrollment['_id']},
                {
                    '$addToSet': {'completed_materials': material_id},
                    '$set': {'last_accessed': datetime.utcnow()}
                }
            )
            
            # Mark material as completed by this user
            db.materials.update_one(
                {'_id': ObjectId(material_id)},
                {'$addToSet': {'completed_by': user_id}}
            )
        
        # Calculate overall progress
        total_materials = db.materials.count_documents({'course_id': course_id, 'is_required': True})
        completed_materials = len(enrollment.get('completed_materials', []))
        
        if total_materials > 0:
            progress = (completed_materials / total_materials) * 100
            db.enrollments.update_one(
                {'_id': enrollment['_id']},
                {'$set': {'progress': round(progress, 2)}}
            )
        
        # Track video watch time
        if watch_time > 0:
            db.video_progress.update_one(
                {
                    'student_id': user_id,
                    'material_id': material_id,
                    'course_id': course_id
                },
                {
                    '$set': {
                        'watch_time': watch_time,
                        'last_watched': datetime.utcnow()
                    }
                },
                upsert=True
            )
        
        return jsonify({'message': 'Progress updated successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/<course_id>', methods=['DELETE'])
@jwt_required()
def delete_course(course_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get course and check permissions
        course = db.courses.find_one({'_id': ObjectId(course_id)})
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] != 'admin' and course['teacher_id'] != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Soft delete: Set is_active to False
        db.courses.update_one(
            {'_id': ObjectId(course_id)},
            {'$set': {'is_active': False, 'updated_at': datetime.utcnow()}}
        )
        
        # Notify enrolled students about course deletion
        enrollments = list(db.enrollments.find({'course_id': course_id}))
        for enrollment in enrollments:
            try:
                create_notification(
                    db=db,
                    user_id=enrollment['student_id'],
                    title='Course Deactivated',
                    message=f'The course "{course["title"]}" has been deactivated by the instructor.',
                    notification_type='warning',
                    link=f'/courses'
                )
            except Exception as notif_error:
                print(f"Failed to create notification: {notif_error}")
        
        return jsonify({'message': 'Course deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/<course_id>/students', methods=['GET'])
@jwt_required()
def get_course_students(course_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check permissions
        course = db.courses.find_one({'_id': ObjectId(course_id)})
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] not in ['admin', 'teacher'] or (user['role'] == 'teacher' and course['teacher_id'] != user_id):
            return jsonify({'error': 'Access denied'}), 403
        
        # Get enrollments
        enrollments = list(db.enrollments.find({'course_id': course_id}))
        
        students = []
        for enrollment in enrollments:
            student = db.users.find_one({'_id': ObjectId(enrollment['student_id'])})
            if student:
                student_id = str(student['_id'])
                
                # Get student's submissions for this course
                assignments = list(db.assignments.find({'course_id': course_id}))
                assignment_ids = [str(a['_id']) for a in assignments]
                
                submissions = list(db.submissions.find({
                    'student_id': student_id,
                    'assignment_id': {'$in': assignment_ids}
                }))
                
                # Calculate average grade
                graded_submissions = [s for s in submissions if s.get('grade') is not None]
                average_grade = 0
                if graded_submissions:
                    total_grade = sum(s['grade'] for s in graded_submissions)
                    total_max = sum(a['max_points'] for a in assignments if str(a['_id']) in [s['assignment_id'] for s in graded_submissions])
                    if total_max > 0:
                        average_grade = round((total_grade / total_max) * 100, 1)
                
                student_data = {
                    'id': student_id,
                    'name': student['name'],
                    'email': student['email'],
                    'roll_no': student.get('roll_no', ''),
                    'department': student.get('department', ''),
                    'enrolled_at': enrollment['enrolled_at'],
                    'progress': enrollment.get('progress', 0),
                    'is_active': enrollment.get('is_active', True),
                    'average_grade': average_grade,
                    'total_points': student.get('total_points', 0),
                    'completed_assignments': len([s for s in submissions if s.get('status') in ['submitted', 'graded']]),
                    'total_assignments': len(assignments)
                }
                students.append(student_data)
        
        return jsonify({'students': students}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@courses_bp.route('/<course_id>/add-youtube-video', methods=['POST'])
@jwt_required()
def add_youtube_video(course_id):
    """Add a YouTube video to course materials"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check permissions
        course = db.courses.find_one({'_id': ObjectId(course_id)})
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] != 'admin' and course['teacher_id'] != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json()
        
        # Get form data
        title = data.get('title')
        description = data.get('description', '')
        youtube_url = data.get('youtube_url', '')
        module_id = data.get('module_id', '')
        order = data.get('order', 0)
        duration = data.get('duration', '')
        
        if not title:
            return jsonify({'error': 'Video title is required'}), 400
        
        if not youtube_url:
            return jsonify({'error': 'YouTube URL is required'}), 400
        
        # Validate YouTube URL format
        import re
        youtube_regex = r'(https?://)?(www\.)?(youtube\.com|youtu\.be)/.+'
        if not re.match(youtube_regex, youtube_url):
            return jsonify({'error': 'Invalid YouTube URL'}), 400
        
        # Create video material record
        video_data = {
            'course_id': course_id,
            'module_id': module_id if module_id else None,
            'title': title,
            'description': description,
            'type': 'video',
            'content': '',  # Empty for YouTube videos
            'youtube_url': youtube_url,
            'duration': duration,
            'order': int(order),
            'is_required': True,
            'uploaded_by': user_id,
            'created_at': datetime.utcnow(),
            'views': 0,
            'completed_by': []
        }
        
        result = db.materials.insert_one(video_data)
        video_data['_id'] = str(result.inserted_id)
        video_data['material_id'] = str(result.inserted_id)
        
        # Notify enrolled students
        enrollments = db.enrollments.find({'course_id': course_id})
        for enrollment in enrollments:
            try:
                create_notification(
                    db=db,
                    user_id=enrollment['student_id'],
                    title='New Video Added',
                    message=f'A new video "{title}" has been added to {course["title"]}',
                    notification_type='info',
                    link=f'/courses/detail?id={course_id}'
                )
            except:
                pass
        
        return jsonify({
            'message': 'YouTube video added successfully',
            'video': video_data
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
