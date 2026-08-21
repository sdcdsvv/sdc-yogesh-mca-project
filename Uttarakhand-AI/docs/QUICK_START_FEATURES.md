# Quick Start Guide - Chat History & Feedback Features

## Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB running locally on port 27017

## Setup (5 minutes)

### 1. Backend Setup

```bash
cd backend

# Install dependencies (if not already done)
pip install -r requirements.txt

# Run database migration
python scripts/migrate_db.py

# Optional: Seed demo data
python scripts/migrate_db.py --seed

# Start backend server
python run.py
```

Backend will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## Testing the Features (10 minutes)

### Step 1: Sign Up
1. Navigate to `http://localhost:5173`
2. Click "Sign Up" or "Login"
3. Fill in the signup form:
   - Name: Your Name
   - Email: your@email.com
   - Password: password123
4. Click "Create Account"
5. You'll be redirected to the dashboard

### Step 2: Chat with AI
1. Click "Services" in the navigation
2. Select "AI Chat Guide"
3. Send a message: "Tell me about Nainital"
4. Wait for the AI response
5. **Notice the like/dislike buttons** below the AI response

### Step 3: Give Feedback
1. Click the **thumbs up** button on the AI response
2. The button will turn green, indicating your feedback was saved
3. Send another message: "What are the best trekking routes?"
4. Click the **thumbs down** button on this response
5. The button will turn red

### Step 4: View Chat History
1. Click "History" in the navigation bar
2. You'll see a list of your conversations on the left
3. Click on a conversation to view all messages
4. Notice the feedback indicators (green/red) on assistant messages
5. Try the search box to filter conversations

### Step 5: Edit Your Profile
1. Click "Profile" in the navigation bar
2. Click "Edit Profile"
3. Change your name or language preference
4. Optionally upload an avatar image
5. Click "Save Changes"
6. Your profile will be updated

### Step 6: Test Reinforcement Learning
1. Go back to chat and ask: "Tell me about Nainital" again
2. Like the response
3. Ask a similar question: "What can I do in Nainital?"
4. The system will use your previous liked response as a reference
5. Over time, responses improve based on your feedback

## API Testing with Postman

### Import Collection
1. Open Postman
2. Click "Import"
3. Select `API_Collection.postman.json`
4. Collection will be imported with 6 requests

### Test Flow
1. **Signup**: Creates a new user
2. **Login**: Returns JWT token (copy this!)
3. **Chat**: Send a message to AI (no auth needed)
4. **Save Message**: Save message to history (paste token)
5. **Submit Feedback**: Like/dislike a message (paste message_id)
6. **Get History**: View all saved messages

## Verify Database

```bash
# Connect to MongoDB
mongosh

# Switch to database
use uttarakhand_tourism

# Check users
db.users.find().pretty()

# Check chats
db.chats.find().pretty()

# Check feedback
db.chats.find({"feedback.rating": {$ne: null}}).pretty()

# Check reinforcement weights
db.chats.find({"reinforcement_weight": {$gt: 1.0}}).pretty()
```

## Common Issues

### Issue: "Failed to connect to MongoDB"
**Solution**: 
```bash
# Start MongoDB
mongod --dbpath /path/to/data
```

### Issue: "401 Unauthorized"
**Solution**: 
- Make sure you're logged in
- Check that JWT token is in localStorage
- Token might have expired, login again

### Issue: Feedback buttons not working
**Solution**:
- Ensure you're logged in
- Check browser console for errors
- Verify backend is running

### Issue: Chat history is empty
**Solution**:
- Messages are only saved when authenticated
- Try logging in and sending new messages

## Features Checklist

- [ ] User can sign up and login
- [ ] User can chat with AI (public, no auth)
- [ ] User can see like/dislike buttons on AI responses
- [ ] User can click like/dislike and see visual feedback
- [ ] User can view chat history page
- [ ] User can search conversations
- [ ] User can delete messages/conversations
- [ ] User can edit profile
- [ ] User can upload avatar
- [ ] Navigation shows History and Profile when logged in
- [ ] Feedback is saved to MongoDB
- [ ] Reinforcement weight increases on like
- [ ] Analytics show feedback statistics

## Next Steps

1. **Explore Analytics**: Check `/api/history/analytics` endpoint
2. **Test Deletion**: Delete a message or conversation
3. **Try Different Languages**: Change language in profile
4. **Export Data**: Use MongoDB queries to export your data
5. **Customize**: Modify the UI colors, add more features

## Support

For issues or questions:
1. Check `FEATURE_IMPLEMENTATION.md` for detailed documentation
2. Review API endpoints in Postman collection
3. Check browser console for frontend errors
4. Check terminal for backend errors
5. Verify MongoDB is running and accessible

---

**Enjoy exploring Uttarakhand with AI! 🏔️**
