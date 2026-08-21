/**
 * Redesigned Destination Showcase
 * Beautiful cards with better layout and interactions
 */
import React, { useState } from 'react';
import { MapPin, Star, Clock, Mountain, ExternalLink, Filter } from 'lucide-react';

interface Destination {
  id: number;
  name: string;
  region: string;
  description: string;
  rating: number;
  bestTime: string;
  altitude: string;
  category: string;
  image: string;
  wikiLink?: string;
}

const destinations: Destination[] = [
  {
    id: 1,
    name: 'Badrinath Temple',
    region: 'Chamoli',
    description: 'One of the Char Dham pilgrimage sites, dedicated to Lord Vishnu',
    rating: 4.9,
    bestTime: 'May - Oct',
    altitude: '3,133m',
    category: 'Spiritual',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80',
    wikiLink: 'https://en.wikipedia.org/wiki/Badrinath_Temple'
  },
  {
    id: 2,
    name: 'Jageshwar Temples',
    region: 'Almora',
    description: 'Ancient temple complex with 124 stone temples in deodar forest',
    rating: 4.7,
    bestTime: 'Year Round',
    altitude: '1,870m',
    category: 'Heritage',
    wikiLink: 'https://en.wikipedia.org/wiki/Jageshwar',
    image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800&q=80'
  },
  {
    id: 3,
    name: 'Chopta',
    region: 'Rudraprayag',
    description: 'Mini Switzerland of India, base for Tungnath trek',
    rating: 4.8,
    bestTime: 'Apr - Nov',
    altitude: '2,680m',
    category: 'Nature',
    wikiLink: 'https://en.wikipedia.org/wiki/Chopta,_Uttarakhand',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80'
  },
  {
    id: 4,
    name: 'Munsiyari',
    region: 'Pithoragarh',
    description: 'Gateway to Johar Valley with Panchachuli peaks view',
    rating: 4.6,
    bestTime: 'Mar - Jun',
    altitude: '2,298m',
    category: 'Adventure',
    wikiLink: 'https://en.wikipedia.org/wiki/Munsiyari',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'
  },
  {
    id: 5,
    name: 'Binsar Wildlife Sanctuary',
    region: 'Almora',
    description: 'Oak and rhododendron forests with 200+ bird species',
    rating: 4.7,
    bestTime: 'Oct - Mar',
    altitude: '2,420m',
    category: 'Wildlife',
    wikiLink: 'https://en.wikipedia.org/wiki/Binsar_Wildlife_Sanctuary',
    image: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&q=80'
  },
  {
    id: 6,
    name: 'Kedarnath',
    region: 'Rudraprayag',
    description: 'Sacred Jyotirlinga temple in the Himalayas',
    rating: 4.9,
    bestTime: 'May - Oct',
    altitude: '3,583m',
    category: 'Spiritual',
    image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&q=80',
    wikiLink: 'https://en.wikipedia.org/wiki/Kedarnath_Temple'
  }
];

const categories = ['All', 'Spiritual', 'Nature', 'Adventure', 'Heritage', 'Wildlife'];

const DestinationShowcaseNew: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const filteredDestinations = selectedCategory === 'All'
    ? destinations
    : destinations.filter(d => d.category === selectedCategory);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-5xl font-bold text-stone-800 mb-4">
          Discover Sacred Destinations
        </h2>
        <p className="text-xl text-stone-600 max-w-3xl mx-auto">
          Explore the divine beauty and spiritual heritage of Uttarakhand's most revered places
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-stone-600">
          <Filter className="w-5 h-5" />
          <span className="font-medium">Filter:</span>
        </div>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2.5 rounded-full font-medium transition-all ${
              selectedCategory === category
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg scale-105'
                : 'bg-white text-stone-700 border-2 border-stone-300 hover:border-emerald-500 hover:text-emerald-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Destination Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDestinations.map((destination) => (
          <div
            key={destination.id}
            onMouseEnter={() => setHoveredCard(destination.id)}
            onMouseLeave={() => setHoveredCard(null)}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          >
            {/* Image */}
            <div className="relative h-64 overflow-hidden">
              <img
                src={destination.image}
                alt={destination.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Category Badge */}
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-bold text-stone-800">
                {destination.category}
              </div>

              {/* Rating */}
              <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span className="text-sm font-bold text-stone-800">{destination.rating}</span>
              </div>

              {/* Title on Image */}
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-2xl font-bold text-white mb-1">
                  {destination.name}
                </h3>
                <div className="flex items-center gap-2 text-white/90">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{destination.region}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-stone-600 mb-4 line-clamp-2">
                {destination.description}
              </p>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="text-xs text-stone-500">Best Time</div>
                    <div className="font-medium text-stone-800">{destination.bestTime}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mountain className="w-4 h-4 text-sky-600" />
                  <div>
                    <div className="text-xs text-stone-500">Altitude</div>
                    <div className="font-medium text-stone-800">{destination.altitude}</div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {destination.wikiLink && (
                <a
                  href={destination.wikiLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
                >
                  <span>Learn More</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Hover Effect Border */}
            <div className={`absolute inset-0 border-4 border-emerald-500 rounded-2xl transition-opacity duration-300 pointer-events-none ${
              hoveredCard === destination.id ? 'opacity-100' : 'opacity-0'
            }`} />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDestinations.length === 0 && (
        <div className="text-center py-20">
          <Mountain className="w-20 h-20 text-stone-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-stone-800 mb-2">
            No destinations found
          </h3>
          <p className="text-stone-600">
            Try selecting a different category
          </p>
        </div>
      )}
    </div>
  );
};

export default DestinationShowcaseNew;
