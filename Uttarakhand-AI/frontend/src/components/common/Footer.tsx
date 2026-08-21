import React from 'react';
import { Phone, Mail, MapPin, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-stone-900 via-slate-900 to-stone-900 text-stone-300 mt-auto relative overflow-hidden">
      {/* Subtle Mountain Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="footer-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M30 10 L50 40 L10 40 Z" fill="currentColor" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-pattern)"/>
        </svg>
      </div>
      
      <div className="container mx-auto px-6 py-12 relative z-10 max-w-7xl">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* About Section */}
          <div className="lg:col-span-1">
            <div className="mb-5">
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src="/src/assets/images/hh-removebg-preview.png" 
                  alt="DSVV Icon"
                  className="h-16 w-16 object-contain"
                />
                <a 
                  href="https://www.dsvv.ac.in/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xl font-bold text-white hover:text-emerald-400 transition-colors duration-200"
                >
                  Dev Sanskriti Vishwavidyalaya
                </a>
              </div>
              <p className="text-sm text-emerald-400 font-medium mb-2">
                CAIR - Centre of Artificial Intelligence
              </p>
              <p className="text-sm text-stone-400 font-medium mb-3">देवभूमि • Land of Gods</p>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              “An AI-powered companion developed at Dev Sanskriti Vishwavidyalaya (DSVV) & its research unit Centre for Artificial Intelligence and Research (CAIR), Haridwar—blending cutting-edge data science with the spiritual-cultural ethos of Uttarakhand.”
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-5 border-b border-stone-700 pb-2">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://uttarakhandtourism.gov.in/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-stone-400 hover:text-emerald-400 hover:translate-x-1 transition-all duration-200 flex items-center gap-2 group"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Official Tourism Portal</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://uttarakhandtourism.gov.in/destination" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-stone-400 hover:text-emerald-400 hover:translate-x-1 transition-all duration-200 flex items-center gap-2 group"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Explore Destinations</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://uttarakhandtourism.gov.in/activities" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-stone-400 hover:text-emerald-400 hover:translate-x-1 transition-all duration-200 flex items-center gap-2 group"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Activities & Adventures</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://uttarakhandtourism.gov.in/accommodation" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-stone-400 hover:text-emerald-400 hover:translate-x-1 transition-all duration-200 flex items-center gap-2 group"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Accommodation</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold text-white mb-5 border-b border-stone-700 pb-2">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <div className="w-9 h-9 bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-800/40 transition-colors">
                  <Phone className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-stone-500 mb-0.5">Phone</p>
                  <a 
                    href="tel:+911334200100"
                    className="text-sm font-semibold text-stone-200 hover:text-emerald-400 transition-colors"
                  >
                    +91-1334-200100
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-9 h-9 bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-800/40 transition-colors">
                  <Mail className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-stone-500 mb-0.5">Email</p>
                  <a 
                    href="mailto:info@dsvv.ac.in"
                    className="text-sm font-medium text-stone-300 hover:text-emerald-400 transition-colors duration-200 break-all"
                  >
                    info@dsvv.ac.in
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-9 h-9 bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-800/40 transition-colors">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-stone-500 mb-0.5">Location</p>
                  <p className="text-sm font-medium text-stone-300">Haridwar, Uttarakhand</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-bold text-white mb-5 border-b border-stone-700 pb-2">Stay Connected</h4>
            <p className="text-sm text-stone-400 mb-5 leading-relaxed">
              Follow us for travel inspiration, updates, and exclusive content from the Land of Gods.
            </p>
            <div className="flex gap-3">
              <a
                href="https://x.com/dsvvofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-stone-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://www.facebook.com/dsvvofficial/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-stone-800 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/dsvvofficial/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-stone-800 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Developer Credits */}
        <div className="border-t border-stone-700/50 pt-8">
          <div className="text-center">
            <p className="text-sm text-stone-400 font-medium mb-1">
              Designed & Developed by <span className="text-emerald-400 font-semibold">Yogesh and Team</span>
            </p>
            <p className="text-xs text-stone-500">
              Built with React • TypeScript • Tailwind CSS • AI
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
