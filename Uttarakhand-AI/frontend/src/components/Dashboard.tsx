import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './common/Navbar';
import PremiumHeroSlider from './explore/PremiumHeroSlider';
import NaturalCategoryCards from './explore/NaturalCategoryCards';
import DestinationShowcaseNew from './explore/DestinationShowcaseNew';
import Footer from './common/Footer';
import type { Language } from '../types';
import '../styles/uttarakhand-theme.css';

interface DashboardProps {
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
}

function Dashboard({ language = 'english', onLanguageChange }: DashboardProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Fixed Navbar */}
      <Navbar 
        currentLanguage={language}
        onLanguageChange={onLanguageChange}
      />
      
      {/* Premium Hero Slider */}
      <div className="pt-24">
        <PremiumHeroSlider />
      </div>
      
      {/* Natural Category Cards */}
      <NaturalCategoryCards />

      {/* Destination Showcase */}
      <div className="py-16 px-8 bg-gradient-to-br from-stone-50 to-stone-100">
        <div className="container mx-auto max-w-7xl">
          <DestinationShowcaseNew />
        </div>
      </div>
      
      {/* Call to Action Section */}
      <div className="py-16 bg-gradient-to-br from-emerald-50 via-teal-50 to-stone-50">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">
            Need Travel Assistance?
          </h2>
          <p className="text-lg text-stone-600 mb-8">
            Access our AI-powered services for personalized travel planning, place recognition, and emergency support
          </p>
          <button
            onClick={() => navigate('/services')}
            className="px-8 py-4 bg-gradient-to-r from-emerald-700 to-teal-700 text-white font-semibold rounded-lg hover:from-emerald-800 hover:to-teal-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Explore AI Services
          </button>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Dashboard;
