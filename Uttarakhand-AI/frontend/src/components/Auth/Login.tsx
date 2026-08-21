  import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { signup, login } from '../../services/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  // Get the page user was trying to access
  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const response = await login({
          email: formData.email,
          password: formData.password
        });

        if (response.success && response.data) {
          // Save user and token to localStorage with timestamp
          localStorage.setItem('user', JSON.stringify(response.data.user));
          localStorage.setItem('authToken', response.data.token);
          localStorage.setItem('tokenTimestamp', new Date().getTime().toString());
          
          // Show welcome message
          setSuccessMessage(response.message || 'Login successful!');
          
          // Navigate after short delay to show message
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 1500);
        } else {
          setError(response.error || 'Login failed');
        }
      } else {
        // Signup
        const response = await signup({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          language: 'english'
        });

        if (response.success && response.data) {
          // Save user and token to localStorage with timestamp
          localStorage.setItem('user', JSON.stringify(response.data.user));
          localStorage.setItem('authToken', response.data.token);
          localStorage.setItem('tokenTimestamp', new Date().getTime().toString());
          
          // Show welcome message
          setSuccessMessage(response.message || 'Account created successfully!');
          
          // Navigate after short delay to show message
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 1500);
        } else {
          setError(response.error || 'Signup failed');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-stone-600 hover:text-emerald-700 font-medium mb-8 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-stone-800 mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-stone-600">
              {isLogin ? 'Continue your Uttarakhand journey' : 'Start exploring the Land of Gods'}
            </p>
            <p className="text-sm text-emerald-700 mt-1 font-medium">
              {isLogin ? 'स्वागत है • उत्तराखंड की यात्रा जारी रखें' : 'खाता बनाएं • देवभूमि की खोज शुरू करें'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 animate-fadeIn">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg mb-4 animate-fadeIn flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-emerald-600 border-stone-300 rounded focus:ring-emerald-500" />
                  <span className="text-stone-600">Remember me</span>
                </label>
                <button type="button" className="text-emerald-700 hover:text-emerald-800 font-medium">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-700 to-teal-700 text-white py-3.5 rounded-lg font-semibold text-base hover:from-emerald-800 hover:to-teal-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center">
            <p className="text-stone-600">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-emerald-700 hover:text-emerald-800 font-semibold hover:underline transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>


        </div>
      </div>

      {/* Right Side - Image/Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-900 via-teal-900 to-green-900 relative overflow-hidden">
        {/* Mountain Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="login-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M30 10 L50 40 L10 40 Z" fill="currentColor" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#login-pattern)"/>
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white text-center">
          <div className="max-w-md">
            <div className="text-6xl mb-6">🏔️</div>
            <h2 className="text-4xl font-bold mb-4" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              Uttarakhand Tourism
            </h2>
            <p className="text-xl mb-2 text-white/90" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
              देवभूमि • Land of Gods
            </p>
            <p className="text-white/80 leading-relaxed mb-8">
              Discover the majestic Himalayas, sacred temples, pristine rivers, and rich cultural heritage with AI-powered guidance.
            </p>

            {/* Features */}
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xl">💬</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">AI Travel Guide</h4>
                  <p className="text-sm text-white/80">Get instant answers in your language</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xl">📸</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Place Recognition</h4>
                  <p className="text-sm text-white/80">Identify landmarks instantly</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xl">🗺️</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Trip Planning</h4>
                  <p className="text-sm text-white/80">Personalized itineraries</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
