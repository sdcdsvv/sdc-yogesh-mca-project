# 🏔️ Uttarakhand Tourism AI

An intelligent tourism guide for Uttarakhand powered by Yogesh and Teams, featuring multi-language support, image recognition, smart itinerary planning, and real-time emergency assistance.

## ✨ Features

### 🤖 AI Chat Guide
- Natural language conversations about Uttarakhand tourism
- Context-aware responses
- Multi-language support (English, Hindi, Garhwali, Kumaoni)
- Information about places, culture, food, and activities

### 📸 Image Recognition
- Upload photos of places to identify them
- Get detailed information about locations
- Historical background and cultural significance
- Interactive maps with nearby attractions
- Do's and don'ts for each location

### 🗺️ Smart Itinerary Planner
- AI-generated personalized travel plans
- Budget-based recommendations
- Day-by-day schedules
- Accommodation and meal suggestions
- Packing lists and travel tips

### 🚨 Emergency Support
- Real-time weather information
- Emergency contact numbers
- Safety alerts and advisories
- Location-based weather forecasts

### 🌐 Multi-Language Support
- English
- Hindi (हिंदी)
- Garhwali (गढ़वळि)
- Kumaoni (कुमाऊँनी)

### 🗺️ Interactive Maps
- Google Maps integration
- Location markers for all destinations
- Directions and navigation
- Nearby places discovery

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- Python 3.9+
- Google Gemini API Key (required)
- OpenWeather API Key (optional)
- Google Maps API Key (optional)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd uttarakhand-tourism-ai
```

2. **Backend Setup**
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Edit .env file and add your API keys
```

3. **Frontend Setup**
```bash
cd frontend

# Install dependencies
npm install

# Update Google Maps API key in index.html
```

4. **Run the Application**

Terminal 1 (Backend):
```bash
cd backend
python run.py
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

Visit: http://localhost:3000

## 🔑 API Keys Setup

### 1. Google Gemini API (Required)
1. Visit https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Create API key
4. Add to `backend/.env`:
```
GEMINI_API_KEY=your_key_here
```

### 2. OpenWeather API (Optional)
1. Visit https://openweathermap.org/api
2. Sign up and verify email
3. Get API key (takes 1-2 hours to activate)
4. Add to `backend/.env`:
```
WEATHER_API_KEY=your_key_here
```

### 3. Google Maps API (Optional)
1. Visit https://console.cloud.google.com/
2. Enable Maps JavaScript API
3. Create API key
4. Add to `backend/.env` and `frontend/index.html`

## 📁 Project Structure

```
uttarakhand-tourism-ai/
├── backend/
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── models/       # Data models
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Utilities
│   │   └── config/       # Configuration
│   ├── requirements.txt
│   ├── .env
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API services
│   │   ├── types/        # TypeScript types
│   │   ├── hooks/        # Custom hooks
│   │   └── utils/        # Utilities
│   ├── package.json
│   └── index.html
└── README.md
```

## 🎯 User Flow

1. **Landing Page** → Beautiful introduction with features
2. **Authentication** → Login/Signup or continue as guest
3. **Dashboard** → Main interface with 4 tabs:
   - 💬 Chat Guide
   - 📸 Image Recognition
   - 📅 Trip Planner
   - 🚨 Emergency Info
4. **Explore** → Interact with AI features
5. **Maps** → View locations on interactive maps

## 🛠️ Tech Stack

### Backend
- Python 3.9+
- Flask (Web framework)
- Google Gemini AI
- OpenWeather API
- MongoDB (optional)

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide Icons

## 📱 Features in Detail

### Chat Interface
- Real-time AI responses
- Conversation history
- Voice input support (planned)
- Quick suggestion chips
- Language switching

### Image Analysis
- Drag & drop upload
- Base64 encoding
- AI-powered recognition
- Detailed place information
- Interactive maps

### Itinerary Generator
- Custom duration (1-15 days)
- Budget planning
- Interest-based recommendations
- Day-wise breakdown
- Accommodation suggestions

### Emergency Features
- Weather widgets
- Emergency contacts
- Safety tips
- Real-time alerts

## 🌟 Highlights

- **User-Friendly UI** - Modern, responsive design
- **Fast Performance** - Optimized API calls
- **Offline Support** - Cached data (planned)
- **Accessibility** - WCAG compliant
- **Mobile Responsive** - Works on all devices

## 🐛 Troubleshooting

### Backend Issues

**Gemini API Error:**
- Ensure API key is correct
- Check model names are `gemini-pro` and `gemini-pro-vision`

**Weather API 401:**
- Verify API key is activated (wait 1-2 hours after signup)
- Check email verification

### Frontend Issues

**Maps Not Loading:**
- Add Google Maps API key in `index.html`
- Enable Maps JavaScript API in Google Cloud Console

**Build Errors:**
- Run `npm install` to install dependencies
- Clear cache: `npm cache clean --force`

## 📄 License

This project is for educational/hackathon purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions:
1. Check SETUP_GUIDE.md
2. Review troubleshooting section
3. Check browser console for errors

## 🎉 Acknowledgments

- Google Gemini AI for powerful AI capabilities
- OpenWeather for weather data
- Google Maps for location services
- Uttarakhand Tourism Department for inspiration

---

Made with ❤️ for Uttarakhand Tourism
