
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LandingPageRedesigned from './components/LandingPageRedesigned';
import ServicesPage from './components/ServicesPage';
import Login from './components/Auth/Login';
import Profile from './components/Auth/Profile';
import Dashboard from './components/Dashboard';
import ChatHistory from './components/chat/ChatHistory';
import ProtectedRoute from './components/common/ProtectedRoute';
import { ActivityDashboard, ActivityHistory } from './components/activity';
import type { Language } from './types';

function App() {
  const [globalLanguage, setGlobalLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('preferredLanguage');
    return (saved as Language) || 'english';
  });

  useEffect(() => {
    localStorage.setItem('preferredLanguage', globalLanguage);
  }, [globalLanguage]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPageRedesigned language={globalLanguage} onLanguageChange={setGlobalLanguage} />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes - Require Authentication */}
        <Route 
          path="/services" 
          element={
            <ProtectedRoute>
              <ServicesPage language={globalLanguage} onLanguageChange={setGlobalLanguage} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile language={globalLanguage} onLanguageChange={setGlobalLanguage} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/history" 
          element={
            <ProtectedRoute>
              <ChatHistory language={globalLanguage} onLanguageChange={setGlobalLanguage} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard language={globalLanguage} onLanguageChange={setGlobalLanguage} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/explore" 
          element={
            <ProtectedRoute>
              <Dashboard language={globalLanguage} onLanguageChange={setGlobalLanguage} />
            </ProtectedRoute>
          } 
        />
        
        {/* Activity Tracking Routes */}
        <Route 
          path="/activity/dashboard" 
          element={
            <ProtectedRoute>
              <ActivityDashboard language={globalLanguage} onLanguageChange={setGlobalLanguage} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/activity/history" 
          element={
            <ProtectedRoute>
              <ActivityHistory language={globalLanguage} onLanguageChange={setGlobalLanguage} />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;