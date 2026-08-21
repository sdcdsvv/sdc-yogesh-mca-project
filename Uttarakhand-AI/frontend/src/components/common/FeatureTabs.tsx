import React, { useEffect, useRef } from 'react';

export interface Tab {
  id: string;
  icon: string;
  label: string;
  description: string;
  color: string;
}

interface FeatureTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const FeatureTabs: React.FC<FeatureTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  const tabsRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  // Scroll active tab into view on mobile
  useEffect(() => {
    if (activeTabRef.current && tabsRef.current) {
      const container = tabsRef.current;
      const activeElement = activeTabRef.current;
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeElement.getBoundingClientRect();

      if (activeRect.left < containerRect.left || activeRect.right > containerRect.right) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeTab]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        break;
      case 'ArrowRight':
        e.preventDefault();
        newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    onTabChange(tabs[newIndex].id);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 border border-stone-200">
      {/* Mobile: Horizontal Scrollable */}
      <div 
        ref={tabsRef}
        className="flex lg:hidden gap-3 overflow-x-auto pb-2 scrollbar-hide"
        role="tablist"
        aria-label="Feature tabs"
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={isActive ? activeTabRef : null}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              className={`group relative flex flex-col items-center gap-2 px-6 py-4 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 min-w-[140px] flex-shrink-0 ${
                isActive
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                  : 'bg-gradient-to-r from-stone-50 to-slate-50 text-slate-700 hover:from-stone-100 hover:to-slate-100 hover:text-slate-800 shadow-md border border-stone-200'
              }`}
            >
              <span className="text-3xl mb-1" aria-hidden="true">{tab.icon}</span>
              <span className="font-semibold text-sm text-center leading-tight">{tab.label}</span>
              <span className={`text-xs opacity-80 text-center leading-tight ${isActive ? 'text-white' : 'text-gray-500'}`}>
                {tab.description}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full" aria-hidden="true"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Desktop: 4-Column Grid */}
      <div 
        className="hidden lg:grid grid-cols-4 gap-4"
        role="tablist"
        aria-label="Feature tabs"
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              className={`group relative flex flex-col items-center gap-2 px-6 py-5 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 ${
                isActive
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                  : 'bg-gradient-to-r from-stone-50 to-slate-50 text-slate-700 hover:from-stone-100 hover:to-slate-100 hover:text-slate-800 shadow-md border border-stone-200 hover:shadow-lg'
              }`}
            >
              <span className="text-3xl mb-1" aria-hidden="true">{tab.icon}</span>
              <span className="font-semibold text-sm text-center leading-tight">{tab.label}</span>
              <span className={`text-xs opacity-80 text-center leading-tight ${isActive ? 'text-white' : 'text-gray-500'}`}>
                {tab.description}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full" aria-hidden="true"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Hidden scrollbar styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default FeatureTabs;
