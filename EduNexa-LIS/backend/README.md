# EduNexa LMS Backend

A comprehensive Flask-based backend for the EduNexa AI-Integrated Learning Management System.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Students, Teachers, and Admins with different permissions
- **Course Management**: Create, manage, and enroll in courses
- **Assignment System**: Create assignments, submit work, and grade submissions
- **Quiz System**: Create quizzes with multiple question types and auto-grading
- **AI Integration**: Chatbot, content summarization, and quiz generation using Gemini AI
- **Analytics**: Comprehensive analytics for students, teachers, and administrators
- **MongoDB Integration**: Flexible NoSQL database with optimized queries

## Tech Stack

- **Backend**: Flask (Python)
- **Database**: MongoDB
- **Authentication**: JWT (Flask-JWT-Extended)
- **AI**: Google Gemini API
- **File Processing**: PyPDF2 for PDF text extraction
- **Security**: Werkzeug for password hashing

## Installation

### Prerequisites

- Python 3.8+
- MongoDB (local or cloud)
- Google Gemini API key

### Setup

1. **Clone and navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration**:
   ```bash
   # Copy example environment file
   copy .env.example .env
   
   # Edit .env file with your configuration
   ```

5. **Configure Environment Variables**:
   Edit `.env` file with your settings:
   ```env
   # MongoDB Configuration
   MONGO_URI=mongodb://localhost:27017/edunexa_lms
   
   # JWT Configuration
   JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
   
   # AI Configuration (Gemini API)
   GEMINI_API_KEY=your-gemini-api-key-here
   
   # Flask Configuration
   FLASK_ENV=development
   FLASK_DEBUG=True
   ```

6. **Start MongoDB**:
   Make sure MongoDB is running on your system.

7. **Run the application**:
   ```bash
   python app.py
   ```

The backend will start on `http://localhost:5010`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

### Courses
- `GET /api/courses/` - Get courses
- `POST /api/courses/` - Create course (Teacher/Admin)
- `GET /api/courses/<id>` - Get course details
- `PUT /api/courses/<id>` - Update course
- `POST /api/courses/<id>/enroll` - Enroll in course
- `POST /api/courses/<id>/unenroll` - Unenroll from course
- `POST /api/courses/<id>/materials` - Upload course material
- `GET /api/courses/<id>/students` - Get enrolled students

### Assignments
- `GET /api/assignments/` - Get assignments
- `POST /api/assignments/` - Create assignment
- `GET /api/assignments/<id>` - Get assignment details
- `PUT /api/assignments/<id>` - Update assignment
- `POST /api/assignments/<id>/submit` - Submit assignment
- `POST /api/assignments/submissions/<id>/grade` - Grade submission

### Quizzes
- `GET /api/quizzes/` - Get quizzes
- `POST /api/quizzes/` - Create quiz
- `GET /api/quizzes/<id>` - Get quiz details
- `POST /api/quizzes/<id>/attempt` - Attempt quiz
- `GET /api/quizzes/<id>/attempts` - Get quiz attempts

### Users (Admin)
- `GET /api/users/` - Get all users
- `GET /api/users/<id>` - Get user details
- `PUT /api/users/<id>` - Update user
- `POST /api/users/<id>/deactivate` - Deactivate user
- `POST /api/users/<id>/activate` - Activate user
- `POST /api/users/<id>/reset-password` - Reset user password
- `POST /api/users/bulk-import` - Bulk import users
- `GET /api/users/statistics` - Get user statistics

### AI Features
- `POST /api/ai/chat` - AI chatbot
- `POST /api/ai/summarize` - Summarize content
- `POST /api/ai/generate-quiz` - Generate quiz from content
- `GET /api/ai/recommendations` - Get personalized recommendations
- `GET /api/ai/chat-history` - Get chat history
- `POST /api/ai/learning-path` - Generate learning path

### Analytics
- `GET /api/analytics/dashboard` - Dashboard analytics
- `GET /api/analytics/course/<id>` - Course analytics
- `GET /api/analytics/student/<id>` - Student analytics
- `GET /api/analytics/system` - System analytics (Admin)

## Database Schema

### Users Collection
```javascript
{
  "_id": ObjectId,
  "name": String,
  "email": String (unique),
  "password": String (hashed),
  "role": String, // "student", "teacher", "admin"
  "phone": String,
  "profile_pic": String,
  "created_at": Date,
  "updated_at": Date,
  "is_active": Boolean,
  
  // Student-specific fields
  "roll_no": String,
  "department": String,
  "year": String,
  "semester": String,
  "enrolled_courses": [String],
  "completed_courses": [String],
  "total_points": Number,
  "badges": [String],
  
  // Teacher-specific fields
  "employee_id": String,
  "designation": String,
  "courses_created": [String],
  "specializations": [String]
}
```

### Courses Collection
```javascript
{
  "_id": ObjectId,
  "title": String,
  "description": String,
  "category": String,
  "teacher_id": String,
  "difficulty": String,
  "duration": String,
  "prerequisites": [String],
  "learning_objectives": [String],
  "thumbnail": String,
  "is_active": Boolean,
  "is_public": Boolean,
  "max_students": Number,
  "created_at": Date,
  "updated_at": Date
}
```

### Enrollments Collection
```javascript
{
  "_id": ObjectId,
  "course_id": String,
  "student_id": String,
  "enrolled_at": Date,
  "progress": Number,
  "completed_materials": [String],
  "completed_assignments": [String],
  "completed_quizzes": [String],
  "is_active": Boolean
}
```

## Test Credentials

### Students
- **Email**: student01@datams.edu, **Password**: Stud@2025
- **Email**: student02@datams.edu, **Password**: Stud@2025
- **Email**: student03@datams.edu, **Password**: Stud@2025

### Teachers
- **Email**: teacher01@datams.edu, **Password**: Teach@2025
- **Email**: teacher02@datams.edu, **Password**: Teach@2025

### Admins
- **Email**: admin@datams.edu, **Password**: Yogi@#2025
- **Email**: superadmin@datams.edu, **Password**: Admin@123456 (deprecated - use admin@datams.edu)

## Development

### Project Structure
```
backend/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
├── routes/               # API route modules
│   ├── auth.py          # Authentication routes
│   ├── courses.py       # Course management routes
│   ├── assignments.py   # Assignment routes
│   ├── quizzes.py       # Quiz routes
│   ├── users.py         # User management routes
│   ├── ai.py            # AI integration routes
│   └── analytics.py     # Analytics routes
└── utils/               # Utility modules
    └── db_init.py       # Database initialization
```

### Adding New Features

1. Create new route modules in the `routes/` directory
2. Register blueprints in `app.py`
3. Add database models/schemas as needed
4. Update API documentation

### Error Handling

The API uses standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

### Security Features

- JWT token-based authentication
- Password hashing with Werkzeug
- Role-based access control
- Input validation and sanitization
- CORS configuration for frontend integration

## Deployment

### Production Setup

1. Set `FLASK_ENV=production` in environment variables
2. Use a production WSGI server like Gunicorn
3. Set up MongoDB with proper authentication
4. Configure reverse proxy (Nginx)
5. Set up SSL certificates
6. Use environment variables for sensitive data

### Docker Deployment (Optional)

Create a `Dockerfile`:
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["python", "app.py"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.