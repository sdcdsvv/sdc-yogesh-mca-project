from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
from werkzeug.utils import secure_filename
import os

from routes.notifications import create_notification
from utils.validation import (
    validate_assignment_data,
    validate_grade_data,
    ValidationError
)

assignments_bp = Blueprint('assignments', __name__)

UPLOAD_ROOT = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
ASSIGNMENT_UPLOAD_FOLDER = os.path.join(UPLOAD_ROOT, 'assignments')
os.makedirs(ASSIGNMENT_UPLOAD_FOLDER, exist_ok=True)

ALLOWED_ASSIGNMENT_EXTENSIONS = {
    'pdf', 'doc', 'docx', 'ppt', 'pptx',
    'txt', 'md', 'csv', 'zip', 'rar',
    'py', 'ipynb', 'js', 'ts', 'java'
}
MAX_ASSIGNMENT_FILE_SIZE_MB = int(os.getenv('MAX_ASSIGNMENT_FILE_SIZE_MB', '50'))


def allowed_assignment_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_ASSIGNMENT_EXTENSIONS

@assignments_bp.route('/', methods=['GET'])
@jwt_required()
def get_assignments():
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get user to check role
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Build query based on user role
        if user['role'] == 'student':
            # Get assignments from enrolled courses
            enrollments = list(db.enrollments.find({'student_id': user_id}))
            course_ids = [enrollment['course_id'] for enrollment in enrollments]
            assignments = list(db.assignments.find({'course_id': {'$in': course_ids}}))
            
            # Add submission status for each assignment
            for assignment in assignments:
                assignment['_id'] = str(assignment['_id'])
                submission = db.submissions.find_one({
                    'assignment_id': str(assignment['_id']),
                    'student_id': user_id
                })
                assignment['submission_status'] = 'submitted' if submission else 'pending'
                if submission:
                    assignment['submission'] = {
                        'submitted_at': submission['submitted_at'],
                        'grade': submission.get('grade'),
                        'feedback': submission.get('feedback', '')
                    }
                
                # Get course info
                course = db.courses.find_one({'_id': ObjectId(assignment['course_id'])})
                if course:
                    assignment['course_title'] = course['title']
        
        elif user['role'] == 'teacher':
            # Get assignments from courses created by teacher
            courses = list(db.courses.find({'teacher_id': user_id}))
            course_ids = [str(course['_id']) for course in courses]
            assignments = list(db.assignments.find({'course_id': {'$in': course_ids}}))
            
            # Add submission count for each assignment
            for assignment in assignments:
                assignment['_id'] = str(assignment['_id'])
                submission_count = db.submissions.count_documents({
                    'assignment_id': str(assignment['_id'])
                })
                assignment['submission_count'] = submission_count
                
                # Get course info
                course = db.courses.find_one({'_id': ObjectId(assignment['course_id'])})
                if course:
                    assignment['course_title'] = course['title']
        
        else:  # admin
            assignments = list(db.assignments.find())
            for assignment in assignments:
                assignment['_id'] = str(assignment['_id'])
                # Get course info
                course = db.courses.find_one({'_id': ObjectId(assignment['course_id'])})
                if course:
                    assignment['course_title'] = course['title']
        
        return jsonify({'assignments': assignments}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@assignments_bp.route('/<assignment_id>', methods=['GET'])
@jwt_required()
def get_assignment(assignment_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get assignment
        assignment = db.assignments.find_one({'_id': ObjectId(assignment_id)})
        if not assignment:
            return jsonify({'error': 'Assignment not found'}), 404
        
        # Check permissions
        user = db.users.find_one({'_id': ObjectId(user_id)})
        course = db.courses.find_one({'_id': ObjectId(assignment['course_id'])})
        
        if user['role'] == 'student':
            # Check if student is enrolled in the course
            enrollment = db.enrollments.find_one({
                'course_id': assignment['course_id'],
                'student_id': user_id
            })
            if not enrollment:
                return jsonify({'error': 'Access denied'}), 403
        elif user['role'] == 'teacher' and course['teacher_id'] != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        assignment['_id'] = str(assignment['_id'])
        
        # Get course info
        if course:
            assignment['course_title'] = course['title']
        
        # If student, get their submission
        if user['role'] == 'student':
            submission = db.submissions.find_one({
                'assignment_id': assignment_id,
                'student_id': user_id
            })
            if submission:
                submission['_id'] = str(submission['_id'])
                assignment['submission'] = submission
        
        # If teacher, get all submissions
        elif user['role'] == 'teacher':
            submissions = list(db.submissions.find({'assignment_id': assignment_id}))
            for submission in submissions:
                submission['_id'] = str(submission['_id'])
                # Get student info
                student = db.users.find_one({'_id': ObjectId(submission['student_id'])})
                if student:
                    submission['student_name'] = student['name']
                    submission['student_email'] = student['email']
                    submission['roll_no'] = student.get('roll_no', '')
            assignment['submissions'] = submissions
        
        return jsonify({'assignment': assignment}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@assignments_bp.route('/', methods=['POST'])
@jwt_required()
def create_assignment():
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is teacher or admin
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] not in ['teacher', 'admin']:
            return jsonify({'error': 'Only teachers and admins can create assignments'}), 403
        
        data = request.get_json()
        
        # Validate and sanitize assignment data
        try:
            validated_data = validate_assignment_data(data)
        except ValidationError as e:
            return jsonify({'error': e.message, 'field': e.field}), 400
        
        # Ensure required fields are present
        required_fields = ['title', 'description', 'course_id', 'due_date']
        for field in required_fields:
            if field not in validated_data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if course exists and user has permission
        course = db.courses.find_one({'_id': ObjectId(validated_data['course_id'])})
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        if user['role'] == 'teacher' and course['teacher_id'] != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Create assignment with validated data
        assignment_data = {
            **validated_data,
            'instructions': validated_data.get('instructions', ''),
            'max_points': validated_data.get('max_points', 100),
            'submission_type': validated_data.get('submission_type', 'file'),
            'allowed_file_types': validated_data.get('allowed_file_types', []),
            'max_file_size': validated_data.get('max_file_size', 10),
            'is_active': True,
            'created_by': user_id,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = db.assignments.insert_one(assignment_data)
        assignment_data['_id'] = str(result.inserted_id)
        
        # Send email notification to enrolled students (async, don't block)
        try:
            from services.notification_service import notify_course_participants
            import threading
            
            subject = f"New Assignment: {validated_data['title']}"
            body = f"A new assignment '{validated_data['title']}' has been posted.\n\nDue Date: {validated_data['due_date'].strftime('%Y-%m-%d %H:%M')}\n\nPlease check the course page for details."
            
            # Run in background thread
            thread = threading.Thread(
                target=notify_course_participants,
                args=(db, validated_data['course_id'], subject, body),
                kwargs={'include_teacher': False}
            )
            thread.daemon = True
            thread.start()
        except Exception as notif_error:
            # Don't fail assignment creation if notification fails
            print(f"Failed to send assignment notification: {notif_error}")
        
        return jsonify({
            'message': 'Assignment created successfully',
            'assignment': assignment_data
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@assignments_bp.route('/<assignment_id>', methods=['PUT'])
@jwt_required()
def update_assignment(assignment_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get assignment and check permissions
        assignment = db.assignments.find_one({'_id': ObjectId(assignment_id)})
        if not assignment:
            return jsonify({'error': 'Assignment not found'}), 404
        
        user = db.users.find_one({'_id': ObjectId(user_id)})
        course = db.courses.find_one({'_id': ObjectId(assignment['course_id'])})
        
        if user['role'] != 'admin' and (user['role'] != 'teacher' or course['teacher_id'] != user_id):
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json()
        
        # Validate and sanitize assignment data
        try:
            validated_data = validate_assignment_data(data)
        except ValidationError as e:
            return jsonify({'error': e.message, 'field': e.field}), 400
        
        if not validated_data:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        # Check if due_date is being changed
        due_date_changed = False
        old_due_date = None
        new_due_date = None
        
        if 'due_date' in validated_data:
            old_due_date = assignment.get('due_date')
            new_due_date = validated_data['due_date']
            # Check if the dates are actually different
            if old_due_date != new_due_date:
                due_date_changed = True
        
        validated_data['updated_at'] = datetime.utcnow()
        update_data = validated_data
        
        # Update assignment
        db.assignments.update_one(
            {'_id': ObjectId(assignment_id)},
            {'$set': update_data}
        )
        
        # Get updated assignment
        updated_assignment = db.assignments.find_one({'_id': ObjectId(assignment_id)})
        updated_assignment['_id'] = str(updated_assignment['_id'])
        
        # Send notification to students if due date changed (async, don't block)
        if due_date_changed:
            try:
                from services.notification_service import notify_course_participants
                import threading
                
                subject = f"Assignment Due Date Updated: {assignment['title']}"
                old_date_str = old_due_date.strftime('%Y-%m-%d %H:%M') if old_due_date else 'N/A'
                new_date_str = new_due_date.strftime('%Y-%m-%d %H:%M') if new_due_date else 'N/A'
                body = f"The due date for assignment '{assignment['title']}' has been updated.\n\nOld Due Date: {old_date_str}\nNew Due Date: {new_date_str}\n\nPlease plan accordingly."
                
                # Run in background thread
                thread = threading.Thread(
                    target=notify_course_participants,
                    args=(db, assignment['course_id'], subject, body),
                    kwargs={'include_teacher': False}
                )
                thread.daemon = True
                thread.start()
            except Exception as notif_error:
                # Don't fail update if notification fails
                print(f"Failed to send due date update notification: {notif_error}")
        
        return jsonify({
            'message': 'Assignment updated successfully',
            'assignment': updated_assignment
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@assignments_bp.route('/<assignment_id>/submit', methods=['POST'])
@jwt_required()
def submit_assignment(assignment_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is student
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] != 'student':
            return jsonify({'error': 'Only students can submit assignments'}), 403
        
        # Get assignment
        assignment = db.assignments.find_one({'_id': ObjectId(assignment_id)})
        if not assignment:
            return jsonify({'error': 'Assignment not found'}), 404
        
        # Check if student is enrolled in the course
        enrollment = db.enrollments.find_one({
            'course_id': assignment['course_id'],
            'student_id': user_id
        })
        if not enrollment:
            return jsonify({'error': 'Not enrolled in this course'}), 403
        
        # Check if assignment is still active and not past due
        if not assignment.get('is_active', True):
            return jsonify({'error': 'Assignment is no longer active'}), 400
        
        if datetime.utcnow() > assignment['due_date']:
            return jsonify({'error': 'Assignment deadline has passed'}), 400
        
        # Check if already submitted
        existing_submission = db.submissions.find_one({
            'assignment_id': assignment_id,
            'student_id': user_id
        })
        if existing_submission:
            return jsonify({'error': 'Assignment already submitted'}), 409
        
        data = request.get_json()
        
        # Validate submission based on type
        submission_type = assignment.get('submission_type', 'file')
        if submission_type in ['text', 'both'] and not data.get('text_content'):
            return jsonify({'error': 'Text content is required'}), 400
        
        if submission_type in ['file', 'both'] and not data.get('file_path'):
            return jsonify({'error': 'File is required'}), 400
        
        # Create submission
        submission_data = {
            'assignment_id': assignment_id,
            'student_id': user_id,
            'course_id': assignment['course_id'],
            'text_content': data.get('text_content', ''),
            'file_path': data.get('file_path', ''),
            'file_name': data.get('file_name', ''),
            'submitted_at': datetime.utcnow(),
            'status': 'submitted',
            'grade': None,
            'feedback': '',
            'graded_at': None,
            'graded_by': None
        }
        
        result = db.submissions.insert_one(submission_data)
        submission_data['_id'] = str(result.inserted_id)
        
        # Send notification to teacher
        try:
            course = db.courses.find_one({'_id': ObjectId(assignment['course_id'])})
            if course:
                teacher_id = course['teacher_id']
                create_notification(
                    db=db,
                    user_id=teacher_id,
                    title='New Assignment Submission',
                    message=f'{user["name"]} has submitted the assignment "{assignment["title"]}"',
                    notification_type='info',
                    link=f'/assignments/detail?id={assignment_id}'
                )
        except Exception as notif_error:
            # Don't fail the submission if notification fails
            print(f"Failed to create teacher notification: {notif_error}")
        
        return jsonify({
            'message': 'Assignment submitted successfully',
            'submission': submission_data
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@assignments_bp.route('/<assignment_id>', methods=['DELETE'])
@jwt_required()
def delete_assignment(assignment_id):
    """
    Delete an assignment.
    Teachers can delete their own assignments.
    Admins can delete any assignment.
    """
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get user and assignment
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        assignment = db.assignments.find_one({'_id': ObjectId(assignment_id)})
        if not assignment:
            return jsonify({'error': 'Assignment not found'}), 404
        
        # Check permissions
        is_admin = user['role'] == 'admin'
        is_teacher = user['role'] == 'teacher'
        
        # Get course to check ownership
        course = db.courses.find_one({'_id': ObjectId(assignment['course_id'])})
        is_owner = is_teacher and course and course['teacher_id'] == user_id
        
        # Allow deletion if admin OR (teacher AND owner)
        if not (is_admin or is_owner):
            return jsonify({'error': 'Access denied. You can only delete your own assignments.'}), 403
        
        # Delete related submissions
        db.submissions.delete_many({'assignment_id': assignment_id})
        
        # Delete the assignment
        db.assignments.delete_one({'_id': ObjectId(assignment_id)})
        
        # Send notification to course participants (async, don't block on failure)
        try:
            from services.notification_service import notify_course_participants, notify_users_by_role
            import threading
            
            subject = f"Assignment Deleted: {assignment['title']}"
            body = f"The assignment '{assignment['title']}' has been deleted from the course."
            
            # Notify course participants (students)
            thread1 = threading.Thread(
                target=notify_course_participants,
                args=(db, assignment['course_id'], subject, body),
                kwargs={'include_teacher': False}
            )
            thread1.daemon = True
            thread1.start()
            
            # Notify admins about the deletion
            admin_subject = f"Assignment Deleted: {assignment['title']}"
            admin_body = f"An assignment has been deleted:\n\nTitle: {assignment['title']}\nCourse ID: {assignment['course_id']}\nDeleted by: {user['name']} ({user['role']})"
            
            thread2 = threading.Thread(
                target=notify_users_by_role,
                args=(db, ['admin'], admin_subject, admin_body)
            )
            thread2.daemon = True
            thread2.start()
        except Exception as notif_error:
            # Don't fail deletion if notification fails
            print(f"Failed to send deletion notification: {notif_error}")
        
        return jsonify({'message': 'Assignment deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@assignments_bp.route('/submissions/<submission_id>/grade', methods=['POST'])
@jwt_required()
def grade_submission(submission_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is teacher or admin
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] not in ['teacher', 'admin']:
            return jsonify({'error': 'Only teachers and admins can grade submissions'}), 403
        
        # Get submission
        submission = db.submissions.find_one({'_id': ObjectId(submission_id)})
        if not submission:
            return jsonify({'error': 'Submission not found'}), 404
        
        # Check permissions
        assignment = db.assignments.find_one({'_id': ObjectId(submission['assignment_id'])})
        course = db.courses.find_one({'_id': ObjectId(assignment['course_id'])})
        
        if user['role'] == 'teacher' and course['teacher_id'] != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json()
        
        # Validate and sanitize grade data
        max_points = assignment.get('max_points', 100)
        try:
            validated_data = validate_grade_data(data, max_points)
        except ValidationError as e:
            return jsonify({'error': e.message, 'field': e.field}), 400
        
        if 'grade' not in validated_data:
            return jsonify({'error': 'Grade is required'}), 400
        
        # Update submission with validated data
        update_data = {
            'grade': validated_data['grade'],
            'feedback': validated_data.get('feedback', ''),
            'status': 'graded',
            'graded_at': datetime.utcnow(),
            'graded_by': user_id
        }
        
        db.submissions.update_one(
            {'_id': ObjectId(submission_id)},
            {'$set': update_data}
        )
        
        # Update student's total points
        db.users.update_one(
            {'_id': ObjectId(submission['student_id'])},
            {'$inc': {'total_points': validated_data['grade']}}
        )
        
        # Create notification for student
        try:
            percentage = (validated_data['grade'] / max_points) * 100
            notification_type = 'success' if percentage >= 70 else 'warning' if percentage >= 50 else 'error'
            
            create_notification(
                db=db,
                user_id=submission['student_id'],
                title='Assignment Graded',
                message=f'Your assignment "{assignment["title"]}" has been graded. Score: {validated_data["grade"]}/{max_points} ({percentage:.1f}%)',
                notification_type=notification_type,
                link=f'/assignments/detail?id={assignment["_id"]}'
            )
        except Exception as notif_error:
            # Don't fail the grading if notification fails
            print(f"Failed to create notification: {notif_error}")
        
        return jsonify({'message': 'Submission graded successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500