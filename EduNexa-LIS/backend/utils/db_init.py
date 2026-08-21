def initialize_database(db):
    """Initialize database with indexes only"""
    
    print("🔧 Initializing database...")
    
    # Create indexes for better performance
    create_indexes(db)
    
    print("✅ Database initialized with indexes")
    print("ℹ️  To seed sample data, run: python backend/scripts/seeders/seed_sample_data.py")

def create_indexes(db):
    """Create database indexes for better performance"""
    
    # Users collection indexes
    db.users.create_index("email", unique=True)
    db.users.create_index("role")
    db.users.create_index([("roll_number", 1)], sparse=True)
    db.users.create_index([("employee_id", 1)], sparse=True)
    
    # Courses collection indexes
    db.courses.create_index("teacher_id")
    db.courses.create_index("category")
    db.courses.create_index("is_active")
    
    # Modules collection indexes (Requirement 7.2)
    db.modules.create_index("course_id")
    db.modules.create_index([("course_id", 1), ("order", 1)])
    
    # Materials collection indexes (Requirement 7.3)
    db.materials.create_index("course_id")
    db.materials.create_index("module_id")
    db.materials.create_index([("module_id", 1), ("order", 1)])
    db.materials.create_index("type")
    
    # Enrollments collection indexes
    db.enrollments.create_index([("student_id", 1), ("course_id", 1)], unique=True)
    db.enrollments.create_index("course_id")
    db.enrollments.create_index("student_id")
    
    # Assignments collection indexes
    db.assignments.create_index("course_id")
    db.assignments.create_index("due_date")
    
    # Submissions collection indexes
    db.submissions.create_index([("assignment_id", 1), ("student_id", 1)], unique=True)
    db.submissions.create_index("student_id")
    
    # Progress collection indexes
    db.progress.create_index([("student_id", 1), ("course_id", 1)], unique=True)
    db.progress.create_index("course_id")
    db.progress.create_index("student_id")
    
    # Video progress collection indexes (Requirement 5.7)
    db.video_progress.create_index([("student_id", 1), ("video_id", 1)], unique=True)
    db.video_progress.create_index("course_id")
    db.video_progress.create_index("student_id")
    db.video_progress.create_index("video_id")
    
    # Chat history indexes
    db.chat_history.create_index("user_id")
    db.chat_history.create_index("timestamp")
    
    # Password reset tokens indexes
    db.password_resets.create_index("token_hash", unique=True)
    db.password_resets.create_index("user_id")
    db.password_resets.create_index("expires_at", expireAfterSeconds=0)  # TTL index
    
    print("📊 Database indexes created")