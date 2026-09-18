import React from 'react';
import { Bookmark, Navigation, Sparkles, Trash2, ArrowRight } from 'lucide-react';
import { Carpark } from '../types';
import { CarparkCard } from './CarparkCard';

interface FavoritesViewProps {
  carparks: Carpark[];
  favoriteIds: string[];
  onToggleFavorite: (id: string) => void;
  onSelectCarpark: (carpark: Carpark) => void;
  onNavigate: (carpark: Carpark) => void;
  onExploreClick: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  carparks,
  favoriteIds,
  onToggleFavorite,
  onSelectCarpark,
  onNavigate,
  onExploreClick,
}) => {
  const favoriteCarparks = carparks.filter((cp) => favoriteIds.includes(cp.id));

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pb-24 pt-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
            <Bookmark size={20} className="text-amber-400 fill-amber-400" />
            Saved Parking Lots
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Quickly monitor vacancy at your regular carparks
          </p>
        </div>

        <span className="text-xs bg-neutral-800 border border-neutral-700 text-neutral-300 px-2.5 py-1 rounded-full font-mono">
          {favoriteCarparks.length} saved
        </span>
      </div>

      {favoriteCarparks.length > 0 ? (
        <div className="space-y-3">
          {favoriteCarparks.map((cp) => (
            <CarparkCard
              key={cp.id}
              carpark={cp}
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
              onSelect={onSelectCarpark}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : (
        <div
          id="empty-favorites-view"
          className="text-center py-16 px-4 bg-neutral-800/40 border border-neutral-700/60 rounded-2xl"
        >
          <div className="w-14 h-14 mx-auto rounded-full bg-neutral-700/50 flex items-center justify-center text-amber-400 mb-3">
            <Bookmark size={26} />
          </div>
          <h3 className="text-base font-semibold text-neutral-200">
            No saved carparks yet
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">
            Tap the bookmark icon on any carpark card or map pin to quickly monitor your regular parking spots here.
          </p>
          <button
            id="explore-carparks-from-favorites-btn"
            type="button"
            onClick={onExploreClick}
            className="mt-4 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs transition-colors inline-flex items-center gap-1.5 shadow-lg shadow-emerald-950"
          >
            <span>Explore Singapore Carparks</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
