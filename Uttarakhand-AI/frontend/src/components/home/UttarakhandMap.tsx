/**
 * Interactive Uttarakhand Map Component
 * Shows different regions with hover effects
 */
import React, { useState } from 'react';
import { MapPin, Mountain, Trees, Waves } from 'lucide-react';

interface Region {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  attractions: string[];
}

const regions: Region[] = [
  {
    name: 'Garhwal',
    description: 'Home to Char Dham and pristine valleys',
    icon: <Mountain className="w-6 h-6" />,
    color: 'from-emerald-600 to-teal-600',
    attractions: ['Badrinath', 'Kedarnath', 'Gangotri', 'Yamunotri']
  },
  {
    name: 'Kumaon',
    description: 'Hill stations and serene lakes',
    icon: <Trees className="w-6 h-6" />,
    color: 'from-sky-600 to-blue-600',
    attractions: ['Nainital', 'Ranikhet', 'Almora', 'Munsiyari']
  },
  {
    name: 'Terai',
    description: 'Wildlife sanctuaries and forests',
    icon: <Waves className="w-6 h-6" />,
    color: 'from-green-600 to-emerald-600',
    attractions: ['Jim Corbett', 'Rajaji National Park']
  }
];

const UttarakhandMap: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  return (
    <div className="relative bg-gradient-to-br from-stone-50 to-stone-100 rounded-3xl p-8 shadow-2xl border-2 border-stone-200">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-stone-800 mb-3">
          Explore Uttarakhand
        </h2>
        <p className="text-lg text-stone-600">
          Discover the diverse regions of Devbhoomi
        </p>
      </div>

      {/* Map Illustration */}
      <div className="relative h-96 bg-gradient-to-br from-emerald-100 to-sky-100 rounded-2xl overflow-hidden mb-6 border-2 border-stone-300">
        {/* Decorative Mountains */}
        <div className="absolute inset-0 opacity-20">
          <svg viewBox="0 0 1200 400" className="w-full h-full">
            <path d="M0,400 L200,100 L400,250 L600,50 L800,200 L1000,80 L1200,300 L1200,400 Z" 
                  fill="currentColor" className="text-stone-700"/>
          </svg>
        </div>

        {/* Region Markers */}
        <div className="absolute top-1/4 left-1/3 transform -translate-x-1/2">
          <button
            onClick={() => setSelectedRegion(regions[0])}
            className={`group relative p-4 rounded-full bg-gradient-to-br ${regions[0].color} shadow-xl hover:scale-110 transition-all duration-300`}
          >
            {regions[0].icon}
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-bold text-stone-800 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              {regions[0].name}
            </span>
          </button>
        </div>

        <div className="absolute top-1/3 right-1/4">
          <button
            onClick={() => setSelectedRegion(regions[1])}
            className={`group relative p-4 rounded-full bg-gradient-to-br ${regions[1].color} shadow-xl hover:scale-110 transition-all duration-300`}
          >
            {regions[1].icon}
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-bold text-stone-800 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              {regions[1].name}
            </span>
          </button>
        </div>

        <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2">
          <button
            onClick={() => setSelectedRegion(regions[2])}
            className={`group relative p-4 rounded-full bg-gradient-to-br ${regions[2].color} shadow-xl hover:scale-110 transition-all duration-300`}
          >
            {regions[2].icon}
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-bold text-stone-800 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              {regions[2].name}
            </span>
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 text-stone-700 opacity-30">
          <MapPin className="w-8 h-8" />
        </div>
      </div>

      {/* Region Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {regions.map((region, index) => (
          <button
            key={index}
            onClick={() => setSelectedRegion(region)}
            className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
              selectedRegion?.name === region.name
                ? `bg-gradient-to-br ${region.color} text-white border-transparent shadow-xl scale-105`
                : 'bg-white border-stone-300 hover:border-stone-400 hover:shadow-lg'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${
                selectedRegion?.name === region.name
                  ? 'bg-white/20'
                  : `bg-gradient-to-br ${region.color} text-white`
              }`}>
                {region.icon}
              </div>
              <h3 className="text-xl font-bold">{region.name}</h3>
            </div>
            <p className={`text-sm mb-3 ${
              selectedRegion?.name === region.name ? 'text-white/90' : 'text-stone-600'
            }`}>
              {region.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {region.attractions.slice(0, 2).map((attraction, i) => (
                <span
                  key={i}
                  className={`text-xs px-2 py-1 rounded-full ${
                    selectedRegion?.name === region.name
                      ? 'bg-white/20'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  {attraction}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Selected Region Details */}
      {selectedRegion && (
        <div className="mt-6 p-6 bg-gradient-to-br from-white to-stone-50 rounded-xl border-2 border-stone-200 animate-fadeIn">
          <h4 className="text-2xl font-bold text-stone-800 mb-3">
            Popular Attractions in {selectedRegion.name}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {selectedRegion.attractions.map((attraction, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-3 bg-white rounded-lg border border-stone-200 hover:shadow-md transition-shadow"
              >
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-stone-700">{attraction}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UttarakhandMap;
