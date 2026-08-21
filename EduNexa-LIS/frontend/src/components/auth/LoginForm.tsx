import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, CheckCircle } from 'lucide-react';


interface LoginFormProps {
  onToggleForm: () => void;
  onForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleForm, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
    } catch (error) {
      setError('Invalid email or password');
    }
  };

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    
    // Auto-set role based on email
    if (demoEmail.includes('student')) {
      setSelectedRole('student');
    } else if (demoEmail.includes('teacher')) {
      setSelectedRole('teacher');
    } else if (demoEmail.includes('admin')) {
      setSelectedRole('admin');
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-sm sm:text-base text-gray-600">Sign in to continue your learning journey</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
            Login as
          </label>
          <select
            id="role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
            required
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Super Administrator</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <LogIn className="h-5 w-5" />
              Sign In
            </>
          )}
        </button>
      </form>

      {/* Divider */}


      {/* Demo Accounts */}
      <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          <p className="text-xs sm:text-sm font-medium text-blue-900">Try Demo Accounts</p>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            className="text-left p-2 bg-white border border-gray-300 rounded-lg hover:bg-blue-50 transition-colors"
            onClick={() => handleDemoLogin('yogesh.chauhan.ai@gmail.com', 'Student@123')}
          >
            <p className="text-xs font-medium text-blue-900">Student Account</p>
            <div className="text-xs text-blue-700 truncate">yogesh.chauhan.ai@gmail.com</div>
          </button>
          <button
            type="button"
            className="text-left p-2 bg-white border border-gray-300 rounded-lg hover:bg-blue-50 transition-colors"
            onClick={() => handleDemoLogin('hemantsingh.ai@gmail.com', 'Teacher@123')}
          >
            <p className="text-xs font-medium text-blue-900">Teacher Account</p>
            <div className="text-xs text-blue-700 truncate">hemantsingh.ai@gmail.com</div>
          </button>
          <button
            type="button"
            className="text-left p-2 bg-white border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
            onClick={() => handleDemoLogin('admin@datams.edu', 'Admin@123')}
          >
            <p className="text-xs font-medium text-purple-900">Super Administrator</p>
            <div className="text-xs text-purple-700 truncate">admin@datams.edu</div>
            <div className="text-[10px] text-purple-600 mt-0.5">Full System Access</div>
          </button>
        </div>
      </div>

      {/* Only show signup option for non-admin roles */}
      {selectedRole !== 'admin' && (
        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <button
            onClick={onToggleForm}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Sign up for free
          </button>
        </p>
      )}
      
      {selectedRole === 'admin' && (
        <p className="text-center text-sm text-gray-500 mt-6 italic">
          Super Administrator account is predefined by the system. Only one admin exists with full access.
        </p>
      )}
    </div>
  );
};