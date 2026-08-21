from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime, timedelta
from collections import defaultdict

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/teacher/dashboard', methods=['GET'])
@jwt_required()
def get_teacher_dashboard_stats():
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get user and verify teacher role
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or user['role'] != 'teacher':
            return jsonify({'error': 'Teacher access required'}), 403
        
        # Get teacher's courses
        courses = list(db.courses.find({'teacher_id': user_id}))
        course_ids = [str(course['_id']) for course in courses]
        
        # Calculate active courses count
        active_courses = len([c for c in courses if c.get('is_active', True)])
        
        # Calculate total enrolled students across all courses
        total_students = 0
        if course_ids:
            total_students = db.enrollments.count_documents({'course_id': {'$in': course_ids}})
        
        # Get assignments created by teacher
        assignments = list(db.assignments.find({'course_id': {'$in': course_ids}}))
        assignment_ids = [str(assignment['_id']) for assignment in assignments]
        
        # Calculate pending assignments (submissions without grades)
        pending_grades = 0
        if assignment_ids:
            pending_grades = db.submissions.count_documents({
                'assignment_id': {'$in': assignment_ids},
                'grade': None
            })
        
        # Calculate average course ratings (placeholder - would need rating system)
        # For now, we'll calculate based on course completion rates as a proxy
        course_rating = 0.0
        if courses and course_ids:
            # Calculate average completion rate across courses as rating proxy
            total_completion = 0
            rated_courses = 0
            
            for course_id in course_ids:
                enrollments = list(db.enrollments.find({'course_id': course_id}))
                if enrollments:
                    avg_progress = sum([e.get('progress', 0) for e in enrollments]) / len(enrollments)
                    total_completion += avg_progress
                    rated_courses += 1
            
            if rated_courses > 0:
                # Convert completion percentage to 5-star rating (0-100% -> 0-5 stars)
                course_rating = (total_completion / rated_courses) * 5 / 100
        
        # Get recent activity data for monthly growth calculation
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        # Monthly growth in courses
        recent_courses = db.courses.count_documents({
            'teacher_id': user_id,
            'created_at': {'$gte': thirty_days_ago}
        })
        
        # Monthly growth in students (new enrollments)
        recent_enrollments = 0
        if course_ids:
            recent_enrollments = db.enrollments.count_documents({
                'course_id': {'$in': course_ids},
                'enrolled_at': {'$gte': thirty_days_ago}
            })
        
        # Calculate rating change (placeholder - would need historical data)
        rating_change = 0.0  # Would calculate from previous period's rating
        
        dashboard_stats = {
            'active_courses': active_courses,
            'total_students': total_students,
            'pending_grades': pending_grades,
            'course_rating': round(course_rating, 2),
            'monthly_growth': {
                'courses': recent_courses,
                'students': recent_enrollments,
                'rating_change': rating_change
            }
        }
        
        return jsonify({'dashboard_stats': dashboard_stats}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/teacher/assignments', methods=['GET'])
@jwt_required()
def get_teacher_assignment_stats():
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get user and verify teacher role
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or user['role'] != 'teacher':
            return jsonify({'error': 'Teacher access required'}), 403
        
        # Get teacher's courses
        courses = list(db.courses.find({'teacher_id': user_id}))
        course_ids = [str(course['_id']) for course in courses]
        
        if not course_ids:
            return jsonify({
                'assignment_stats': {
                    'total_assignments': 0,
                    'pending_submissions': 0,
                    'graded_submissions': 0,
                    'completion_rate': 0,
                    'average_grade': 0,
                    'grading_workload': [],
                    'assignment_performance': []
                }
            }), 200
        
        # Get all assignments for teacher's courses
        assignments = list(db.assignments.find({'course_id': {'$in': course_ids}}))
        assignment_ids = [str(assignment['_id']) for assignment in assignments]
        
        # Get all submissions for these assignments
        submissions = list(db.submissions.find({'assignment_id': {'$in': assignment_ids}}))
        
        # Calculate basic statistics
        total_assignments = len(assignments)
        total_submissions = len(submissions)
        pending_submissions = len([s for s in submissions if s.get('grade') is None])
        graded_submissions = len([s for s in submissions if s.get('grade') is not None])
        
        # Calculate completion rate
        total_possible_submissions = 0
        for assignment in assignments:
            course_enrollments = db.enrollments.count_documents({'course_id': assignment['course_id']})
            total_possible_submissions += course_enrollments
        
        completion_rate = (total_submissions / total_possible_submissions * 100) if total_possible_submissions > 0 else 0
        
        # Calculate average grade
        graded_subs = [s for s in submissions if s.get('grade') is not None]
        average_grade = sum([s['grade'] for s in graded_subs]) / len(graded_subs) if graded_subs else 0
        
        # Grading workload - assignments with pending submissions
        grading_workload = []
        for assignment in assignments:
            assignment_submissions = [s for s in submissions if s['assignment_id'] == str(assignment['_id'])]
            pending_count = len([s for s in assignment_submissions if s.get('grade') is None])
            
            if pending_count > 0:
                course = db.courses.find_one({'_id': ObjectId(assignment['course_id'])})
                grading_workload.append({
                    'assignment_id': str(assignment['_id']),
                    'assignment_title': assignment['title'],
                    'course_title': course['title'] if course else 'Unknown Course',
                    'due_date': assignment['due_date'],
                    'pending_submissions': pending_count,
                    'total_submissions': len(assignment_submissions),
                    'priority': 'high' if pending_count > 10 else 'medium' if pending_count > 5 else 'low'
                })
        
        # Sort by pending submissions (highest first)
        grading_workload.sort(key=lambda x: x['pending_submissions'], reverse=True)
        
        # Assignment performance analysis
        assignment_performance = []
        for assignment in assignments:
            assignment_submissions = [s for s in submissions if s['assignment_id'] == str(assignment['_id'])]
            graded_assignment_subs = [s for s in assignment_submissions if s.get('grade') is not None]
            
            course = db.courses.find_one({'_id': ObjectId(assignment['course_id'])})
            course_enrollments = db.enrollments.count_documents({'course_id': assignment['course_id']})
            
            # Calculate assignment statistics
            submission_rate = (len(assignment_submissions) / course_enrollments * 100) if course_enrollments > 0 else 0
            avg_assignment_grade = sum([s['grade'] for s in graded_assignment_subs]) / len(graded_assignment_subs) if graded_assignment_subs else 0
            
            assignment_performance.append({
                'assignment_id': str(assignment['_id']),
                'assignment_title': assignment['title'],
                'course_title': course['title'] if course else 'Unknown Course',
                'max_points': assignment.get('max_points', 100),
                'total_submissions': len(assignment_submissions),
                'graded_submissions': len(graded_assignment_subs),
                'submission_rate': round(submission_rate, 2),
                'average_grade': round(avg_assignment_grade, 2),
                'grade_percentage': round((avg_assignment_grade / assignment.get('max_points', 100)) * 100, 2) if assignment.get('max_points', 100) > 0 else 0,
                'due_date': assignment['due_date'],
                'created_at': assignment['created_at']
            })
        
        # Sort by creation date (newest first)
        assignment_performance.sort(key=lambda x: x['created_at'], reverse=True)
        
        assignment_stats = {
            'total_assignments': total_assignments,
            'pending_submissions': pending_submissions,
            'graded_submissions': graded_submissions,
            'completion_rate': round(completion_rate, 2),
            'average_grade': round(average_grade, 2),
            'grading_workload': grading_workload[:10],  # Top 10 assignments needing attention
            'assignment_performance': assignment_performance
        }
        
        return jsonify({'assignment_stats': assignment_stats}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_analytics():
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get user to check role
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        analytics_data = {}
        
        if user['role'] == 'student':
            # Student analytics
            enrollments = list(db.enrollments.find({'student_id': user_id}))
            
            # Course progress
            course_progress = []
            total_progress = 0
            for enrollment in enrollments:
                course = db.courses.find_one({'_id': ObjectId(enrollment['course_id'])})
                if course:
                    progress = enrollment.get('progress', 0)
                    course_progress.append({
                        'course_title': course['title'],
                        'progress': progress
                    })
                    total_progress += progress
            
            avg_progress = total_progress / len(enrollments) if enrollments else 0
            

            
            # Assignment submissions
            submissions = list(db.submissions.find({'student_id': user_id}))
            graded_submissions = [s for s in submissions if s.get('grade') is not None]
            assignment_grades = [s.get('grade', 0) for s in graded_submissions]
            avg_assignment_grade = sum(assignment_grades) / len(assignment_grades) if assignment_grades else 0
            
            # Recent activity
            recent_activities = []
            

            
            # Recent submissions
            recent_submissions = sorted(submissions, key=lambda x: x['submitted_at'], reverse=True)[:5]
            for submission in recent_submissions:
                assignment = db.assignments.find_one({'_id': ObjectId(submission['assignment_id'])})
                if assignment:
                    recent_activities.append({
                        'type': 'assignment',
                        'title': f"Submitted: {assignment['title']}",
                        'status': submission.get('status', 'submitted'),
                        'date': submission['submitted_at']
                    })
            
            # Sort recent activities by date
            recent_activities.sort(key=lambda x: x['date'], reverse=True)
            recent_activities = recent_activities[:10]
            
            analytics_data = {
                'enrolled_courses': len(enrollments),
                'average_progress': round(avg_progress, 2),
                'total_points': user.get('total_points', 0),

                'assignments_submitted': len(submissions),
                'average_assignment_grade': round(avg_assignment_grade, 2),
                'course_progress': course_progress,
                'recent_activities': recent_activities
            }
            
        elif user['role'] == 'teacher':
            # Teacher analytics
            courses = list(db.courses.find({'teacher_id': user_id}))
            course_ids = [str(course['_id']) for course in courses]
            
            # Total enrollments across all courses
            total_enrollments = db.enrollments.count_documents({'course_id': {'$in': course_ids}})
            
            # Assignments and submissions
            assignments = list(db.assignments.find({'course_id': {'$in': course_ids}}))
            assignment_ids = [str(assignment['_id']) for assignment in assignments]
            total_submissions = db.submissions.count_documents({'assignment_id': {'$in': assignment_ids}})
            

            
            # Course-wise enrollment
            course_enrollments = []
            for course in courses:
                enrollment_count = db.enrollments.count_documents({'course_id': str(course['_id'])})
                course_enrollments.append({
                    'course_title': course['title'],
                    'enrollments': enrollment_count
                })
            
            # Recent student activity
            recent_submissions = list(db.submissions.find({'assignment_id': {'$in': assignment_ids}})
                                    .sort('submitted_at', -1).limit(10))
            
            recent_activities = []
            for submission in recent_submissions:
                assignment = db.assignments.find_one({'_id': ObjectId(submission['assignment_id'])})
                student = db.users.find_one({'_id': ObjectId(submission['student_id'])})
                if assignment and student:
                    recent_activities.append({
                        'type': 'submission',
                        'student_name': student['name'],
                        'assignment_title': assignment['title'],
                        'submitted_at': submission['submitted_at'],
                        'status': submission.get('status', 'submitted')
                    })
            
            analytics_data = {
                'courses_created': len(courses),
                'total_students': total_enrollments,
                'assignments_created': len(assignments),
                'total_submissions': total_submissions,

                'course_enrollments': course_enrollments,
                'recent_activities': recent_activities
            }
            
        elif user['role'] == 'admin':
            # Admin analytics
            total_users = db.users.count_documents({})
            total_students = db.users.count_documents({'role': 'student'})
            total_teachers = db.users.count_documents({'role': 'teacher'})
            total_courses = db.courses.count_documents({})
            total_enrollments = db.enrollments.count_documents({})
            
            # Recent registrations (last 30 days)
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            recent_registrations = db.users.count_documents({
                'created_at': {'$gte': thirty_days_ago}
            })
            
            # Course popularity
            pipeline = [
                {'$group': {'_id': '$course_id', 'count': {'$sum': 1}}},
                {'$sort': {'count': -1}},
                {'$limit': 10}
            ]
            popular_courses_data = list(db.enrollments.aggregate(pipeline))
            
            popular_courses = []
            for item in popular_courses_data:
                course = db.courses.find_one({'_id': ObjectId(item['_id'])})
                if course:
                    popular_courses.append({
                        'course_title': course['title'],
                        'enrollments': item['count']
                    })
            
            # Department distribution
            dept_pipeline = [
                {'$match': {'role': {'$in': ['student', 'teacher']}}},
                {'$group': {'_id': '$department', 'count': {'$sum': 1}}},
                {'$sort': {'count': -1}}
            ]
            department_stats = list(db.users.aggregate(dept_pipeline))
            
            analytics_data = {
                'total_users': total_users,
                'total_students': total_students,
                'total_teachers': total_teachers,
                'total_courses': total_courses,
                'total_enrollments': total_enrollments,
                'recent_registrations': recent_registrations,
                'popular_courses': popular_courses,
                'department_distribution': department_stats
            }
        
        return jsonify({'analytics': analytics_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/course/<course_id>', methods=['GET'])
@jwt_required()
def get_course_analytics(course_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Get course and check permissions
        course = db.courses.find_one({'_id': ObjectId(course_id)})
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] not in ['admin', 'teacher'] or (user['role'] == 'teacher' and course['teacher_id'] != user_id):
            return jsonify({'error': 'Access denied'}), 403
        
        # Get enrollments
        enrollments = list(db.enrollments.find({'course_id': course_id}))
        total_students = len(enrollments)
        
        # Get assignments
        assignments = list(db.assignments.find({'course_id': course_id}))
        assignment_ids = [str(assignment['_id']) for assignment in assignments]
        
        # Get submissions
        submissions = list(db.submissions.find({'assignment_id': {'$in': assignment_ids}}))
        

        

        
        # Calculate engagement metrics
        active_students = len(set([s['student_id'] for s in submissions]))
        engagement_rate = (active_students / total_students * 100) if total_students > 0 else 0
        
        # Assignment performance
        assignment_performance = []
        for assignment in assignments:
            assignment_submissions = [s for s in submissions if s['assignment_id'] == str(assignment['_id'])]
            graded_submissions = [s for s in assignment_submissions if s.get('grade') is not None]
            
            if graded_submissions:
                grades = [s['grade'] for s in graded_submissions]
                avg_grade = sum(grades) / len(grades)
                assignment_performance.append({
                    'assignment_title': assignment['title'],
                    'submissions': len(assignment_submissions),
                    'average_grade': round(avg_grade, 2),
                    'submission_rate': round(len(assignment_submissions) / total_students * 100, 2) if total_students > 0 else 0
                })
        

        
        # Student progress distribution
        progress_distribution = {
            '0-25%': 0,
            '26-50%': 0,
            '51-75%': 0,
            '76-100%': 0
        }
        
        for enrollment in enrollments:
            progress = enrollment.get('progress', 0)
            if progress <= 25:
                progress_distribution['0-25%'] += 1
            elif progress <= 50:
                progress_distribution['26-50%'] += 1
            elif progress <= 75:
                progress_distribution['51-75%'] += 1
            else:
                progress_distribution['76-100%'] += 1
        
        # Top performing students
        student_performance = []
        for enrollment in enrollments:
            student = db.users.find_one({'_id': ObjectId(enrollment['student_id'])})
            if student:
                # Calculate student's performance in this course
                student_submissions = [s for s in submissions if s['student_id'] == enrollment['student_id']]

                
                graded_submissions = [s for s in student_submissions if s.get('grade') is not None]
                avg_assignment_grade = sum([s['grade'] for s in graded_submissions]) / len(graded_submissions) if graded_submissions else 0
                
                overall_score = avg_assignment_grade if graded_submissions else 0
                
                student_performance.append({
                    'student_name': student['name'],
                    'roll_no': student.get('roll_no', ''),
                    'progress': enrollment.get('progress', 0),
                    'assignments_submitted': len(student_submissions),

                    'average_assignment_grade': round(avg_assignment_grade, 2),

                    'overall_performance': round(overall_score, 2)
                })
        
        # Sort by overall performance
        student_performance.sort(key=lambda x: x['overall_performance'], reverse=True)
        top_students = student_performance[:10]
        
        analytics_data = {
            'course_title': course['title'],
            'total_students': total_students,
            'active_students': active_students,
            'engagement_rate': round(engagement_rate, 2),
            'total_assignments': len(assignments),
            'assignment_performance': assignment_performance,

            'progress_distribution': progress_distribution,
            'top_students': top_students
        }
        
        return jsonify({'analytics': analytics_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/student/<student_id>', methods=['GET'])
@jwt_required()
def get_student_analytics(student_id):
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check permissions
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] not in ['admin', 'teacher'] and user_id != student_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Get student
        student = db.users.find_one({'_id': ObjectId(student_id)})
        if not student or student['role'] != 'student':
            return jsonify({'error': 'Student not found'}), 404
        
        # Get enrollments
        enrollments = list(db.enrollments.find({'student_id': student_id}))
        
        # Get course performance
        course_performance = []
        for enrollment in enrollments:
            course = db.courses.find_one({'_id': ObjectId(enrollment['course_id'])})
            if course:
                # Get assignments for this course
                assignments = list(db.assignments.find({'course_id': enrollment['course_id']}))
                assignment_ids = [str(a['_id']) for a in assignments]
                
                # Get student's submissions
                submissions = list(db.submissions.find({
                    'assignment_id': {'$in': assignment_ids},
                    'student_id': student_id
                }))
                
                graded_submissions = [s for s in submissions if s.get('grade') is not None]
                avg_assignment_grade = sum([s['grade'] for s in graded_submissions]) / len(graded_submissions) if graded_submissions else 0
                

                
                course_performance.append({
                    'course_title': course['title'],
                    'progress': enrollment.get('progress', 0),
                    'assignments_submitted': len(submissions),
                    'total_assignments': len(assignments),
                    'average_assignment_grade': round(avg_assignment_grade, 2),

                })
        
        # Overall statistics
        all_submissions = list(db.submissions.find({'student_id': student_id}))

        
        graded_submissions = [s for s in all_submissions if s.get('grade') is not None]
        overall_assignment_avg = sum([s['grade'] for s in graded_submissions]) / len(graded_submissions) if graded_submissions else 0
        

        
        # Learning progress over time
        progress_timeline = []
        for enrollment in enrollments:
            course = db.courses.find_one({'_id': ObjectId(enrollment['course_id'])})
            if course:
                progress_timeline.append({
                    'date': enrollment['enrolled_at'],
                    'course': course['title'],
                    'progress': enrollment.get('progress', 0)
                })
        
        progress_timeline.sort(key=lambda x: x['date'])
        
        analytics_data = {
            'student_name': student['name'],
            'roll_no': student.get('roll_no', ''),
            'department': student.get('department', ''),
            'total_points': student.get('total_points', 0),
            'courses_enrolled': len(enrollments),
            'assignments_submitted': len(all_submissions),

            'overall_assignment_average': round(overall_assignment_avg, 2),

            'course_performance': course_performance,
            'progress_timeline': progress_timeline
        }
        
        return jsonify({'analytics': analytics_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/system', methods=['GET'])
@jwt_required()
def get_system_analytics():
    try:
        user_id = get_jwt_identity()
        db = current_app.db
        
        # Check if user is admin
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user['role'] != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        # Get date range
        days = int(request.args.get('days', 30))
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # User registration trends
        registration_pipeline = [
            {'$match': {'created_at': {'$gte': start_date}}},
            {'$group': {
                '_id': {
                    'year': {'$year': '$created_at'},
                    'month': {'$month': '$created_at'},
                    'day': {'$dayOfMonth': '$created_at'}
                },
                'count': {'$sum': 1}
            }},
            {'$sort': {'_id': 1}}
        ]
        
        registration_trends = list(db.users.aggregate(registration_pipeline))
        
        # Course creation trends
        course_pipeline = [
            {'$match': {'created_at': {'$gte': start_date}}},
            {'$group': {
                '_id': {
                    'year': {'$year': '$created_at'},
                    'month': {'$month': '$created_at'},
                    'day': {'$dayOfMonth': '$created_at'}
                },
                'count': {'$sum': 1}
            }},
            {'$sort': {'_id': 1}}
        ]
        
        course_trends = list(db.courses.aggregate(course_pipeline))
        
        # Activity trends (submissions)
        submission_pipeline = [
            {'$match': {'submitted_at': {'$gte': start_date}}},
            {'$group': {
                '_id': {
                    'year': {'$year': '$submitted_at'},
                    'month': {'$month': '$submitted_at'},
                    'day': {'$dayOfMonth': '$submitted_at'}
                },
                'count': {'$sum': 1}
            }},
            {'$sort': {'_id': 1}}
        ]
        
        submission_trends = list(db.submissions.aggregate(submission_pipeline))
        

        
        # System totals
        total_users = db.users.count_documents({})
        total_courses = db.courses.count_documents({})
        total_enrollments = db.enrollments.count_documents({})
        total_assignments = db.assignments.count_documents({})

        
        # Active users (users who have activity in the last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        active_users = len(set(
            [s['student_id'] for s in db.submissions.find({'submitted_at': {'$gte': seven_days_ago}})]
        ))
        
        analytics_data = {
            'system_totals': {
                'total_users': total_users,
                'total_courses': total_courses,
                'total_enrollments': total_enrollments,
                'total_assignments': total_assignments,
                'total_quizzes': total_quizzes,
                'active_users_7_days': active_users
            },
            'trends': {
                'user_registrations': registration_trends,
                'course_creations': course_trends,
                'assignment_submissions': submission_trends,
                'quiz_attempts': quiz_trends
            }
        }
        
        return jsonify({'analytics': analytics_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500