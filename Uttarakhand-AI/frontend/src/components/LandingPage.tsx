import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './common/Navbar';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section - Uttarakhand Style */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-green-50 to-blue-50">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnpNNiAzNGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto pt-20">
          {/* Main Heading with Uttarakhand Colors */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              <span className="text-orange-600">उत्तराखंड</span>
              <span className="text-gray-800"> | </span>
              <span className="text-green-700">Uttarakhand</span>
            </h1>
            <div className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-semibold text-gray-700">
              <span className="text-orange-500">देवभूमि</span>
              <span>•</span>
              <span className="text-green-600">Land of Gods</span>
            </div>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-6 font-medium">
            Your AI-Powered Tourism Companion
          </p>
          <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Explore the majestic Himalayas, sacred temples, pristine rivers, and rich cultural heritage 
            with intelligent recommendations in your preferred language
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => navigate('/login')}
              className="px-10 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Start Your Journey
            </button>
            <button
              onClick={() => navigate('/explore')}
              className="px-10 py-4 bg-white text-green-700 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl border-2 border-green-600 transform hover:-translate-y-0.5"
            >
              Explore Now
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16">
            <StatCard number="13" label="Districts" icon="🏛️" />
            <StatCard number="12+" label="National Parks" icon="🌲" />
            <StatCard number="100+" label="Tourist Places" icon="📍" />
            <StatCard number="4" label="Languages" icon="🗣️" />
          </div>
        </div>
      </div>

      {/* Tourism Categories - Uttarakhand Style */}
      <div className="py-20 px-4 bg-gradient-to-b from-white to-orange-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Explore Uttarakhand
            </h2>
            <p className="text-lg text-gray-600">Discover the diverse beauty of the Himalayas</p>
          </div>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            <CategoryCard
              icon="🛕"
              title="Spiritual Tourism"
              description="Char Dham, Haridwar, Rishikesh"
              color="from-orange-400 to-orange-600"
            />
            <CategoryCard
              icon="🏔️"
              title="Adventure Sports"
              description="Trekking, Rafting, Skiing"
              color="from-blue-400 to-blue-600"
            />
            <CategoryCard
              icon="🐅"
              title="Wildlife Safari"
              description="Jim Corbett, Rajaji National Park"
              color="from-green-500 to-green-700"
            />
            <CategoryCard
              icon="🏞️"
              title="Hill Stations"
              description="Nainital, Mussoorie, Ranikhet"
              color="from-teal-400 to-teal-600"
            />
            <CategoryCard
              icon="🎭"
              title="Cultural Heritage"
              description="Temples, Festivals, Local Art"
              color="from-purple-400 to-purple-600"
            />
            <CategoryCard
              icon="🌄"
              title="Valley of Flowers"
              description="UNESCO World Heritage Site"
              color="from-pink-400 to-pink-600"
            />
            <CategoryCard
              icon="⛷️"
              title="Winter Sports"
              description="Auli Skiing, Snow Activities"
              color="from-cyan-400 to-cyan-600"
            />
            <CategoryCard
              icon="🧘"
              title="Yoga & Wellness"
              description="Meditation, Ayurveda, Retreats"
              color="from-amber-400 to-amber-600"
            />
          </div>
        </div>
      </div>

      {/* AI Features Section */}
      <div className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Smart Travel Assistant
            </h2>
            <p className="text-lg text-gray-600">AI-powered features for seamless exploration</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🤖"
              title="AI Chat Guide"
              description="Get instant answers about places, culture, and travel tips in your preferred language"
              gradient="from-blue-50 to-blue-100"
            />
            <FeatureCard
              icon="📸"
              title="Image Recognition"
              description="Upload photos to identify places and get detailed information instantly"
              gradient="from-green-50 to-green-100"
            />
            <FeatureCard
              icon="🗺️"
              title="Smart Itineraries"
              description="Generate personalized travel plans based on your interests and budget"
              gradient="from-orange-50 to-orange-100"
            />
            <FeatureCard
              icon="🌐"
              title="Multi-Language Support"
              description="Available in English, Hindi, Garhwali, and Kumaoni languages"
              gradient="from-purple-50 to-purple-100"
            />
            <FeatureCard
              icon="🚨"
              title="Emergency Assistance"
              description="Quick access to emergency contacts and real-time weather alerts"
              gradient="from-red-50 to-red-100"
            />
            <FeatureCard
              icon="📍"
              title="Interactive Maps"
              description="Explore destinations with integrated Google Maps and navigation"
              gradient="from-teal-50 to-teal-100"
            />
          </div>
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="py-20 px-4 bg-gradient-to-br from-green-50 via-blue-50 to-orange-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Must-Visit Destinations
            </h2>
            <p className="text-lg text-gray-600">Experience the best of Uttarakhand</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DestinationCard 
              name="Rishikesh" 
              subtitle="Yoga Capital of the World"
              image="🏞️" 
              tag="Adventure & Spiritual" 
              color="from-blue-500 to-teal-500"
            />
            <DestinationCard 
              name="Nainital" 
              subtitle="Lake District of India"
              image="🏔️" 
              tag="Hill Station" 
              color="from-cyan-500 to-blue-500"
            />
            <DestinationCard 
              name="Kedarnath" 
              subtitle="Sacred Char Dham"
              image="🛕" 
              tag="Spiritual" 
              color="from-orange-500 to-red-500"
            />
            <DestinationCard 
              name="Jim Corbett" 
              subtitle="India's Oldest National Park"
              image="🐅" 
              tag="Wildlife" 
              color="from-green-500 to-emerald-600"
            />
            <DestinationCard 
              name="Mussoorie" 
              subtitle="Queen of Hills"
              image="⛰️" 
              tag="Hill Station" 
              color="from-purple-500 to-pink-500"
            />
            <DestinationCard 
              name="Haridwar" 
              subtitle="Gateway to Gods"
              image="🕉️" 
              tag="Spiritual" 
              color="from-amber-500 to-orange-600"
            />
            <DestinationCard 
              name="Auli" 
              subtitle="Skiing Paradise"
              image="⛷️" 
              tag="Adventure" 
              color="from-sky-400 to-blue-600"
            />
            <DestinationCard 
              name="Valley of Flowers" 
              subtitle="UNESCO Heritage Site"
              image="🌸" 
              tag="Nature" 
              color="from-pink-400 to-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Testimonials / Experience Section */}
      <div className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Why Travelers Love Us
            </h2>
            <p className="text-lg text-gray-600">Real experiences from real travelers</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="The AI guide helped me plan my entire Char Dham yatra perfectly. Got recommendations in Hindi which made it so easy!"
              author="Priya Sharma"
              location="Delhi"
            />
            <TestimonialCard
              quote="Image recognition feature is amazing! I took a photo of a temple and instantly got its history and significance."
              author="Rahul Verma"
              location="Mumbai"
            />
            <TestimonialCard
              quote="Emergency contacts and weather alerts saved my trek. This app is a must-have for Uttarakhand travelers."
              author="Amit Patel"
              location="Ahmedabad"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 bg-gradient-to-r from-orange-500 via-orange-600 to-green-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Begin Your Himalayan Adventure
          </h2>
          <p className="text-xl md:text-2xl mb-4 font-medium">
            देवभूमि की यात्रा शुरू करें
          </p>
          <p className="text-lg mb-10 opacity-90">
            Join thousands of travelers exploring Uttarakhand with AI-powered guidance
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="px-10 py-4 bg-white text-orange-600 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all shadow-xl transform hover:-translate-y-1"
            >
              Sign Up Free
            </button>
            <button
              onClick={() => navigate('/explore')}
              className="px-10 py-4 bg-transparent text-white rounded-lg text-lg font-semibold hover:bg-white/10 transition-all shadow-xl border-2 border-white transform hover:-translate-y-1"
            >
              Explore as Guest
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Uttarakhand Tourism</h3>
              <p className="text-sm">Your AI-powered companion for exploring the Land of Gods</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-orange-400 transition">About Us</a></li>
                <li><a href="#" className="hover:text-orange-400 transition">Destinations</a></li>
                <li><a href="#" className="hover:text-orange-400 transition">Travel Guide</a></li>
                <li><a href="#" className="hover:text-orange-400 transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-orange-400 transition">Emergency Contacts</a></li>
                <li><a href="#" className="hover:text-orange-400 transition">Weather Updates</a></li>
                <li><a href="#" className="hover:text-orange-400 transition">Travel Tips</a></li>
                <li><a href="#" className="hover:text-orange-400 transition">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <p className="text-sm mb-2">Follow us for updates</p>
              <div className="flex gap-3 text-2xl">
                <span className="cursor-pointer hover:text-orange-400 transition">📘</span>
                <span className="cursor-pointer hover:text-orange-400 transition">📷</span>
                <span className="cursor-pointer hover:text-orange-400 transition">🐦</span>
                <span className="cursor-pointer hover:text-orange-400 transition">📺</span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>© 2024 Uttarakhand Tourism AI. All rights reserved. | Made with ❤️ for travelers</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Component: Stats Card
const StatCard: React.FC<{ number: string; label: string; icon: string }> = ({ number, label, icon }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
    <div className="text-4xl mb-2">{icon}</div>
    <div className="text-3xl font-bold text-gray-800 mb-1">{number}</div>
    <div className="text-sm text-gray-600 font-medium">{label}</div>
  </div>
);

// Component: Category Card
const CategoryCard: React.FC<{ icon: string; title: string; description: string; color: string }> = 
  ({ icon, title, description, color }) => (
  <div className="group cursor-pointer">
    <div className={`bg-gradient-to-br ${color} rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 h-full`}>
      <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/90 text-sm">{description}</p>
    </div>
  </div>
);

// Component: Feature Card
const FeatureCard: React.FC<{ icon: string; title: string; description: string; gradient: string }> = 
  ({ icon, title, description, gradient }) => (
  <div className={`p-6 bg-gradient-to-br ${gradient} rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-200`}>
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

// Component: Destination Card
const DestinationCard: React.FC<{ 
  name: string; 
  subtitle: string;
  image: string; 
  tag: string;
  color: string;
}> = ({ name, subtitle, image, tag, color }) => (
  <div className="relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
    <div className={`h-64 bg-gradient-to-br ${color} flex items-center justify-center text-7xl relative`}>
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all"></div>
      <span className="relative z-10 transform group-hover:scale-110 transition-transform">{image}</span>
    </div>
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-5">
      <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full w-fit mb-3 font-medium">
        {tag}
      </span>
      <h3 className="text-2xl font-bold text-white mb-1">{name}</h3>
      <p className="text-white/80 text-sm">{subtitle}</p>
    </div>
  </div>
);

// Component: Testimonial Card
const TestimonialCard: React.FC<{ quote: string; author: string; location: string }> = 
  ({ quote, author, location }) => (
  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-200">
    <div className="text-4xl text-orange-500 mb-4">"</div>
    <p className="text-gray-700 mb-6 italic leading-relaxed">{quote}</p>
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
        {author.charAt(0)}
      </div>
      <div>
        <div className="font-semibold text-gray-800">{author}</div>
        <div className="text-sm text-gray-500">{location}</div>
      </div>
    </div>
  </div>
);

export default LandingPage;