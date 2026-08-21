import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { MultiStepRegisterForm } from './MultiStepRegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { ResetPasswordForm } from './ResetPasswordForm';
import { Brain, GraduationCap, ArrowLeft, Star, Users, BookOpen, Award, TrendingUp, Lightbulb, Rocket, BarChart3, Target } from 'lucide-react';

interface AuthPageProps {
  onBackToLanding?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onBackToLanding }) => {
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'forgot-password' | 'reset-password'>('login');
  const [resetToken, setResetToken] = useState<string>('');

  const features = [
    {
      icon: Lightbulb,
      title: 'Intelligent Learning',
      description: 'AI-driven insights that adapt to your learning style'
    },
    {
      icon: Rocket,
      title: 'Accelerated Growth',
      description: 'Fast-track your skills with optimized learning paths'
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Deep insights with improvement recommendations'
    },
    {
      icon: Target,
      title: 'Goal-Oriented System',
      description: 'Set, track, and achieve your learning objectives'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Data Science Student',
      content: 'EduNexa helped me improve my grades by 40% in just one semester!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Software Engineer',
      content: 'The systematic approach made complex topics so much easier.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="flex items-center justify-between p-6">
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </button>
          )}
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div className="bg-gradient-to-r from-purple-600 to-green-600 p-2 rounded-xl">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">EduNexa</h1>
              <p className="text-xs text-gray-500">Learning Improved System</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-screen p-4 pt-20 pb-8">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Enhanced Branding */}
          <div className="hidden lg:block">
            <div className="space-y-8">
              {/* Main Heading */}
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  Welcome to the
                  <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 bg-clip-text text-transparent"> Future of Learning</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Join thousands of students achieving measurable improvements with our intelligent learning system.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">50K+</div>
                  <div className="text-sm text-gray-600">Active Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">1.2K+</div>
                  <div className="text-sm text-gray-600">Expert Instructors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">98%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-white/50 rounded-xl backdrop-blur-sm">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg flex-shrink-0">
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Testimonials */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">What our students say:</h3>
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="bg-white/70 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 text-sm mb-2 italic">"{testimonial.content}"</p>
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">{testimonial.name}</span> - {testimonial.role}
                    </div>
                  </div>
                ))}
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Trusted by 50,000+ students</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Enhanced Auth Forms */}
          <div className="w-full max-w-md mx-auto lg:max-w-none">
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-white/20 backdrop-blur-sm">
              {/* Mobile Header */}
              <div className="lg:hidden text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-gradient-to-r from-purple-600 to-green-600 p-2 rounded-xl">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Welcome to EduNexa</h2>
                <p className="text-sm text-gray-600">Learning Improved System</p>
              </div>

              {/* Auth Forms */}
              {currentView === 'login' && (
                <LoginForm 
                  onToggleForm={() => setCurrentView('register')} 
                  onForgotPassword={() => setCurrentView('forgot-password')}
                />
              )}
              {currentView === 'register' && (
                <MultiStepRegisterForm onToggleForm={() => setCurrentView('login')} />
              )}
              {currentView === 'forgot-password' && (
                <ForgotPasswordForm onBackToLogin={() => setCurrentView('login')} />
              )}
              {currentView === 'reset-password' && (
                <ResetPasswordForm 
                  token={resetToken}
                  onSuccess={() => {
                    alert('Password reset successfully! Please login with your new password.');
                    setCurrentView('login');
                  }}
                  onError={(error) => {
                    alert(error);
                    setCurrentView('forgot-password');
                  }}
                />
              )}

              {/* Additional Info */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-center text-xs sm:text-sm text-gray-500">
                  <p className="mb-2">By continuing, you agree to our Terms of Service and Privacy Policy</p>
                  <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
                    <span>Secure & Private</span>
                    <span>Available Worldwide</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Features */}
            <div className="lg:hidden mt-6 space-y-3 max-w-md mx-auto">
              {features.slice(0, 2).map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white/70 rounded-xl backdrop-blur-sm">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg flex-shrink-0">
                    <feature.icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{feature.title}</h3>
                    <p className="text-xs text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};