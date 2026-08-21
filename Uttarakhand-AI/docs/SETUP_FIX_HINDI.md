# सेटअप फिक्स गाइड - Landing Page, Weather & Maps 🔧

## क्या फिक्स किया गया ✅

### 1. **Google Maps**
- ✅ API key `index.html` में add कर दिया
- ✅ MapView component improve किया
- ✅ Loading state add किया
- ✅ Error handling add की

### 2. **Weather Widget**
- ⚠️ **Weather API Key चाहिए** - OpenWeather से लेना होगा
- ✅ Weather service पहले से ready है
- ✅ Frontend component ready है

### 3. **Landing Page**
- ✅ पहले से ही काम कर रहा है
- ✅ Beautiful design है
- ✅ सब features ready हैं

## सेटअप स्टेप्स (बहुत आसान!)

### Step 1: OpenWeather API Key लें (FREE)

1. यहाँ जाएं: https://openweathermap.org/api
2. "Sign Up" पर क्लिक करें (Free है)
3. Email verify करें
4. "API keys" section में जाएं
5. API key copy करें
6. 10-15 मिनट wait करें (activation के लिए)

### Step 2: .env File Update करें

`backend/.env` file खोलें और बदलें:
```env
WEATHER_API_KEY=your_openweather_api_key_here
```

अपनी actual key से:
```env
WEATHER_API_KEY=apni_actual_key_yahan_paste_karo
```

### Step 3: Backend Server Restart करें

```bash
cd uttarakhand-tourism-ai/backend
python run.py
```

### Step 4: Frontend Refresh करें

Browser में refresh करें (F5)

## टेस्टिंग

### Landing Page Test:
1. खोलें: http://localhost:5173/
2. Beautiful hero section दिखेगा
3. "Explore as Guest" पर क्लिक करें

### Maps Test:
1. Dashboard में जाएं
2. "Emergency" tab पर क्लिक करें
3. नीचे scroll करें - Map load होगा
4. अगर नहीं दिख रहा, browser console check करें (F12)

### Weather Test:
1. Dashboard → Emergency tab
2. ऊपर Weather widget दिखेगा
3. Dropdown से different cities select करें
4. Temperature, humidity, wind speed दिखेगा

**बिना API Key के:**
- Default weather data दिखेगा
- Message: "Weather data unavailable"

**API Key के साथ:**
- Real-time weather दिखेगा
- Travel advice मिलेगी
- सभी weather details

## समस्या समाधान

### Maps नहीं दिख रहे?

**Check 1: Browser Console**
- F12 दबाएं
- Console tab खोलें
- Red errors देखें

**Check 2: API Key**
`frontend/index.html` में key check करें

**Check 3: Internet**
- Internet connection check करें
- Google Maps script load हो रही है या नहीं

### Weather काम नहीं कर रहा?

**बिना API Key:**
- यह normal है
- Default data दिखेगा
- OpenWeather से free key लें

**API Key के साथ भी नहीं:**
1. Key activate होने में 10-15 मिनट लगते हैं
2. Backend logs check करें
3. Different city try करें
4. Backend restart करें

### Landing Page नहीं खुल रहा?

1. Frontend server चल रहा है check करें
2. http://localhost:5173/ खोलें
3. Browser console में errors देखें
4. `npm run dev` फिर से run करें

## बदली गई Files

### Frontend:
1. ✅ `frontend/index.html` - Google Maps key add किया
2. ✅ `frontend/src/components/common/MapView.tsx` - Improve किया
3. ✅ Weather & Landing Page - पहले से ready थे

### Backend:
- कोई बदलाव नहीं
- Weather service पहले से ready है
- बस .env में API key चाहिए

## API Keys Summary

### ✅ पहले से Configure:
- Gemini API (AI Chat) - काम कर रहा है
- Google Maps API - Add कर दिया

### ⚠️ Configure करना है:
- OpenWeather API - https://openweathermap.org/api से लें

## अगले Steps

1. **OpenWeather API Key लें** (5 मिनट)
   - openweathermap.org पर signup करें
   - API key copy करें
   - backend/.env में paste करें

2. **Servers Restart करें** (1 मिनट)
   - Backend: `python run.py`
   - Frontend: Browser refresh करें

3. **सब Test करें** (2 मिनट)
   - Landing page खोलें
   - Dashboard में जाएं
   - Weather check करें
   - Maps check करें

## मदद चाहिए?

अगर अभी भी problem है:

1. **Browser Console Check करें** (F12 दबाएं)
2. **Backend Logs देखें** (Terminal में)
3. **API Keys Verify करें** (.env और index.html में)
4. **Browser Cache Clear करें** (Ctrl+Shift+Delete)
5. **दोनों Servers Restart करें**

## Free API Keys Info

### OpenWeather:
- **Free:** 1000 calls/day
- **Link:** https://openweathermap.org/api
- **Activation:** 10-15 मिनट
- **Cost:** हमेशा FREE

### Google Maps:
- **Free:** $200 credit/month
- **Link:** https://console.cloud.google.com/
- **Activation:** तुरंत
- **Cost:** छोटे projects के लिए FREE

---

**बाकी सब पहले से ready है! 🎉**

बस OpenWeather API key लें और enjoy करें!

## Quick Commands

```bash
# Backend start
cd uttarakhand-tourism-ai/backend
python run.py

# Frontend start (अगर नहीं चल रहा)
cd uttarakhand-tourism-ai/frontend
npm run dev

# Browser में खोलें
http://localhost:5173/
```

**Happy Coding! 🚀**
