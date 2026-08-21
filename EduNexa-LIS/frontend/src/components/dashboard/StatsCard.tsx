import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  color: 'blue' | 'purple' | 'green' | 'yellow' | 'red';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600'
  };

  const changeClasses = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
        <div className={`p-2 sm:p-2.5 md:p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
        </div>
        {change && (
          <span className={`text-xs sm:text-sm font-medium ${changeClasses[changeType]} hidden sm:inline`}>
            {change}
          </span>
        )}
      </div>
      <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{value}</p>
      {change && (
        <span className={`text-xs font-medium ${changeClasses[changeType]} sm:hidden mt-1 block`}>
          {change}
        </span>
      )}
    </div>
  );
};