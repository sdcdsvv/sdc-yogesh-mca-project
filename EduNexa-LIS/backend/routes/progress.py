from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
from utils.api_response import error_response, success_response, prepare_api_response
from utils.case_converter import convert_dict_keys_to_camel

progress_bp = Blueprint('progress', __name__)

@progress_bp.route('/course/<course_id>', methods=['GET'])
@jwt_required()
def get_course_progress(course_id):
    """Get student's progress for a specific course"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is student
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or user['role'] != 'student':
            return error_response('Only students can view progress', 403)
        
        # Get or create progress record
        progress = db.progress.find_one({
            'course_id': course_id,
            'student_id': user_id
        })
        
        # If no progress record exists, return default state
        if not progress:
            default_progress = {
                'course_id': course_id,
                'student_id': user_id,
                'started': False,
                'last_accessed': None,
                'overall_progress': 0,
                'completed_materials': []
            }
            return prepare_api_response({'progress': default_progress}, status_code=200)
        
        # Convert ObjectId to string
        progress['_id'] = str(progress['_id'])
        
        # Format datetime fields
        if progress.get('last_accessed'):
            progress['last_accessed'] = progress['last_accessed'].isoformat()
        if progress.get('created_at'):
            progress['created_at'] = progress['created_at'].isoformat()
        if progress.get('updated_at'):
            progress['updated_at'] = progress['updated_at'].isoformat()
        
        return prepare_api_response({'progress': progress}, status_code=200)
        
    except Exception as e:
        return error_response(str(e), 500)

@progress_bp.route('/course/<course_id>/start', methods=['POST'])
@jwt_required()
def start_course(course_id):
    """Initialize progress tracking when student first accesses a course"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is student
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or user['role'] != 'student':
            return error_response('Only students can start courses', 403)
        
        # Check if course exists
        course = db.courses.find_one({'_id': ObjectId(course_id)})
        if not course:
            return error_response('Course not found', 404)
        
        # Check if student is enrolled
        enrollment = db.enrollments.find_one({
            'course_id': course_id,
            'student_id': user_id
        })
        
        if not enrollment:
            return error_response('Not enrolled in this course', 403)
        
        # Check if progress record already exists
        existing_progress = db.progress.find_one({
            'course_id': course_id,
            'student_id': user_id
        })
        
        current_time = datetime.utcnow()
        
        if existing_progress:
            # Update existing progress record
            db.progress.update_one(
                {'_id': existing_progress['_id']},
                {
                    '$set': {
                        'started': True,
                        'last_accessed': current_time,
                        'updated_at': current_time
                    }
                }
            )
            
            progress_data = {
                'course_id': course_id,
                'student_id': user_id,
                'started': True,
                'last_accessed': current_time.isoformat()
            }
            return success_response('Progress updated', {'progress': progress_data}, 200)
        else:
            # Create new progress record
            progress_data = {
                'course_id': course_id,
                'student_id': user_id,
                'started': True,
                'last_accessed': current_time,
                'completed_materials': [],
                'overall_progress': 0,
                'created_at': current_time,
                'updated_at': current_time
            }
            
            result = db.progress.insert_one(progress_data)
            progress_data['_id'] = str(result.inserted_id)
            progress_data['last_accessed'] = current_time.isoformat()
            progress_data['created_at'] = current_time.isoformat()
            progress_data['updated_at'] = current_time.isoformat()
            
            # IMPORTANT: Also initialize progress in enrollment record
            db.enrollments.update_one(
                {
                    'student_id': user_id,
                    'course_id': course_id
                },
                {
                    '$set': {
                        'progress': 0,
                        'updated_at': current_time
                    }
                }
            )
            
            return success_response('Progress initialized', {'progress': progress_data}, 201)
        
    except Exception as e:
        return error_response(str(e), 500)


@progress_bp.route('/course/<course_id>/videos', methods=['GET'])
@jwt_required()
def get_course_video_statistics(course_id):
    """Get video statistics for a course (teacher only)"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is teacher
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or user['role'] not in ['teacher', 'admin']:
            return error_response('Only teachers can view video statistics', 403)
        
        # Verify course exists and teacher owns it
        course = db.courses.find_one({'_id': ObjectId(course_id)})
        if not course:
            return error_response('Course not found', 404)
        
        if user['role'] == 'teacher' and course.get('teacher_id') != user_id:
            return error_response('You do not have access to this course', 403)
        
        # Get all video materials for this course
        videos = list(db.materials.find({
            'course_id': course_id,
            'type': 'video'
        }))
        
        # Get enrolled students count
        enrolled_students = db.enrollments.count_documents({'course_id': course_id})
        
        # Calculate statistics for each video
        video_stats = []
        for video in videos:
            video_id = str(video['_id'])
            
            # Get all video progress records for this video
            progress_records = list(db.video_progress.find({'video_id': video_id}))
            
            # Calculate statistics
            total_views = len(progress_records)
            total_watch_time = sum([p.get('watch_time', 0) for p in progress_records])
            completed_views = len([p for p in progress_records if p.get('completed', False)])
            
            # Calculate average completion percentage
            avg_completion = 0
            if progress_records:
                video_duration = video.get('duration', 600)  # Default 10 minutes
                completion_percentages = [
                    (p.get('watch_time', 0) / video_duration * 100) if video_duration > 0 else 0
                    for p in progress_records
                ]
                avg_completion = sum(completion_percentages) / len(completion_percentages)
            
            # Calculate view rate (percentage of enrolled students who viewed)
            view_rate = (total_views / enrolled_students * 100) if enrolled_students > 0 else 0
            
            # Format watch time
            hours = total_watch_time // 3600
            minutes = (total_watch_time % 3600) // 60
            seconds = total_watch_time % 60
            watch_time_formatted = f"{int(hours)}h {int(minutes)}m {int(seconds)}s"
            
            video_stat = {
                'id': video_id,
                'title': video.get('title', 'Untitled Video'),
                'description': video.get('description', ''),
                'content_id': video.get('content', ''),
                'uploaded_at': video.get('created_at', datetime.utcnow()).isoformat(),
                'file_size': video.get('file_size', 0),
                'file_path': video.get('file_path', ''),
                'statistics': {
                    'total_views': total_views,
                    'total_watch_time_seconds': total_watch_time,
                    'total_watch_time_formatted': watch_time_formatted,
                    'avg_completion_percentage': round(avg_completion, 2),
                    'completed_views': completed_views,
                    'enrolled_students': enrolled_students,
                    'view_rate': round(view_rate, 2)
                }
            }
            video_stats.append(video_stat)
        
        # Sort by total views (most viewed first)
        video_stats.sort(key=lambda x: x['statistics']['total_views'], reverse=True)
        
        # Calculate overall statistics
        total_videos = len(videos)
        total_views_all = sum([v['statistics']['total_views'] for v in video_stats])
        total_watch_time_all = sum([v['statistics']['total_watch_time_seconds'] for v in video_stats])
        
        # Format total watch time
        hours = total_watch_time_all // 3600
        minutes = (total_watch_time_all % 3600) // 60
        total_watch_time_formatted = f"{int(hours)}h {int(minutes)}m"
        
        response_data = {
            'course_id': course_id,
            'course_title': course.get('title', 'Unknown Course'),
            'total_videos': total_videos,
            'enrolled_students': enrolled_students,
            'overall_statistics': {
                'total_views': total_views_all,
                'total_watch_time_seconds': total_watch_time_all,
                'total_watch_time_formatted': total_watch_time_formatted,
                'avg_views_per_video': round(total_views_all / total_videos, 2) if total_videos > 0 else 0
            },
            'videos': video_stats
        }
        
        return prepare_api_response(response_data, status_code=200)
        
    except Exception as e:
        current_app.logger.error(f"Error fetching video statistics: {str(e)}")
        return error_response(str(e), 500)
