import React from 'react';
import LanguageSelector from './LanguageSelector';
import type { Language } from '../../types';

interface HeroHeaderProps {
  title: string;
  description: string;
  currentLanguage?: Language;
  onLanguageChange?: (lang: Language) => void;
  showLanguageSelector?: boolean;
}

const HeroHeader: React.FC<HeroHeaderProps> = ({ 
  title, 
  description,
  currentLanguage = 'english',
  onLanguageChange,
  showLanguageSelector = true
}) => {
  return (
    <div className="relative bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 text-white overflow-hidden shadow-xl">
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Mountain Silhouette */}
      <div className="absolute bottom-0 left-0 right-0 opacity-20">
        <svg viewBox="0 0 1200 120" className="w-full h-20">
          <path d="M0,60 L200,20 L400,50 L600,10 L800,40 L1000,25 L1200,50 L1200,120 L0,120 Z" fill="white" opacity="0.3"/>
          <path d="M0,80 L150,50 L350,70 L550,40 L750,60 L950,45 L1200,65 L1200,120 L0,120 Z" fill="white" opacity="0.2"/>
        </svg>
      </div>

      {/* Content Container */}
      <div className="relative container mx-auto px-4 py-10 max-w-7xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Title and Description with Icon */}
          <div className="flex-1 flex items-center gap-4">
            <div className="hidden md:block w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
              <span className="text-4xl">🏔️</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg flex items-center gap-3">
                {title}
              </h1>
              <p className="text-orange-100 text-lg md:text-xl drop-shadow-md font-medium">
                {description}
              </p>
            </div>
          </div>

          {/* Language Selector */}
          {showLanguageSelector && onLanguageChange && (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg hover:bg-white/30 transition-all">
              <LanguageSelector 
                currentLanguage={currentLanguage} 
                onLanguageChange={onLanguageChange} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroHeader;
