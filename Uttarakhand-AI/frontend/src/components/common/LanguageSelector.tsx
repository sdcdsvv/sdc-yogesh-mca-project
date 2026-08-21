import React from 'react';
import { Globe } from 'lucide-react';
import type { Language } from '../../types';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'english', name: 'English', flag: '🇬🇧' },
  { code: 'hindi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'garhwali', name: 'गढ़वाली', flag: '🏔️' },
  { code: 'kumaoni', name: 'कुमाऊँनी', flag: '⛰️' }
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange
}) => {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
        <Globe className="w-4 h-4" />
        <select
          value={currentLanguage}
          onChange={(e) => onLanguageChange(e.target.value as Language)}
          className="bg-transparent text-white border-none outline-none cursor-pointer text-sm font-medium"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code} className="text-gray-800">
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LanguageSelector;

