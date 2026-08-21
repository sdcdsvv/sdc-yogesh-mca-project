# MongoDB Authentication & Chat Storage - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install MongoDB

**Windows:**
```bash
# Download and install from: https://www.mongodb.com/try/download/community
# Start MongoDB service
net start MongoDB
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongod
```

**Mac:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

### Step 2: Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 3: Initialize Database

```bash
cd backend
python scripts/init_database.py --all
```

This will:
- Create collections (users, chats)
- Create indexes
- Seed test data

**Test Credentials:**
- Email: `test@uttarakhand.com`
- Password: `test123`

### Step 4: Start Server

```bash
python run.py
```

Server starts at: `http://localhost:5000`

---

## 🧪 Test the API

### 1. Test Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"test123","name":"Test User"}'
```

### 2. Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"test123"}'
```

**Copy the token from response!**

### 3. Test Chat Save
```bash
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"role":"user","content":"Tell me about Kedarnath"}'
```

### 4. Test Get History
```bash
curl -X GET http://localhost:5000/api/chat/history \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Test Feedback
```bash
curl -X POST http://localhost:5000/api/chat/feedback \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"message_id":"MESSAGE_ID","rating":1}'
```

---

## 📊 What's Implemented

✅ **User Authentication**
- Signup with email validation
- Login with JWT tokens
- Password hashing (bcrypt)
- Profile management

✅ **Chat Storage**
- Per-user private history
- Session-based organization
- Full CRUD operations
- Pagination support

✅ **Feedback System**
- Like/Dislike responses
- Feedback comments
- Analytics tracking
- Reinforcement learning data

✅ **Security**
- JWT authentication
- Password hashing
- User-specific access
- Input validation

---

## 🔌 Key API Endpoints

### Authentication
```
POST   /api/auth/signup          - Create account
POST   /api/auth/login           - Login
GET    /api/auth/profile         - Get profile
PUT    /api/auth/profile         - Update profile
POST   /api/auth/change-password - Change password
```

### Chat & Feedback
```
POST   /api/chat/message         - Save message
GET    /api/chat/history         - Get history
GET    /api/chat/sessions        - Get sessions
GET    /api/chat/session/:id     - Get session messages
POST   /api/chat/feedback        - Add like/dislike
GET    /api/chat/analytics       - Get analytics
DELETE /api/chat/message/:id     - Delete message
DELETE /api/chat/session/:id     - Delete session
DELETE /api/chat/history         - Delete all history
```

---

## 🔐 Authentication Flow

1. **Signup/Login** → Get JWT token
2. **Store token** in localStorage/sessionStorage
3. **Add to requests**: `Authorization: Bearer <token>`
4. **Token expires** after 7 days

---

## 📝 Database Schema

### Users
```javascript
{
  email: "user@example.com",
  password: "hashed",
  name: "User Name",
  language: "english",
  stats: {
    total_chats: 0,
    positive_feedback: 0,
    negative_feedback: 0
  }
}
```

### Chats
```javascript
{
  user_id: "user-id",
  session_id: "session-uuid",
  role: "user" | "assistant",
  content: "message",
  timestamp: ISODate,
  feedback: {
    rating: 1 | -1 | null,
    comment: "optional"
  }
}
```

---

## 🎯 Feedback System

### How to Use

1. **User sends message** → Save with role: "user"
2. **AI responds** → Save with role: "assistant"
3. **User likes/dislikes** → POST to /api/chat/feedback
4. **System tracks** → Updates stats and analytics

### Reinforcement Learning

```python
# Get similar liked responses
liked_responses = chat_model.get_similar_liked_responses(
    query="Tell me about Kedarnath",
    limit=5
)

# Use for:
# - Response ranking
# - Template boosting
# - Style learning
# - Quality improvement
```

---

## 🔧 Configuration

### Environment Variables (.env)
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DB_NAME=uttarakhand_tourism

# JWT Secret (change in production!)
JWT_SECRET=your-secret-key-here

# Flask
SECRET_KEY=flask-secret-key
FLASK_ENV=development
```

---

## 📈 Monitoring

### Check Database
```bash
mongosh
use uttarakhand_tourism
db.users.countDocuments()
db.chats.countDocuments()
```

### View Collections
```bash
db.users.find().pretty()
db.chats.find().limit(5).pretty()
```

### Check Indexes
```bash
db.users.getIndexes()
db.chats.getIndexes()
```

---

## 🐛 Troubleshooting

### MongoDB not starting?
```bash
# Check status
mongosh

# Restart service
# Windows: net start MongoDB
# Linux: sudo systemctl restart mongod
# Mac: brew services restart mongodb-community
```

### Can't connect to database?
- Check MONGODB_URI in .env
- Verify MongoDB is running
- Check firewall settings

### JWT token invalid?
- Check JWT_SECRET in .env
- Verify token format: `Bearer <token>`
- Token might be expired (7 days)

---

## 📚 Full Documentation

See `backend/MONGODB_SETUP.md` for:
- Complete API reference
- Security details
- Performance optimization
- Advanced features
- Integration examples

---

## ✅ Checklist

- [ ] MongoDB installed and running
- [ ] Python dependencies installed
- [ ] Database initialized
- [ ] Server started successfully
- [ ] Test signup working
- [ ] Test login working
- [ ] Test chat save working
- [ ] Test feedback working

---

**Ready to integrate with frontend!** 🎉

Next steps:
1. Update frontend login/signup
2. Store JWT token
3. Add Authorization header
4. Implement chat history UI
5. Add like/dislike buttons
