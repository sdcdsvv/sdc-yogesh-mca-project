import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from './common/Navbar';
import Footer from './common/Footer';
import UttarakhandMap from './home/UttarakhandMap';
import { translations, Language } from '../utils/translations';
import type { Language as LangType } from '../types';

interface LandingPageProps {
  language?: LangType;
  onLanguageChange?: (lang: LangType) => void;
}

const LandingPageRedesigned: React.FC<LandingPageProps> = ({ 
  language: propLanguage = 'english',
  onLanguageChange 
}) => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const language = propLanguage;

  const t = translations[language as Language];

  const heroSlides = t.hero.slides.map((slide, index) => ({
    ...slide,
    gradient: [
      'from-slate-800/90 via-stone-700/85 to-slate-800/90',
      'from-emerald-900/90 via-teal-800/85 to-green-900/90',
      'from-sky-900/90 via-blue-800/85 to-cyan-900/90',
      'from-amber-900/90 via-orange-800/85 to-yellow-900/90'
    ][index],
    imageUrl: [
      'https://images.unsplash.com/photo-1649147313351-c86537fda0eb?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.unsplash.com/photo-1544952019-734321a2a151?q=80&w=1965&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcRBeh9Nzr0PqOUdW-pP2qQBm-VQ-8DeuXm7WWsRPdMmK3TwoUAp560akMfGNwriXezyy7uBs51H_kZlSthKok8OsL4&s=19',
      'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?q=80&w=2072'
    ][index]
  }));

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, currentSlide]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setIsAutoPlaying(false);
  };

  const handlePrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar 
        currentLanguage={language}
        onLanguageChange={onLanguageChange}
      />
      
      {/* Premium Hero Section with Slider */}
      <div className="relative h-[85vh] min-h-[600px] overflow-hidden bg-stone-900 group mt-24">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={heroSlides[currentSlide].imageUrl} 
            alt={heroSlides[currentSlide].title}
            className="w-full h-full object-cover transition-all duration-1000"
            loading="lazy"
          />
          {/* Dark Overlay with Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${heroSlides[currentSlide].gradient} transition-all duration-1000`}></div>
          
          {/* Subtle Mountain Pattern */}
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="mountain-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M30 10 L50 40 L10 40 Z" fill="currentColor" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#mountain-pattern)"/>
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium mb-6 border border-white/20">
                <span className="text-xl">🏔️</span>
                <span>Explore Devbhoomi</span>
              </div>

              {/* Main Heading */}
              <div className="mb-8 animate-fade-in-up">
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                  {heroSlides[currentSlide].title}
                </h1>
                <p className="text-2xl md:text-3xl text-white/90 mb-4 font-light" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                  {heroSlides[currentSlide].subtitle}
                </p>
                <p className="text-lg text-white/80 mb-8">
                  {heroSlides[currentSlide].description}
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button
                  onClick={() => navigate('/services')}
                  className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all shadow-lg"
                >
                  {t.hero.exploreServices}
                </button>
                <button
                  onClick={() => navigate('/explore')}
                  className="px-8 py-4 bg-white text-emerald-800 font-semibold rounded-lg hover:bg-stone-100 transition-all shadow-lg"
                >
                  {t.hero.discoverDestinations}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrevious}
          className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border border-white/20"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border border-white/20"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all ${
                index === currentSlide
                  ? 'w-12 h-1.5 bg-white'
                  : 'w-8 h-1.5 bg-white/40 hover:bg-white/60'
              } rounded-full`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Slide Counter */}
        <div className="absolute top-8 right-8 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white font-medium border border-white/20">
          {String(currentSlide + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
        </div>
      </div>

      {/* Services Preview Section */}
      <div className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-stone-800 mb-4">
              {t.services.heading}
            </h2>
            <p className="text-lg text-stone-600">
              {t.services.subheading}
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {['💬', '📸', '🗺️', '🚨'].map((icon, index) => (
              <ServicePreviewCard
                key={index}
                icon={icon}
                title={t.services.cards[index].title}
                description={t.services.cards[index].description}
              />
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/services')}
              className="px-8 py-3 bg-gradient-to-r from-emerald-700 to-teal-700 text-white font-semibold rounded-lg hover:from-emerald-800 hover:to-teal-800 transition-all shadow-md"
            >
              {t.services.viewAll}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Uttarakhand Map */}
      <div className="py-20 px-6 bg-gradient-to-br from-stone-100 via-emerald-50 to-teal-50">
        <div className="container mx-auto max-w-7xl">
          <UttarakhandMap />
        </div>
      </div>

      {/* Destinations Showcase */}
      <div className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-stone-800 mb-4">
              {t.destinations.heading}
            </h2>
            <p className="text-lg text-stone-600">
              {t.destinations.subheading}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {t.destinations.categories.map((category, index) => (
              <CategoryCard
                key={index}
                title={category.title}
                subtitle={category.subtitle}
                gradient={[
                  'from-amber-700 to-orange-800',
                  'from-sky-700 to-blue-800',
                  'from-emerald-700 to-green-800',
                  'from-teal-700 to-cyan-800',
                  'from-purple-700 to-indigo-800',
                  'from-pink-700 to-rose-800',
                  'from-slate-700 to-gray-800',
                  'from-stone-700 to-zinc-800'
                ][index]}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-stone-800 mb-4">
              {t.whyChoose.heading}
            </h2>
            <p className="text-lg text-stone-600">
              {t.whyChoose.subheading}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {t.whyChoose.features.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="py-16 px-6 bg-gradient-to-br from-emerald-900 via-teal-900 to-green-900 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-5xl font-bold mb-2">50K+</div>
              <div className="text-white/80">Happy Travelers</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-5xl font-bold mb-2">100+</div>
              <div className="text-white/80">Destinations</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-5xl font-bold mb-2">4.8★</div>
              <div className="text-white/80">Average Rating</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-5xl font-bold mb-2">24/7</div>
              <div className="text-white/80">Support Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-6 bg-gradient-to-r from-emerald-800 via-teal-800 to-green-800 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t.cta.heading}
          </h2>
          <p className="text-xl mb-4 font-medium opacity-90">
            {t.cta.subheading}
          </p>
          <p className="text-lg mb-10 opacity-80">
            {t.cta.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="px-10 py-4 bg-white text-emerald-800 rounded-lg text-lg font-semibold hover:bg-stone-100 transition-all shadow-lg"
            >
              {t.cta.getStarted}
            </button>
            <button
              onClick={() => navigate('/explore')}
              className="px-10 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg text-lg font-semibold hover:bg-white/20 transition-all shadow-lg border border-white/20"
            >
              {t.cta.exploreNow}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// Service Preview Card Component
const ServicePreviewCard: React.FC<{ icon: string; title: string; description: string }> = 
  ({ icon, title, description }) => (
  <div className="bg-stone-50 rounded-xl p-6 hover:bg-stone-100 transition-all border border-stone-200">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-lg font-bold text-stone-800 mb-2">{title}</h3>
    <p className="text-sm text-stone-600">{description}</p>
  </div>
);

// Category Card Component
const CategoryCard: React.FC<{ title: string; subtitle: string; gradient: string }> = 
  ({ title, subtitle, gradient }) => (
  <div className="group cursor-pointer">
    <div className={`bg-gradient-to-br ${gradient} rounded-xl p-6 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 h-full`}>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/80 text-sm">{subtitle}</p>
    </div>
  </div>
);

// Feature Card Component
const FeatureCard: React.FC<{ title: string; description: string }> = 
  ({ title, description }) => (
  <div className="bg-stone-50 rounded-xl p-8 border border-stone-200">
    <h3 className="text-xl font-bold text-stone-800 mb-3">{title}</h3>
    <p className="text-stone-600 leading-relaxed">{description}</p>
  </div>
);

export default LandingPageRedesigned;
