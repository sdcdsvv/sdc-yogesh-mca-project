# Uttarakhand Tourism AI - Version 2.0

## 🎉 New Features: Chat History & Feedback System

Version 2.0 introduces a comprehensive chat history and feedback system with reinforcement learning capabilities.

## 🚀 Quick Start

### 1. Setup Database
```bash
cd backend
python scripts/migrate_db.py
```

### 2. Start Backend
```bash
python run.py
```

### 3. Start Frontend
```bash
cd frontend
npm run dev
```

### 4. Test Features
- Navigate to `http://localhost:5173`
- Sign up / Login
- Chat with AI and use like/dislike buttons
- View history at `/history`
- Edit profile at `/profile`

## ✨ Key Features

### 🗨️ Chat History
- View all your conversations
- Search through messages
- Delete messages or entire conversations
- Session-based grouping

### 👍 Feedback System
- Like/Dislike buttons on AI responses
- Visual feedback indicators
- Feedback analytics
- User statistics

### 🧠 Reinforcement Learning
- Liked responses get boosted (weight ×1.2)
- Disliked responses get reduced (weight ×0.8)
- System learns from your preferences
- Better responses over time

### 👤 User Profile
- Edit name and language
- Upload avatar
- View statistics
- Secure authentication

## 📚 Documentation

- **[FEATURE_IMPLEMENTATION.md](./FEATURE_IMPLEMENTATION.md)** - Complete technical documentation
- **[QUICK_START_FEATURES.md](./QUICK_START_FEATURES.md)** - Quick start guide
- **[CHANGELOG_V2.md](./CHANGELOG_V2.md)** - Detailed changelog
- **[DELIVERABLES_SUMMARY.md](./DELIVERABLES_SUMMARY.md)** - Implementation summary

## 🧪 Testing

### Postman Collection
Import `API_Collection.postman.json` into Postman to test all API endpoints.

### Manual Testing
Follow the step-by-step guide in `QUICK_START_FEATURES.md`

## 🔒 Security

- Bcrypt password hashing
- JWT authentication
- Protected API endpoints
- User-specific data isolation
- Input validation

## 📊 Database Schema

### Users
- Email, password, name, language
- Avatar (base64 or URL)
- Statistics (chats, feedback)

### Chats
- User ID, session ID, role
- Content, timestamp
- Feedback (rating, comment)
- Reinforcement weight

## 🎯 API Endpoints

### Public (No Auth)
- `POST /api/chat/message` - Chat with AI
- `GET /api/chat/suggestions` - Get suggestions

### Protected (Requires JWT)
- `POST /api/auth/signup` - Sign up
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/history/message` - Save message
- `GET /api/history/history` - Get history
- `POST /api/history/feedback` - Submit feedback
- `DELETE /api/history/message/:id` - Delete message

## 🎨 UI Components

### New Pages
- `/history` - Chat History page
- `/profile` - User Profile page

### Updated Components
- Chat Interface - Added feedback buttons
- Message Bubble - Like/Dislike controls
- Navbar - History and Profile links

## 🔧 Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Flask, Python
- **Database**: MongoDB
- **Auth**: JWT, Bcrypt
- **API**: RESTful

## 📈 Performance

- Efficient MongoDB indexes
- Pagination support
- JWT token caching
- Optimized queries

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Start MongoDB
mongod --dbpath /path/to/data
```

### 401 Unauthorized
- Ensure you're logged in
- Check JWT token in localStorage
- Token might have expired

### Empty Chat History
- Messages only saved when authenticated
- Try logging in and sending new messages

## 🎓 How Reinforcement Learning Works

1. User likes a response → Weight increases (×1.2)
2. User dislikes a response → Weight decreases (×0.8)
3. System searches for similar liked responses
4. Uses them as templates for future responses
5. Responses improve over time

## 📝 Migration from V1

1. Run migration script: `python scripts/migrate_db.py`
2. Clear browser localStorage
3. Re-login to get JWT token
4. Start using new features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

Same as main project

## 🙏 Acknowledgments

- Built with Kiro AI Assistant
- Inspired by modern chat applications
- Designed for Uttarakhand Tourism

---

**Version**: 2.0.0  
**Release Date**: November 16, 2025  
**Status**: Production Ready ✅

For detailed documentation, see [FEATURE_IMPLEMENTATION.md](./FEATURE_IMPLEMENTATION.md)
