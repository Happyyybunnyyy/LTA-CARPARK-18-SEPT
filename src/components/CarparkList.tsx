import React from 'react';
import {
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  ArrowUpDown,
  Car,
  AlertCircle,
} from 'lucide-react';
import { Carpark, FilterOptions, SortOption } from '../types';
import { CarparkCard } from './CarparkCard';

interface CarparkListProps {
  carparks: Carpark[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectCarpark: (carpark: Carpark) => void;
  onNavigate: (carpark: Carpark) => void;
  onRefreshLive: () => void;
  isRefreshing: boolean;
  filters: FilterOptions;
  onSortChange: (sort: SortOption) => void;
  onOpenFilter: () => void;
  onResetFilters: () => void;
  selectedCarparkId?: string;
  activeLocationName: string;
}

export const CarparkList: React.FC<CarparkListProps> = ({
  carparks,
  favorites,
  onToggleFavorite,
  onSelectCarpark,
  onNavigate,
  onRefreshLive,
  isRefreshing,
  filters,
  onSortChange,
  onOpenFilter,
  onResetFilters,
  selectedCarparkId,
  activeLocationName,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 pb-24 pt-2">
      {/* Subheader: Location label, count & Sort control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 bg-neutral-800/60 border border-neutral-700/60 rounded-xl p-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-neutral-100">
              Nearby Parking Lots
            </h2>
            <span
              id="carparks-count-badge"
              className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium"
            >
              {carparks.length} found
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5 truncate">
            Near <span className="text-neutral-200 font-medium">{activeLocationName}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Simulated Realtime Refresh */}
          <button
            id="sync-live-lots-btn"
            type="button"
            onClick={onRefreshLive}
            disabled={isRefreshing}
            title="Simulate live carpark availability update"
            className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-emerald-300 bg-neutral-700/50 hover:bg-neutral-700 px-2.5 py-1.5 rounded-lg border border-neutral-600 transition-colors"
          >
            <RotateCcw
              size={13}
              className={isRefreshing ? 'animate-spin text-emerald-400' : ''}
            />
            <span className="hidden xs:inline">Sync Lots</span>
          </button>

          {/* Sort Dropdown */}
          <div className="relative flex items-center">
            <label htmlFor="sort-dropdown" className="sr-only">
              Sort by
            </label>
            <div className="flex items-center gap-1 bg-neutral-700/50 border border-neutral-600 rounded-lg px-2 py-1 text-xs text-neutral-300">
              <ArrowUpDown size={12} className="text-neutral-400 shrink-0" />
              <select
                id="sort-dropdown"
                value={filters.sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                aria-label="Sort carparks by"
                className="bg-transparent text-xs text-neutral-200 focus:outline-none pr-1 py-0.5 cursor-pointer"
              >
                <option value="distance" className="bg-neutral-800 text-neutral-100">
                  Nearest First
                </option>
                <option value="availability" className="bg-neutral-800 text-neutral-100">
                  Most Lots Available
                </option>
                <option value="price" className="bg-neutral-800 text-neutral-100">
                  Lowest Price First
                </option>
                <option value="name" className="bg-neutral-800 text-neutral-100">
                  Alphabetical
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Indicators */}
      {(filters.agency !== 'ALL' ||
        filters.evChargingOnly ||
        filters.coveredOnly ||
        filters.onlyWithLots) && (
        <div className="flex items-center gap-1.5 flex-wrap mb-3 text-xs">
          <span className="text-neutral-400">Filters:</span>
          {filters.agency !== 'ALL' && (
            <span className="bg-neutral-700 text-neutral-200 px-2 py-0.5 rounded-md border border-neutral-600">
              Agency: {filters.agency}
            </span>
          )}
          {filters.evChargingOnly && (
            <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30">
              EV Charger
            </span>
          )}
          {filters.coveredOnly && (
            <span className="bg-neutral-700 text-neutral-200 px-2 py-0.5 rounded-md border border-neutral-600">
              Covered
            </span>
          )}
          {filters.onlyWithLots && (
            <span className="bg-neutral-700 text-neutral-200 px-2 py-0.5 rounded-md border border-neutral-600">
              Has Vacancy
            </span>
          )}
          <button
            id="clear-active-filters-btn"
            type="button"
            onClick={onResetFilters}
            className="text-emerald-400 hover:text-emerald-300 underline ml-1"
          >
            Reset
          </button>
        </div>
      )}

      {/* Carpark Cards List */}
      {carparks.length > 0 ? (
        <div id="carpark-cards-grid" className="space-y-3">
          {carparks.map((cp) => (
            <CarparkCard
              key={cp.id}
              carpark={cp}
              isFavorite={favorites.includes(cp.id)}
              onToggleFavorite={onToggleFavorite}
              onSelect={onSelectCarpark}
              onNavigate={onNavigate}
              isSelected={selectedCarparkId === cp.id}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div
          id="no-carparks-found-state"
          className="text-center py-16 px-4 bg-neutral-800/40 border border-neutral-700/60 rounded-2xl"
        >
          <div className="w-14 h-14 mx-auto rounded-full bg-neutral-700/50 flex items-center justify-center text-neutral-400 mb-3">
            <Car size={26} />
          </div>
          <h3 className="text-base font-semibold text-neutral-200">
            No matching carparks found
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">
            Try adjusting your search criteria or resetting filters to view all Singapore parking locations.
          </p>
          <button
            id="reset-all-filters-btn"
            type="button"
            onClick={onResetFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-semibold text-xs transition-colors shadow-lg shadow-emerald-950"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};
