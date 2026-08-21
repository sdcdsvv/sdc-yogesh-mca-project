import React from 'react';
import { Mountain, Trees, Church, Footprints, Waves, Sunrise } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  icon: React.ReactNode;
  description: string;
  count: string;
  color: string;
}

const categories: Category[] = [
  {
    id: 1,
    name: 'Mountain Peaks',
    icon: <Mountain className="w-8 h-8" />,
    description: 'Majestic Himalayan summits',
    count: '25+ Peaks',
    color: 'from-slate-600 to-slate-700'
  },
  {
    id: 2,
    name: 'Pine Forests',
    icon: <Trees className="w-8 h-8" />,
    description: 'Dense deodar & oak forests',
    count: '12 Reserves',
    color: 'from-emerald-700 to-teal-800'
  },
  {
    id: 3,
    name: 'Sacred Temples',
    icon: <Church className="w-8 h-8" />,
    description: 'Ancient spiritual sites',
    count: '50+ Temples',
    color: 'from-amber-700 to-orange-800'
  },
  {
    id: 4,
    name: 'Nature Trails',
    icon: <Footprints className="w-8 h-8" />,
    description: 'Scenic trekking routes',
    count: '30+ Trails',
    color: 'from-stone-600 to-stone-700'
  },
  {
    id: 5,
    name: 'Rivers & Lakes',
    icon: <Waves className="w-8 h-8" />,
    description: 'Pristine water bodies',
    count: '15+ Lakes',
    color: 'from-cyan-700 to-blue-800'
  },
  {
    id: 6,
    name: 'Meadows',
    icon: <Sunrise className="w-8 h-8" />,
    description: 'Alpine grasslands',
    count: '8 Bugyals',
    color: 'from-lime-700 to-green-800'
  }
];

const NaturalCategoryCards: React.FC = () => {
  return (
    <div className="py-16 px-8 bg-gradient-to-b from-stone-50 to-slate-50">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Explore Uttarakhand
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover the diverse landscapes and rich heritage of the Land of Gods
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group relative overflow-hidden rounded-2xl bg-white border border-stone-200 hover:border-stone-300 transition-all duration-300 hover:shadow-xl cursor-pointer"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              {/* Content */}
              <div className="relative p-8">
                {/* Icon */}
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${category.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {category.icon}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-slate-900">
                  {category.name}
                </h3>

                {/* Description */}
                <p className="text-slate-600 mb-4">
                  {category.description}
                </p>

                {/* Count Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-100 rounded-full text-sm font-medium text-slate-700">
                  <span>{category.count}</span>
                </div>
              </div>

              {/* Hover Arrow */}
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NaturalCategoryCards;
