import React from 'react';
import {
  Bookmark,
  Navigation,
  Zap,
  ShieldAlert,
  ArrowUpRight,
  Warehouse,
  Clock,
  Car,
} from 'lucide-react';
import { Carpark } from '../types';
import { formatDistance } from '../services/carparkService';

interface CarparkCardProps {
  carpark: Carpark;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSelect: (carpark: Carpark) => void;
  onNavigate: (carpark: Carpark) => void;
  isSelected?: boolean;
}

export const CarparkCard: React.FC<CarparkCardProps> = ({
  carpark,
  isFavorite,
  onToggleFavorite,
  onSelect,
  onNavigate,
  isSelected = false,
}) => {
  const percentage = Math.min(
    100,
    Math.round((carpark.availableLots / Math.max(1, carpark.totalLots)) * 100)
  );

  // Status color styles
  const getStatusBadge = () => {
    if (carpark.availableLots <= 5) {
      return {
        bg: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
        dot: 'bg-rose-400',
        label: carpark.availableLots === 0 ? 'Full' : 'Filling Fast',
        barBg: 'bg-rose-500',
      };
    }
    if (carpark.availableLots <= 25) {
      return {
        bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
        dot: 'bg-amber-400',
        label: 'Limited Lots',
        barBg: 'bg-amber-500',
      };
    }
    return {
      bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
      dot: 'bg-emerald-400',
      label: 'Plentiful',
      barBg: 'bg-emerald-500',
    };
  };

  const status = getStatusBadge();

  // Agency color
  const getAgencyColor = () => {
    switch (carpark.agency) {
      case 'HDB':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'URA':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'Commercial':
        return 'bg-orange-500/15 text-orange-300 border-orange-500/30';
      default:
        return 'bg-neutral-700/50 text-neutral-300 border-neutral-600';
    }
  };

  return (
    <div
      id={`carpark-card-${carpark.id}`}
      onClick={() => onSelect(carpark)}
      className={`relative rounded-xl border p-4 transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'bg-neutral-800/95 border-emerald-500 shadow-lg ring-1 ring-emerald-500/30'
          : 'bg-neutral-800/60 hover:bg-neutral-800/90 border-neutral-700/70 hover:border-neutral-600'
      }`}
    >
      {/* Header Row: Title, Agency, Bookmark */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={`text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded border uppercase whitespace-nowrap ${getAgencyColor()}`}
            >
              {carpark.agency}
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              {formatDistance(carpark.distanceKm)} away
            </span>
            <span className="text-[11px] text-neutral-500">
              • {carpark.district}
            </span>
          </div>
          <h3 className="text-base font-semibold text-neutral-100 truncate hover:text-emerald-300 transition-colors">
            {carpark.name}
          </h3>
          <p className="text-xs text-neutral-400 truncate mt-0.5">
            {carpark.address}
          </p>
        </div>

        {/* Favorite Bookmark Button */}
        <button
          id={`favorite-btn-${carpark.id}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(carpark.id);
          }}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`p-2 rounded-lg border transition-colors shrink-0 ${
            isFavorite
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
              : 'bg-neutral-700/30 border-neutral-700 text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Bookmark size={16} className={isFavorite ? 'fill-amber-400' : ''} />
        </button>
      </div>

      {/* Real-time Availability Showcase */}
      <div className="mt-3.5 bg-neutral-900/60 rounded-lg p-3 border border-neutral-800 flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-neutral-50">
            {carpark.availableLots}
          </span>
          <span className="text-xs text-neutral-400">
            / {carpark.totalLots} lots free
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${status.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />
            <span>{status.label}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-2 w-full bg-neutral-700/40 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${status.barBg}`}
          style={{ width: `${Math.max(4, percentage)}%` }}
        />
      </div>

      {/* Rates & Highlights Row */}
      <div className="mt-3 pt-3 border-t border-neutral-700/40 flex items-center justify-between text-xs text-neutral-300">
        <div className="flex items-center gap-1.5 truncate max-w-[65%]">
          <Clock size={13} className="text-emerald-400 shrink-0" />
          <span className="truncate text-neutral-300 font-medium">
            {carpark.rates.weekdayRate}
          </span>
        </div>

        {/* Feature Pills */}
        <div className="flex items-center gap-2 shrink-0">
          {carpark.hasEVCharging && (
            <span
              title={`EV Charging Available (${carpark.evChargersCount || 2} chargers)`}
              className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium"
            >
              <Zap size={11} />
              <span>EV</span>
            </span>
          )}

          {carpark.isCovered && (
            <span
              title="Covered multi-storey or basement carpark"
              className="text-neutral-400 hover:text-neutral-200"
            >
              <Warehouse size={13} />
            </span>
          )}

          {carpark.heightLimitM && (
            <span className="text-[11px] font-mono text-neutral-400">
              {carpark.heightLimitM}m
            </span>
          )}
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="mt-3 flex items-center gap-2">
        <button
          id={`nav-btn-${carpark.id}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(carpark);
          }}
          className="flex-1 bg-neutral-700/60 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-medium py-2 px-3 rounded-lg border border-neutral-600/60 transition-colors flex items-center justify-center gap-1.5"
        >
          <Navigation size={13} className="text-emerald-400" />
          <span>Directions</span>
        </button>

        <button
          id={`details-btn-${carpark.id}`}
          type="button"
          onClick={() => onSelect(carpark)}
          className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-emerald-200 text-xs font-medium py-2 px-3 rounded-lg border border-emerald-500/40 transition-colors flex items-center justify-center gap-1"
        >
          <span>View Rates & Info</span>
          <ArrowUpRight size={13} />
        </button>
      </div>
    </div>
  );
};
