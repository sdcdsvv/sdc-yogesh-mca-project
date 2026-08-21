import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  location: string;
  description: string;
  gradient: string;
  imageUrl: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Kedarnath Temple',
    subtitle: 'Sacred Abode in the Himalayas',
    category: 'Spiritual Heritage',
    location: 'Rudraprayag District',
    description: 'One of the twelve Jyotirlingas, nestled at 3,583m in the Garhwal Himalayas',
    gradient: 'from-slate-800/90 via-stone-700/85 to-slate-800/90',
    imageUrl: 'https://images.unsplash.com/photo-1649147313351-c86537fda0eb?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 2,
    title: 'Valley of Flowers',
    subtitle: 'UNESCO World Heritage Site',
    category: 'Natural Wonder',
    location: 'Chamoli District',
    description: 'Alpine meadow adorned with endemic flora and breathtaking mountain vistas',
    gradient: 'from-emerald-900/90 via-teal-800/85 to-green-900/90',
    imageUrl: 'https://images.unsplash.com/photo-1544952019-734321a2a151?q=80&w=1965&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 3,
    title: 'Jim Corbett National Park',
    subtitle: "India's Oldest National Park",
    category: 'Wildlife Sanctuary',
    location: 'Nainital District',
    description: 'Home to the majestic Bengal tiger and diverse Himalayan wildlife',
    gradient: 'from-amber-900/90 via-orange-800/85 to-yellow-900/90',
    imageUrl: 'https://images.unsplash.com/photo-1669021820358-317111184ede?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 4,
    title: 'Nainital Lake',
    subtitle: 'The Lake District of India',
    category: 'Hill Station',
    location: 'Kumaon Region',
    description: 'Serene pear-shaped lake surrounded by seven hills and pine forests',
    gradient: 'from-sky-900/90 via-blue-800/85 to-cyan-900/90',
    imageUrl: 'https://images.unsplash.com/photo-1610715936287-6c2ad208cdbf?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 5,
    title: 'Auli Meadows',
    subtitle: 'Skiing Paradise of India',
    category: 'Adventure Destination',
    location: 'Chamoli District',
    description: 'Snow-covered slopes with panoramic views of Nanda Devi and Himalayan peaks',
    gradient: 'from-stone-900/90 via-slate-800/85 to-gray-900/90',
    imageUrl: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?q=80&w=2070'
  }
];

const PremiumHeroSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full h-[600px] overflow-hidden bg-stone-900 group">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={currentSlide.imageUrl} 
          alt={currentSlide.title}
          className="w-full h-full object-cover transition-all duration-1000"
          loading="lazy"
        />
        {/* Dark Overlay with Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${currentSlide.gradient} transition-all duration-1000`}></div>
        
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="pahadi-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 20 L20 0 L40 20 L20 40 Z" fill="currentColor" opacity="0.1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pahadi-pattern)"/>
          </svg>
        </div>
      </div>

      {/* Content Container */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-8 max-w-7xl">
          <div className="max-w-3xl animate-fade-in-up">
            {/* Category Badge */}
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-white/10 backdrop-blur-md text-white text-sm font-medium rounded-full border border-white/20">
                {currentSlide.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              {currentSlide.title}
            </h1>

            {/* Subtitle */}
            <p className="text-2xl md:text-3xl text-white/90 mb-6 font-light" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
              {currentSlide.subtitle}
            </p>

            {/* Location */}
            <div className="flex items-center gap-2 text-white/80 mb-6">
              <MapPin className="w-5 h-5" />
              <span className="text-lg">{currentSlide.location}</span>
            </div>

            {/* Description */}
            <p className="text-lg text-white/80 mb-8 max-w-2xl leading-relaxed">
              {currentSlide.description}
            </p>

            {/* CTA Button */}
            <button className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-medium rounded-lg border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all">
              Explore Destination
            </button>
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
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all ${
              index === currentIndex
                ? 'w-12 h-1.5 bg-white'
                : 'w-8 h-1.5 bg-white/40 hover:bg-white/60'
            } rounded-full`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute top-8 right-8 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white font-medium border border-white/20">
        {String(currentIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
      </div>
    </div>
  );
};

export default PremiumHeroSlider;
