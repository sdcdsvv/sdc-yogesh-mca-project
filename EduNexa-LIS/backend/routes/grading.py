"""
Enhanced Grading System for Assignment Submissions
Includes rubric-based scoring, grade status management, audit logs, and notifications
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
import threading
from typing import Dict, List, Optional

from routes.notifications import create_notification
from utils.validation import ValidationError

grading_bp = Blueprint('grading', __name__)


def validate_rubric_scores(rubric_scores: List[Dict], max_points: int) -> tuple:
    """Validate rubric scores and calculate total"""
    if not isinstance(rubric_scores, list):
        raise ValidationError('Rubric scores must be a list', 'rubric_scores')
    
    total_score = 0
    for item in rubric_scores:
        if not isinstance(item, dict):
            raise ValidationError('Each rubric item must be an object', 'rubric_scores')
        
        if 'criterion' not in item or 'score' not in item or 'max_score' not in item:
            raise ValidationError('Each rubric item must have criterion, score, and max_score', 'rubric_scores')
        
        score = item['score']
        max_score = item['max_score']
        
        if not isinstance(score, (int, float)) or not isinstance(max_score, (int, float)):
            raise ValidationError('Scores must be numbers', 'rubric_scores')
        
        if score < 0 or score > max_score:
            raise ValidationError(f'Score {score} exceeds max score {max_score}', 'rubric_scores')
        
        total_score += score
    
    if total_score > max_points:
        raise ValidationError(f'Total score {total_score} exceeds assignment max points {max_points}', 'rubric_scores')
    
    return total_score, rubric_scores


def create_audit_log(db, action: str, user_id: str, submission_id: str, details: Dict):
    """Create an audit log entry for grading actions"""
    try:
        audit_entry = {
            'action': action,
            'user_id': user_id,
            'submission_id': submission_id,
            'details': details,
            'timestamp': datetime.utcnow(),
            'ip_address': request.remote_addr,
            'user_agent': request.headers.get('User-Agent', '')
        }
        db.grading_audit_logs.insert_one(audit_entry)
    except Exception as e:
        print(f"Failed to create audit log: {e}")


def send_grade_notification_email(db, student_id: str, assignment_title: str, grade: float, max_points: int, is_final: bool):
    """Send email notification to student about grade (with retry logic)"""
    try:
        from services.notification_service import send_email_notification
        
        student = db.users.find_one({'_id': ObjectId(student_id)})
        if not student or not student.get('email'):
            return
        
        percentage = (grade / max_points) * 100
        status = "Final" if is_final else "Provisional"
        
        subject = f"Grade {status}: {assignment_title}"
        body = f"""
Hello {student.get('name', 'Student')},

Your assignment "{assignment_title}" has been graded.

Score: {grade}/{max_points} ({percentage:.1f}%)
Status: {status}

{'This is your final grade for this assignment.' if is_final else 'This grade is provisional and may be updated.'}

Log in to view detailed feedback and rubric scores.

Best regards,
EduNexa Team
"""
        
        # Retry logic for email sending
        max_retries = 3
        for attempt in range(max_retries):
            try:
                send_email_notification(student['email'], subject, body)
                # Log successful email
                db.email_logs.insert_one({
                    'recipient': student['email'],
                    'subject': subject,
                    'status': 'sent',
                    'attempt': attempt + 1,
                    'timestamp': datetime.utcnow()
                })
                break
            except Exception as email_error:
                if attempt == max_retries - 1:
                    # Log failed email after all retries
                    db.email_logs.insert_one({
                        'recipient': student['email'],
                        'subject': subject,
                        'status': 'failed',
                        'error': str(email_error),
                        'attempts': max_retries,
                        'timestamp': datetime.utcnow()
                    })
                    print(f"Failed to send email after {max_retries} attempts: {email_error}")
                else:
                    # Wait before retry (exponential backoff)
                    import time
                    time.sleep(2 ** attempt)
    except Exception as e:
        print(f"Error in send_grade_notification_email: {e}")


@grading_bp.route('/submissions/<submission_id>/grade', methods=['POST'])
@jwt_required()
def grade_submission_enhanced(submission_id):
    """
    Enhanced grading endpoint with rubric support, audit logs, and notifications
    
    Request body:
    {
        "grade": 85,  # Optional if rubric_scores provided
        "feedback": "Great work!",
        "rubric_scores": [
            {"criterion": "Code Quality", "score": 25, "max_score": 30, "comments": "Well structured"},
            {"criterion": "Documentation", "score": 20, "max_score": 25, "comments": "Good comments"},
            {"criterion": "Functionality", "score": 40, "max_score": 45, "comments": "Works perfectly"}
        ],
        "is_final": false,  # true for final grade, false for provisional
        "release_grade": true  # Whether to show grade to student immediately
    }
    """
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
        if not assignment:
            return jsonify({'error': 'Assignment not found'}), 404
            
        course = db.courses.find_one({'_id': ObjectId(assignment['course_id'])})
        
        if user['role'] == 'teacher' and course['teacher_id'] != user_id:
            return jsonify({'error': 'Access denied - not your course'}), 403
        
        data = request.get_json()
        max_points = assignment.get('max_points', 100)
        
        # Validate rubric scores if provided
        rubric_scores = data.get('rubric_scores', [])
        if rubric_scores:
            try:
                total_score, validated_rubric = validate_rubric_scores(rubric_scores, max_points)
                final_grade = total_score
            except ValidationError as e:
                return jsonify({'error': e.message, 'field': e.field}), 400
        else:
            # Use direct grade if no rubric
            final_grade = data.get('grade')
            if final_grade is None:
                return jsonify({'error': 'Either grade or rubric_scores is required'}), 400
            
            if not isinstance(final_grade, (int, float)):
                return jsonify({'error': 'Grade must be a number'}), 400
            
            if final_grade < 0 or final_grade > max_points:
                return jsonify({'error': f'Grade must be between 0 and {max_points}'}), 400
            
            validated_rubric = []
        
        feedback = data.get('feedback', '').strip()
        is_final = data.get('is_final', False)
        release_grade = data.get('release_grade', True)
        
        # Prepare update data
        update_data = {
            'grade': final_grade,
            'feedback': feedback,
            'rubric_scores': validated_rubric,
            'status': 'graded',
            'is_final': is_final,
            'grade_released': release_grade,
            'graded_at': datetime.utcnow(),
            'graded_by': user_id,
            'grader_name': user.get('name', 'Unknown')
        }
        
        # Check if this is a re-grade
        was_previously_graded = submission.get('status') == 'graded'
        previous_grade = submission.get('grade')
        
        # Update submission
        db.submissions.update_one(
            {'_id': ObjectId(submission_id)},
            {'$set': update_data}
        )
        
        # Create audit log
        audit_details = {
            'submission_id': submission_id,
            'assignment_id': str(assignment['_id']),
            'student_id': submission['student_id'],
            'grade': final_grade,
            'max_points': max_points,
            'is_final': is_final,
            'release_grade': release_grade,
            'has_rubric': len(validated_rubric) > 0,
            'was_regrade': was_previously_graded,
            'previous_grade': previous_grade
        }
        create_audit_log(db, 'grade_submission', user_id, submission_id, audit_details)
        
        # Send notifications if grade is released
        if release_grade:
            # In-app notification
            try:
                percentage = (final_grade / max_points) * 100
                notification_type = 'success' if percentage >= 70 else 'warning' if percentage >= 50 else 'info'
                status_text = "Final" if is_final else "Provisional"
                
                create_notification(
                    db=db,
                    user_id=submission['student_id'],
                    title=f'Assignment Graded ({status_text})',
                    message=f'Your assignment "{assignment["title"]}" has been graded. Score: {final_grade}/{max_points} ({percentage:.1f}%)',
                    notification_type=notification_type,
                    link=f'/assignments/detail?id={assignment["_id"]}'
                )
            except Exception as notif_error:
                print(f"Failed to create in-app notification: {notif_error}")
            
            # Email notification (async with retry)
            try:
                thread = threading.Thread(
                    target=send_grade_notification_email,
                    args=(db, submission['student_id'], assignment['title'], final_grade, max_points, is_final)
                )
                thread.daemon = True
                thread.start()
            except Exception as email_error:
                print(f"Failed to start email notification thread: {email_error}")
        
        return jsonify({
            'message': 'Submission graded successfully',
            'grade': final_grade,
            'max_points': max_points,
            'percentage': (final_grade / max_points) * 100,
            'is_final': is_final,
            'released': release_grade
        }), 200
        
    except Exception as e:
        print(f"Error in grade_submission_enhanced: {e}")
        return jsonify({'error': str(e)}), 500


@grading_bp.route('/submissions/<submission_id>/release', methods=['POST'])
@jwt_required()
def release_grade(submission_id):
    """Release a previously hidden grade to the student"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check permissions
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] not in ['teacher', 'admin']:
            return jsonify({'error': 'Only teachers and admins can release grades'}), 403
        
        submission = db.submissions.find_one({'_id': ObjectId(submission_id)})
        if not submission:
            return jsonify({'error': 'Submission not found'}), 404
        
        if submission.get('status') != 'graded':
            return jsonify({'error': 'Submission has not been graded yet'}), 400
        
        assignment = db.assignments.find_one({'_id': ObjectId(submission['assignment_id'])})
        course = db.courses.find_one({'_id': ObjectId(assignment['course_id'])})
        
        if user['role'] == 'teacher' and course['teacher_id'] != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Update submission
        db.submissions.update_one(
            {'_id': ObjectId(submission_id)},
            {'$set': {'grade_released': True, 'released_at': datetime.utcnow()}}
        )
        
        # Create audit log
        create_audit_log(db, 'release_grade', user_id, submission_id, {
            'assignment_id': str(assignment['_id']),
            'student_id': submission['student_id']
        })
        
        # Send notifications
        grade = submission.get('grade', 0)
        max_points = assignment.get('max_points', 100)
        is_final = submission.get('is_final', False)
        
        # In-app notification
        try:
            percentage = (grade / max_points) * 100
            notification_type = 'success' if percentage >= 70 else 'warning' if percentage >= 50 else 'info'
            
            create_notification(
                db=db,
                user_id=submission['student_id'],
                title='Grade Released',
                message=f'Your grade for "{assignment["title"]}" is now available. Score: {grade}/{max_points} ({percentage:.1f}%)',
                notification_type=notification_type,
                link=f'/assignments/detail?id={assignment["_id"]}'
            )
        except Exception as notif_error:
            print(f"Failed to create notification: {notif_error}")
        
        # Email notification
        try:
            thread = threading.Thread(
                target=send_grade_notification_email,
                args=(db, submission['student_id'], assignment['title'], grade, max_points, is_final)
            )
            thread.daemon = True
            thread.start()
        except Exception as email_error:
            print(f"Failed to start email thread: {email_error}")
        
        return jsonify({'message': 'Grade released successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@grading_bp.route('/submissions/<submission_id>/hide', methods=['POST'])
@jwt_required()
def hide_grade(submission_id):
    """Hide a grade from the student"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check permissions
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] not in ['teacher', 'admin']:
            return jsonify({'error': 'Only teachers and admins can hide grades'}), 403
        
        submission = db.submissions.find_one({'_id': ObjectId(submission_id)})
        if not submission:
            return jsonify({'error': 'Submission not found'}), 404
        
        assignment = db.assignments.find_one({'_id': ObjectId(submission['assignment_id'])})
        course = db.courses.find_one({'_id': ObjectId(assignment['course_id'])})
        
        if user['role'] == 'teacher' and course['teacher_id'] != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Update submission
        db.submissions.update_one(
            {'_id': ObjectId(submission_id)},
            {'$set': {'grade_released': False, 'hidden_at': datetime.utcnow()}}
        )
        
        # Create audit log
        create_audit_log(db, 'hide_grade', user_id, submission_id, {
            'assignment_id': str(assignment['_id']),
            'student_id': submission['student_id']
        })
        
        return jsonify({'message': 'Grade hidden successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@grading_bp.route('/submissions/<submission_id>/finalize', methods=['POST'])
@jwt_required()
def finalize_grade(submission_id):
    """Mark a grade as final (cannot be changed without admin approval)"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check permissions
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] not in ['teacher', 'admin']:
            return jsonify({'error': 'Only teachers and admins can finalize grades'}), 403
        
        submission = db.submissions.find_one({'_id': ObjectId(submission_id)})
        if not submission:
            return jsonify({'error': 'Submission not found'}), 404
        
        if submission.get('status') != 'graded':
            return jsonify({'error': 'Submission must be graded first'}), 400
        
        assignment = db.assignments.find_one({'_id': ObjectId(submission['assignment_id'])})
        course = db.courses.find_one({'_id': ObjectId(assignment['course_id'])})
        
        if user['role'] == 'teacher' and course['teacher_id'] != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Update submission
        db.submissions.update_one(
            {'_id': ObjectId(submission_id)},
            {'$set': {
                'is_final': True,
                'finalized_at': datetime.utcnow(),
                'finalized_by': user_id
            }}
        )
        
        # Create audit log
        create_audit_log(db, 'finalize_grade', user_id, submission_id, {
            'assignment_id': str(assignment['_id']),
            'student_id': submission['student_id'],
            'grade': submission.get('grade')
        })
        
        return jsonify({'message': 'Grade finalized successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@grading_bp.route('/submissions/<submission_id>', methods=['GET'])
@jwt_required()
def get_submission_details(submission_id):
    """Get detailed submission information with permission checks"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        submission = db.submissions.find_one({'_id': ObjectId(submission_id)})
        if not submission:
            return jsonify({'error': 'Submission not found'}), 404
        
        assignment = db.assignments.find_one({'_id': ObjectId(submission['assignment_id'])})
        course = db.courses.find_one({'_id': ObjectId(assignment['course_id'])})
        
        # Permission check: only submitting student or course teacher can view
        is_student = user['role'] == 'student' and submission['student_id'] == user_id
        is_teacher = user['role'] == 'teacher' and course['teacher_id'] == user_id
        is_admin = user['role'] == 'admin'
        
        if not (is_student or is_teacher or is_admin):
            return jsonify({'error': 'Access denied - you do not have permission to view this submission'}), 403
        
        # Convert ObjectId to string
        submission['_id'] = str(submission['_id'])
        
        # Get student info
        student = db.users.find_one({'_id': ObjectId(submission['student_id'])})
        if student:
            submission['student_name'] = student.get('name', 'Unknown')
            submission['student_email'] = student.get('email', '')
            submission['student_roll_no'] = student.get('roll_no', '')
        
        # Add assignment info
        submission['assignment_title'] = assignment.get('title', '')
        submission['assignment_max_points'] = assignment.get('max_points', 100)
        submission['course_title'] = course.get('title', '')
        
        # If student, hide grade if not released
        if is_student and not submission.get('grade_released', True):
            submission.pop('grade', None)
            submission.pop('feedback', None)
            submission.pop('rubric_scores', None)
            submission['grade_status'] = 'pending_release'
        
        return jsonify({'submission': submission}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@grading_bp.route('/assignments/<assignment_id>/submissions', methods=['GET'])
@jwt_required()
def get_assignment_submissions(assignment_id):
    """Get all submissions for an assignment (teacher/admin only)"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] not in ['teacher', 'admin']:
            return jsonify({'error': 'Only teachers and admins can view all submissions'}), 403
        
        assignment = db.assignments.find_one({'_id': ObjectId(assignment_id)})
        if not assignment:
            return jsonify({'error': 'Assignment not found'}), 404
        
        course = db.courses.find_one({'_id': ObjectId(assignment['course_id'])})
        
        if user['role'] == 'teacher' and course['teacher_id'] != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Get all submissions
        submissions = list(db.submissions.find({'assignment_id': assignment_id}))
        
        # Enrich with student info
        for submission in submissions:
            submission['_id'] = str(submission['_id'])
            student = db.users.find_one({'_id': ObjectId(submission['student_id'])})
            if student:
                submission['student_name'] = student.get('name', 'Unknown')
                submission['student_email'] = student.get('email', '')
                submission['student_roll_no'] = student.get('roll_no', '')
        
        # Sort by submission time
        submissions.sort(key=lambda x: x.get('submitted_at', ''), reverse=True)
        
        return jsonify({
            'submissions': submissions,
            'total': len(submissions),
            'graded': len([s for s in submissions if s.get('status') == 'graded']),
            'pending': len([s for s in submissions if s.get('status') == 'submitted'])
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@grading_bp.route('/audit-logs/<submission_id>', methods=['GET'])
@jwt_required()
def get_grading_audit_logs(submission_id):
    """Get audit logs for a submission (teacher/admin only)"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] not in ['teacher', 'admin']:
            return jsonify({'error': 'Only teachers and admins can view audit logs'}), 403
        
        # Get audit logs
        logs = list(db.grading_audit_logs.find({'submission_id': submission_id}).sort('timestamp', -1))
        
        # Convert ObjectId to string and enrich with user info
        for log in logs:
            log['_id'] = str(log['_id'])
            grader = db.users.find_one({'_id': ObjectId(log['user_id'])})
            if grader:
                log['user_name'] = grader.get('name', 'Unknown')
        
        return jsonify({'audit_logs': logs}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
