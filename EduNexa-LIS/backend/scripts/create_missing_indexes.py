"""
Script to create missing database indexes.

This script creates the indexes that were added to db_init.py but haven't been
applied to the existing database yet.

Usage:
    python backend/scripts/create_missing_indexes.py
"""

import sys
import os
from pymongo import MongoClient

# Add backend directory to path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Connect to MongoDB
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/edunexa_lms')
client = MongoClient(MONGO_URI)
db = client.edunexa_lms


def create_index_safe(collection, index_spec, index_name=None):
    """
    Create an index safely, handling existing indexes.
    
    Args:
        collection: MongoDB collection
        index_spec: Index specification (field name or list of tuples)
        index_name: Optional custom index name
    """
    try:
        if index_name:
            collection.create_index(index_spec, name=index_name)
        else:
            collection.create_index(index_spec)
        return True
    except Exception as e:
        if 'IndexKeySpecsConflict' in str(e) or 'already exists' in str(e):
            # Index already exists, skip
            return False
        else:
            # Re-raise other errors
            raise


def create_indexes():
    """Create all database indexes"""
    
    print("🔧 Creating database indexes...")
    created_count = 0
    skipped_count = 0
    
    # Courses collection indexes (Requirement 7.1)
    print("  Creating courses indexes...")
    if create_index_safe(db.courses, "teacher_id"):
        created_count += 1
    else:
        skipped_count += 1
    
    # Modules collection indexes (Requirement 7.2)
    print("  Creating modules indexes...")
    if create_index_safe(db.modules, "course_id"):
        created_count += 1
    else:
        skipped_count += 1
    if create_index_safe(db.modules, [("course_id", 1), ("order", 1)]):
        created_count += 1
    else:
        skipped_count += 1
    
    # Materials collection indexes (Requirement 7.3)
    print("  Creating materials indexes...")
    if create_index_safe(db.materials, "course_id"):
        created_count += 1
    else:
        skipped_count += 1
    if create_index_safe(db.materials, "module_id"):
        created_count += 1
    else:
        skipped_count += 1
    if create_index_safe(db.materials, [("module_id", 1), ("order", 1)]):
        created_count += 1
    else:
        skipped_count += 1
    if create_index_safe(db.materials, "type"):
        created_count += 1
    else:
        skipped_count += 1
    
    # Enrollments collection indexes (Requirement 7.4)
    print("  Creating enrollments indexes...")
    if create_index_safe(db.enrollments, "student_id"):
        created_count += 1
    else:
        skipped_count += 1
    if create_index_safe(db.enrollments, "course_id"):
        created_count += 1
    else:
        skipped_count += 1
    # Skip compound index if unique version exists
    if create_index_safe(db.enrollments, [("student_id", 1), ("course_id", 1)], "enrollment_lookup"):
        created_count += 1
    else:
        skipped_count += 1
    
    # Progress collection indexes (Requirement 7.5)
    print("  Creating progress indexes...")
    if create_index_safe(db.progress, [("student_id", 1), ("course_id", 1)], "progress_lookup"):
        created_count += 1
    else:
        skipped_count += 1
    
    # Video progress collection indexes
    print("  Creating video_progress indexes...")
    if create_index_safe(db.video_progress, [("student_id", 1), ("video_id", 1)], "video_progress_lookup"):
        created_count += 1
    else:
        skipped_count += 1
    
    print(f"✅ Database indexes processed: {created_count} created, {skipped_count} already existed")


def main():
    """Main function"""
    print("=" * 60)
    print("🔍 Creating Missing Database Indexes")
    print("=" * 60)
    
    try:
        create_indexes()
        print("\n✅ All indexes created successfully!")
        return 0
    except Exception as e:
        print(f"\n❌ Error creating indexes: {e}")
        return 1


if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)
