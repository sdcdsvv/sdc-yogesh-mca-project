"""
Comprehensive Database Seeder for EduNexa LMS
Seeds ALL collections with realistic, production-ready dummy data from MongoDB

Collections seeded:
- users (students, teachers, admins)
- courses (with modules and materials)
- enrollments
- assignments
- submissions
- videos
- documents
- modules
- materials
- progress
- video_progress
- notifications
- discussions
- schedules
- achievements
- user_achievements
- quizzes (if applicable)

Usage:
    python backend/scripts/seeders/comprehensive_seed_data.py
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
from bson import ObjectId
from pymongo import MongoClient
from dotenv import load_dotenv
import random

load_dotenv()

# Realistic data pools
STUDENT_NAMES = [
    "Rahul Sharma", "Priya Singh", "Amit Kumar", "Sneha Patel", "Vikram Reddy",
    "Anjali Gupta", "Rohan Mehta", "Pooja Desai", "Arjun Nair", "Kavya Iyer",
    "Siddharth Joshi", "Neha Kapoor", "Karan Malhotra", "Riya Agarwal", "Aditya Verma"
]

TEACHER_NAMES = [
    "Dr. Rajesh Kumar", "Prof. Meera Sharma", "Dr. Suresh Patel", "Prof. Anita Desai",
    "Dr. Vikram Singh"
]

COURSE_DATA = [
    {
        "title": "Introduction to Machine Learning",
        "description": "Comprehensive course covering ML fundamentals, algorithms, and practical applications using Python and scikit-learn.",
        "category": "AI & Machine Learning",
        "difficulty": "Intermediate",
        "duration": "12 weeks",
        "thumbnail": "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400",
        "prerequisites": ["Python Programming", "Statistics Basics"],
        "learning_objectives": ["Understand ML algorithms", "Build predictive models", "Evaluate model performance"]
    },
    {
        "title": "Full Stack Web Development",
        "description": "Learn to build modern web applications using React, Node.js, Express, and MongoDB.",
        "category": "Web Development",
        "difficulty": "Intermediate",
        "duration": "16 weeks",
        "thumbnail": "https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=400",
        "prerequisites": ["HTML/CSS", "JavaScript Basics"],
        "learning_objectives": ["Build full-stack applications", "Master React and Node.js", "Deploy web apps"]
    },
    {
        "title": "Data Science with Python",
        "description": "Master data analysis, visualization, and statistical modeling using Python, Pandas, and NumPy.",
        "category": "Data Science",
        "difficulty": "Beginner",
        "duration": "10 weeks",
        "thumbnail": "https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=400",
        "prerequisites": ["Basic Python"],
        "learning_objectives": ["Analyze data with Pandas", "Create visualizations", "Build statistical models"]
    },
    {
        "title": "Cloud Computing with AWS",
        "description": "Learn cloud infrastructure, deployment, and management using Amazon Web Services.",
        "category": "Cloud Computing",
        "difficulty": "Advanced",
        "duration": "14 weeks",
        "thumbnail": "https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400",
        "prerequisites": ["Linux Basics", "Networking Fundamentals"],
        "learning_objectives": ["Deploy cloud infrastructure", "Manage AWS services", "Implement DevOps practices"]
    },
    {
        "title": "Mobile App Development with React Native",
        "description": "Build cross-platform mobile applications for iOS and Android using React Native.",
        "category": "Mobile Development",
        "difficulty": "Intermediate",
        "duration": "12 weeks",
        "thumbnail": "https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=400",
        "prerequisites": ["JavaScript", "React Basics"],
        "learning_objectives": ["Build mobile apps", "Handle device features", "Publish to app stores"]
    }
]

DEPARTMENTS = ["Computer Science", "Data Science", "Information Technology", "Software Engineering"]
YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"]

def print_header(title):
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)

def print_success(message):
    print(f"✅ {message}")

def print_info(message):
    print(f"ℹ️  {message}")

def create_users(db):
    """Create students, teachers, and admin users"""
    print_info("Creating users...")
    users = []
    user_map = {}
    
    # Create students
    for i, name in enumerate(STUDENT_NAMES, 1):
        email = f"student{i:02d}@datams.edu"
        user = {
            "name": name,
            "email": email,
            "password": generate_password_hash("Stud@2025"),
            "role": "student",
            "phone": f"+91-98765-{43210 + i}",
            "roll_number": f"MCA2025_{i:03d}",
            "department": random.choice(DEPARTMENTS),
            "year": random.choice(YEARS),
            "semester": "4th",
            "profile_pic": f"https://ui-avatars.com/api/?name={name.replace(' ', '+')}&background=random",
            "enrolled_courses": [],
            "completed_courses": [],
            "total_points": random.randint(50, 500),
            "badges": [],
            "created_at": datetime.utcnow() - timedelta(days=random.randint(30, 180)),
            "updated_at": datetime.utcnow(),
            "is_active": True
        }
        users.append(user)
    
    # Create teachers
    for i, name in enumerate(TEACHER_NAMES, 1):
        email = f"teacher{i:02d}@datams.edu"
        user = {
            "name": name,
            "email": email,
            "password": generate_password_hash("Teach@2025"),
            "role": "teacher",
            "phone": f"+91-98765-{50000 + i}",
            "employee_id": f"FAC{1000 + i}",
            "department": random.choice(DEPARTMENTS),
            "designation": random.choice(["Professor", "Associate Professor", "Assistant Professor"]),
            "profile_pic": f"https://ui-avatars.com/api/?name={name.replace(' ', '+')}&background=random",
            "courses_created": [],
            "specializations": random.sample(["Machine Learning", "Web Development", "Data Science", "Cloud Computing"], 2),
            "created_at": datetime.utcnow() - timedelta(days=random.randint(180, 365)),
            "updated_at": datetime.utcnow(),
            "is_active": True
        }
        users.append(user)
    
    # Create single super admin
    super_admin = {
        "name": "Super Admin",
        "email": "admin@datams.edu",
        "password": generate_password_hash("Yogi@#2025"),
        "role": "admin",
        "phone": "+91-98765-00000",
        "employee_id": "SUPERADMIN001",
        "department": "Administration",
        "designation": "Super Administrator",
        "profile_pic": "https://ui-avatars.com/api/?name=Super+Admin&background=4F46E5",
        "created_at": datetime.utcnow() - timedelta(days=365),
        "updated_at": datetime.utcnow(),
        "is_active": True
    }
    users.append(super_admin)
    
    # Insert users
    result = db.users.insert_many(users)
    
    # Create user map
    for user, user_id in zip(users, result.inserted_ids):
        user_map[user['email']] = str(user_id)
    
    print_success(f"Created {len(users)} users ({len(STUDENT_NAMES)} students, {len(TEACHER_NAMES)} teachers, 1 admin)")
    return user_map

def create_courses_and_modules(db, user_map):
    """Create courses with modules and materials"""
    print_info("Creating courses with modules and materials...")
    
    teacher_emails = [f"teacher{i:02d}@datams.edu" for i in range(1, len(TEACHER_NAMES) + 1)]
    courses_created = []
    module_map = {}
    material_map = {}
    
    for i, course_data in enumerate(COURSE_DATA):
        teacher_email = teacher_emails[i % len(teacher_emails)]
        teacher_id = user_map[teacher_email]
        
        course = {
            **course_data,
            "teacher_id": teacher_id,
            "is_active": True,
            "is_public": True,
            "max_students": random.randint(30, 50),
            "created_at": datetime.utcnow() - timedelta(days=random.randint(60, 180)),
            "updated_at": datetime.utcnow()
        }
        
        result = db.courses.insert_one(course)
        course_id = str(result.inserted_id)
        courses_created.append(course_id)
        
        # Update teacher's courses_created
        db.users.update_one(
            {"_id": ObjectId(teacher_id)},
            {"$push": {"courses_created": course_id}}
        )
        
        # Create modules for this course
        module_titles = [
            f"Introduction to {course_data['title'].split()[-1]}",
            f"Core Concepts and Fundamentals",
            f"Practical Applications and Projects",
            f"Advanced Topics and Best Practices"
        ]
        
        for mod_idx, mod_title in enumerate(module_titles, 1):
            module = {
                "course_id": course_id,
                "title": mod_title,
                "description": f"Module {mod_idx} covering essential topics",
                "order": mod_idx,
                "created_at": datetime.utcnow() - timedelta(days=random.randint(30, 90))
            }
            
            mod_result = db.modules.insert_one(module)
            module_id = str(mod_result.inserted_id)
            
            if course_id not in module_map:
                module_map[course_id] = []
            module_map[course_id].append(module_id)
            
            # Create materials for this module
            material_types = ["video", "document", "video", "document"]
            for mat_idx, mat_type in enumerate(material_types, 1):
                material = {
                    "course_id": course_id,
                    "module_id": module_id,
                    "title": f"{mod_title} - Lesson {mat_idx}",
                    "description": f"Detailed lesson covering key concepts",
                    "type": mat_type,
                    "content": f"content_{mat_type}_{course_id}_{module_id}_{mat_idx}",
                    "order": mat_idx,
                    "is_required": mat_idx <= 2,
                    "uploaded_by": teacher_id,
                    "created_at": datetime.utcnow() - timedelta(days=random.randint(20, 80))
                }
                
                mat_result = db.materials.insert_one(material)
                material_id = str(mat_result.inserted_id)
                
                if module_id not in material_map:
                    material_map[module_id] = []
                material_map[module_id].append(material_id)
    
    print_success(f"Created {len(courses_created)} courses with modules and materials")
    return courses_created, module_map, material_map

def create_enrollments(db, user_map, courses_created):
    """Create student enrollments"""
    print_info("Creating enrollments...")
    
    student_emails = [f"student{i:02d}@datams.edu" for i in range(1, len(STUDENT_NAMES) + 1)]
    enrollments = []
    
    for student_email in student_emails:
        student_id = user_map[student_email]
        
        # Enroll each student in 2-4 random courses
        num_courses = random.randint(2, 4)
        enrolled_courses = random.sample(courses_created, num_courses)
        
        for course_id in enrolled_courses:
            enrollment = {
                "course_id": course_id,
                "student_id": student_id,
                "enrolled_at": datetime.utcnow() - timedelta(days=random.randint(10, 60)),
                "progress": random.randint(10, 85),
                "completed_materials": [],
                "completed_assignments": [],
                "is_active": True
            }
            enrollments.append(enrollment)
            
            # Update student's enrolled_courses
            db.users.update_one(
                {"_id": ObjectId(student_id)},
                {"$push": {"enrolled_courses": course_id}}
            )
    
    if enrollments:
        db.enrollments.insert_many(enrollments)
    
    print_success(f"Created {len(enrollments)} enrollments")
    return enrollments

def create_assignments_and_submissions(db, user_map, courses_created):
    """Create assignments and student submissions"""
    print_info("Creating assignments and submissions...")
    
    assignments_created = []
    submissions = []
    
    for course_id in courses_created:
        course = db.courses.find_one({"_id": ObjectId(course_id)})
        teacher_id = course["teacher_id"]
        
        # Create 3-4 assignments per course
        for i in range(random.randint(3, 4)):
            assignment = {
                "title": f"{course['title']} - Assignment {i+1}",
                "description": f"Complete the assignment covering module {i+1} concepts",
                "course_id": course_id,
                "instructions": f"Submit your work demonstrating understanding of the key concepts from module {i+1}.",
                "due_date": datetime.utcnow() + timedelta(days=random.randint(7, 30)),
                "max_points": 100,
                "submission_type": "file",
                "allowed_file_types": ["pdf", "doc", "docx"],
                "max_file_size": 10,
                "is_active": True,
                "created_by": teacher_id,
                "created_at": datetime.utcnow() - timedelta(days=random.randint(5, 40)),
                "updated_at": datetime.utcnow()
            }
            
            result = db.assignments.insert_one(assignment)
            assignment_id = str(result.inserted_id)
            assignments_created.append(assignment_id)
            
            # Create submissions from enrolled students
            enrollments = db.enrollments.find({"course_id": course_id})
            
            for enrollment in enrollments:
                # 70% chance student submitted
                if random.random() < 0.7:
                    submitted_at = datetime.utcnow() - timedelta(days=random.randint(1, 10))
                    is_graded = random.random() < 0.6  # 60% are graded
                    
                    submission = {
                        "assignment_id": assignment_id,
                        "student_id": enrollment["student_id"],
                        "course_id": course_id,
                        "submission_text": f"Submission for {assignment['title']}",
                        "file_path": f"/uploads/assignments/submission_{assignment_id}_{enrollment['student_id']}.pdf",
                        "submitted_at": submitted_at,
                        "status": "graded" if is_graded else "submitted",
                        "grade": random.randint(70, 100) if is_graded else None,
                        "feedback": f"Good work! Keep it up." if is_graded else None,
                        "graded_at": submitted_at + timedelta(days=random.randint(1, 5)) if is_graded else None,
                        "graded_by": teacher_id if is_graded else None
                    }
                    submissions.append(submission)
    
    if submissions:
        db.submissions.insert_many(submissions)
    
    print_success(f"Created {len(assignments_created)} assignments and {len(submissions)} submissions")
    return assignments_created

def create_videos(db, user_map, courses_created):
    """Create video records"""
    print_info("Creating videos...")
    
    videos = []
    video_map = {}
    
    for course_id in courses_created:
        course = db.courses.find_one({"_id": ObjectId(course_id)})
        teacher_id = course["teacher_id"]
        
        # Create 5-8 videos per course
        for i in range(random.randint(5, 8)):
            video = {
                "filename": f"lecture_{course_id}_{i+1}.mp4",
                "original_filename": f"{course['title']} - Lecture {i+1}.mp4",
                "file_path": f"/uploads/videos/lecture_{course_id}_{i+1}.mp4",
                "file_size": random.randint(50000000, 200000000),  # 50-200 MB
                "duration": random.randint(600, 3600),  # 10-60 minutes
                "mime_type": "video/mp4",
                "thumbnail": f"/uploads/videos/thumbnails/lecture_{course_id}_{i+1}.jpg",
                "uploaded_by": teacher_id,
                "title": f"{course['title']} - Lecture {i+1}",
                "description": f"Comprehensive lecture covering key concepts",
                "view_count": random.randint(10, 100),
                "created_at": datetime.utcnow() - timedelta(days=random.randint(20, 80)),
                "updated_at": datetime.utcnow()
            }
            
            result = db.videos.insert_one(video)
            video_id = str(result.inserted_id)
            
            if course_id not in video_map:
                video_map[course_id] = []
            video_map[course_id].append(video_id)
            
            videos.append(video_id)
    
    print_success(f"Created {len(videos)} videos")
    return video_map

def create_documents(db, user_map, courses_created):
    """Create document records"""
    print_info("Creating documents...")
    
    documents = []
    document_map = {}
    
    for course_id in courses_created:
        course = db.courses.find_one({"_id": ObjectId(course_id)})
        teacher_id = course["teacher_id"]
        
        # Create 3-5 documents per course
        doc_types = ["pdf", "docx", "pptx"]
        for i in range(random.randint(3, 5)):
            doc_type = random.choice(doc_types)
            
            document = {
                "filename": f"material_{course_id}_{i+1}.{doc_type}",
                "original_filename": f"{course['title']} - Material {i+1}.{doc_type}",
                "file_path": f"/uploads/documents/material_{course_id}_{i+1}.{doc_type}",
                "file_size": random.randint(500000, 5000000),  # 0.5-5 MB
                "mime_type": f"application/{doc_type}",
                "uploaded_by": teacher_id,
                "created_at": datetime.utcnow() - timedelta(days=random.randint(20, 80))
            }
            
            result = db.documents.insert_one(document)
            document_id = str(result.inserted_id)
            
            if course_id not in document_map:
                document_map[course_id] = []
            document_map[course_id].append(document_id)
            
            documents.append(document_id)
    
    print_success(f"Created {len(documents)} documents")
    return document_map

def create_progress_records(db, user_map, courses_created):
    """Create progress tracking records"""
    print_info("Creating progress records...")
    
    progress_records = []
    video_progress_records = []
    
    student_emails = [f"student{i:02d}@datams.edu" for i in range(1, len(STUDENT_NAMES) + 1)]
    
    for student_email in student_emails:
        student_id = user_map[student_email]
        
        # Track which videos this student has watched (across all courses)
        watched_videos = set()
        
        # Get student's enrollments
        enrollments = db.enrollments.find({"student_id": student_id})
        
        for enrollment in enrollments:
            course_id = enrollment["course_id"]
            
            # Create overall progress record
            materials = list(db.materials.find({"course_id": course_id}))
            completed_count = random.randint(0, len(materials))
            completed_materials = random.sample([str(m["_id"]) for m in materials], completed_count) if materials else []
            
            progress = {
                "student_id": student_id,
                "course_id": course_id,
                "progress_percentage": enrollment["progress"],
                "completed_materials": completed_materials,
                "last_accessed": datetime.utcnow() - timedelta(days=random.randint(0, 7)),
                "time_spent": random.randint(3600, 36000),  # 1-10 hours
                "created_at": enrollment["enrolled_at"],
                "updated_at": datetime.utcnow()
            }
            progress_records.append(progress)
            
            # Create video progress for some videos (ensure unique student-video combinations)
            videos = list(db.videos.find({}))
            
            for video in random.sample(videos, min(len(videos), random.randint(2, 5))):
                video_id = str(video["_id"])
                
                # Skip if already watched by this student
                if video_id in watched_videos:
                    continue
                
                watched_videos.add(video_id)
                watch_time = random.randint(60, video.get("duration", 600))
                
                video_progress = {
                    "student_id": student_id,
                    "video_id": video_id,
                    "watch_time": watch_time,
                    "completed": watch_time >= video.get("duration", 600) * 0.8,
                    "last_position": watch_time,
                    "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 30)),
                    "updated_at": datetime.utcnow()
                }
                video_progress_records.append(video_progress)
    
    if progress_records:
        db.progress.insert_many(progress_records)
    if video_progress_records:
        db.video_progress.insert_many(video_progress_records)
    
    print_success(f"Created {len(progress_records)} progress records and {len(video_progress_records)} video progress records")

def create_notifications(db, user_map):
    """Create notifications"""
    print_info("Creating notifications...")
    
    notifications = []
    notification_types = ["info", "success", "warning", "alert"]
    notification_templates = [
        ("New Assignment Posted", "A new assignment has been posted in {course}"),
        ("Grade Published", "Your assignment has been graded in {course}"),
        ("Course Update", "New materials have been added to {course}"),
        ("Deadline Reminder", "Assignment deadline approaching in {course}"),
        ("Welcome", "Welcome to EduNexa LMS! Start exploring your courses.")
    ]
    
    student_emails = [f"student{i:02d}@datams.edu" for i in range(1, len(STUDENT_NAMES) + 1)]
    
    for student_email in student_emails:
        student_id = user_map[student_email]
        
        # Create 3-7 notifications per student
        for _ in range(random.randint(3, 7)):
            title, message_template = random.choice(notification_templates)
            
            # Get a random course name
            courses = list(db.courses.find())
            course_name = random.choice(courses)["title"] if courses else "your course"
            
            notification = {
                "user_id": student_id,
                "title": title,
                "message": message_template.format(course=course_name),
                "type": random.choice(notification_types),
                "is_read": random.random() < 0.4,  # 40% read
                "created_at": datetime.utcnow() - timedelta(days=random.randint(0, 30)),
                "read_at": datetime.utcnow() - timedelta(days=random.randint(0, 5)) if random.random() < 0.4 else None
            }
            notifications.append(notification)
    
    if notifications:
        db.notifications.insert_many(notifications)
    
    print_success(f"Created {len(notifications)} notifications")

def create_discussions(db, user_map, courses_created):
    """Create discussion forum posts"""
    print_info("Creating discussions...")
    
    discussions = []
    discussion_topics = [
        "Question about Assignment {num}",
        "Help needed with {topic}",
        "Great lecture on {topic}!",
        "Clarification on {topic}",
        "Study group for upcoming exam"
    ]
    
    topics = ["Machine Learning", "Web Development", "Data Analysis", "Cloud Computing", "React", "Python"]
    
    student_emails = [f"student{i:02d}@datams.edu" for i in range(1, len(STUDENT_NAMES) + 1)]
    
    for course_id in courses_created:
        # Create 5-10 discussions per course
        for _ in range(random.randint(5, 10)):
            student_email = random.choice(student_emails)
            student_id = user_map[student_email]
            student = db.users.find_one({"_id": ObjectId(student_id)})
            
            topic_template = random.choice(discussion_topics)
            topic = topic_template.format(num=random.randint(1, 4), topic=random.choice(topics))
            
            discussion = {
                "course_id": course_id,
                "user_id": student_id,
                "author_name": student["name"],
                "title": topic,
                "content": f"I have a question about {random.choice(topics)}. Can someone help me understand this better?",
                "replies": [],
                "likes": random.randint(0, 15),
                "is_pinned": random.random() < 0.1,  # 10% pinned
                "is_resolved": random.random() < 0.5,  # 50% resolved
                "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 60)),
                "updated_at": datetime.utcnow() - timedelta(days=random.randint(0, 30))
            }
            
            # Add some replies
            num_replies = random.randint(0, 5)
            for _ in range(num_replies):
                reply_author_email = random.choice(student_emails)
                reply_author_id = user_map[reply_author_email]
                reply_author = db.users.find_one({"_id": ObjectId(reply_author_id)})
                
                reply = {
                    "user_id": reply_author_id,
                    "author_name": reply_author["name"],
                    "content": f"Here's my take on this: {random.choice(['Great question!', 'I had the same doubt.', 'Check the lecture notes.', 'Let me explain...'])}",
                    "likes": random.randint(0, 10),
                    "created_at": datetime.utcnow() - timedelta(days=random.randint(0, 30))
                }
                discussion["replies"].append(reply)
            
            discussions.append(discussion)
    
    if discussions:
        db.discussions.insert_many(discussions)
    
    print_success(f"Created {len(discussions)} discussion posts")

def create_schedules(db, courses_created):
    """Create course schedules"""
    print_info("Creating schedules...")
    
    schedules = []
    days_of_week = ["Monday", "Wednesday", "Friday"]
    time_slots = ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"]
    
    for course_id in courses_created:
        course = db.courses.find_one({"_id": ObjectId(course_id)})
        
        # Create 2-3 schedule entries per course
        for i in range(random.randint(2, 3)):
            schedule = {
                "course_id": course_id,
                "title": f"{course['title']} - Lecture",
                "description": f"Regular lecture session",
                "event_type": "lecture",
                "start_time": datetime.utcnow() + timedelta(days=random.randint(1, 30), hours=random.randint(9, 16)),
                "end_time": datetime.utcnow() + timedelta(days=random.randint(1, 30), hours=random.randint(10, 17)),
                "location": f"Room {random.randint(101, 305)}",
                "is_recurring": True,
                "recurrence_pattern": f"Weekly on {random.choice(days_of_week)}",
                "created_by": course["teacher_id"],
                "created_at": datetime.utcnow() - timedelta(days=random.randint(30, 90)),
                "updated_at": datetime.utcnow()
            }
            schedules.append(schedule)
    
    if schedules:
        db.schedules.insert_many(schedules)
    
    print_success(f"Created {len(schedules)} schedule entries")

def create_achievements(db, user_map):
    """Create achievement definitions and user achievements"""
    print_info("Creating achievements...")
    
    # Achievement definitions
    achievement_defs = [
        {
            "code": "first_course",
            "title": "First Steps",
            "description": "Enrolled in your first course",
            "icon": "🎓",
            "points": 10,
            "criteria": {"type": "enrollment_count", "threshold": 1}
        },
        {
            "code": "assignment_master",
            "title": "Assignment Master",
            "description": "Submitted 10 assignments",
            "icon": "📝",
            "points": 50,
            "criteria": {"type": "assignments_submitted", "threshold": 10}
        },
        {
            "code": "perfect_score",
            "title": "Perfect Score",
            "description": "Achieved 100% on an assignment",
            "icon": "⭐",
            "points": 30,
            "criteria": {"type": "perfect_grade", "threshold": 100}
        },
        {
            "code": "course_complete",
            "title": "Course Completed",
            "description": "Completed your first course",
            "icon": "🏆",
            "points": 100,
            "criteria": {"type": "courses_completed", "threshold": 1}
        },
        {
            "code": "active_learner",
            "title": "Active Learner",
            "description": "Logged in for 7 consecutive days",
            "icon": "🔥",
            "points": 25,
            "criteria": {"type": "login_streak", "threshold": 7}
        }
    ]
    
    # Insert achievement definitions
    db.achievements.delete_many({})  # Clear existing
    db.achievements.insert_many(achievement_defs)
    
    # Award some achievements to students
    user_achievements = []
    student_emails = [f"student{i:02d}@datams.edu" for i in range(1, len(STUDENT_NAMES) + 1)]
    
    for student_email in student_emails:
        student_id = user_map[student_email]
        
        # Award 1-3 random achievements
        num_achievements = random.randint(1, 3)
        awarded = random.sample(achievement_defs, num_achievements)
        
        for achievement in awarded:
            user_achievement = {
                "user_id": student_id,
                "achievement_code": achievement["code"],
                "unlocked_at": datetime.utcnow() - timedelta(days=random.randint(1, 60))
            }
            user_achievements.append(user_achievement)
            
            # Update user's badges and points
            db.users.update_one(
                {"_id": ObjectId(student_id)},
                {
                    "$addToSet": {"badges": achievement["code"]},
                    "$inc": {"total_points": achievement["points"]}
                }
            )
    
    if user_achievements:
        db.user_achievements.insert_many(user_achievements)
    
    print_success(f"Created {len(achievement_defs)} achievement definitions and awarded {len(user_achievements)} achievements")

def main():
    """Main execution function"""
    print_header("EduNexa LMS - Comprehensive Database Seeder")
    
    # Connect to MongoDB
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/edunexa_lms')
    
    try:
        client = MongoClient(MONGO_URI)
        db = client.edunexa_lms
        client.admin.command('ping')
        print_success(f"Connected to MongoDB: {MONGO_URI}")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        sys.exit(1)
    
    # Check if data exists
    user_count = db.users.count_documents({})
    if user_count > 0:
        print_info(f"Database contains {user_count} users")
        response = input("⚠️  Clear all data and reseed? (yes/no): ").strip().lower()
        
        if response == 'yes':
            print_info("Clearing all collections...")
            collections = ['users', 'courses', 'enrollments', 'assignments', 'submissions',
                          'videos', 'documents', 'modules', 'materials', 'progress',
                          'video_progress', 'notifications', 'discussions', 'schedules',
                          'achievements', 'user_achievements']
            
            for collection in collections:
                db[collection].delete_many({})
            print_success("All collections cleared")
        else:
            print_info("Seeding cancelled")
            sys.exit(0)
    
    print_header("Starting Data Generation")
    
    try:
        # Create all data
        user_map = create_users(db)
        courses_created, module_map, material_map = create_courses_and_modules(db, user_map)
        create_enrollments(db, user_map, courses_created)
        create_assignments_and_submissions(db, user_map, courses_created)
        video_map = create_videos(db, user_map, courses_created)
        document_map = create_documents(db, user_map, courses_created)
        create_progress_records(db, user_map, courses_created)
        create_notifications(db, user_map)
        create_discussions(db, user_map, courses_created)
        create_schedules(db, courses_created)
        create_achievements(db, user_map)
        
        print_header("Seeding Complete - Summary")
        
        # Print statistics
        stats = {
            "Users": db.users.count_documents({}),
            "Courses": db.courses.count_documents({}),
            "Modules": db.modules.count_documents({}),
            "Materials": db.materials.count_documents({}),
            "Enrollments": db.enrollments.count_documents({}),
            "Assignments": db.assignments.count_documents({}),
            "Submissions": db.submissions.count_documents({}),
            "Videos": db.videos.count_documents({}),
            "Documents": db.documents.count_documents({}),
            "Progress Records": db.progress.count_documents({}),
            "Video Progress": db.video_progress.count_documents({}),
            "Notifications": db.notifications.count_documents({}),
            "Discussions": db.discussions.count_documents({}),
            "Schedules": db.schedules.count_documents({}),
            "Achievements": db.achievements.count_documents({}),
            "User Achievements": db.user_achievements.count_documents({})
        }
        
        print("\n📊 Database Statistics:")
        for collection, count in stats.items():
            print(f"   {collection}: {count}")
        
        print_header("Test Credentials")
        print("\n👨‍🎓 Students:")
        print("   Email: student01@datams.edu to student15@datams.edu")
        print("   Password: Stud@2025")
        
        print("\n👨‍🏫 Teachers:")
        print("   Email: teacher01@datams.edu to teacher05@datams.edu")
        print("   Password: Teach@2025")
        
        print("\n👨‍💼 Super Admin:")
        print("   Email: admin@datams.edu")
        print("   Password: Yogi@#2025")
        print("   Role: Super Administrator (Full System Access)")
        
        print_header("✅ All Data Successfully Seeded!")
        print("\n🎉 Your database is now populated with realistic dummy data!")
        print("🚀 Start your application and login with the credentials above.\n")
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Seeding cancelled by user")
        sys.exit(0)
