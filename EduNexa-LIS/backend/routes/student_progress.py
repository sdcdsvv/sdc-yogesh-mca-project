from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime, timedelta

student_progress_bp = Blueprint('student_progress', __name__)

@student_progress_bp.route('/teacher/students', methods=['GET'])
@jwt_required()
def get_teacher_students_progress():
    """Get progress tracking for all students across teacher's courses"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Verify teacher role
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or user['role'] != 'teacher':
            return jsonify({'error': 'Teacher access required'}), 403
        
        # Get teacher's courses
        courses = list(db.courses.find({'teacher_id': user_id}))
        course_ids = [str(course['_id']) for course in courses]
        
        if not course_ids:
            return jsonify({'students': []}), 200
        
        # Get all enrollments for teacher's courses
        enrollments = list(db.enrollments.find({'course_id': {'$in': course_ids}}))
        
        # Build student progress data
        students_progress = []
        
        for enrollment in enrollments:
            student_id = enrollment['student_id']
            
            # Get student info
            student = db.users.find_one({'_id': ObjectId(student_id)})
            if not student:
                continue
            
            # Get course info
            course = db.courses.find_one({'_id': ObjectId(enrollment['course_id'])})
            if not course:
                continue
            
            # Get assignments for this course
            assignments = list(db.assignments.find({'course_id': enrollment['course_id']}))
            assignment_ids = [str(a['_id']) for a in assignments]
            
            # Get student's submissions
            submissions = list(db.submissions.find({
                'assignment_id': {'$in': assignment_ids},
                'student_id': student_id
            }))
            
            # Calculate assignment performance
            graded_submissions = [s for s in submissions if s.get('grade') is not None]
            avg_grade = sum([s['grade'] for s in graded_submissions]) / len(graded_submissions) if graded_submissions else 0
            
            # Get recent activity
            seven_days_ago = datetime.utcnow() - timedelta(days=7)
            recent_submissions = [s for s in submissions if s.get('submitted_at', datetime.min) >= seven_days_ago]
            
            # Calculate engagement score (0-100)
            engagement_score = 0
            if enrollment.get('progress', 0) > 0:
                engagement_score += 30
            if len(recent_submissions) > 0:
                engagement_score += 30
            if enrollment.get('progress', 0) >= 50:
                engagement_score += 20
            if len(submissions) >= len(assignments) * 0.8:
                engagement_score += 20
            
            student_progress = {
                'student_id': student_id,
                'student_name': student['name'],
                'student_email': student['email'],
                'roll_no': student.get('roll_no', ''),
                'department': student.get('department', ''),
                'course_id': enrollment['course_id'],
                'course_title': course['title'],
                'enrolled_at': enrollment['enrolled_at'],
                'progress': enrollment.get('progress', 0),
                'completed_materials': len(enrollment.get('completed_materials', [])),
                'total_materials': db.materials.count_documents({'course_id': enrollment['course_id']}),
                'assignments_submitted': len(submissions),
                'total_assignments': len(assignments),
                'average_grade': round(avg_grade, 2),
                'engagement_score': engagement_score,
                'last_activity': submissions[-1]['submitted_at'] if submissions else enrollment.get('enrolled_at'),
                'is_active': enrollment.get('is_active', True),
                'needs_attention': engagement_score < 40 or enrollment.get('progress', 0) < 20
            }
            
            students_progress.append(student_progress)
        
        students_progress.sort(key=lambda x: x['engagement_score'])
        
        return jsonify({'students': students_progress}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@student_progress_bp.route('/teacher/student/<student_id>', methods=['GET'])
@jwt_required()
def get_student_detailed_progress(student_id):
    """Get detailed progress tracking for a specific student"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Verify teacher role
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or user['role'] != 'teacher':
            return jsonify({'error': 'Teacher access required'}), 403
        
        # Get student info
        student = db.users.find_one({'_id': ObjectId(student_id)})
        if not student or student['role'] != 'student':
            return jsonify({'error': 'Student not found'}), 404
        
        # Get teacher's courses
        teacher_courses = list(db.courses.find({'teacher_id': user_id}))
        teacher_course_ids = [str(c['_id']) for c in teacher_courses]
        
        # Get student's enrollments in teacher's courses
        enrollments = list(db.enrollments.find({
            'student_id': student_id,
            'course_id': {'$in': teacher_course_ids}
        }))
        
        if not enrollments:
            return jsonify({'error': 'Student not enrolled in any of your courses'}), 404
        
        # Build detailed progress data
        course_progress = []
        
        for enrollment in enrollments:
            course = db.courses.find_one({'_id': ObjectId(enrollment['course_id'])})
            if not course:
                continue
            
            # Get materials progress
            materials = list(db.materials.find({'course_id': enrollment['course_id']}))
            completed_materials = enrollment.get('completed_materials', [])
            
            # Get video watch progress
            video_materials = [m for m in materials if m.get('type') == 'video']
            video_progress = []
            
            for video in video_materials:
                watch_data = db.watch_progress.find_one({
                    'student_id': student_id,
                    'material_id': str(video['_id'])
                })
                
                video_progress.append({
                    'video_id': str(video['_id']),
                    'video_title': video['title'],
                    'watch_time': watch_data.get('watch_time', 0) if watch_data else 0,
                    'total_duration': watch_data.get('total_duration', 0) if watch_data else 0,
                    'progress_percentage': watch_data.get('progress_percentage', 0) if watch_data else 0,
                    'last_watched': watch_data.get('last_watched') if watch_data else None,
                    'completed': str(video['_id']) in completed_materials
                })
            
            # Get assignments progress
            assignments = list(db.assignments.find({'course_id': enrollment['course_id']}))
            assignment_ids = [str(a['_id']) for a in assignments]
            
            submissions = list(db.submissions.find({
                'assignment_id': {'$in': assignment_ids},
                'student_id': student_id
            }))
            
            assignment_progress = []
            for assignment in assignments:
                submission = next((s for s in submissions if s['assignment_id'] == str(assignment['_id'])), None)
                
                assignment_progress.append({
                    'assignment_id': str(assignment['_id']),
                    'assignment_title': assignment['title'],
                    'due_date': assignment['due_date'],
                    'max_points': assignment.get('max_points', 100),
                    'submitted': submission is not None,
                    'submitted_at': submission.get('submitted_at') if submission else None,
                    'grade': submission.get('grade') if submission else None,
                    'feedback': submission.get('feedback') if submission else None,
                    'status': submission.get('status', 'not_submitted') if submission else 'not_submitted',
                    'is_late': submission.get('submitted_at', datetime.max) > assignment['due_date'] if submission else False
                })
            
            # Calculate performance metrics
            graded_submissions = [s for s in submissions if s.get('grade') is not None]
            avg_grade = sum([s['grade'] for s in graded_submissions]) / len(graded_submissions) if graded_submissions else 0
            
            # Calculate time spent (from video watch data)
            total_watch_time = sum([vp['watch_time'] for vp in video_progress])
            
            course_progress.append({
                'course_id': enrollment['course_id'],
                'course_title': course['title'],
                'enrolled_at': enrollment['enrolled_at'],
                'overall_progress': enrollment.get('progress', 0),
                'materials': {
                    'total': len(materials),
                    'completed': len(completed_materials),
                    'completion_rate': (len(completed_materials) / len(materials) * 100) if materials else 0
                },
                'videos': {
                    'total': len(video_materials),
                    'progress': video_progress,
                    'total_watch_time_minutes': round(total_watch_time / 60, 2)
                },
                'assignments': {
                    'total': len(assignments),
                    'submitted': len(submissions),
                    'graded': len(graded_submissions),
                    'average_grade': round(avg_grade, 2),
                    'progress': assignment_progress
                },
                'performance_metrics': {
                    'engagement_rate': (len(submissions) / len(assignments) * 100) if assignments else 0,
                    'completion_rate': enrollment.get('progress', 0),
                    'average_grade': round(avg_grade, 2),
                    'time_spent_minutes': round(total_watch_time / 60, 2)
                }
            })
        
        # Calculate overall student metrics across all courses
        total_progress = sum([cp['overall_progress'] for cp in course_progress])
        avg_progress = total_progress / len(course_progress) if course_progress else 0
        
        all_grades = []
        for cp in course_progress:
            for ap in cp['assignments']['progress']:
                if ap['grade'] is not None:
                    all_grades.append(ap['grade'])
        
        overall_avg_grade = sum(all_grades) / len(all_grades) if all_grades else 0
        
        student_data = {
            'student_id': student_id,
            'student_name': student['name'],
            'student_email': student['email'],
            'roll_no': student.get('roll_no', ''),
            'department': student.get('department', ''),
            'courses_enrolled': len(enrollments),
            'average_progress': round(avg_progress, 2),
            'overall_average_grade': round(overall_avg_grade, 2),
            'course_progress': course_progress
        }
        
        return jsonify({'student_progress': student_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@student_progress_bp.route('/teacher/course/<course_id>/progress', methods=['GET'])
@jwt_required()
def get_course_students_progress(course_id):
    """Get progress tracking for all students in a specific course"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Verify teacher role and course ownership
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or user['role'] != 'teacher':
            return jsonify({'error': 'Teacher access required'}), 403
        
        course = db.courses.find_one({'_id': ObjectId(course_id)})
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        if course['teacher_id'] != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Get all enrollments for this course
        enrollments = list(db.enrollments.find({'course_id': course_id}))
        
        # Get course materials and assignments
        materials = list(db.materials.find({'course_id': course_id}))
        assignments = list(db.assignments.find({'course_id': course_id}))
        assignment_ids = [str(a['_id']) for a in assignments]
        
        # Build student progress data
        students_progress = []
        
        for enrollment in enrollments:
            student_id = enrollment['student_id']
            student = db.users.find_one({'_id': ObjectId(student_id)})
            
            if not student:
                continue
            
            # Get student's submissions
            submissions = list(db.submissions.find({
                'assignment_id': {'$in': assignment_ids},
                'student_id': student_id
            }))
            
            # Calculate metrics
            graded_submissions = [s for s in submissions if s.get('grade') is not None]
            avg_grade = sum([s['grade'] for s in graded_submissions]) / len(graded_submissions) if graded_submissions else 0
            
            # Get recent activity
            seven_days_ago = datetime.utcnow() - timedelta(days=7)
            recent_activity = len([s for s in submissions if s.get('submitted_at', datetime.min) >= seven_days_ago])
            
            # Calculate engagement metrics
            material_completion = (len(enrollment.get('completed_materials', [])) / len(materials) * 100) if materials else 0
            assignment_completion = (len(submissions) / len(assignments) * 100) if assignments else 0
            
            students_progress.append({
                'student_id': student_id,
                'student_name': student['name'],
                'student_email': student['email'],
                'roll_no': student.get('roll_no', ''),
                'enrolled_at': enrollment['enrolled_at'],
                'overall_progress': enrollment.get('progress', 0),
                'material_completion': round(material_completion, 2),
                'assignment_completion': round(assignment_completion, 2),
                'assignments_submitted': len(submissions),
                'assignments_graded': len(graded_submissions),
                'average_grade': round(avg_grade, 2),
                'recent_activity_count': recent_activity,
                'last_activity': submissions[-1]['submitted_at'] if submissions else enrollment.get('enrolled_at'),
                'is_active': enrollment.get('is_active', True)
            })
        
        students_progress.sort(key=lambda x: x['overall_progress'])
        
        # Calculate course-wide statistics
        course_stats = {
            'total_students': len(students_progress),
            'average_progress': round(sum([s['overall_progress'] for s in students_progress]) / len(students_progress), 2) if students_progress else 0,
            'average_grade': round(sum([s['average_grade'] for s in students_progress if s['average_grade'] > 0]) / len([s for s in students_progress if s['average_grade'] > 0]), 2) if any(s['average_grade'] > 0 for s in students_progress) else 0,
            'active_students': len([s for s in students_progress if s['recent_activity_count'] > 0]),
            'struggling_students': len([s for s in students_progress if s['overall_progress'] < 30]),
            'excelling_students': len([s for s in students_progress if s['overall_progress'] >= 80])
        }
        
        return jsonify({
            'course_id': course_id,
            'course_title': course['title'],
            'statistics': course_stats,
            'students': students_progress
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@student_progress_bp.route('/teacher/engagement/alerts', methods=['GET'])
@jwt_required()
def get_engagement_alerts():
    """Get real-time engagement alerts for students needing attention"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Verify teacher role
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or user['role'] != 'teacher':
            return jsonify({'error': 'Teacher access required'}), 403
        
        # Get teacher's courses
        courses = list(db.courses.find({'teacher_id': user_id}))
        course_ids = [str(course['_id']) for course in courses]
        
        if not course_ids:
            return jsonify({'alerts': []}), 200
        
        # Get all enrollments
        enrollments = list(db.enrollments.find({'course_id': {'$in': course_ids}}))
        
        alerts = []
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        fourteen_days_ago = datetime.utcnow() - timedelta(days=14)
        
        for enrollment in enrollments:
            student_id = enrollment['student_id']
            course_id = enrollment['course_id']
            
            # Get student and course info
            student = db.users.find_one({'_id': ObjectId(student_id)})
            course = db.courses.find_one({'_id': ObjectId(course_id)})
            
            if not student or not course:
                continue
            
            # Get assignments for this course
            assignments = list(db.assignments.find({'course_id': course_id}))
            assignment_ids = [str(a['_id']) for a in assignments]
            
            # Get student's submissions
            submissions = list(db.submissions.find({
                'assignment_id': {'$in': assignment_ids},
                'student_id': student_id
            }))
            
            # Check for various alert conditions
            alert_reasons = []
            alert_severity = 'low'
            
            # 1. No recent activity (14+ days)
            recent_submissions = [s for s in submissions if s.get('submitted_at', datetime.min) >= fourteen_days_ago]
            if len(recent_submissions) == 0 and len(submissions) > 0:
                alert_reasons.append('No activity in 14+ days')
                alert_severity = 'high'
            elif len([s for s in submissions if s.get('submitted_at', datetime.min) >= seven_days_ago]) == 0:
                alert_reasons.append('No activity in 7+ days')
                alert_severity = 'medium' if alert_severity == 'low' else alert_severity
            
            # 2. Low progress (< 20%)
            if enrollment.get('progress', 0) < 20:
                alert_reasons.append(f'Low progress ({enrollment.get("progress", 0):.1f}%)')
                alert_severity = 'high'
            elif enrollment.get('progress', 0) < 40:
                alert_reasons.append(f'Below average progress ({enrollment.get("progress", 0):.1f}%)')
                alert_severity = 'medium' if alert_severity == 'low' else alert_severity
            
            # 3. Low assignment completion (< 50%)
            if len(assignments) > 0:
                completion_rate = (len(submissions) / len(assignments)) * 100
                if completion_rate < 50:
                    alert_reasons.append(f'Low assignment completion ({completion_rate:.1f}%)')
                    alert_severity = 'high' if completion_rate < 30 else ('medium' if alert_severity == 'low' else alert_severity)
            
            # 4. Failing grades (average < 60)
            graded_submissions = [s for s in submissions if s.get('grade') is not None]
            if graded_submissions:
                avg_grade = sum([s['grade'] for s in graded_submissions]) / len(graded_submissions)
                if avg_grade < 60:
                    alert_reasons.append(f'Low average grade ({avg_grade:.1f})')
                    alert_severity = 'high'
                elif avg_grade < 70:
                    alert_reasons.append(f'Below average grade ({avg_grade:.1f})')
                    alert_severity = 'medium' if alert_severity == 'low' else alert_severity
            
            # 5. Missing recent assignments
            recent_assignments = [a for a in assignments if datetime.fromisoformat(a['due_date'].replace('Z', '+00:00')) >= seven_days_ago]
            recent_assignment_ids = [str(a['_id']) for a in recent_assignments]
            recent_assignment_submissions = [s for s in submissions if s['assignment_id'] in recent_assignment_ids]
            
            if len(recent_assignments) > 0 and len(recent_assignment_submissions) < len(recent_assignments):
                missing_count = len(recent_assignments) - len(recent_assignment_submissions)
                alert_reasons.append(f'{missing_count} recent assignment(s) not submitted')
                alert_severity = 'medium' if alert_severity == 'low' else alert_severity
            
            # Only create alert if there are reasons
            if alert_reasons:
                alerts.append({
                    'student_id': student_id,
                    'student_name': student['name'],
                    'student_email': student['email'],
                    'roll_no': student.get('roll_no', ''),
                    'course_id': course_id,
                    'course_title': course['title'],
                    'alert_severity': alert_severity,
                    'alert_reasons': alert_reasons,
                    'progress': enrollment.get('progress', 0),
                    'last_activity': submissions[-1]['submitted_at'] if submissions else enrollment.get('enrolled_at'),
                    'assignments_completed': len(submissions),
                    'total_assignments': len(assignments),
                    'created_at': datetime.utcnow()
                })
        
        # Sort by severity (high first) and then by progress (lowest first)
        severity_order = {'high': 0, 'medium': 1, 'low': 2}
        alerts.sort(key=lambda x: (severity_order[x['alert_severity']], x['progress']))
        
        return jsonify({'alerts': alerts, 'total_alerts': len(alerts)}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@student_progress_bp.route('/teacher/engagement/summary', methods=['GET'])
@jwt_required()
def get_engagement_summary():
    """Get real-time engagement summary across all courses"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Verify teacher role
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or user['role'] != 'teacher':
            return jsonify({'error': 'Teacher access required'}), 403
        
        # Get teacher's courses
        courses = list(db.courses.find({'teacher_id': user_id}))
        course_ids = [str(course['_id']) for course in courses]
        
        if not course_ids:
            return jsonify({
                'summary': {
                    'total_students': 0,
                    'active_students': 0,
                    'at_risk_students': 0,
                    'inactive_students': 0,
                    'average_engagement': 0,
                    'engagement_trend': 'stable'
                }
            }), 200
        
        # Get all enrollments
        enrollments = list(db.enrollments.find({'course_id': {'$in': course_ids}}))
        
        # Calculate engagement metrics
        total_students = len(enrollments)
        active_students = 0
        at_risk_students = 0
        inactive_students = 0
        
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        fourteen_days_ago = datetime.utcnow() - timedelta(days=14)
        
        for enrollment in enrollments:
            student_id = enrollment['student_id']
            course_id = enrollment['course_id']
            
            # Get assignments and submissions
            assignments = list(db.assignments.find({'course_id': course_id}))
            assignment_ids = [str(a['_id']) for a in assignments]
            
            submissions = list(db.submissions.find({
                'assignment_id': {'$in': assignment_ids},
                'student_id': student_id
            }))
            
            # Determine student status
            recent_activity = any(s.get('submitted_at', datetime.min) >= seven_days_ago for s in submissions)
            progress = enrollment.get('progress', 0)
            
            if not recent_activity and len(submissions) > 0:
                # Check if completely inactive (14+ days)
                very_old_activity = all(s.get('submitted_at', datetime.min) < fourteen_days_ago for s in submissions)
                if very_old_activity:
                    inactive_students += 1
                else:
                    at_risk_students += 1
            elif progress < 30 or (len(assignments) > 0 and len(submissions) / len(assignments) < 0.5):
                at_risk_students += 1
            else:
                active_students += 1
        
        # Calculate average engagement score
        total_engagement = 0
        for enrollment in enrollments:
            student_id = enrollment['student_id']
            course_id = enrollment['course_id']
            
            assignments = list(db.assignments.find({'course_id': course_id}))
            assignment_ids = [str(a['_id']) for a in assignments]
            
            submissions = list(db.submissions.find({
                'assignment_id': {'$in': assignment_ids},
                'student_id': student_id
            }))
            
            # Calculate engagement score (0-100)
            engagement_score = 0
            if enrollment.get('progress', 0) > 0:
                engagement_score += 30
            
            recent_submissions = [s for s in submissions if s.get('submitted_at', datetime.min) >= seven_days_ago]
            if len(recent_submissions) > 0:
                engagement_score += 30
            
            if enrollment.get('progress', 0) >= 50:
                engagement_score += 20
            
            if len(assignments) > 0 and len(submissions) >= len(assignments) * 0.8:
                engagement_score += 20
            
            total_engagement += engagement_score
        
        average_engagement = total_engagement / total_students if total_students > 0 else 0
        
        # Determine engagement trend (would need historical data for accurate trend)
        engagement_trend = 'stable'
        if average_engagement >= 70:
            engagement_trend = 'improving'
        elif average_engagement < 50:
            engagement_trend = 'declining'
        
        summary = {
            'total_students': total_students,
            'active_students': active_students,
            'at_risk_students': at_risk_students,
            'inactive_students': inactive_students,
            'average_engagement': round(average_engagement, 2),
            'engagement_rate': round((active_students / total_students * 100), 2) if total_students > 0 else 0,
            'at_risk_rate': round((at_risk_students / total_students * 100), 2) if total_students > 0 else 0,
            'engagement_trend': engagement_trend,
            'last_updated': datetime.utcnow()
        }
        
        return jsonify({'summary': summary}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@student_progress_bp.route('/teacher/engagement/course/<course_id>/monitor', methods=['GET'])
@jwt_required()
def monitor_course_engagement(course_id):
    """Monitor real-time engagement for a specific course"""
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Verify teacher role and course ownership
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or user['role'] != 'teacher':
            return jsonify({'error': 'Teacher access required'}), 403
        
        course = db.courses.find_one({'_id': ObjectId(course_id)})
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        if course['teacher_id'] != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Get enrollments
        enrollments = list(db.enrollments.find({'course_id': course_id}))
        
        # Get assignments
        assignments = list(db.assignments.find({'course_id': course_id}))
        assignment_ids = [str(a['_id']) for a in assignments]
        
        # Calculate real-time metrics
        engagement_data = {
            'course_id': course_id,
            'course_title': course['title'],
            'total_students': len(enrollments),
            'engagement_breakdown': {
                'highly_engaged': 0,
                'moderately_engaged': 0,
                'low_engagement': 0,
                'inactive': 0
            },
            'recent_activity': [],
            'engagement_by_time': {
                'last_24h': 0,
                'last_7d': 0,
                'last_30d': 0
            }
        }
        
        now = datetime.utcnow()
        one_day_ago = now - timedelta(days=1)
        seven_days_ago = now - timedelta(days=7)
        thirty_days_ago = now - timedelta(days=30)
        
        for enrollment in enrollments:
            student_id = enrollment['student_id']
            student = db.users.find_one({'_id': ObjectId(student_id)})
            
            if not student:
                continue
            
            # Get submissions
            submissions = list(db.submissions.find({
                'assignment_id': {'$in': assignment_ids},
                'student_id': student_id
            }))
            
            # Calculate engagement level
            progress = enrollment.get('progress', 0)
            recent_submissions = [s for s in submissions if s.get('submitted_at', datetime.min) >= seven_days_ago]
            
            engagement_score = 0
            if progress > 0:
                engagement_score += 30
            if len(recent_submissions) > 0:
                engagement_score += 30
            if progress >= 50:
                engagement_score += 20
            if len(assignments) > 0 and len(submissions) >= len(assignments) * 0.8:
                engagement_score += 20
            
            # Categorize engagement
            if engagement_score >= 80:
                engagement_data['engagement_breakdown']['highly_engaged'] += 1
            elif engagement_score >= 50:
                engagement_data['engagement_breakdown']['moderately_engaged'] += 1
            elif engagement_score >= 30:
                engagement_data['engagement_breakdown']['low_engagement'] += 1
            else:
                engagement_data['engagement_breakdown']['inactive'] += 1
            
            # Track recent activity
            for submission in submissions:
                submitted_at = submission.get('submitted_at', datetime.min)
                if submitted_at >= one_day_ago:
                    engagement_data['engagement_by_time']['last_24h'] += 1
                if submitted_at >= seven_days_ago:
                    engagement_data['engagement_by_time']['last_7d'] += 1
                if submitted_at >= thirty_days_ago:
                    engagement_data['engagement_by_time']['last_30d'] += 1
                
                # Add to recent activity list (last 10)
                if submitted_at >= seven_days_ago and len(engagement_data['recent_activity']) < 10:
                    assignment = next((a for a in assignments if str(a['_id']) == submission['assignment_id']), None)
                    if assignment:
                        engagement_data['recent_activity'].append({
                            'student_name': student['name'],
                            'activity_type': 'assignment_submission',
                            'assignment_title': assignment['title'],
                            'timestamp': submitted_at,
                            'grade': submission.get('grade')
                        })
        
        # Sort recent activity by timestamp
        engagement_data['recent_activity'].sort(key=lambda x: x['timestamp'], reverse=True)
        
        return jsonify({'engagement_data': engagement_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
