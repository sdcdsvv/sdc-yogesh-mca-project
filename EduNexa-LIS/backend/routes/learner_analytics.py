from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime, timedelta
import statistics

learner_analytics_bp = Blueprint('learner_analytics', __name__)

def calculate_student_performance_score(student_data, course_id=None):
    """
    Calculate a comprehensive performance score for a student
    Returns a score between 0-100 where higher is better
    """
    score_components = []
    
    # Get student_id as string
    student_id = str(student_data['_id'])
    
    # Assignment performance (60% weight)
    assignment_scores = []
    assignment_filter = {'student_id': student_id}
    if course_id:
        assignment_filter['course_id'] = course_id
    
    submissions = list(current_app.db.submissions.find(assignment_filter))
    if submissions:
        graded_submissions = [sub for sub in submissions if sub.get('grade') is not None]
        if graded_submissions:
            assignment_scores = [sub['grade'] for sub in graded_submissions]
            avg_assignment_score = statistics.mean(assignment_scores)
            score_components.append(('assignment', avg_assignment_score, 0.6))
    
    # Course progress (40% weight)
    enrollment_filter = {'student_id': student_id}
    if course_id:
        enrollment_filter['course_id'] = course_id
    
    enrollments = list(current_app.db.enrollments.find(enrollment_filter))
    if enrollments:
        progress_scores = [enrollment.get('progress', 0) for enrollment in enrollments]
        avg_progress = statistics.mean(progress_scores)
        score_components.append(('progress', avg_progress, 0.4))
    
    # Calculate weighted average
    if not score_components:
        return 0
    
    total_weighted_score = sum(score * weight for _, score, weight in score_components)
    total_weight = sum(weight for _, _, weight in score_components)
    
    return total_weighted_score / total_weight if total_weight > 0 else 0

def get_learning_pace(student_data, course_id=None):
    """
    Determine learning pace based on completion time and activity patterns
    Returns: 'fast', 'normal', 'slow'
    """
    db = current_app.db
    
    # Get student_id as string
    student_id = str(student_data['_id'])
    
    # Get enrollment date and progress
    enrollment_filter = {'student_id': student_id}
    if course_id:
        enrollment_filter['course_id'] = course_id
    
    enrollments = list(db.enrollments.find(enrollment_filter))
    if not enrollments:
        return 'unknown'
    
    # Calculate average progress rate (progress per day)
    progress_rates = []
    total_progress = 0
    for enrollment in enrollments:
        enrollment_date = enrollment.get('enrolled_at', datetime.utcnow())
        current_progress = enrollment.get('progress', 0)
        total_progress += current_progress
        days_enrolled = max(1, (datetime.utcnow() - enrollment_date).days)
        progress_rate = current_progress / days_enrolled
        progress_rates.append(progress_rate)
    
    if not progress_rates:
        return 'unknown'
    
    avg_progress_rate = statistics.mean(progress_rates)
    avg_progress = total_progress / len(enrollments)
    
    # Get submission frequency and performance
    recent_submissions = list(db.submissions.find({
        'student_id': student_id,
        'submitted_at': {'$gte': datetime.utcnow() - timedelta(days=30)}
    }))
    
    submission_frequency = len(recent_submissions) / 30  # submissions per day
    
    # Get all submissions for grade analysis
    all_submissions = list(db.submissions.find({'student_id': student_id}))
    graded_submissions = [sub for sub in all_submissions if sub.get('grade') is not None]
    avg_grade = statistics.mean([sub['grade'] for sub in graded_submissions]) if graded_submissions else 0
    
    # More balanced classification logic
    # Fast learners: High progress OR good grades with activity OR high submission rate
    if (avg_progress_rate > 1.5 or 
        (avg_grade > 75 and submission_frequency > 0.1) or 
        submission_frequency > 0.2 or
        (avg_progress > 60 and len(recent_submissions) > 2)):
        return 'fast'
    
    # Slow learners: Low progress AND low activity OR very low grades
    elif (avg_progress_rate < 0.8 and submission_frequency < 0.1) or avg_grade < 50:
        return 'slow'
    
    else:
        return 'normal'

def get_areas_of_difficulty(student_data, course_id=None):
    """
    Identify areas where student is struggling
    """
    db = current_app.db
    difficulties = []
    
    # Get student_id as string
    student_id = str(student_data['_id'])
    
    # Overdue assignments
    overdue_assignments = list(db.assignments.find({
        'due_date': {'$lt': datetime.utcnow()},
        '_id': {'$nin': [
            ObjectId(sub['assignment_id']) for sub in 
            db.submissions.find({'student_id': student_id})
        ]}
    }))
    
    if overdue_assignments:
        difficulties.append({
            'type': 'assignment_completion',
            'description': f'{len(overdue_assignments)} overdue assignments'
        })
    
    # Low course progress
    low_progress_courses = []
    enrollments = list(db.enrollments.find({'student_id': student_id}))
    
    for enrollment in enrollments:
        if enrollment.get('progress', 0) < 30:  # Less than 30% progress
            course = db.courses.find_one({'_id': ObjectId(enrollment['course_id'])})
            if course:
                enrollment_days = (datetime.utcnow() - enrollment.get('enrolled_at', datetime.utcnow())).days
                if enrollment_days > 14:  # Enrolled for more than 2 weeks
                    low_progress_courses.append(course['title'])
    
    if low_progress_courses:
        difficulties.append({
            'type': 'course_progress',
            'description': f'Low progress in: {", ".join(low_progress_courses)}'
        })
    
    return difficulties

@learner_analytics_bp.route('/performance-analysis', methods=['GET'])
@jwt_required()
def get_performance_analysis():
    """
    Get comprehensive performance analysis for all students
    Accessible by teachers and super admins
    """
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check user permissions
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or user['role'] not in ['teacher', 'admin']:
            return jsonify({'error': 'Access denied. Teachers and admins only.'}), 403
        
        # Get query parameters
        course_id = request.args.get('course_id')
        performance_type = request.args.get('type', 'all')  # 'slow', 'fast', 'all'
        
        # Get students based on user role
        if user['role'] == 'teacher':
            # Teachers can only see students from their courses
            teacher_courses = list(db.courses.find({'teacher_id': user_id}))
            course_ids = [str(course['_id']) for course in teacher_courses]
            
            if course_id and course_id not in course_ids:
                return jsonify({'error': 'Access denied to this course'}), 403
            
            # Get students enrolled in teacher's courses
            enrollment_filter = {'course_id': {'$in': course_ids}}
            if course_id:
                enrollment_filter = {'course_id': course_id}
            
            enrollments = list(db.enrollments.find(enrollment_filter))
            student_ids = list(set([enrollment['student_id'] for enrollment in enrollments]))
            students = list(db.users.find({
                '_id': {'$in': [ObjectId(sid) for sid in student_ids]},
                'role': 'student'
            }))
        else:
            # Super admins can see all students
            student_filter = {'role': 'student'}
            students = list(db.users.find(student_filter))
        
        # Analyze each student
        student_analysis = []
        slow_learners = []
        fast_learners = []
        
        for student in students:
            student_id = str(student['_id'])
            
            # Calculate performance metrics
            performance_score = calculate_student_performance_score(student, course_id)
            learning_pace = get_learning_pace(student, course_id)
            difficulties = get_areas_of_difficulty(student, course_id)
            
            # Get recent activity
            recent_logins = db.users.find_one({'_id': student['_id']}).get('last_login')
            days_since_login = 0
            if recent_logins:
                days_since_login = (datetime.utcnow() - recent_logins).days
            
            # Get course-specific data if course_id is provided
            course_data = None
            if course_id:
                enrollment = db.enrollments.find_one({
                    'student_id': student_id,
                    'course_id': course_id
                })
                if enrollment:
                    course = db.courses.find_one({'_id': ObjectId(course_id)})
                    course_data = {
                        'course_name': course['title'] if course else 'Unknown',
                        'progress': enrollment.get('progress', 0),
                        'enrolled_at': enrollment.get('enrolled_at', datetime.utcnow()).isoformat()
                    }
            
            analysis = {
                'student_id': student_id,
                'student_name': student['name'],
                'email': student['email'],
                'department': student.get('department', 'N/A'),
                'year': student.get('year', 'N/A'),
                'roll_number': student.get('roll_number', 'N/A'),
                'performance_score': round(performance_score, 2),
                'learning_pace': learning_pace,
                'difficulties': difficulties,
                'days_since_login': days_since_login,
                'course_data': course_data,
                'risk_level': 'high' if performance_score < 50 or learning_pace == 'slow' else 
                            'medium' if performance_score < 70 else 'low'
            }
            
            student_analysis.append(analysis)
            
            # Categorize students (balanced criteria)
            # Slow learners: explicitly marked as slow OR low performance
            if learning_pace == 'slow' or performance_score < 55:
                slow_learners.append(analysis)
            # Fast learners: explicitly marked as fast OR good performance
            elif learning_pace == 'fast' or performance_score >= 70:
                fast_learners.append(analysis)
        
        # Sort by performance score
        student_analysis.sort(key=lambda x: x['performance_score'])
        slow_learners.sort(key=lambda x: x['performance_score'])
        fast_learners.sort(key=lambda x: x['performance_score'], reverse=True)
        
        # Filter based on requested type
        if performance_type == 'slow':
            filtered_students = slow_learners
        elif performance_type == 'fast':
            filtered_students = fast_learners
        else:
            filtered_students = student_analysis
        
        # Generate summary statistics
        total_students = len(student_analysis)
        summary = {
            'total_students': total_students,
            'slow_learners_count': len(slow_learners),
            'fast_learners_count': len(fast_learners),
            'average_performance': round(statistics.mean([s['performance_score'] for s in student_analysis]) if student_analysis else 0, 2),
            'students_at_risk': len([s for s in student_analysis if s['risk_level'] == 'high']),
            'inactive_students': len([s for s in student_analysis if s['days_since_login'] > 7])
        }
        
        return jsonify({
            'summary': summary,
            'students': filtered_students,
            'slow_learners': slow_learners[:10],  # Top 10 slow learners
            'fast_learners': fast_learners[:10],  # Top 10 fast learners
            'analysis_date': datetime.utcnow().isoformat(),
            'course_filter': course_id
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@learner_analytics_bp.route('/student-recommendations', methods=['GET'])
@jwt_required()
def get_student_recommendations():
    """
    Get personalized recommendations for improving student performance
    """
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check user permissions
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or user['role'] not in ['teacher', 'admin']:
            return jsonify({'error': 'Access denied. Teachers and admins only.'}), 403
        
        student_id = request.args.get('student_id')
        if not student_id:
            return jsonify({'error': 'Student ID is required'}), 400
        
        # Get student data
        student = db.users.find_one({'_id': ObjectId(student_id), 'role': 'student'})
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        # Check if teacher has access to this student
        if user['role'] == 'teacher':
            teacher_courses = list(db.courses.find({'teacher_id': user_id}))
            course_ids = [str(course['_id']) for course in teacher_courses]
            
            student_enrollments = list(db.enrollments.find({'student_id': student_id}))
            student_course_ids = [enrollment['course_id'] for enrollment in student_enrollments]
            
            # Check if student is enrolled in any of teacher's courses
            if not any(cid in course_ids for cid in student_course_ids):
                return jsonify({'error': 'Access denied to this student'}), 403
        
        # Analyze student performance
        performance_score = calculate_student_performance_score(student)
        learning_pace = get_learning_pace(student)
        difficulties = get_areas_of_difficulty(student)
        
        # Generate recommendations
        recommendations = []
        
        # Performance-based recommendations
        if performance_score < 50:
            recommendations.append({
                'type': 'urgent',
                'title': 'Immediate Intervention Required',
                'description': 'Student performance is critically low. Consider one-on-one tutoring or additional support.',
                'actions': [
                    'Schedule individual meeting with student',
                    'Provide additional study materials',
                    'Consider peer tutoring program',
                    'Review learning objectives and methods'
                ]
            })
        elif performance_score < 70:
            recommendations.append({
                'type': 'moderate',
                'title': 'Additional Support Recommended',
                'description': 'Student would benefit from extra guidance and practice.',
                'actions': [
                    'Provide supplementary exercises',
                    'Encourage participation in study groups',
                    'Offer office hours for questions',
                    'Monitor progress more closely'
                ]
            })
        
        # Pace-based recommendations
        if learning_pace == 'slow':
            recommendations.append({
                'type': 'pace',
                'title': 'Slow Learning Pace Detected',
                'description': 'Student may need more time or different learning approaches.',
                'actions': [
                    'Break down complex topics into smaller chunks',
                    'Provide extended deadlines when possible',
                    'Use visual aids and interactive content',
                    'Check for learning disabilities or barriers'
                ]
            })
        elif learning_pace == 'fast':
            recommendations.append({
                'type': 'enrichment',
                'title': 'Advanced Learner - Enrichment Opportunities',
                'description': 'Student is progressing quickly and may benefit from additional challenges.',
                'actions': [
                    'Provide advanced or bonus materials',
                    'Consider mentoring opportunities',
                    'Suggest additional projects or research',
                    'Explore leadership roles in group work'
                ]
            })
        
        # Difficulty-specific recommendations
        for difficulty in difficulties:
            if difficulty['type'] == 'assignment_completion':
                recommendations.append({
                    'type': 'behavioral',
                    'title': 'Assignment Completion Issues',
                    'description': difficulty['description'],
                    'actions': [
                        'Discuss time management strategies',
                        'Set up assignment reminders',
                        'Break assignments into smaller tasks',
                        'Address any personal barriers'
                    ]
                })
        
        # Engagement recommendations
        last_login = student.get('last_login')
        if last_login:
            days_inactive = (datetime.utcnow() - last_login).days
            if days_inactive > 7:
                recommendations.append({
                    'type': 'engagement',
                    'title': 'Low Engagement - Student Inactive',
                    'description': f'Student has not logged in for {days_inactive} days.',
                    'actions': [
                        'Send personalized check-in message',
                        'Call or email student directly',
                        'Identify barriers to participation',
                        'Provide flexible learning options'
                    ]
                })
        
        return jsonify({
            'student': {
                'id': student_id,
                'name': student['name'],
                'email': student['email'],
                'department': student.get('department', 'N/A'),
                'year': student.get('year', 'N/A')
            },
            'performance_metrics': {
                'performance_score': round(performance_score, 2),
                'learning_pace': learning_pace,
                'risk_level': 'high' if performance_score < 50 else 'medium' if performance_score < 70 else 'low'
            },
            'difficulties': difficulties,
            'recommendations': recommendations,
            'generated_at': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@learner_analytics_bp.route('/performance-alerts', methods=['GET'])
@jwt_required()
def get_performance_alerts():
    """
    Get real-time alerts about student performance issues
    """
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check user permissions
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or user['role'] not in ['teacher', 'admin']:
            return jsonify({'error': 'Access denied. Teachers and admins only.'}), 403
        
        alerts = []
        
        # Get students based on user role
        if user['role'] == 'teacher':
            teacher_courses = list(db.courses.find({'teacher_id': user_id}))
            course_ids = [str(course['_id']) for course in teacher_courses]
            enrollments = list(db.enrollments.find({'course_id': {'$in': course_ids}}))
            student_ids = [enrollment['student_id'] for enrollment in enrollments]
        else:
            # Super admin sees all students
            students = list(db.users.find({'role': 'student'}))
            student_ids = [str(student['_id']) for student in students]
        
        # Check for various alert conditions
        for student_id in student_ids:
            student = db.users.find_one({'_id': ObjectId(student_id)})
            if not student:
                continue
            
            # Alert: Student hasn't logged in for a week
            last_login = student.get('last_login')
            if last_login and (datetime.utcnow() - last_login).days >= 7:
                alerts.append({
                    'type': 'inactive',
                    'severity': 'medium',
                    'student_id': student_id,
                    'student_name': student['name'],
                    'message': f"{student['name']} hasn't logged in for {(datetime.utcnow() - last_login).days} days",
                    'created_at': datetime.utcnow().isoformat()
                })
            
            # Alert: Multiple low-grade assignments
            recent_submissions = list(db.submissions.find({
                'student_id': student_id,
                'submitted_at': {'$gte': datetime.utcnow() - timedelta(days=7)}
            }))
            
            failed_assignments = [sub for sub in recent_submissions if sub.get('grade') is not None and sub.get('grade') < 50]
            if len(failed_assignments) >= 2:
                alerts.append({
                    'type': 'academic',
                    'severity': 'high',
                    'student_id': student_id,
                    'student_name': student['name'],
                    'message': f"{student['name']} has {len(failed_assignments)} low-grade assignments in the past week",
                    'created_at': datetime.utcnow().isoformat()
                })
            
            # Alert: Overdue assignments
            student_submissions = list(db.submissions.find({'student_id': student_id}))
            submitted_assignment_ids = [sub['assignment_id'] for sub in student_submissions]
            
            # Get student's enrolled courses
            student_enrollments = list(db.enrollments.find({'student_id': student_id}))
            enrolled_course_ids = [enrollment['course_id'] for enrollment in student_enrollments]
            
            overdue_assignments = list(db.assignments.find({
                'course_id': {'$in': enrolled_course_ids},
                'due_date': {'$lt': datetime.utcnow()},
                '_id': {'$nin': [ObjectId(aid) for aid in submitted_assignment_ids]}
            }))
            
            if len(overdue_assignments) >= 2:
                alerts.append({
                    'type': 'deadline',
                    'severity': 'high',
                    'student_id': student_id,
                    'student_name': student['name'],
                    'message': f"{student['name']} has {len(overdue_assignments)} overdue assignments",
                    'created_at': datetime.utcnow().isoformat()
                })
            
            # Alert: Sudden drop in performance
            performance_score = calculate_student_performance_score(student)
            if performance_score < 40:
                alerts.append({
                    'type': 'performance',
                    'severity': 'high',
                    'student_id': student_id,
                    'student_name': student['name'],
                    'message': f"{student['name']} has critically low performance score: {performance_score:.1f}%",
                    'created_at': datetime.utcnow().isoformat()
                })
        
        # Sort alerts by severity and date
        severity_order = {'high': 0, 'medium': 1, 'low': 2}
        alerts.sort(key=lambda x: (severity_order.get(x['severity'], 3), x['created_at']), reverse=True)
        
        return jsonify({
            'alerts': alerts,
            'total_alerts': len(alerts),
            'high_priority': len([a for a in alerts if a['severity'] == 'high']),
            'medium_priority': len([a for a in alerts if a['severity'] == 'medium']),
            'generated_at': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500