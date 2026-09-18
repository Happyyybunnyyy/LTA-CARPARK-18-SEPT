import React from 'react';
import { Map, ListFilter, Bookmark, BookOpen } from 'lucide-react';
import { NavTab } from '../types';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  favoritesCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  favoritesCount,
}) => {
  const tabs = [
    {
      id: 'map' as NavTab,
      label: 'Map View',
      icon: Map,
      badge: null,
    },
    {
      id: 'list' as NavTab,
      label: 'Nearby Lots',
      icon: ListFilter,
      badge: null,
    },
    {
      id: 'favorites' as NavTab,
      label: 'Saved',
      icon: Bookmark,
      badge: favoritesCount > 0 ? favoritesCount : null,
    },
    {
      id: 'guide' as NavTab,
      label: 'SG Rates',
      icon: BookOpen,
      badge: null,
    },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      aria-label="Main Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800 safe-area-pb"
    >
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors duration-150 ${
                isActive
                  ? 'text-emerald-400 font-medium'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div className="relative">
                <Icon
                  size={20}
                  className={`transition-transform duration-150 ${
                    isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'
                  }`}
                />
                {tab.badge !== null && (
                  <span
                    id="favorites-count-badge"
                    className="absolute -top-1 -right-2 bg-emerald-500 text-neutral-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center leading-none shadow"
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight whitespace-nowrap">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-6 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
