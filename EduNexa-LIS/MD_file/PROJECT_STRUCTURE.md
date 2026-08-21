# Project Structure

## Clean Directory Organization

```
project/
│
├── frontend/                    # React + TypeScript Frontend
│   ├── src/                    # Source code
│   │   ├── components/         # React components
│   │   ├── config/             # Configuration files
│   │   ├── contexts/           # React contexts
│   │   ├── hooks/              # Custom hooks
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   ├── types/              # TypeScript types
│   │   ├── utils/              # Utility functions
│   │   └── test/               # Frontend tests
│   │
│   ├── dist/                   # Build output (gitignored)
│   ├── node_modules/           # Dependencies (gitignored)
│   ├── package.json            # Frontend dependencies
│   ├── vite.config.ts          # Vite configuration
│   ├── vitest.config.ts        # Vitest test configuration
│   ├── tsconfig.json           # TypeScript configuration
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   ├── postcss.config.js       # PostCSS configuration
│   └── eslint.config.js        # ESLint configuration
│
├── backend/                     # Flask + Python Backend
│   ├── routes/                 # API route handlers
│   │   ├── auth.py            # Authentication routes
│   │   ├── courses.py         # Course management
│   │   ├── assignments.py     # Assignment routes
│   │   ├── grading.py         # Grading routes
│   │   ├── users.py           # User management
│   │   ├── ai.py              # AI integration
│   │   ├── analytics.py       # Analytics routes
│   │   ├── videos.py          # Video management
│   │   ├── documents.py       # Document management
│   │   ├── progress.py        # Progress tracking
│   │   ├── notifications.py   # Notifications
│   │   ├── discussions.py     # Discussion forums
│   │   ├── schedule.py        # Scheduling
│   │   └── achievements.py    # Achievements/badges
│   │
│   ├── services/               # Business logic layer
│   │   └── notification_service.py
│   │
│   ├── utils/                  # Utility functions
│   │   ├── db_init.py         # Database initialization
│   │   ├── error_handler.py   # Error handling
│   │   ├── validation.py      # Input validation
│   │   ├── api_response.py    # API response formatting
│   │   ├── case_converter.py  # Case conversion utilities
│   │   ├── file_logger.py     # File logging utilities
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
│   │   ├── edunexa.log        # General logs
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
│
├── .gitignore                  # Git ignore rules
├── deploy.sh                   # Deployment script
├── PROJECT_STRUCTURE.md        # This file
└── README.md                   # Project documentation
```

## Removed Files/Folders

The following unnecessary files and folders have been removed:

### Root Level
- `$null` - Empty file
- `tatus --short` - Git command output
- `how --stat 291edfd` - Git command output
- `FIXES_COMPLETE.txt` - Temporary file
- `.hypothesis/` (root) - Moved to backend
- `.pytest_cache/` (root) - Moved to backend
- `Tests/` - Duplicate test folder
- `Thumbnails directory ready/` - Unnecessary folder
- `_archive/` - Old archived files
- `uploads/` (root) - Duplicate of backend/uploads
- `echo/` - Unnecessary folder
- `docs/` - Unnecessary folder

### Backend Cleanup
- `backend/diagnose_student_issue.py` - Diagnostic script
- `backend/diagnose_student.py` - Diagnostic script
- `backend/setup_notifications.py` - Setup script (already run)
- `backend/test_logging_manual.py` - Manual test file
- `backend/test_video_progress_manual.py` - Manual test file
- `backend/test_video_linking_manual.py` - Manual test file
- `backend/cleanup_test_data.py` - Cleanup script
- `backend/verify_document_upload.py` - Verification script
- `backend/fix_student_access.py` - Fix script
- `backend/render.yaml` - Unused deployment config
- `backend/routes/test_users.py` - Test route (not for production)
- `backend/scripts/verify_schema_consistency.py` - Verification script
- `backend/scripts/cleanup_seed_data.py` - Cleanup script
- `backend/scripts/verify_mongodb_only.py` - Verification script
- `backend/scripts/view_test_users.py` - View script
- `backend/scripts/identify_mock_data.py` - Identification script

### Reorganized Files
- `backend/token_cleanup.py` → `backend/scripts/token_cleanup.py`
- `backend/reset_admin_password.py` → `backend/scripts/reset_admin_password.py`

## Running the Project

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
python run.py
```

## Notes
- All frontend files are now in `frontend/` directory
- All backend files are now in `backend/` directory
- Environment files are in their respective directories
- Build outputs and dependencies are properly gitignored
