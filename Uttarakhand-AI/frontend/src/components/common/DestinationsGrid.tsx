import React from 'react';
import { MapPin, Star, TrendingUp } from 'lucide-react';

interface Destination {
  id: number;
  name: string;
  category: string;
  image: string;
  gradient: string;
  rating: number;
  visitors: string;
  description: string;
}

const destinations: Destination[] = [
  {
    id: 1,
    name: 'Rishikesh',
    category: 'Adventure & Spiritual',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80',
    gradient: 'from-blue-500 to-teal-500',
    rating: 4.8,
    visitors: '2M+',
    description: 'Yoga Capital & Adventure Hub'
  },
  {
    id: 2,
    name: 'Nainital',
    category: 'Hill Station',
    image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&q=80',
    gradient: 'from-cyan-500 to-blue-500',
    rating: 4.7,
    visitors: '1.5M+',
    description: 'Lake District of India'
  },
  {
    id: 3,
    name: 'Jim Corbett',
    category: 'Wildlife',
    image: 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=800&q=80',
    gradient: 'from-green-500 to-emerald-600',
    rating: 4.8,
    visitors: '800K+',
    description: 'Premier Wildlife Sanctuary'
  },
  {
    id: 4,
    name: 'Mussoorie',
    category: 'Hill Station',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80',
    gradient: 'from-purple-500 to-pink-500',
    rating: 4.6,
    visitors: '1.2M+',
    description: 'Queen of Hills'
  },
  {
    id: 5,
    name: 'Haridwar',
    category: 'Spiritual',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80',
    gradient: 'from-amber-500 to-orange-600',
    rating: 4.9,
    visitors: '3M+',
    description: 'Gateway to Gods'
  },
  {
    id: 6,
    name: 'Auli',
    category: 'Adventure',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    gradient: 'from-sky-400 to-blue-600',
    rating: 4.7,
    visitors: '500K+',
    description: 'Skiing Paradise'
  }
];

const DestinationsGrid: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-orange-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-orange-600" />
            Popular Destinations
          </h3>
          <p className="text-gray-600 text-sm mt-1">Explore the most visited places</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold text-sm">
          View All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {destinations.map((destination) => (
          <div
            key={destination.id}
            className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer"
          >
            {/* Image Background */}
            <div className="h-48 relative overflow-hidden">
              <img 
                src={destination.image} 
                alt={destination.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

              {/* Category Badge */}
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold rounded-full shadow-lg">
                  {destination.category}
                </span>
              </div>

              {/* Visitors Badge */}
              <div className="absolute top-3 right-3">
                <div className="flex items-center gap-1 px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold rounded-full shadow-lg">
                  <TrendingUp className="w-3 h-3" />
                  {destination.visitors}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                    {destination.name}
                  </h4>
                  <p className="text-sm text-gray-600">{destination.description}</p>
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-bold text-gray-800">{destination.rating}</span>
                </div>
              </div>
              <button className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-orange-50 to-yellow-50 text-orange-600 rounded-lg hover:from-orange-100 hover:to-yellow-100 transition-all font-semibold text-sm border border-orange-200 group-hover:border-orange-300">
                Explore More →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DestinationsGrid;
