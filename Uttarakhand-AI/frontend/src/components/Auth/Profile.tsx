import React, { useState, useEffect } from 'react';
import { User, Mail, Globe, Camera, Save, Loader2, Award, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import type { Language } from '../../types';

interface UserProfile {
  _id: string;
  email: string;
  name: string;
  language: string;
  avatar?: string;
  created_at: string;
  stats: {
    total_chats: number;
    total_feedback: number;
    positive_feedback: number;
    negative_feedback: number;
  };
}

interface ProfileProps {
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
}

const Profile: React.FC<ProfileProps> = ({ language = 'english', onLanguageChange }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    language: 'english',
    avatar: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.data.user);
        setFormData({
          name: data.data.user.name,
          language: data.data.user.language,
          avatar: data.data.user.avatar || ''
        });
      }
    } catch (error) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setProfile(data.data.user);
        setSuccess('Profile updated successfully!');
        setEditing(false);
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(data.data.user));
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (error) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col">
        <Navbar currentLanguage={language} onLanguageChange={onLanguageChange} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-stone-600 font-medium">Loading your profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col">
        <Navbar currentLanguage={language} onLanguageChange={onLanguageChange} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-stone-600">Failed to load profile</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar currentLanguage={language} onLanguageChange={onLanguageChange} />
      
      {/* Hero Section */}
      <div className="relative pt-40 pb-16 bg-gradient-to-br from-emerald-900 via-teal-900 to-green-900 overflow-hidden">
        {/* Mountain Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="profile-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M30 10 L50 40 L10 40 Z" fill="currentColor" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#profile-pattern)"/>
          </svg>
        </div>

        <div className="container mx-auto px-6 max-w-6xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-6 border border-white/20">
            <User className="w-4 h-4" />
            <span>Account Settings</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            My Profile
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-16">
        <div className="container mx-auto px-6 max-w-6xl">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-stone-200">
                <div className="relative inline-block mb-6">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt={profile.name}
                      className="w-40 h-40 rounded-full object-cover border-4 border-emerald-200 shadow-lg"
                    />
                  ) : (
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center border-4 border-emerald-200 shadow-lg">
                      <User className="w-20 h-20 text-white" />
                    </div>
                  )}
                  
                  {editing && (
                    <label className="absolute bottom-2 right-2 bg-emerald-600 text-white p-3 rounded-full cursor-pointer hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-110">
                      <Camera className="w-5 h-5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                
                <h2 className="text-2xl font-bold text-stone-800 mb-2">{profile.name}</h2>
                <p className="text-stone-500 mb-4">{profile.email}</p>
                
                <div className="flex items-center justify-center gap-2 text-sm text-stone-500 bg-stone-50 rounded-lg px-4 py-2">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mt-6 border border-stone-200">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-stone-800 text-lg">Your Statistics</h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
                    <div className="flex justify-between items-center">
                      <span className="text-stone-700 font-medium">Total Chats</span>
                      <span className="text-2xl font-bold text-emerald-600">{profile.stats.total_chats}</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-200">
                    <div className="flex justify-between items-center">
                      <span className="text-stone-700 font-medium">Feedback Given</span>
                      <span className="text-2xl font-bold text-orange-600">{profile.stats.total_feedback}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-center">
                      <div className="text-2xl font-bold text-emerald-600">{profile.stats.positive_feedback}</div>
                      <div className="text-xs text-stone-600 mt-1">Positive</div>
                    </div>
                    <div className="bg-red-50 rounded-xl p-3 border border-red-200 text-center">
                      <div className="text-2xl font-bold text-red-600">{profile.stats.negative_feedback}</div>
                      <div className="text-xs text-stone-600 mt-1">Negative</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Achievement Badge */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg p-6 mt-6 border-2 border-amber-200">
                <div className="text-center">
                  <Award className="w-12 h-12 text-amber-600 mx-auto mb-3" />
                  <h4 className="font-bold text-stone-800 mb-1">Explorer Badge</h4>
                  <p className="text-xs text-stone-600">Active Uttarakhand Traveler</p>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-stone-200">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-stone-800">Profile Information</h3>
                    <p className="text-stone-500 text-sm mt-1">Update your personal details and preferences</p>
                  </div>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-start gap-3">
                    <div className="w-6 h-6 bg-red-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-700 text-sm font-bold">!</span>
                    </div>
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="bg-emerald-50 border-2 border-emerald-200 text-emerald-700 px-6 py-4 rounded-xl mb-6 flex items-start gap-3">
                    <div className="w-6 h-6 bg-emerald-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-emerald-700 text-sm font-bold">✓</span>
                    </div>
                    <p className="text-sm font-medium">{success}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-3 flex items-center gap-2">
                      <User className="w-5 h-5 text-emerald-600" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!editing}
                      className="w-full px-5 py-4 border-2 border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-stone-50 disabled:text-stone-600 transition-all text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-3 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-emerald-600" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full px-5 py-4 border-2 border-stone-300 rounded-xl bg-stone-50 text-stone-600 text-base"
                    />
                    <p className="text-xs text-stone-500 mt-2 ml-1">Email address cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-3 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-emerald-600" />
                      Preferred Language
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      disabled={!editing}
                      className="w-full px-5 py-4 border-2 border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-stone-50 disabled:text-stone-600 transition-all text-base"
                    >
                      <option value="english">English</option>
                      <option value="hindi">Hindi (हिंदी)</option>
                      <option value="garhwali">Garhwali (गढ़वाली)</option>
                      <option value="kumaoni">Kumaoni (कुमाऊँनी)</option>
                    </select>
                  </div>

                  {editing && (
                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(false);
                          setFormData({
                            name: profile.name,
                            language: profile.language,
                            avatar: profile.avatar || ''
                          });
                          setError('');
                          setSuccess('');
                        }}
                        className="px-8 py-4 border-2 border-stone-300 text-stone-700 rounded-xl font-bold hover:bg-stone-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Profile;
