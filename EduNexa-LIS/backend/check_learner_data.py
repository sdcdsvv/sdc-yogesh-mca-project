from pymongo import MongoClient
from datetime import datetime, timedelta
import statistics

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/edunexa_lms')
db = client.edunexa_lms

# Get all students
students = list(db.users.find({'role': 'student'}))
print(f"Total students: {len(students)}")

# Get enrollments
enrollments = list(db.enrollments.find({}))
print(f"Total enrollments: {len(enrollments)}")

# Get submissions
submissions = list(db.submissions.find({}))
print(f"Total submissions: {len(submissions)}")

print("\n--- Analyzing Learning Pace Logic ---")

# Check a few students
for i, student in enumerate(students[:3]):
    student_id = str(student['_id'])
    print(f"\nStudent {i+1}: {student['name']} (ID: {student_id})")
    
    # Get enrollments for this student
    student_enrollments = list(db.enrollments.find({'student_id': student_id}))
    print(f"  Enrollments: {len(student_enrollments)}")
    
    if student_enrollments:
        for enrollment in student_enrollments:
            enrollment_date = enrollment.get('enrolled_at', datetime.utcnow())
            current_progress = enrollment.get('progress', 0)
            days_enrolled = max(1, (datetime.utcnow() - enrollment_date).days)
            progress_rate = current_progress / days_enrolled
            
            print(f"    Course: {enrollment.get('course_id')}")
            print(f"    Progress: {current_progress}%")
            print(f"    Days enrolled: {days_enrolled}")
            print(f"    Progress rate: {progress_rate:.2f}% per day")
    
    # Get recent submissions
    recent_submissions = list(db.submissions.find({
        'student_id': student_id,
        'submitted_at': {'$gte': datetime.utcnow() - timedelta(days=30)}
    }))
    submission_frequency = len(recent_submissions) / 30
    print(f"  Recent submissions (30 days): {len(recent_submissions)}")
    print(f"  Submission frequency: {submission_frequency:.3f} per day")
    
    # Determine pace
    if student_enrollments:
        progress_rates = []
        for enrollment in student_enrollments:
            enrollment_date = enrollment.get('enrolled_at', datetime.utcnow())
            current_progress = enrollment.get('progress', 0)
            days_enrolled = max(1, (datetime.utcnow() - enrollment_date).days)
            progress_rate = current_progress / days_enrolled
            progress_rates.append(progress_rate)
        
        avg_progress_rate = statistics.mean(progress_rates)
        
        if avg_progress_rate > 2.0 and submission_frequency > 0.2:
            pace = 'fast'
        elif avg_progress_rate < 0.5 or submission_frequency < 0.1:
            pace = 'slow'
        else:
            pace = 'normal'
        
        print(f"  Calculated pace: {pace}")
        print(f"    Avg progress rate: {avg_progress_rate:.2f}% per day")
        print(f"    Threshold for fast: >2.0% per day AND >0.2 submissions/day")
        print(f"    Threshold for slow: <0.5% per day OR <0.1 submissions/day")

print("\n--- Summary ---")
print(f"Total students: {len(students)}")
print(f"Total enrollments: {len(enrollments)}")
print(f"Total submissions: {len(submissions)}")
