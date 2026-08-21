# 🚀 Quick Start Guide

## For Windows Users (Easiest Way)

### Step 1: Install Everything
```bash
# Double-click this file:
INSTALL.bat
```

### Step 2: Add API Keys
1. Open `backend/.env` in any text editor
2. Add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_key_here
   ```
3. Get key from: https://makersuite.google.com/app/apikey

### Step 3: Start Application
```bash
# Double-click this file:
START.bat
```

That's it! The app will open in your browser automatically.

---

## Manual Setup (All Platforms)

### Backend
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Add API key to .env file
# Edit backend/.env and add:
# GEMINI_API_KEY=your_key_here

# Run server
python run.py
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

### Access
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

---

## 🔑 Required API Keys

### Gemini API (Required)
**Get it here:** https://makersuite.google.com/app/apikey

1. Sign in with Google
2. Click "Create API Key"
3. Copy the key
4. Add to `backend/.env`:
   ```
   GEMINI_API_KEY=your_key_here
   ```

### OpenWeather API (Optional)
**Get it here:** https://openweathermap.org/api

1. Sign up for free account
2. Verify your email (important!)
3. Go to API Keys section
4. Copy your key
5. **Wait 1-2 hours** for activation
6. Add to `backend/.env`:
   ```
   WEATHER_API_KEY=your_key_here
   ```

### Google Maps API (Optional)
**Get it here:** https://console.cloud.google.com/

1. Create new project
2. Enable "Maps JavaScript API"
3. Create credentials → API Key
4. Copy the key
5. Add to `backend/.env`:
   ```
   GOOGLE_MAPS_API_KEY=your_key_here
   ```
6. Also replace in `frontend/index.html`:
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY_HERE"></script>
   ```

---

## ✅ Verify Installation

### Check Backend
```bash
cd backend
python run.py
```
Should see: `Running on http://127.0.0.1:5000`

### Check Frontend
```bash
cd frontend
npm run dev
```
Should see: `Local: http://localhost:3000`

---

## 🎯 First Steps After Installation

1. **Visit Landing Page**
   - Go to http://localhost:3000
   - Explore the features

2. **Try Login/Signup**
   - Click "Get Started"
   - Create an account or continue as guest

3. **Test Chat**
   - Go to Dashboard
   - Ask: "Tell me about Rishikesh"

4. **Upload Image**
   - Switch to "Image Info" tab
   - Upload a photo of any Uttarakhand place

5. **Generate Itinerary**
   - Switch to "Plan Trip" tab
   - Fill in your preferences
   - Get AI-generated plan

---

## 🐛 Common Issues

### "Python not found"
**Solution:** Install Python from https://www.python.org/downloads/

### "Node not found"
**Solution:** Install Node.js from https://nodejs.org/

### "Gemini API Error"
**Solution:** 
- Check if API key is correct in `.env`
- Ensure no extra spaces
- Restart backend server

### "Weather API 401"
**Solution:**
- Wait 1-2 hours after signup
- Verify your email
- Get a new key if needed

### "Maps not showing"
**Solution:**
- Add Google Maps API key in `index.html`
- Enable Maps JavaScript API in Google Cloud Console

---

## 📱 Using the App

### Chat Guide
- Ask questions about Uttarakhand
- Get travel tips
- Learn about culture and food
- Switch languages anytime

### Image Recognition
- Upload photos of places
- Get instant identification
- View on map
- See nearby attractions

### Trip Planner
- Set duration and budget
- Choose interests
- Get day-by-day itinerary
- View all locations on map

### Emergency
- Check weather
- Get emergency contacts
- Safety information
- Real-time alerts

---

## 🎨 Features to Try

1. **Multi-Language** - Switch between English, Hindi, Garhwali, Kumaoni
2. **Maps** - Click "Open in Google Maps" for navigation
3. **Guest Mode** - Explore without signing up
4. **Responsive** - Try on mobile/tablet
5. **Dark Mode** - Coming soon!

---

## 📞 Need Help?

1. Check `SETUP_GUIDE.md` for detailed instructions
2. See `README.md` for full documentation
3. Review `CHANGELOG.md` for all features
4. Check browser console for errors

---

## 🎉 You're All Set!

Enjoy exploring Uttarakhand with AI assistance! 🏔️

**Pro Tip:** Bookmark http://localhost:3000 for quick access
