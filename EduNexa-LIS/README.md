# EduNexa - AI-Integrated Learning Management System

A comprehensive full-stack Learning Management System built with React + TypeScript (frontend) and Flask + Python (backend), featuring AI-powered learning assistance, analytics, and course management.

## ✨ Key Features

- **Role-Based Access Control**: Separate interfaces for Students, Teachers, and Admins
- **Course Management**: Create, manage, and enroll in courses with rich content
- **Assignment System**: Submit assignments, grade submissions, and track progress
- **AI Integration**: 
  - AI-powered chatbot for learning assistance
  - Content summarization
  - Automated quiz generation
  - Personalized learning recommendations
- **Video Management**: Upload and track video progress
- **Document Management**: Upload and manage course materials
- **Analytics Dashboard**: Comprehensive analytics for students, teachers, and admins
- **Notifications System**: Real-time notifications for course activities
- **Discussion Forums**: Interactive discussions for courses
- **Progress Tracking**: Track student progress across courses
- **Achievements & Badges**: Gamification with badges and points
- **Schedule Management**: Course scheduling and calendar

## 📁 Project Structure

```
project/
│
├── frontend/                    # React + TypeScript Frontend
│   ├── src/                    # Source code
│   │   ├── components/         # React components
│   │   ├── config/             # Configuration files
│   │   ├── contexts/           # React contexts (Auth, LMS)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Page components
│   │   ├── services/           # API service layer
│   │   ├── types/              # TypeScript type definitions
│   │   ├── utils/              # Utility functions
│   │   └── test/               # Frontend tests
│   ├── dist/                   # Build output (gitignored)
│   ├── node_modules/           # Dependencies (gitignored)
│   ├── package.json            # Frontend dependencies
│   ├── vite.config.ts          # Vite configuration
│   ├── vitest.config.ts        # Vitest test configuration
│   ├── tsconfig.json           # TypeScript configuration
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   └── eslint.config.js        # ESLint configuration
│
├── backend/                     # Flask + Python Backend
│   ├── routes/                 # API route handlers
│   │   ├── auth.py            # Authentication & authorization
│   │   ├── courses.py         # Course management
│   │   ├── assignments.py     # Assignment management
│   │   ├── grading.py         # Grading system
│   │   ├── users.py           # User management
│   │   ├── ai.py              # AI features (chatbot, summarization)
│   │   ├── analytics.py       # Analytics & reporting
│   │   ├── learner_analytics.py # Student-specific analytics
│   │   ├── videos.py          # Video management
│   │   ├── documents.py       # Document management
│   │   ├── progress.py        # Progress tracking
│   │   ├── student_progress.py # Student progress details
│   │   ├── notifications.py   # Notification system
│   │   ├── notification_settings.py # Notification preferences
│   │   ├── discussions.py     # Discussion forums
│   │   ├── schedule.py        # Course scheduling
│   │   └── achievements.py    # Achievements & badges
│   │
│   ├── services/               # Business logic layer
│   │   ├── notification_service.py
│   │   └── enhanced_notification_service.py
│   │
│   ├── utils/                  # Utility functions
│   │   ├── db_init.py         # Database initialization
│   │   ├── error_handler.py   # Error handling
│   │   ├── validation.py      # Input validation
│   │   ├── api_response.py    # API response formatting
│   │   ├── case_converter.py  # Case conversion utilities
│   │   ├── file_logger.py     # File logging
│   │   └── token_cleanup.py   # Token cleanup utilities
│   │
│   ├── scripts/                # Utility scripts
│   │   ├── seeders/           # Database seeders
│   │   ├── create_missing_indexes.py
│   │   ├── generate_test_users.py
│   │   ├── notification_cli.py
│   │   ├── reset_admin_password.py
│   │   └── token_cleanup.py
│   │
│   ├── tests/                  # Backend tests
│   ├── uploads/                # User uploaded files
│   │   ├── assignments/       # Assignment submissions
│   │   ├── documents/         # Course documents
│   │   ├── thumbnails/        # Course thumbnails
│   │   └── videos/            # Video files
│   │
│   ├── logs/                   # Application logs
│   │   ├── edunexa.log        # General application logs
│   │   ├── errors.log         # Error logs
│   │   └── file_operations.log # File operation logs
│   │
│   ├── app.py                  # Flask application
│   ├── run.py                  # Application entry point
│   ├── gunicorn_config.py      # Gunicorn configuration
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Environment template
│   └── README.md               # Backend documentation
│
├── .git/                       # Git repository
├── .kiro/                      # Kiro IDE settings
├── .vscode/                    # VS Code settings
├── .gitignore                  # Git ignore rules
├── deploy.sh                   # Deployment script
├── CLEANUP_SUMMARY.md          # Cleanup documentation
├── PROJECT_STRUCTURE.md        # Detailed structure documentation
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (local or cloud instance)
- **Google Gemini API Key** (for AI features)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
# Copy example environment file
copy .env.example .env  # Windows
cp .env.example .env    # macOS/Linux
```

5. Edit `.env` file with your configuration:
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

6. Start the backend server:
```bash
python run.py
```

The backend API will run on `http://localhost:5010`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🔑 Test Credentials

### Students
- **Email**: student01@datams.edu | **Password**: Stud@2025
- **Email**: student02@datams.edu | **Password**: Stud@2025
- **Email**: student03@datams.edu | **Password**: Stud@2025

### Teachers
- **Email**: teacher01@datams.edu | **Password**: Teach@2025
- **Email**: teacher02@datams.edu | **Password**: Teach@2025

### Admins
- **Email**: admin@datams.edu | **Password**: Yogi@#2025
- **Email**: superadmin@datams.edu | **Password**: Admin@123456 (deprecated - use admin@datams.edu)

## 📦 Available Scripts

### Frontend
- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests (single run)
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run build:netlify` - Build for Netlify deployment

### Backend
- `python run.py` - Start Flask development server
- `python app.py` - Alternative way to start server
- `pytest` - Run backend tests
- `python backend/scripts/generate_test_users.py` - Generate test users
- `python backend/scripts/reset_admin_password.py` - Reset admin password
- `python backend/scripts/token_cleanup.py` - Clean up expired tokens
- `python backend/scripts/notification_cli.py` - Notification CLI tool

## 🌐 Deployment

### Production Deployment

1. **Backend Deployment**:
   - Set `FLASK_ENV=production` in environment variables
   - Use Gunicorn as WSGI server: `gunicorn -c gunicorn_config.py app:app`
   - Configure MongoDB with authentication
   - Set up reverse proxy (Nginx/Apache)
   - Enable SSL certificates

2. **Frontend Deployment**:
   - Build production bundle: `npm run build`
   - Deploy `dist/` folder to hosting platform (Netlify, Vercel, etc.)
   - Configure environment variables for API endpoints

3. **Using Deploy Script**:
```bash
./deploy.sh
```

### Recommended Hosting Platforms
- **Backend**: Render, Railway, Heroku, AWS, DigitalOcean
- **Frontend**: Netlify, Vercel, GitHub Pages
- **Database**: MongoDB Atlas (cloud)

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **React Markdown** - Markdown rendering with syntax highlighting
- **Supabase Client** - Backend integration
- **Vitest** - Unit testing framework
- **ESLint** - Code linting

### Backend
- **Flask 3.0** - Python web framework
- **MongoDB (PyMongo)** - NoSQL database
- **Flask-JWT-Extended** - JWT authentication
- **Flask-CORS** - Cross-origin resource sharing
- **Google Generative AI (Gemini)** - AI-powered features
- **PyPDF2** - PDF text extraction
- **Pillow** - Image processing
- **Bcrypt** - Password hashing
- **Gunicorn** - Production WSGI server
- **Pytest** - Testing framework
- **Bleach** - HTML sanitization

## 📚 API Documentation

For detailed API documentation, see [backend/README.md](backend/README.md)

### Main API Endpoints

- **Authentication**: `/api/auth/*` - Login, register, profile management
- **Courses**: `/api/courses/*` - Course CRUD, enrollment, materials
- **Assignments**: `/api/assignments/*` - Assignment management and submissions
- **Grading**: `/api/grading/*` - Grade submissions and feedback
- **Users**: `/api/users/*` - User management (admin)
- **AI Features**: `/api/ai/*` - Chatbot, summarization, quiz generation
- **Analytics**: `/api/analytics/*` - Dashboard and reporting
- **Videos**: `/api/videos/*` - Video upload and progress tracking
- **Documents**: `/api/documents/*` - Document management
- **Progress**: `/api/progress/*` - Student progress tracking
- **Notifications**: `/api/notifications/*` - Notification system
- **Discussions**: `/api/discussions/*` - Discussion forums
- **Schedule**: `/api/schedule/*` - Course scheduling
- **Achievements**: `/api/achievements/*` - Badges and achievements

## 🗄️ Database Schema

The application uses MongoDB with the following main collections:

- **users** - User accounts (students, teachers, admins)
- **courses** - Course information and metadata
- **enrollments** - Student course enrollments
- **assignments** - Assignment details
- **submissions** - Assignment submissions
- **videos** - Video content and metadata
- **documents** - Course documents
- **progress** - Student progress tracking
- **notifications** - User notifications
- **discussions** - Discussion forum posts
- **achievements** - User achievements and badges
- **schedules** - Course schedules

For detailed schema information, see [backend/README.md](backend/README.md)

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm run test          # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:ui       # Run tests with UI
```

### Backend Tests
```bash
cd backend
pytest                # Run all tests
pytest -v             # Verbose output
pytest tests/         # Run specific test directory
```

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Input validation and sanitization
- HTML sanitization with Bleach
- CORS configuration
- Secure file upload handling
- Token expiration and cleanup

## 📝 Development Guidelines

1. **Code Style**:
   - Frontend: Follow ESLint configuration
   - Backend: Follow PEP 8 Python style guide

2. **Git Workflow**:
   - Create feature branches from `main`
   - Write descriptive commit messages
   - Submit pull requests for review

3. **Testing**:
   - Write tests for new features
   - Ensure all tests pass before committing
   - Maintain test coverage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For issues and questions:
- Check the [backend documentation](backend/README.md)
- Review [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- Check [CLEANUP_SUMMARY.md](CLEANUP_SUMMARY.md) for recent changes

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Real-time collaboration features
- [ ] Advanced AI tutoring
- [ ] Integration with external LMS platforms
- [ ] Video conferencing integration
- [ ] Advanced analytics and reporting
- [ ] Multi-language support

















backend run process

(base) sdc-dsvv@sdc-dsvv:~/Desktop/SDC STUDENTS PROJECT/yogesh project mca 4th/EduNexa-LIS/backend$ conda activate yogesh_project
(yogesh_project) sdc-dsvv@sdc-dsvv:~/Desktop/SDC STUDENTS PROJECT/yogesh project mca 4th/EduNexa-LIS/backend$ python app.py
Traceback (most recent call last):
  File "/home/sdc-dsvv/Desktop/SDC STUDENTS PROJECT/yogesh project mca 4th/EduNexa-LIS/backend/app.py", line 3, in <module>
    from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
ModuleNotFoundError: No module named 'flask_jwt_extended'
(yogesh_project) sdc-dsvv@sdc-dsvv:~/Desktop/SDC STUDENTS PROJECT/yogesh project mca 4th/EduNexa-LIS/backend$ conda env list

# conda environments:
#
# * -> active
# + -> frozen
base                     /home/sdc-dsvv/miniconda3
alumani                  /home/sdc-dsvv/miniconda3/envs/alumani
amit_bit_6sem            /home/sdc-dsvv/miniconda3/envs/amit_bit_6sem
cs-broad-y               /home/sdc-dsvv/miniconda3/envs/cs-broad-y
event_copy               /home/sdc-dsvv/miniconda3/envs/event_copy
gaurav_it6sem            /home/sdc-dsvv/miniconda3/envs/gaurav_it6sem
gk                       /home/sdc-dsvv/miniconda3/envs/gk
quiz_master2             /home/sdc-dsvv/miniconda3/envs/quiz_master2
sachin_mca_anubhuti      /home/sdc-dsvv/miniconda3/envs/sachin_mca_anubhuti
sdc_event1               /home/sdc-dsvv/miniconda3/envs/sdc_event1
sdc_event_env            /home/sdc-dsvv/miniconda3/envs/sdc_event_env
skillsync                /home/sdc-dsvv/miniconda3/envs/skillsync
uttarakhand              /home/sdc-dsvv/miniconda3/envs/uttarakhand
yogesh_project       *   /home/sdc-dsvv/miniconda3/envs/yogesh_project

(yogesh_project) sdc-dsvv@sdc-dsvv:~/Desktop/SDC STUDENTS PROJECT/yogesh project mca 4th/EduNexa-LIS/backend$ conda deactivate
(base) sdc-dsvv@sdc-dsvv:~/Desktop/SDC STUDENTS PROJECT/yogesh project mca 4th/EduNexa-LIS/backend$ conda activate uttarakhand 
(uttarakhand) sdc-dsvv@sdc-dsvv:~/Desktop/SDC STUDENTS PROJECT/yogesh project mca 4th/EduNexa-LIS/backend$ python app.py
/home/sdc-dsvv/miniconda3/envs/uttarakhand/lib/python3.10/site-packages/google/api_core/_python_version_support.py:273: FutureWarning: You are using a Python version (3.10.20) which Google will stop supporting in new releases of google.api_core once it reaches its end of life (2026-10-04). Please upgrade to the latest Python version, or at least Python 3.11, to continue receiving updates for google.api_core past that date.
  warnings.warn(message, FutureWarning)
⚠️  Warning: GEMINI_API_KEY not found. AI features will use fallback responses.
✅ Connected to MongoDB successfully!
🔧 Initializing database...
📊 Database indexes created
✅ Database initialized with indexes
ℹ️  To seed sample data, run: python backend/scripts/seeders/seed_sample_data.py
Cleaned up 0 expired refresh tokens
Cleaned up 0 expired password reset tokens
 * Serving Flask app 'app'
 * Debug mode: on
INFO:werkzeug:WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://192.160.108.56:5000
INFO:werkzeug:Press CTRL+C to quit
INFO:werkzeug: * Restarting with stat
/home/sdc-dsvv/miniconda3/envs/uttarakhand/lib/python3.10/site-packages/google/api_core/_python_version_support.py:273: FutureWarning: You are using a Python version (3.10.20) which Google will stop supporting in new releases of google.api_core once it reaches its end of life (2026-10-04). Please upgrade to the latest Python version, or at least Python 3.11, to continue receiving updates for google.api_core past that date.
  warnings.warn(message, FutureWarning)
✅ Connected to MongoDB successfully!
🔧 Initializing database...
📊 Database indexes created
✅ Database initialized with indexes
ℹ️  To seed sample data, run: python backend/scripts/seeders/seed_sample_data.py
Cleaned up 0 expired refresh tokens
Cleaned up 0 expired password reset tokens
WARNING:werkzeug: * Debugger is active!
INFO:werkzeug: * Debugger PIN: 493-926-427
