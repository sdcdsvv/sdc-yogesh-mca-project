import React from 'react';
import { Mountain } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import type { Language } from '../../types';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ language, onLanguageChange }) => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mountain className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Uttarakhand Tourism AI</h1>
              <p className="text-sm text-blue-100">Your Intelligent Travel Guide</p>
            </div>
          </div>
          <LanguageSelector
            currentLanguage={language}
            onLanguageChange={onLanguageChange}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;

