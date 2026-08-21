# Database Seeders

This directory contains scripts for manually seeding the database with test and sample data. These scripts are designed to be run manually and are **not** executed automatically during application startup.

## Overview

The EduNexa LMS uses MongoDB as its single source of truth for runtime data. The application automatically creates database indexes on startup, but all data must be seeded manually using the scripts in this directory.

## Prerequisites

Before running any seeder scripts, ensure:

1. MongoDB is running and accessible
2. Environment variables are configured (`.env` file in `backend/` directory)
3. Required Python packages are installed: `pip install -r backend/requirements.txt`
4. You are in the project root directory

## Available Seeder Scripts

### 1. Seed Sample Data (`seed_sample_data.py`)

Creates a complete set of sample data for development and testing, including:
- 3 sample students
- 2 sample teachers
- 1 super admin
- 4 sample courses
- Student enrollments
- Sample assignments

**Usage:**
```bash
python backend/scripts/seeders/seed_sample_data.py
```

**Sample Accounts Created:**

| Role | Email | Password |
|------|-------|----------|
| Student | student01@datams.edu | Stud@2025 |
| Student | student02@datams.edu | Stud@2025 |
| Student | student03@datams.edu | Stud@2025 |
| Teacher | teacher01@datams.edu | Teach@2025 |
| Teacher | teacher02@datams.edu | Teach@2025 |
| Super Admin | superadmin@datams.edu | Admin@123456 |

**Notes:**
- The script checks if users already exist and prompts before adding duplicate data
- Students are automatically enrolled in 2-3 courses
- Each course gets 2 sample assignments

---

### 2. Create Test Teacher (`create_test_teacher.py`)

Creates a single test teacher account for integration testing.

**Usage:**
```bash
python backend/scripts/seeders/create_test_teacher.py
```

**Account Created:**

| Role | Email | Password |
|------|-------|----------|
| Teacher | teacher@test.com | test123 |

**Notes:**
- Checks if the teacher already exists before creating
- Useful for running teacher-specific endpoint tests

---

### 3. Create Test Student Data (`create_test_student_data.py`)

Creates a complete test scenario including:
- 1 test student
- 1 test course (owned by test teacher)
- Student enrollment
- 1 test assignment
- 1 test submission

**Usage:**
```bash
# First, create the test teacher
python backend/scripts/seeders/create_test_teacher.py

# Then, create the test student data
python backend/scripts/seeders/create_test_student_data.py
```

**Account Created:**

| Role | Email | Password |
|------|-------|----------|
| Student | student@test.com | test123 |

**Notes:**
- Requires test teacher to exist (run `create_test_teacher.py` first)
- Creates a complete workflow for testing grading functionality
- Prints all created IDs for use in API testing

---

## Common Workflows

### Setting Up a Fresh Development Environment

```bash
# 1. Start MongoDB
# (varies by system)

# 2. Start the application (creates indexes)
python backend/app.py

# 3. In a new terminal, seed sample data
python backend/scripts/seeders/seed_sample_data.py
```

### Setting Up for Integration Testing

```bash
# 1. Create test teacher
python backend/scripts/seeders/create_test_teacher.py

# 2. Create test student and related data
python backend/scripts/seeders/create_test_student_data.py

# 3. Run your tests
python backend/test_teacher_endpoints.py
```

### Resetting the Database

```bash
# 1. Drop the database (MongoDB shell or Compass)
# In MongoDB shell:
use edunexa_lms
db.dropDatabase()

# 2. Restart the application (recreates indexes)
python backend/app.py

# 3. Re-seed data as needed
python backend/scripts/seeders/seed_sample_data.py
```

---

## Environment Variables

All seeder scripts use the following environment variable for MongoDB connection:

```bash
MONGO_URI=mongodb://localhost:27017/edunexa_lms
```

Make sure this is set in your `backend/.env` file or system environment.

---

## Troubleshooting

### "Failed to connect to MongoDB"

**Solution:** Ensure MongoDB is running and the `MONGO_URI` in your `.env` file is correct.

```bash
# Check if MongoDB is running
# Windows:
net start MongoDB

# Linux/Mac:
sudo systemctl status mongod
```

### "Database already contains X users"

**Solution:** The script detects existing data. You can:
- Choose 'y' to add more data alongside existing data
- Choose 'n' to cancel
- Drop the database and start fresh (see "Resetting the Database" above)

### "Test teacher not found"

**Solution:** When running `create_test_student_data.py`, you must first run `create_test_teacher.py`:

```bash
python backend/scripts/seeders/create_test_teacher.py
python backend/scripts/seeders/create_test_student_data.py
```

### Import Errors

**Solution:** Ensure you're running the scripts from the project root directory and all dependencies are installed:

```bash
# From project root
pip install -r backend/requirements.txt
python backend/scripts/seeders/seed_sample_data.py
```

---

## Best Practices

1. **Never commit seeded data to production** - These scripts are for development/testing only
2. **Use separate databases** - Consider using different database names for development, testing, and production
3. **Document custom seeders** - If you create additional seeder scripts, document them here
4. **Version control** - Keep seeder scripts in version control, but never commit actual database dumps
5. **Clean data regularly** - Periodically reset your development database to ensure seeders work correctly

---

## Adding New Seeder Scripts

When creating new seeder scripts:

1. Place them in `backend/scripts/seeders/`
2. Follow the naming convention: `seed_*.py` or `create_*.py`
3. Include proper error handling and user feedback
4. Check for existing data before inserting
5. Document the script in this README
6. Add proper imports and path configuration:

```python
import sys
import os
from dotenv import load_dotenv

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

# Load environment variables
load_dotenv()
```

---

## Related Documentation

- [Backend README](../../README.md) - Main backend documentation
- [DEV_NOTES.md](../../../docs/DEV_NOTES.md) - Development setup and configuration
- [Database Schema](../../utils/db_init.py) - Database indexes and structure

---

**Last Updated:** 2024
**Maintained By:** EduNexa Development Team
