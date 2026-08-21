# Chat History & Feedback Feature Implementation

## Overview
This document describes the complete implementation of per-user chat history, feedback system, and reinforcement learning features for the Uttarakhand Tourism AI project.

## Features Implemented

### 1. **Per-User Chat History**
- ✅ Every authenticated user can view their complete chat history
- ✅ Messages include timestamps, role (user/assistant), content, and feedback
- ✅ Paginated chat history page with search functionality
- ✅ Session-based conversation grouping
- ✅ Delete individual messages or entire conversations

### 2. **MongoDB Persistence**
- ✅ All chat messages stored in `chats` collection
- ✅ Comprehensive metadata tracking:
  - `user_id`: Links message to user
  - `session_id`: Groups messages into conversations
  - `role`: 'user' or 'assistant'
  - `content`: Message text
  - `timestamp`: When message was sent
  - `metadata`: Language, query type, tokens used, response time
  - `feedback`: Rating, comment, timestamp
  - `reinforcement_weight`: Used for ML prioritization
- ✅ Efficient indexes for fast queries
- ✅ Migration script for database setup

### 3. **Feedback System (Like/Dislike)**
- ✅ Like/Dislike buttons on every assistant response
- ✅ Feedback stored in database with user_id, message_id, rating, timestamp
- ✅ Visual feedback indicators (green for like, red for dislike)
- ✅ Feedback analytics and statistics

### 4. **Reinforcement Learning**
- ✅ Liked responses get increased `reinforcement_weight` (×1.2)
- ✅ Disliked responses get decreased weight (×0.8)
- ✅ Text search index for finding similar liked responses
- ✅ API endpoint to retrieve similar liked responses
- ✅ Auditable through feedback timestamps and weight tracking

### 5. **User Profile Management**
- ✅ Separate profile page for viewing/editing user info
- ✅ Editable fields: name, language preference, avatar
- ✅ Avatar upload (base64 encoding)
- ✅ Profile statistics display
- ✅ Email is read-only (security)

### 6. **Authentication & Authorization**
- ✅ Secure signup/login with bcrypt password hashing
- ✅ JWT-based authentication
- ✅ Protected API endpoints (require valid token)
- ✅ User can only access their own data

### 7. **UI Updates**
- ✅ Like/Dislike buttons on chat messages
- ✅ Chat History page with session list and message view
- ✅ Profile edit form with avatar upload
- ✅ Navigation links for History and Profile (when logged in)
- ✅ Mobile-responsive design
- ✅ Consistent Uttarakhand theme styling

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  password: String (bcrypt hashed),
  name: String,
  language: String,
  avatar: String (optional, base64 or URL),
  created_at: DateTime (indexed),
  updated_at: DateTime,
  is_active: Boolean (indexed),
  preferences: {
    theme: String,
    notifications: Boolean
  },
  stats: {
    total_chats: Number,
    total_feedback: Number,
    positive_feedback: Number,
    negative_feedback: Number
  }
}
```

**Indexes:**
- `email` (unique)
- `created_at`
- `is_active`

### Chats Collection
```javascript
{
  _id: ObjectId,
  user_id: String (indexed),
  session_id: String (indexed, UUID),
  role: String ('user' | 'assistant', indexed),
  content: String (text indexed),
  timestamp: DateTime (indexed with user_id),
  metadata: {
    language: String,
    query_type: String,
    intent: String,
    model_version: String,
    tokens_used: Number,
    response_time: Number
  },
  feedback: {
    rating: Number (1=like, -1=dislike, null=none, indexed),
    comment: String (optional),
    timestamp: DateTime
  },
  tokens_used: Number,
  response_time: Number,
  reinforcement_weight: Number (default: 1.0)
}
```

**Indexes:**
- `user_id + timestamp` (compound, for user history)
- `session_id` (for conversation grouping)
- `feedback.rating` (for analytics)
- `role` (for filtering)
- `content` (text search, for similarity matching)
- `feedback.rating + timestamp` (for reinforcement learning)

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/profile` - Get current user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `POST /api/auth/change-password` - Change password (protected)
- `GET /api/auth/verify` - Verify JWT token (protected)

### Chat History
- `POST /api/history/message` - Save a chat message (protected)
- `GET /api/history/history` - Get user's chat history with pagination (protected)
- `GET /api/history/sessions` - Get list of user's chat sessions (protected)
- `GET /api/history/session/:id` - Get all messages from a session (protected)
- `POST /api/history/feedback` - Submit feedback on a message (protected)
- `GET /api/history/analytics` - Get chat analytics (protected)
- `DELETE /api/history/message/:id` - Delete a message (protected)
- `DELETE /api/history/session/:id` - Delete a session (protected)
- `DELETE /api/history/history` - Delete all chat history (protected)

### AI Chat (Public)
- `POST /api/chat/message` - Send message to AI (no auth required)
- `POST /api/chat/translate` - Translate text (no auth required)
- `GET /api/chat/suggestions` - Get chat suggestions (no auth required)

## Reinforcement Learning Mechanism

### How It Works

1. **Feedback Collection**
   - User clicks like/dislike on assistant response
   - Feedback stored with rating (1 or -1) and timestamp
   - `reinforcement_weight` updated multiplicatively

2. **Weight Adjustment**
   - **Like (rating=1)**: `weight *= 1.2` (boost by 20%)
   - **Dislike (rating=-1)**: `weight *= 0.8` (reduce by 20%)
   - Multiple likes compound: 1.0 → 1.2 → 1.44 → 1.73...

3. **Response Prioritization**
   - When generating responses, system can query similar liked responses
   - Text search on `content` field finds semantically similar messages
   - Filter by `feedback.rating = 1` to get only liked responses
   - Sort by `reinforcement_weight` to prioritize highly-liked responses
   - Use these as templates or examples for new responses

4. **Auditability**
   - Every feedback action has timestamp
   - Weight changes are traceable through feedback history
   - Analytics show feedback distribution
   - Can track which responses are most helpful

### Implementation Example

```python
# In Chat model
def get_similar_liked_responses(self, query: str, limit: int = 5):
    """Get similar responses that were liked by users"""
    liked_responses = list(
        self.collection.find({
            "role": "assistant",
            "feedback.rating": 1,
            "$text": {"$search": query}
        })
        .sort([
            ("reinforcement_weight", -1),  # Highest weight first
            ("feedback.timestamp", -1)      # Most recent first
        ])
        .limit(limit)
    )
    return liked_responses
```

## Migration & Setup

### 1. Run Database Migration

```bash
cd backend
python scripts/migrate_db.py
```

This will:
- Create collections with proper indexes
- Set up text search indexes
- Display database schema

### 2. Optional: Seed Sample Data

```bash
python scripts/migrate_db.py --seed
```

Creates a demo user:
- Email: demo@uttarakhand.com
- Password: demo123

### 3. View Schema Documentation

```bash
python scripts/migrate_db.py --schema
```

## Testing

### Manual Testing Flow

1. **Signup**
   ```
   POST http://localhost:5000/api/auth/signup
   {
     "email": "test@example.com",
     "password": "test123",
     "name": "Test User"
   }
   ```

2. **Login** (save the token)
   ```
   POST http://localhost:5000/api/auth/login
   {
     "email": "test@example.com",
     "password": "test123"
   }
   ```

3. **Chat** (public, no auth)
   ```
   POST http://localhost:5000/api/chat/message
   {
     "message": "Tell me about Nainital",
     "language": "english"
   }
   ```

4. **Save Message** (with token)
   ```
   POST http://localhost:5000/api/history/message
   Headers: Authorization: Bearer <token>
   {
     "session_id": "session-123",
     "role": "user",
     "content": "Tell me about Nainital",
     "metadata": {"language": "english"}
   }
   ```

5. **Submit Feedback** (with token)
   ```
   POST http://localhost:5000/api/history/feedback
   Headers: Authorization: Bearer <token>
   {
     "message_id": "<message_id>",
     "rating": 1
   }
   ```

6. **View History** (with token)
   ```
   GET http://localhost:5000/api/history/history?limit=50
   Headers: Authorization: Bearer <token>
   ```

### Frontend Testing

1. Start backend: `python run.py`
2. Start frontend: `npm run dev`
3. Navigate to `http://localhost:5173`
4. Sign up / Login
5. Go to Services → Chat
6. Send messages
7. Click like/dislike buttons
8. Navigate to "History" to see saved chats
9. Navigate to "Profile" to edit profile

## Security Features

1. **Password Security**
   - Bcrypt hashing with salt
   - Minimum 6 characters
   - Never returned in API responses

2. **JWT Authentication**
   - Tokens expire (configurable)
   - Required for all protected endpoints
   - Includes user_id and email in payload

3. **Authorization**
   - Users can only access their own data
   - All queries filtered by user_id
   - Message/session ownership verified before deletion

4. **Input Validation**
   - Email format validation
   - Required field checks
   - SQL injection prevention (MongoDB)
   - XSS prevention (sanitized inputs)

## File Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── auth_routes.py          # Authentication endpoints
│   │   ├── chat_routes.py          # Chat history endpoints
│   │   └── chat.py                 # Public AI chat endpoints
│   ├── models/
│   │   ├── user.py                 # User model with auth
│   │   └── chat.py                 # Chat model with feedback
│   ├── utils/
│   │   └── auth.py                 # JWT utilities
│   └── config/
│       └── database.py             # MongoDB connection
├── scripts/
│   └── migrate_db.py               # Database migration script
└── run.py                          # Application entry point

frontend/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Login.tsx           # Login/Signup form
│   │   │   └── Profile.tsx         # Profile page
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx   # Main chat UI
│   │   │   ├── MessageBubble.tsx   # Message with feedback buttons
│   │   │   └── ChatHistory.tsx     # History page
│   │   └── common/
│   │       └── Navbar.tsx          # Navigation with auth
│   ├── services/
│   │   └── api.ts                  # API client functions
│   └── types/
│       └── chat.ts                 # TypeScript types
└── App.tsx                         # Routes
```

## Performance Considerations

1. **Indexes**
   - Compound index on `user_id + timestamp` for fast history queries
   - Text index on `content` for similarity search
   - All frequently queried fields are indexed

2. **Pagination**
   - History API supports limit/skip parameters
   - Default limit: 50 messages
   - Maximum limit: 100 messages

3. **Caching**
   - JWT tokens cached in localStorage
   - User profile cached in localStorage
   - Message IDs mapped for quick feedback submission

## Future Enhancements

1. **Advanced Reinforcement Learning**
   - Use embeddings instead of text search
   - Implement collaborative filtering
   - A/B testing for response variations
   - Track click-through rates on suggestions

2. **Analytics Dashboard**
   - Visualize feedback trends
   - Show most helpful responses
   - Track user engagement metrics
   - Export analytics data

3. **Social Features**
   - Share conversations
   - Public/private conversation toggle
   - Community feedback on responses

4. **Advanced Search**
   - Full-text search across all messages
   - Filter by date range, language, feedback
   - Export conversation history

## Troubleshooting

### Issue: "Not authenticated" error
**Solution**: Ensure JWT token is in localStorage as 'authToken'

### Issue: Feedback not saving
**Solution**: Check that message has a server-side ID (not just local ID)

### Issue: Chat history empty
**Solution**: Messages are only saved when user is authenticated

### Issue: Migration fails
**Solution**: Ensure MongoDB is running and connection string is correct in .env

## Changelog

### Version 2.0 - Chat History & Feedback Feature
- Added per-user chat history with MongoDB persistence
- Implemented like/dislike feedback system
- Added reinforcement learning weight mechanism
- Created profile management page
- Updated authentication to use JWT
- Added chat history page with search
- Implemented message and session deletion
- Added feedback analytics
- Created database migration script
- Updated UI with feedback buttons
- Added navigation links for authenticated users
- Improved mobile responsiveness

---

**Last Updated**: November 16, 2025
**Author**: Kiro AI Assistant
**Version**: 2.0
