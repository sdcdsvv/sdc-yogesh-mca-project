# Uttarakhand Tourism AI - Setup Guide

## 🔧 Prerequisites
- Node.js (v18 or higher)
- Python (v3.9 or higher)
- MongoDB (optional, for production)

## 📝 API Keys Required

### 1. Google Gemini API Key (Required)
**Purpose:** AI chat, image recognition, itinerary generation

**How to get:**
1. Visit https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key

**Add to:** `backend/.env`
```
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. OpenWeather API Key (Optional but Recommended)
**Purpose:** Real-time weather information

**How to get:**
1. Visit https://openweathermap.org/api
2. Sign up for a free account
3. Verify your email (important!)
4. Go to API Keys section
5. Copy your API key
6. **Note:** Free tier keys take 1-2 hours to activate after email verification

**Add to:** `backend/.env`
```
WEATHER_API_KEY=your_openweather_api_key_here
```

### 3. Google Maps API Key (Optional but Recommended)
**Purpose:** Interactive maps, location services

**How to get:**
1. Visit https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable "Maps JavaScript API" and "Places API"
4. Go to Credentials → Create Credentials → API Key
5. Restrict the key (optional but recommended):
   - Application restrictions: HTTP referrers
   - Add: `http://localhost:3000/*`
6. Copy the API key

**Add to:** 
- `backend/.env`:
```
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```
- `frontend/index.html` (replace `YOUR_GOOGLE_MAPS_API_KEY`)

## 🚀 Installation Steps

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure .env file (add your API keys)
# Edit backend/.env with your keys

# Run the server
python run.py
```

Backend will run on: http://localhost:5000

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Install React Router (if not already installed)
npm install react-router-dom

# Configure Google Maps
# Edit frontend/index.html and replace YOUR_GOOGLE_MAPS_API_KEY

# Run development server
npm run dev
```

Frontend will run on: http://localhost:3000

## 🎯 Features Overview

### 1. Landing Page
- Beautiful hero section
- Feature highlights
- Popular destinations
- Call-to-action buttons

### 2. User Authentication
- Login/Signup forms
- Guest access option
- Session management (localStorage)

### 3. AI Chat Guide
- Multi-language support (English, Hindi, Garhwali, Kumaoni)
- Context-aware responses
- Tourism information

### 4. Image Recognition
- Upload photos of places
- AI identifies locations
- Detailed information display

### 5. Smart Itinerary Planner
- Personalized trip planning
- Budget-based recommendations
- Day-by-day schedules

### 6. Emergency Support
- Real-time weather alerts
- Emergency contacts
- Safety information

### 7. Interactive Maps
- Google Maps integration
- Location markers
- Directions support

## 🔍 Troubleshooting

### Backend Errors

**Error: "models/gemini-1.5-flash is not found"**
- Fixed! The model name has been updated to `gemini-pro`
- Restart the backend server

**Error: "401 Unauthorized" for Weather API**
- Your OpenWeather API key is invalid or not activated
- Wait 1-2 hours after email verification
- Or get a new key from https://openweathermap.org/api

### Frontend Errors

**Error: "tsconfig.node.json not found"**
- Fixed! The file has been created
- Restart the dev server with `npm run dev`

**Maps not showing:**
- Check if you added your Google Maps API key in `index.html`
- Ensure the API key has Maps JavaScript API enabled
- Check browser console for specific errors

## 📱 User Flow

1. **Landing Page** → User sees features and destinations
2. **Login/Signup** → User creates account or continues as guest
3. **Dashboard** → Main interface with 4 tabs:
   - Chat Guide
   - Image Recognition
   - Trip Planner
   - Emergency Info
4. **Explore** → User interacts with AI features
5. **Maps** → View locations on interactive map

## 🌐 Language Support

The app supports 4 languages:
- English
- Hindi (हिंदी)
- Garhwali (गढ़वळि)
- Kumaoni (कुमाऊँनी)

Change language using the selector in the header.

## 💡 Tips for Best Experience

1. **Use valid API keys** - Most features require Gemini API
2. **Enable location services** - For better map experience
3. **Upload clear images** - For accurate place recognition
4. **Provide detailed preferences** - For better itinerary suggestions

## 🆘 Support

If you encounter issues:
1. Check this guide first
2. Verify all API keys are correct
3. Check browser console for errors
4. Restart both backend and frontend servers

## 📄 License

This project is for educational/hackathon purposes.
