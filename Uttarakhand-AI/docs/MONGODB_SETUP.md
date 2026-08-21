## MongoDB Authentication & Chat Storage Implementation

Complete implementation of persistent per-user chat storage and feedback-driven response improvement using local MongoDB.

---

## 🎯 Features Implemented

### 1. **User Authentication**
- ✅ Signup with email validation
- ✅ Login with JWT token generation
- ✅ Password hashing with bcrypt
- ✅ Profile management
- ✅ Password change functionality
- ✅ Token verification

### 2. **Chat Storage**
- ✅ Per-user private conversation history
- ✅ Session-based chat organization
- ✅ Message metadata (timestamp, tokens, response time)
- ✅ Pagination support
- ✅ Full CRUD operations

### 3. **Feedback System**
- ✅ Like/Dislike for assistant responses
- ✅ Feedback comments
- ✅ Feedback analytics
- ✅ Reinforcement learning data collection
- ✅ Similar liked responses retrieval

### 4. **Security**
- ✅ JWT-based authentication
- ✅ Password hashing (bcrypt)
- ✅ User-specific data access
- ✅ Secure indexes
- ✅ Input validation

---

## 📁 File Structure

```
backend/
├── app/
│   ├── models/
│   │   ├── user.py              # User model with authentication
│   │   └── chat.py              # Chat model with feedback
│   ├── api/
│   │   ├── auth_routes.py       # Authentication endpoints
│   │   └── chat_routes.py       # Chat & feedback endpoints
│   ├── config/
│   │   └── database.py          # MongoDB connection
│   ├── utils/
│   │   └── auth.py              # JWT utilities
│   └── __init__.py              # Flask app with routes
├── scripts/
│   └── init_database.py         # Database initialization
├── requirements.txt             # Updated dependencies
└── .env                         # Environment variables
```

---

## 🚀 Installation & Setup

### 1. Install MongoDB Locally

**Windows:**
```bash
# Download from: https://www.mongodb.com/try/download/community
# Install and start MongoDB service
net start MongoDB
```

**Linux/Mac:**
```bash
# Install MongoDB
sudo apt-get install mongodb  # Ubuntu/Debian
brew install mongodb-community  # Mac

# Start MongoDB
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # Mac
```

### 2. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**New Dependencies Added:**
- `PyJWT==2.8.0` - JWT token generation
- `bcrypt==4.1.2` - Password hashing
- `email-validator==2.1.0` - Email validation

### 3. Configure Environment Variables

Update `backend/.env`:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DB_NAME=uttarakhand_tourism

# JWT Secret (change in production!)
JWT_SECRET=uttarakhand-tourism-jwt-secret-key-change-in-production-2024
```

### 4. Initialize Database

```bash
cd backend

# Initialize database (create collections and indexes)
python scripts/init_database.py --init

# Initialize and seed test data
python scripts/init_database.py --all

# Only seed test data
python scripts/init_database.py --seed

# Drop all collections (use with caution!)
python scripts/init_database.py --drop
```

### 5. Start Flask Server

```bash
python run.py
```

Server will start at: `http://localhost:5000`

---

## 📊 Database Schema

### Users Collection

```javascript
{
  "_id": ObjectId,
  "email": "user@example.com",  // Unique index
  "password": "hashed_password",  // bcrypt hash
  "name": "User Name",
  "language": "english",
  "created_at": ISODate,
  "updated_at": ISODate,
  "is_active": true,
  "preferences": {
    "theme": "light",
    "notifications": true
  },
  "stats": {
    "total_chats": 0,
    "total_feedback": 0,
    "positive_feedback": 0,
    "negative_feedback": 0
  }
}
```

**Indexes:**
- `email` (unique)
- `created_at`

### Chats Collection

```javascript
{
  "_id": ObjectId,
  "user_id": "user_id_string",  // Compound index with timestamp
  "session_id": "uuid-string",  // Index
  "role": "user" | "assistant",
  "content": "message content",
  "timestamp": ISODate,  // Compound index with user_id
  "metadata": {
    "language": "english",
    "query_type": "destination",
    "tokens_used": 150,
    "response_time": 1.5
  },
  "feedback": {
    "rating": 1 | -1 | null,  // Index
    "comment": "optional comment",
    "timestamp": ISODate
  },
  "tokens_used": 150,
  "response_time": 1.5
}
```

**Indexes:**
- `(user_id, timestamp)` (compound, descending)
- `session_id`
- `feedback.rating`
- `content` (text index for search)

---

## 🔌 API Endpoints

### Authentication Endpoints

#### 1. Signup
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name",
  "language": "english"
}

Response:
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {...},
    "token": "jwt-token-string"
  }
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "token": "jwt-token-string"
  }
}
```

#### 3. Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <jwt-token>

Response:
{
  "success": true,
  "data": {
    "user": {...}
  }
}
```

#### 4. Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "New Name",
  "language": "hindi",
  "preferences": {...}
}
```

#### 5. Change Password
```http
POST /api/auth/change-password
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "old_password": "oldpass123",
  "new_password": "newpass123"
}
```

#### 6. Verify Token
```http
GET /api/auth/verify
Authorization: Bearer <jwt-token>
```

---

### Chat & Feedback Endpoints

#### 1. Save Message
```http
POST /api/chat/message
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "session_id": "uuid-string",  // optional
  "role": "user" | "assistant",
  "content": "message content",
  "metadata": {
    "language": "english",
    "query_type": "destination",
    "tokens_used": 150,
    "response_time": 1.5
  }
}

Response:
{
  "success": true,
  "message": "Message saved successfully",
  "data": {
    "message": {...},
    "session_id": "uuid-string"
  }
}
```

#### 2. Get Chat History
```http
GET /api/chat/history?limit=50&skip=0&session_id=uuid
Authorization: Bearer <jwt-token>

Query Parameters:
- limit: Number of messages (default: 50, max: 100)
- skip: Pagination offset (default: 0)
- session_id: Filter by session (optional)

Response:
{
  "success": true,
  "data": {
    "chats": [...],
    "count": 50,
    "limit": 50,
    "skip": 0
  }
}
```

#### 3. Get Sessions List
```http
GET /api/chat/sessions?limit=20
Authorization: Bearer <jwt-token>

Response:
{
  "success": true,
  "data": {
    "sessions": [
      {
        "_id": "session-id",
        "last_message": "...",
        "last_timestamp": "...",
        "message_count": 10,
        "first_message": "..."
      }
    ],
    "count": 20
  }
}
```

#### 4. Get Session Messages
```http
GET /api/chat/session/<session_id>
Authorization: Bearer <jwt-token>

Response:
{
  "success": true,
  "data": {
    "session_id": "uuid",
    "chats": [...],
    "count": 10
  }
}
```

#### 5. Add Feedback (Like/Dislike)
```http
POST /api/chat/feedback
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "message_id": "message-id-string",
  "rating": 1,  // 1 for like, -1 for dislike
  "comment": "optional feedback comment"
}

Response:
{
  "success": true,
  "message": "Feedback added successfully"
}
```

#### 6. Get Analytics
```http
GET /api/chat/analytics
Authorization: Bearer <jwt-token>

Response:
{
  "success": true,
  "data": {
    "analytics": {
      "total_messages": 100,
      "total_sessions": 10,
      "avg_response_time": 1.2,
      "total_tokens": 5000,
      "user_messages": 50,
      "assistant_messages": 50
    },
    "feedback": {
      "total": 50,
      "liked": 40,
      "disliked": 5,
      "no_feedback": 5
    }
  }
}
```

#### 7. Delete Message
```http
DELETE /api/chat/message/<message_id>
Authorization: Bearer <jwt-token>
```

#### 8. Delete Session
```http
DELETE /api/chat/session/<session_id>
Authorization: Bearer <jwt-token>

Response:
{
  "success": true,
  "message": "Session deleted successfully",
  "data": {
    "deleted_count": 10
  }
}
```

#### 9. Delete All History
```http
DELETE /api/chat/history
Authorization: Bearer <jwt-token>

Response:
{
  "success": true,
  "message": "All chat history deleted successfully",
  "data": {
    "deleted_count": 100
  }
}
```

---

## 🔐 Security Features

### 1. Password Security
- Passwords hashed using bcrypt with salt
- Minimum 6 characters required
- Never stored in plain text
- Secure password change flow

### 2. JWT Authentication
- Token expires after 7 days
- Includes user_id and email in payload
- Verified on every protected route
- Bearer token format

### 3. Data Access Control
- Users can only access their own data
- User ID verified from JWT token
- Database queries filtered by user_id
- Soft delete for users (is_active flag)

### 4. Input Validation
- Email format validation
- Required field checks
- Type validation
- SQL injection prevention (MongoDB)

---

## 🎯 Feedback-Driven Response Improvement

### How It Works

1. **Feedback Collection**
   - Users can like (rating: 1) or dislike (rating: -1) assistant responses
   - Optional comments for detailed feedback
   - Timestamp recorded for tracking

2. **Data Storage**
   - All feedback stored in chat document
   - Indexed for fast retrieval
   - User stats updated automatically

3. **Reinforcement Learning**
   - Liked responses can be retrieved for similar queries
   - Use `get_similar_liked_responses()` method
   - Can be integrated with response generation pipeline

4. **Analytics**
   - Track positive vs negative feedback
   - Monitor response quality over time
   - Identify patterns in user preferences

### Integration Example

```python
from app.models.chat import Chat
from app.config.database import get_database

db = get_database()
chat_model = Chat(db)

# Get similar liked responses for a query
query = "Tell me about Kedarnath"
liked_responses = chat_model.get_similar_liked_responses(query, limit=5)

# Use these responses to:
# 1. Boost similar response templates
# 2. Adjust retrieval ranking
# 3. Weight example responses in generation
# 4. Fine-tune response style
```

---

## 📈 Performance Optimization

### Indexes Created
1. **Users Collection**
   - `email` (unique) - Fast login lookup
   - `created_at` - User registration analytics

2. **Chats Collection**
   - `(user_id, timestamp)` - Fast user history retrieval
   - `session_id` - Session-based queries
   - `feedback.rating` - Feedback analytics
   - `content` (text) - Full-text search

### Query Optimization
- Pagination with skip/limit
- Compound indexes for common queries
- Aggregation pipelines for analytics
- Efficient session grouping

---

## 🧪 Testing

### Test Credentials
After running `python scripts/init_database.py --all`:

```
Email: test@uttarakhand.com
Password: test123
```

### Manual Testing

1. **Test Signup**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

2. **Test Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

3. **Test Chat Save** (use token from login)
```bash
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"role":"user","content":"Hello"}'
```

4. **Test Feedback**
```bash
curl -X POST http://localhost:5000/api/chat/feedback \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"message_id":"MESSAGE_ID","rating":1}'
```

---

## 🔧 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh

# Start MongoDB service
# Windows:
net start MongoDB

# Linux:
sudo systemctl start mongod

# Mac:
brew services start mongodb-community
```

### Database Not Initializing
```bash
# Drop and reinitialize
python scripts/init_database.py --drop
python scripts/init_database.py --all
```

### JWT Token Issues
- Check JWT_SECRET in .env
- Verify token format: `Bearer <token>`
- Check token expiration (7 days)

---

## 📝 Next Steps

1. **Frontend Integration**
   - Update login/signup to use new API
   - Store JWT token in localStorage
   - Add Authorization header to requests
   - Implement chat history UI
   - Add like/dislike buttons

2. **Response Improvement**
   - Integrate feedback data with AI model
   - Use liked responses for training
   - Implement response ranking
   - A/B test different approaches

3. **Advanced Features**
   - Real-time chat with WebSockets
   - Chat export functionality
   - Advanced search in history
   - Conversation summarization
   - Multi-device sync

---

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [PyJWT Documentation](https://pyjwt.readthedocs.io/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [bcrypt Documentation](https://github.com/pyca/bcrypt/)

---

**Last Updated**: November 2024
**Version**: 2.0
**Status**: Production Ready ✅
