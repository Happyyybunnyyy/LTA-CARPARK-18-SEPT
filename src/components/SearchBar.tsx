import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Crosshair, SlidersHorizontal, MapPin, Sparkles } from 'lucide-react';
import { SearchLocation } from '../types';
import { POPULAR_SG_LOCATIONS } from '../data/singaporeCarparks';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectLocation: (location: SearchLocation) => void;
  onCurrentLocationClick: () => void;
  isLocating: boolean;
  onOpenFilter: () => void;
  activeFilterCount: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onSelectLocation,
  onCurrentLocationClick,
  isLocating,
  onOpenFilter,
  activeFilterCount,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter matching suggestions
  const suggestions = POPULAR_SG_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc: SearchLocation) => {
    onSelectLocation(loc);
    setIsFocused(false);
  };

  return (
    <div className="relative w-full z-30" ref={dropdownRef}>
      <div className="flex items-center gap-2">
        {/* Main Search Input Container */}
        <div
          id="search-bar-container"
          className={`flex-1 flex items-center bg-neutral-800/90 border backdrop-blur-md rounded-xl px-3.5 py-2.5 transition-all shadow-lg ${
            isFocused
              ? 'border-emerald-500/80 ring-2 ring-emerald-500/20 bg-neutral-800'
              : 'border-neutral-700/80 hover:border-neutral-600'
          }`}
        >
          <Search size={18} className="text-neutral-400 shrink-0 mr-2.5" />
          <input
            id="carpark-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search Singapore location, mall, or postal code..."
            className="w-full bg-transparent text-sm text-neutral-100 placeholder-neutral-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              id="clear-search-btn"
              type="button"
              onClick={() => {
                onSearchChange('');
                setIsFocused(true);
              }}
              className="p-1 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 rounded-md transition-colors mr-1"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
          <button
            id="gps-locate-btn"
            type="button"
            onClick={onCurrentLocationClick}
            disabled={isLocating}
            title="Locate around current Singapore location"
            className={`p-1.5 rounded-lg transition-colors shrink-0 ${
              isLocating
                ? 'bg-emerald-500/20 text-emerald-400 animate-pulse'
                : 'hover:bg-neutral-700 text-neutral-400 hover:text-emerald-400'
            }`}
            aria-label="Find carparks near me"
          >
            <Crosshair size={17} />
          </button>
        </div>

        {/* Filter Trigger Button */}
        <button
          id="open-filters-btn"
          type="button"
          onClick={onOpenFilter}
          aria-label="Filter carparks"
          className={`relative p-3 rounded-xl border backdrop-blur-md shrink-0 transition-all flex items-center justify-center ${
            activeFilterCount > 0
              ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400'
              : 'bg-neutral-800/90 border-neutral-700/80 hover:border-neutral-600 text-neutral-300'
          }`}
        >
          <SlidersHorizontal size={18} />
          {activeFilterCount > 0 && (
            <span
              id="filter-badge"
              className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-neutral-950 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow"
            >
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Quick Location Chips */}
      <div
        id="quick-location-chips"
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 mt-1"
      >
        {POPULAR_SG_LOCATIONS.slice(0, 6).map((loc) => {
          const isSelected = searchQuery.toLowerCase() === loc.name.toLowerCase();
          return (
            <button
              key={loc.id}
              id={`quick-chip-${loc.id}`}
              type="button"
              onClick={() => handleSelect(loc)}
              className={`shrink-0 text-xs px-2.5 py-1 rounded-lg border transition-colors whitespace-nowrap ${
                isSelected
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-medium'
                  : 'bg-neutral-800/70 border-neutral-700/60 text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100'
              }`}
            >
              {loc.name.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {/* Autocomplete Dropdown */}
      {isFocused && (
        <div
          id="location-autocomplete-dropdown"
          className="absolute left-0 right-0 top-[48px] bg-neutral-800 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto"
        >
          <div className="p-2 border-b border-neutral-700/50 flex items-center justify-between text-xs text-neutral-400 font-medium px-3">
            <span className="flex items-center gap-1">
              <Sparkles size={13} className="text-emerald-400" />
              Singapore Destinations
            </span>
            <span>{suggestions.length} places</span>
          </div>

          {suggestions.length > 0 ? (
            <div className="divide-y divide-neutral-700/30">
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  id={`suggest-${item.id}`}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-neutral-700/60 transition-colors flex items-start gap-2.5 group"
                >
                  <MapPin
                    size={16}
                    className="text-emerald-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-neutral-100 group-hover:text-emerald-300 transition-colors truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-neutral-400 truncate">
                      {item.description} • <span className="text-neutral-500">{item.district}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-neutral-400">
              No matching Singapore locations found for "{searchQuery}". You can also view nearby carparks by browsing the map.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
