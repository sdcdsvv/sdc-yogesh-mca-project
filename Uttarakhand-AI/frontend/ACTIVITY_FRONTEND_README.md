# Activity Tracking - Frontend Integration Guide

## 📁 Created Files

### Services
- **`src/services/activity.ts`** - Activity API service with TypeScript types

### Components
- **`src/components/activity/ActivityHistory.tsx`** - Full activity history page
- **`src/components/activity/ActivityDashboard.tsx`** - Analytics dashboard
- **`src/components/activity/RecentActivities.tsx`** - Recent activities widget
- **`src/components/activity/index.ts`** - Component exports

## 🚀 How to Use

### 1. Install Dependencies (if needed)

```bash
npm install date-fns  # For date formatting (if not already installed)
```

### 2. Add Routes to Your App

Update your `App.tsx` or router configuration:

```tsx
import { 
  ActivityHistory, 
  ActivityDashboard 
} from './components/activity';

// Add these routes
<Route path="/activity/history" element={<ActivityHistory />} />
<Route path="/activity/dashboard" element={<ActivityDashboard />} />
```

### 3. Add Navigation Links

In your navigation/menu component:

```tsx
<Link to="/activity/dashboard">Activity Dashboard</Link>
<Link to="/activity/history">Activity History</Link>
```

### 4. Add Recent Activities Widget to Dashboard

In your main dashboard:

```tsx
import { RecentActivities } from './components/activity';

// In your dashboard component
<RecentActivities limit={5} />
```

## 🎨 Components Overview

### ActivityHistory
**Path:** `/activity/history`

Features:
- ✅ Paginated activity list
- ✅ Filter by service type
- ✅ Filter by time range (7/30/90/365 days)
- ✅ Beautiful card-based UI
- ✅ Status indicators
- ✅ Duration and timestamp display

Props: None (self-contained)

### ActivityDashboard
**Path:** `/activity/dashboard`

Features:
- ✅ Statistics cards (total activities, services used, etc.)
- ✅ Service usage breakdown with progress bars
- ✅ Time range selector
- ✅ Average response time
- ✅ Most used service highlight

Props: None (self-contained)

### RecentActivities
Embeddable widget for showing recent activities

Features:
- ✅ Compact list view
- ✅ Service icons and colors
- ✅ "View all" link to full history
- ✅ Loading states

Props:
```tsx
interface RecentActivitiesProps {
  limit?: number;      // Number of activities to show (default: 5)
  compact?: boolean;   // Compact mode (default: false)
}
```

Usage:
```tsx
<RecentActivities limit={10} />
```

## 🎯 API Service Usage

### Import the service
```tsx
import activityService from '../services/activity';
```

### Get activity history
```tsx
const response = await activityService.getHistory({
  limit: 20,
  skip: 0,
  service_type: 'itinerary',
  days: 30
});
```

### Get recent activities
```tsx
const response = await activityService.getRecent(10);
```

### Get usage summary
```tsx
const response = await activityService.getSummary(30);
```

### Get timeline
```tsx
const response = await activityService.getTimeline({
  group_by: 'day',
  days: 7
});
```

### Get service analytics
```tsx
const response = await activityService.getServiceAnalytics('itinerary');
```

## 🎨 Design Features

### Color Scheme
Each service has a unique color:
- **Itinerary:** Blue (`bg-blue-500`)
- **Vision:** Purple (`bg-purple-500`)
- **Chat:** Green (`bg-green-500`)
- **Emergency:** Red (`bg-red-500`)
- **Weather:** Cyan (`bg-cyan-500`)
- **Places:** Orange (`bg-orange-500`)
- **Translation:** Pink (`bg-pink-500`)

### Icons
Using Lucide React icons:
- Itinerary: `MapPin`
- Vision: `Image`
- Chat: `MessageSquare`
- Emergency: `AlertCircle`
- Weather: `Cloud`
- Places: `Globe`

### Responsive Design
- ✅ Mobile-friendly
- ✅ Grid layouts adjust to screen size
- ✅ Touch-friendly buttons and cards

## 📱 Example: Complete Integration

### App.tsx
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ActivityHistory, ActivityDashboard } from './components/activity';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Existing routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Activity routes */}
        <Route path="/activity/history" element={<ActivityHistory />} />
        <Route path="/activity/dashboard" element={<ActivityDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Dashboard.tsx
```tsx
import { RecentActivities } from './components/activity';

function Dashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Other dashboard widgets */}
      <div className="col-span-1">
        <WelcomeCard />
      </div>
      
      {/* Recent Activities Widget */}
      <div className="col-span-1">
        <RecentActivities limit={5} />
      </div>
      
      <div className="col-span-1">
        <QuickActions />
      </div>
    </div>
  );
}
```

### Navigation.tsx
```tsx
import { Link } from 'react-router-dom';
import { BarChart3, History } from 'lucide-react';

function Navigation() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/dashboard">Dashboard</Link>
      
      {/* Activity links */}
      <Link to="/activity/dashboard">
        <BarChart3 className="w-5 h-5" />
        Analytics
      </Link>
      <Link to="/activity/history">
        <History className="w-5 h-5" />
        Activity
      </Link>
    </nav>
  );
}
```

## 🔧 Customization

### Change Colors
Update `serviceColors` object in components:

```tsx
const serviceColors: Record<string, string> = {
  itinerary: 'bg-indigo-500',  // Change to your color
  vision: 'bg-violet-500',
  // ...
};
```

### Add Custom Filters
Extend the `ActivityHistory` component:

```tsx
// Add new filter state
const [customFilter, setCustomFilter] = useState('');

// Add to API call
const response = await activityService.getHistory({
  limit,
  skip,
  service_type: filter,
  days: timeRange,
  // Add your custom parameter
});
```

### Modify Card Layout
Edit the activity card in `ActivityHistory.tsx`:

```tsx
<div className="bg-white rounded-xl shadow-md p-6">
  {/* Customize card content */}
</div>
```

## 🧪 Testing

### Test the components
```bash
# Run the frontend
npm run dev

# Visit pages:
http://localhost:5173/activity/dashboard
http://localhost:5173/activity/history
```

### Check API connection
Open browser console and check for:
- ✅ No CORS errors
- ✅ 200 status codes
- ✅ Proper data loading

## 📊 Data Flow

```
User Action (e.g., Generate Itinerary)
    ↓
Backend logs activity via activity_helper
    ↓
Activity saved in MongoDB
    ↓
Frontend calls activityService.getHistory()
    ↓
Activity API returns data
    ↓
Components display activity
```

## 🎯 Features Summary

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| **ActivityHistory** | Full history page | Pagination, filters, detailed view |
| **ActivityDashboard** | Analytics | Stats cards, charts, breakdown |
| **RecentActivities** | Widget | Compact list, embeddable |

## 🚀 Next Steps

1. ✅ Components created
2. ✅ API service ready
3. ⏳ **Add routes to App.tsx**
4. ⏳ **Add navigation links**
5. ⏳ **Test with real data**
6. ⏳ **Customize styling**

## 💡 Tips

- **Loading States:** All components handle loading states
- **Error Handling:** API errors are logged to console
- **Empty States:** Beautiful empty states when no data
- **Responsive:** Works on all screen sizes
- **TypeScript:** Full type safety with interfaces

## 📞 Need Help?

Check these files:
- `src/services/activity.ts` - API calls and types
- `src/components/activity/ActivityHistory.tsx` - Main history page
- `src/components/activity/ActivityDashboard.tsx` - Analytics page

---

**Status:** ✅ Ready to integrate
**Tech Stack:** React + TypeScript + TailwindCSS
**Dependencies:** date-fns, lucide-react
