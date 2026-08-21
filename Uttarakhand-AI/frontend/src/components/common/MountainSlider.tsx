import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Star } from 'lucide-react';

interface Destination {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  gradient: string;
  rating: number;
  category: string;
}

const destinations: Destination[] = [
  {
    id: 1,
    name: 'Kedarnath',
    subtitle: 'Sacred Char Dham',
    description: 'One of the holiest Hindu temples dedicated to Lord Shiva, nestled in the Garhwal Himalayas',
    image: '🛕',
    gradient: 'from-orange-500 via-red-500 to-pink-500',
    rating: 4.9,
    category: 'Spiritual'
  },
  {
    id: 2,
    name: 'Valley of Flowers',
    subtitle: 'UNESCO Heritage Site',
    description: 'A breathtaking alpine valley with endemic flora and stunning mountain views',
    image: '🌸',
    gradient: 'from-pink-400 via-rose-400 to-red-400',
    rating: 4.8,
    category: 'Nature'
  },
  {
    id: 3,
    name: 'Nainital',
    subtitle: 'Lake District of India',
    description: 'Charming hill station centered around the beautiful Naini Lake',
    image: '🏔️',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    rating: 4.7,
    category: 'Hill Station'
  },
  {
    id: 4,
    name: 'Jim Corbett',
    subtitle: "India's Oldest National Park",
    description: 'Premier wildlife sanctuary famous for Bengal tigers and diverse fauna',
    image: '🐅',
    gradient: 'from-green-500 via-emerald-500 to-teal-600',
    rating: 4.8,
    category: 'Wildlife'
  },
  {
    id: 5,
    name: 'Auli',
    subtitle: 'Skiing Paradise',
    description: 'Premier skiing destination with panoramic Himalayan views',
    image: '⛷️',
    gradient: 'from-sky-400 via-blue-500 to-indigo-600',
    rating: 4.6,
    category: 'Adventure'
  }
];

const MountainSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % destinations.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + destinations.length) % destinations.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % destinations.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const currentDestination = destinations[currentIndex];

  return (
    <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-2xl group">
      {/* Main Slide */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentDestination.gradient} transition-all duration-700`}>
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        {/* Content */}
        <div className="relative h-full flex items-center justify-between px-12">
          {/* Left Content */}
          <div className="flex-1 text-white z-10">
            <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4 border border-white/30">
              {currentDestination.category}
            </div>
            <h2 className="text-5xl font-bold mb-3 drop-shadow-lg">
              {currentDestination.name}
            </h2>
            <p className="text-xl font-medium mb-4 text-white/90">
              {currentDestination.subtitle}
            </p>
            <p className="text-lg mb-6 max-w-xl leading-relaxed text-white/80">
              {currentDestination.description}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                <Star className="w-5 h-5 fill-yellow-300 text-yellow-300" />
                <span className="font-bold text-lg">{currentDestination.rating}</span>
              </div>
              <button className="px-6 py-2 bg-white text-gray-800 rounded-full font-semibold hover:bg-white/90 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                Explore More
              </button>
            </div>
          </div>

          {/* Right Icon */}
          <div className="text-[200px] opacity-30 transform group-hover:scale-110 transition-transform duration-700">
            {currentDestination.image}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border border-white/30"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border border-white/30"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {destinations.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all ${
              index === currentIndex
                ? 'w-8 h-2 bg-white'
                : 'w-2 h-2 bg-white/50 hover:bg-white/70'
            } rounded-full`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-medium border border-white/30">
        {currentIndex + 1} / {destinations.length}
      </div>
    </div>
  );
};

export default MountainSlider;
