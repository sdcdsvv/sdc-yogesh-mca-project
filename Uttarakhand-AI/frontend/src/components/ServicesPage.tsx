import { useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Navbar from './common/Navbar';
import Footer from './common/Footer';
import ChatInterface from './chat/ChatInterface';
import ImageUpload from './vision/ImageUpload';
import ItineraryForm from './itinerary/ItineraryForm';
import EmergencyAlert from './emergency/EmergencyAlert';
import WeatherWidget from './emergency/WeatherWidget';
import type { Language } from '../types';

type ServiceType = 'chat' | 'vision' | 'itinerary' | 'emergency';

interface ServiceCard {
  id: ServiceType;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  icon: string;
  gradient: string;
  bgPattern: string;
}

const services: ServiceCard[] = [
  {
    id: 'chat',
    title: 'AI Travel Guide',
    subtitle: 'Intelligent Conversation Assistant',
    description: 'Chat with our AI-powered guide to get instant answers about destinations, culture, temples, and travel tips in your preferred language.',
    features: ['Multi-language support', 'Real-time responses', 'Cultural insights', 'Travel recommendations'],
    icon: '💬',
    gradient: 'from-emerald-700 to-teal-800',
    bgPattern: 'from-emerald-50 to-teal-50'
  },
  {
    id: 'vision',
    title: 'Place Recognition',
    subtitle: 'Visual Landmark Identification',
    description: 'Upload photos to instantly identify landmarks, temples, and natural wonders with detailed historical and cultural information.',
    features: ['Image recognition', 'Landmark details', 'Historical context', 'Location information'],
    icon: '📸',
    gradient: 'from-sky-700 to-blue-800',
    bgPattern: 'from-sky-50 to-blue-50'
  },
  {
    id: 'itinerary',
    title: 'Trip Planning',
    subtitle: 'Personalized Journey Creator',
    description: 'Generate customized itineraries based on your interests, budget, travel duration, and preferred activities for the perfect Uttarakhand experience.',
    features: ['Custom itineraries', 'Budget planning', 'Activity suggestions', 'Route optimization'],
    icon: '🗺️',
    gradient: 'from-amber-700 to-orange-800',
    bgPattern: 'from-amber-50 to-orange-50'
  },
  {
    id: 'emergency',
    title: 'Emergency Services',
    subtitle: 'Safety & Weather Information',
    description: 'Access emergency contacts, real-time weather alerts, and critical safety information to ensure a secure journey through the mountains.',
    features: ['Emergency contacts', 'Weather alerts', 'Safety tips', 'Helpline numbers'],
    icon: '🚨',
    gradient: 'from-stone-700 to-slate-800',
    bgPattern: 'from-stone-50 to-slate-50'
  }
];

interface ServicesPageProps {
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
}

function ServicesPage({ language = 'english', onLanguageChange }: ServicesPageProps) {
  const [activeService, setActiveService] = useState<ServiceType | null>(null);

  const activeServiceData = services.find(s => s.id === activeService);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Navbar 
        currentLanguage={language}
        onLanguageChange={onLanguageChange}
      />
      
      {/* Hero Section */}
      <div className="relative pt-40 pb-16 bg-gradient-to-br from-emerald-900 via-teal-900 to-green-900 overflow-hidden">
        {/* Mountain Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="services-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M30 10 L50 40 L10 40 Z" fill="currentColor" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#services-pattern)"/>
          </svg>
        </div>

        <div className="container mx-auto px-6 max-w-6xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-6 border border-white/20">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Travel Tools</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            Intelligent Travel Services
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-2" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            Explore Uttarakhand with cutting-edge AI technology
          </p>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            स्मार्ट यात्रा सेवाओं के साथ उत्तराखंड का अन्वेषण करें
          </p>
        </div>
      </div>

      {/* Services Grid or Active Service */}
      <div className="flex-1 py-16">
        <div className="container mx-auto px-6 max-w-7xl">
          {!activeService ? (
            <>
              {/* Services Grid */}
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setActiveService(service.id)}
                    className="group text-left bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-stone-200 hover:border-stone-300 transform hover:-translate-y-1"
                  >
                    {/* Card Header with Gradient */}
                    <div className={`bg-gradient-to-br ${service.bgPattern} p-8 border-b border-stone-200`}>
                      <div className={`w-16 h-16 bg-gradient-to-br ${service.gradient} rounded-xl flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {service.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-stone-800 mb-2">
                        {service.title}
                      </h3>
                      <p className="text-sm font-medium text-stone-600">
                        {service.subtitle}
                      </p>
                    </div>

                    {/* Card Body */}
                    <div className="p-8">
                      <p className="text-stone-600 leading-relaxed mb-6">
                        {service.description}
                      </p>

                      {/* Features List */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        {service.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-stone-600">
                            <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <div className="flex items-center text-emerald-700 font-semibold group-hover:gap-2 transition-all">
                        <span>Launch Service</span>
                        <span className="ml-1 group-hover:ml-2 transition-all text-lg">→</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Info Section */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-200">
                <div className="max-w-3xl mx-auto text-center">
                  <h3 className="text-2xl font-bold text-stone-800 mb-3">
                    Why Choose Our AI Services?
                  </h3>
                  <p className="text-stone-600 leading-relaxed mb-6">
                    Our intelligent tools are specifically designed for Uttarakhand tourism, combining local expertise with advanced AI technology to provide accurate, helpful, and culturally relevant information.
                  </p>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="text-3xl mb-3">⚡</div>
                      <h4 className="font-semibold text-stone-800 mb-2">Instant Responses</h4>
                      <p className="text-sm text-stone-600">Get answers in seconds, not hours</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="text-3xl mb-3">🌐</div>
                      <h4 className="font-semibold text-stone-800 mb-2">Multi-Language</h4>
                      <p className="text-sm text-stone-600">Available in 4+ languages</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="text-3xl mb-3">🎯</div>
                      <h4 className="font-semibold text-stone-800 mb-2">Personalized</h4>
                      <p className="text-sm text-stone-600">Tailored to your preferences</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              {/* Back Button with Service Info */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setActiveService(null)}
                  className="flex items-center gap-2 text-stone-600 hover:text-emerald-700 font-medium transition-colors group"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  <span>Back to All Services</span>
                </button>
                {activeServiceData && (
                  <div className="hidden md:flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${activeServiceData.gradient} rounded-lg flex items-center justify-center text-xl`}>
                      {activeServiceData.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-800">{activeServiceData.title}</h3>
                      <p className="text-sm text-stone-600">{activeServiceData.subtitle}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Service Content */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-200">
                {activeService === 'chat' && (
                  <ChatInterface language={language} />
                )}
                {activeService === 'vision' && (
                  <div className="p-8">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-stone-800 mb-2">Place Recognition</h2>
                      <p className="text-stone-600">Upload an image to identify landmarks and get detailed information</p>
                    </div>
                    <ImageUpload language={language} />
                  </div>
                )}
                {activeService === 'itinerary' && (
                  <div className="p-8">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-stone-800 mb-2">Trip Planning</h2>
                      <p className="text-stone-600">Create your personalized Uttarakhand itinerary</p>
                    </div>
                    <ItineraryForm />
                  </div>
                )}
                {activeService === 'emergency' && (
                  <div className="p-8 bg-gradient-to-br from-stone-50 to-slate-50">
                    <div className="text-center mb-8">
                      <div className="inline-block p-4 bg-gradient-to-br from-stone-700 to-slate-800 rounded-2xl mb-4 shadow-lg">
                        <span className="text-5xl">🚨</span>
                      </div>
                      <h2 className="text-3xl font-bold text-stone-800 mb-2">Emergency Services</h2>
                      <p className="text-stone-600 text-lg">Access critical safety information and weather updates</p>
                    </div>
                    
                    {/* Vertical Sections Layout */}
                    <div className="max-w-5xl mx-auto space-y-6">
                      {/* Weather Forecast Section */}
                      <WeatherWidget />
                      
                      {/* Emergency Alert with all sections */}
                      <EmergencyAlert />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ServicesPage;
