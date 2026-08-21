# User Activity Tracking System

## Overview (Kya hai ye?)

Pehle sirf **chat history** save hoti thi (user-assistant conversations). 

Ab ek complete **Activity Tracking System** implement kiya gaya hai jo track karega:
- User ne **kaunsi service** use ki
- **Kab** use ki
- **Kya query** kiya
- **Kya response** aaya
- **Kitna time** laga

## Architecture (Structure)

### 1. Database Model: `Activity`
**Location:** `backend/app/models/activity.py`

Ye model track karta hai:
- `user_id`: Konsa user
- `service_type`: Kaun si service (itinerary, vision, chat, emergency, weather, etc.)
- `action`: Kya action (generate, analyze, search, lookup, query)
- `details`: Description aur summary
- `request_data`: User ne kya request kiya
- `response_data`: Kya response mila
- `metadata`: Extra info (language, duration, IP address etc.)
- `timestamp`: Kab hua
- `duration_ms`: Kitna time laga (milliseconds me)

### 2. API Routes: `activity_routes.py`
**Location:** `backend/app/api/activity_routes.py`

#### Available Endpoints:

```
POST   /api/activity/log              - Activity log karo
GET    /api/activity/history          - Activity history dekho
GET    /api/activity/recent           - Recent activities dekho  
GET    /api/activity/summary          - Usage summary dekho
GET    /api/activity/timeline         - Timeline graph ke liye data
GET    /api/activity/analytics/<type> - Service-specific analytics
DELETE /api/activity/history          - Saari history delete karo
```

### 3. Helper Utilities: `activity_helper.py`
**Location:** `backend/app/utils/activity_helper.py`

Easy logging ke liye ready-made functions:
- `log_itinerary_generation()` - Itinerary generation log karo
- `log_vision_analysis()` - Image analysis log karo
- `log_chat_interaction()` - Chat log karo
- `log_emergency_lookup()` - Emergency service lookup log karo
- `log_weather_query()` - Weather query log karo
- `ActivityTimer` - Automatic timing ke saath logging

## How to Use (Kaise use kare)

### Method 1: Helper Functions (Sabse Easy)

```python
from app.utils.activity_helper import log_itinerary_generation

# Itinerary generate karne ke baad
result = gemini_service.generate_itinerary(preferences)

# Activity log karo
log_itinerary_generation(
    user_id=current_user['user_id'],
    preferences=preferences,
    result=result,
    duration_ms=1500
)
```

### Method 2: ActivityTimer (Automatic Timing)

```python
from app.utils.activity_helper import ActivityTimer

with ActivityTimer(
    user_id=current_user['user_id'],
    service_type='itinerary',
    action='generate',
    request_data={'duration': 3, 'budget': 50000}
) as timer:
    # Apna kaam karo
    result = gemini_service.generate_itinerary(preferences)
    
    # Response set karo
    timer.set_response_data({
        'success': True,
        'days_count': 3
    })
```

### Method 3: Manual Logging (Full Control)

```python
from app.utils.activity_helper import get_activity_logger

logger = get_activity_logger()
logger.log(
    user_id=current_user['user_id'],
    service_type='emergency',
    action='lookup',
    details={'description': 'Emergency lookup'},
    request_data={'location': 'Dehradun'},
    response_data={'success': True}
)
```

## Service Types (Available Services)

- `itinerary` - Itinerary generation
- `vision` - Image analysis  
- `chat` - Chat interactions
- `emergency` - Emergency services
- `places` - Place information
- `weather` - Weather queries
- `translation` - Translation requests
- `other` - Any other service

## API Examples

### 1. Get User Activity History

```bash
GET /api/activity/history?limit=20&service_type=itinerary&days=7
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "_id": "...",
        "user_id": "user123",
        "service_type": "itinerary",
        "action": "generate",
        "details": {
          "description": "Generated 3-day itinerary",
          "budget_range": "₹50000"
        },
        "request_data": {
          "duration": 3,
          "budget": 50000,
          "interests": ["temples", "trekking"]
        },
        "response_data": {
          "success": true,
          "days_count": 3
        },
        "timestamp": "2024-01-15T10:30:00Z",
        "duration_ms": 1500
      }
    ],
    "count": 20
  }
}
```

### 2. Get Usage Summary

```bash
GET /api/activity/summary?days=30
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_activities": 45,
    "period_days": 30,
    "services": [
      {
        "_id": "itinerary",
        "count": 20,
        "last_used": "2024-01-15T10:30:00Z",
        "avg_duration": 1450.5
      },
      {
        "_id": "vision",
        "count": 15,
        "last_used": "2024-01-14T15:20:00Z",
        "avg_duration": 2100.3
      }
    ],
    "most_used_service": "itinerary"
  }
}
```

### 3. Get Activity Timeline

```bash
GET /api/activity/timeline?group_by=day&days=7
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "timeline": [
      {
        "_id": "2024-01-15",
        "count": 8,
        "services": ["itinerary", "vision", "chat"]
      },
      {
        "_id": "2024-01-14",
        "count": 5,
        "services": ["itinerary", "emergency"]
      }
    ],
    "group_by": "day",
    "days": 7
  }
}
```

### 4. Get Recent Activities

```bash
GET /api/activity/recent?limit=10
Authorization: Bearer <token>
```

### 5. Service-Specific Analytics

```bash
GET /api/activity/analytics/itinerary
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "service_type": "itinerary",
    "analytics": {
      "total_uses": 25,
      "unique_actions": ["generate", "save"],
      "avg_duration": 1450.5,
      "first_used": "2024-01-01T00:00:00Z",
      "last_used": "2024-01-15T10:30:00Z"
    }
  }
}
```

## Integration in Existing Services

### Itinerary Service

File: `backend/app/api/itinerary.py`

```python
from app.utils.activity_helper import log_itinerary_generation
import time

@itinerary_bp.route('/generate', methods=['POST'])
@require_auth
def generate_itinerary(current_user):
    start_time = time.time()
    
    # ... existing code ...
    result = gemini_service.generate_itinerary(preferences)
    
    # Add activity logging
    duration_ms = (time.time() - start_time) * 1000
    log_itinerary_generation(
        user_id=current_user['user_id'],
        preferences=preferences,
        result=result,
        duration_ms=duration_ms
    )
    
    return jsonify(result), 200
```

### Vision Service

File: `backend/app/api/vision.py`

```python
from app.utils.activity_helper import log_vision_analysis
import time

@vision_bp.route('/analyze', methods=['POST'])
@require_auth
def analyze_image(current_user):
    start_time = time.time()
    
    # ... existing code ...
    result = gemini_service.analyze_image(image_data, language)
    
    # Add activity logging
    duration_ms = (time.time() - start_time) * 1000
    log_vision_analysis(
        user_id=current_user['user_id'],
        language=language,
        result=result,
        duration_ms=duration_ms
    )
    
    return jsonify(result), 200
```

### Chat Service

File: `backend/app/api/chat.py`

```python
from app.utils.activity_helper import log_chat_interaction
import time

@chat_bp.route('/query', methods=['POST'])
@require_auth
def chat_query(current_user):
    start_time = time.time()
    
    query = data.get('query')
    # ... existing code ...
    response = gemini_service.chat(query, language)
    
    # Add activity logging
    duration_ms = (time.time() - start_time) * 1000
    log_chat_interaction(
        user_id=current_user['user_id'],
        query=query,
        response=response,
        language=language,
        duration_ms=duration_ms
    )
    
    return jsonify({'response': response}), 200
```

## Benefits (Fayde)

1. **Complete User Journey Tracking**
   - User ne kya kya kiya sabka record
   - Konsi service zyada use hoti hai
   - User behavior patterns

2. **Analytics & Insights**
   - Service usage statistics
   - Performance metrics (duration tracking)
   - Popular features identification

3. **Better User Experience**
   - Users apni history dekh sakte hain
   - Recent activities quick access
   - Personalized recommendations (future)

4. **Debugging & Monitoring**
   - Issues ko identify karna easy
   - Performance bottlenecks find karna
   - Error tracking

5. **Business Intelligence**
   - Most used services
   - Peak usage times
   - User engagement metrics

## Database Schema

MongoDB Collection: `activities`

```javascript
{
  _id: ObjectId("..."),
  user_id: "user123",
  service_type: "itinerary",
  action: "generate",
  details: {
    description: "Generated 3-day itinerary",
    budget_range: "₹50000"
  },
  request_data: {
    duration: 3,
    budget: 50000,
    interests: ["temples", "trekking"],
    start_location: "Dehradun"
  },
  response_data: {
    success: true,
    days_count: 3
  },
  metadata: {
    language: "english",
    duration_ms: 1500,
    user_agent: "...",
    ip_address: "..."
  },
  timestamp: ISODate("2024-01-15T10:30:00Z"),
  status: "success",
  duration_ms: 1500
}
```

## Indexes (Performance)

For fast queries, following indexes are created:
- `user_id + timestamp` (user history)
- `service_type` (filter by service)
- `action` (filter by action)
- `user_id + service_type` (service analytics)

## Privacy & Data Handling

- **Sensitive data ko sanitize kiya jata hai**
- Password, tokens store nahi hote
- Only necessary request/response data
- Users apni history delete kar sakte hain

## Future Enhancements

1. **Real-time Notifications** - User activity pe notifications
2. **Recommendations** - User behavior based suggestions
3. **Export Feature** - Activity history download (CSV/JSON)
4. **Admin Dashboard** - All users ka analytics
5. **Activity Heatmap** - Visual representation
6. **Comparison** - Compare service usage over time
7. **Alerts** - Unusual activity detection

## Testing

Test the APIs using Postman or curl:

```bash
# Login first to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Get activity history
curl -X GET "http://localhost:5000/api/activity/history?limit=10" \
  -H "Authorization: Bearer <your-token>"

# Get usage summary
curl -X GET "http://localhost:5000/api/activity/summary?days=30" \
  -H "Authorization: Bearer <your-token>"
```

## Summary

**Old System:** Sirf chat messages save hoti thi

**New System:** 
- ✅ Har service ka usage track hota hai
- ✅ User kahan kahan gaya, sab record
- ✅ Detailed analytics available
- ✅ Timeline view
- ✅ Service-wise breakdown
- ✅ Performance metrics

Ye system ab production-ready hai. Bas existing services me activity logging ko integrate karna hai using the helper functions provided.

---

**For detailed integration examples, see:** `backend/examples/activity_logging_integration.py`
