# Setup Fix Guide - Landing Page, Weather & Maps 🔧

## Issues Fixed ✅

### 1. **Google Maps Integration**
- ✅ API key added to `index.html`
- ✅ MapView component improved with loading states
- ✅ Error handling added
- ✅ Auto-open info window

### 2. **Weather Widget**
- ⚠️ **Weather API Key Missing** - Needs OpenWeather API key
- ✅ Weather service already implemented
- ✅ Frontend component ready

### 3. **Landing Page**
- ✅ Already working properly
- ✅ Beautiful design with gradients
- ✅ Feature cards and destinations

## Quick Setup Steps

### Step 1: Get OpenWeather API Key (FREE)

1. Go to: https://openweathermap.org/api
2. Click "Sign Up" (Free tier is enough)
3. Verify your email
4. Go to "API keys" section
5. Copy your API key
6. Wait 10-15 minutes for activation

### Step 2: Update .env File

Open `backend/.env` and replace:
```env
WEATHER_API_KEY=your_openweather_api_key_here
```

With your actual key:
```env
WEATHER_API_KEY=your_actual_api_key_here
```

### Step 3: Restart Backend Server

```bash
cd uttarakhand-tourism-ai/backend
python run.py
```

### Step 4: Refresh Frontend

If frontend is running, just refresh the browser.
If not:
```bash
cd uttarakhand-tourism-ai/frontend
npm run dev
```

## Testing

### Test Landing Page:
1. Open: http://localhost:5173/
2. Should see beautiful hero section
3. Click "Explore as Guest" → Goes to Dashboard

### Test Maps:
1. Go to Dashboard
2. Click "Emergency" tab
3. Scroll down - Map should load
4. If not loading, check browser console for errors

### Test Weather:
1. Go to Dashboard → Emergency tab
2. Weather widget at top
3. Select different cities from dropdown
4. Should show temperature, humidity, wind, etc.

**Without API Key:**
- Shows default weather data
- Message: "Weather data unavailable"

**With API Key:**
- Shows real-time weather
- Travel advice based on conditions
- All weather details

## Troubleshooting

### Maps Not Showing?

**Check 1: Google Maps Script**
Open browser console (F12), look for errors like:
- "Google is not defined" → Script not loaded
- "API key invalid" → Check API key in index.html

**Check 2: API Key**
Make sure the key in `frontend/index.html` is valid:
```html
<script async defer
  src="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&libraries=places">
</script>
```

**Check 3: Browser Console**
- Press F12
- Go to Console tab
- Look for red errors
- Share errors if you need help

### Weather Not Working?

**Without API Key:**
- Weather widget will show default data
- This is normal behavior
- Get free API key from OpenWeather

**With API Key but not working:**
1. Check if key is activated (wait 10-15 mins after signup)
2. Check backend logs for errors
3. Try different city names
4. Restart backend server

### Landing Page Issues?

**Page not loading:**
1. Check if frontend server is running
2. Go to: http://localhost:5173/
3. Check browser console for errors

**Styling broken:**
1. Make sure Tailwind CSS is installed
2. Run: `npm install` in frontend folder
3. Restart dev server

## File Changes Made

### Frontend:
1. ✅ `frontend/index.html` - Added Google Maps API key
2. ✅ `frontend/src/components/common/MapView.tsx` - Improved with loading states
3. ✅ `frontend/src/components/emergency/WeatherWidget.tsx` - Already good
4. ✅ `frontend/src/components/LandingPage.tsx` - Already good

### Backend:
- No changes needed
- Weather service already implemented
- Just need API key in .env

## API Keys Summary

### ✅ Already Configured:
- Gemini API (AI Chat) - Working
- Google Maps API - Added to index.html

### ⚠️ Needs Configuration:
- OpenWeather API - Get from https://openweathermap.org/api

## Next Steps

1. **Get OpenWeather API Key** (5 minutes)
   - Sign up at openweathermap.org
   - Copy API key
   - Add to backend/.env

2. **Restart Servers** (1 minute)
   - Backend: `python run.py`
   - Frontend: Already running or `npm run dev`

3. **Test Everything** (2 minutes)
   - Landing page: http://localhost:5173/
   - Dashboard: Click "Explore as Guest"
   - Weather: Emergency tab
   - Maps: Should load automatically

## Support

If you still face issues:

1. **Check Browser Console** (F12)
2. **Check Backend Logs** (Terminal where backend is running)
3. **Verify API Keys** (All keys in .env and index.html)
4. **Clear Browser Cache** (Ctrl+Shift+Delete)
5. **Restart Both Servers**

## Free API Keys Info

### OpenWeather (Weather):
- **Free Tier:** 1000 calls/day
- **Signup:** https://openweathermap.org/api
- **Activation:** 10-15 minutes
- **Cost:** FREE forever

### Google Maps (Maps):
- **Free Tier:** $200 credit/month
- **Signup:** https://console.cloud.google.com/
- **Activation:** Instant
- **Cost:** FREE for small projects

---

**Everything else is already configured and working! 🎉**

Just get the OpenWeather API key and you're all set!
