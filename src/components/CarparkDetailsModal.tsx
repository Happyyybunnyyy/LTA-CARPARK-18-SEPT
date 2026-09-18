import React from 'react';
import {
  X,
  Bookmark,
  Navigation,
  ExternalLink,
  Zap,
  Warehouse,
  Clock,
  Car,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Code2,
} from 'lucide-react';
import { Carpark } from '../types';
import { formatDistance } from '../services/carparkService';

interface CarparkDetailsModalProps {
  carpark: Carpark | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onNavigate: (carpark: Carpark) => void;
}

export const CarparkDetailsModal: React.FC<CarparkDetailsModalProps> = ({
  carpark,
  onClose,
  isFavorite,
  onToggleFavorite,
  onNavigate,
}) => {
  if (!carpark) return null;

  const occupancyPercent = Math.min(
    100,
    Math.round((carpark.availableLots / Math.max(1, carpark.totalLots)) * 100)
  );

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${carpark.lat},${carpark.lng}&travelmode=driving`;
  const wazeUrl = `https://waze.com/ul?ll=${carpark.lat},${carpark.lng}&navigate=yes`;
  const appleMapsUrl = `https://maps.apple.com/?daddr=${carpark.lat},${carpark.lng}&dirflg=d`;

  return (
    <div
      id="carpark-details-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="carpark-details-sheet"
        className="w-full max-w-lg bg-neutral-900 border border-neutral-700/80 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-6 animate-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {carpark.agency}
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                {formatDistance(carpark.distanceKm)} away
              </span>
              <span className="text-xs text-neutral-400">
                • {carpark.district}
              </span>
            </div>
            <h2 className="text-xl font-bold text-neutral-100 leading-tight">
              {carpark.name}
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              {carpark.address}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id="details-favorite-toggle-btn"
              type="button"
              onClick={() => onToggleFavorite(carpark.id)}
              className={`p-2 rounded-xl border transition-colors ${
                isFavorite
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-neutral-200'
              }`}
              aria-label={isFavorite ? 'Remove bookmark' : 'Bookmark carpark'}
            >
              <Bookmark size={18} className={isFavorite ? 'fill-amber-400' : ''} />
            </button>
            <button
              id="details-close-btn"
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-neutral-200"
              aria-label="Close details"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Real-time Vacancy Box */}
        <div className="mt-4 bg-gradient-to-br from-neutral-800 to-neutral-850 rounded-xl p-4 border border-neutral-700/80">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-400 font-medium">
                Live Lot Availability
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black text-emerald-400">
                  {carpark.availableLots}
                </span>
                <span className="text-sm text-neutral-300 font-medium">
                  / {carpark.totalLots} total lots
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {occupancyPercent}% Vacant
              </span>
              <div className="text-[11px] text-neutral-400 mt-1">
                Updated {carpark.lastUpdated}
              </div>
            </div>
          </div>

          {/* Bar */}
          <div className="mt-3 w-full bg-neutral-700/50 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, occupancyPercent)}%` }}
            />
          </div>
        </div>

        {/* Parking Rates Table */}
        <div className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 mb-2.5">
            <Clock size={14} className="text-emerald-400" />
            Parking Charges & Timings
          </h3>

          <div className="bg-neutral-800/60 border border-neutral-700/70 rounded-xl divide-y divide-neutral-700/60 text-xs">
            <div className="p-3 flex items-start justify-between gap-4">
              <span className="text-neutral-400 font-medium w-28 shrink-0">
                Mondays - Fridays
              </span>
              <span className="text-neutral-100 font-medium text-right flex-1">
                {carpark.rates.weekdayRate}
              </span>
            </div>

            <div className="p-3 flex items-start justify-between gap-4">
              <span className="text-neutral-400 font-medium w-28 shrink-0">
                Saturdays
              </span>
              <span className="text-neutral-100 font-medium text-right flex-1">
                {carpark.rates.saturdayRate}
              </span>
            </div>

            <div className="p-3 flex items-start justify-between gap-4">
              <span className="text-neutral-400 font-medium w-28 shrink-0">
                Sundays & PH
              </span>
              <span className="text-neutral-100 font-medium text-right flex-1">
                {carpark.rates.sundayPHRate}
              </span>
            </div>

            <div className="p-3 flex items-start justify-between gap-4 bg-neutral-800/40">
              <span className="text-neutral-400 font-medium w-28 shrink-0">
                Grace Period
              </span>
              <span className="text-emerald-400 font-semibold text-right flex-1">
                {carpark.rates.gracePeriodMins} minutes complimentary
              </span>
            </div>

            {carpark.rates.nightParkingCapped && (
              <div className="p-3 flex items-start justify-between gap-4">
                <span className="text-neutral-400 font-medium w-28 shrink-0">
                  Night Scheme
                </span>
                <span className="text-neutral-200 text-right flex-1">
                  {carpark.rates.nightParkingCapped}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Carpark Amenities & Restrictions */}
        <div className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2.5">
            Facility Specifications
          </h3>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="bg-neutral-800/50 border border-neutral-700/60 rounded-xl p-3 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                <Zap size={16} />
              </div>
              <div>
                <div className="text-neutral-400 text-[11px]">EV Charging</div>
                <div className="font-semibold text-neutral-200">
                  {carpark.hasEVCharging
                    ? `${carpark.evChargersCount || 4} Points Available`
                    : 'Not Available'}
                </div>
              </div>
            </div>

            <div className="bg-neutral-800/50 border border-neutral-700/60 rounded-xl p-3 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-neutral-700 text-neutral-300 shrink-0">
                <Warehouse size={16} />
              </div>
              <div>
                <div className="text-neutral-400 text-[11px]">Clearance Height</div>
                <div className="font-semibold text-neutral-200">
                  {carpark.heightLimitM ? `${carpark.heightLimitM} metres` : 'No Restriction'}
                </div>
              </div>
            </div>

            <div className="bg-neutral-800/50 border border-neutral-700/60 rounded-xl p-3 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-neutral-700 text-neutral-300 shrink-0">
                <Car size={16} />
              </div>
              <div>
                <div className="text-neutral-400 text-[11px]">Carpark Structure</div>
                <div className="font-semibold text-neutral-200">
                  {carpark.isCovered ? 'Covered / MSCP' : 'Surface Open-Air'}
                </div>
              </div>
            </div>

            <div className="bg-neutral-800/50 border border-neutral-700/60 rounded-xl p-3 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-neutral-700 text-neutral-300 shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div>
                <div className="text-neutral-400 text-[11px]">Gantry Payment</div>
                <div className="font-semibold text-neutral-200">
                  EPS (CEPAS / NETS)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Developer API Connection Note */}
        <div className="mt-5 bg-neutral-800/30 border border-neutral-700/40 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
            <Code2 size={13} className="text-emerald-400" />
            <span>API Target:</span>
            <span className="text-neutral-200 font-semibold">{carpark.id}</span>
            <span className="text-neutral-500">•</span>
            <span>Agency: {carpark.agency}</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Pre-configured schema mapped to Singapore LTA DataMall / data.gov.sg car park availability API.
          </p>
        </div>

        {/* Navigation Action Buttons */}
        <div className="mt-5 pt-4 border-t border-neutral-800 flex flex-col gap-2">
          <button
            id="start-navigation-primary-btn"
            type="button"
            onClick={() => onNavigate(carpark)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950"
          >
            <Navigation size={18} />
            <span>Start Turn-by-Turn Navigation</span>
          </button>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <a
              id="open-google-maps-link"
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-neutral-800 hover:bg-neutral-750 text-neutral-300 hover:text-white py-2.5 px-2 rounded-xl border border-neutral-700 text-center transition-colors truncate"
            >
              Google Maps
            </a>
            <a
              id="open-apple-maps-link"
              href={appleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-neutral-800 hover:bg-neutral-750 text-neutral-300 hover:text-white py-2.5 px-2 rounded-xl border border-neutral-700 text-center transition-colors truncate"
            >
              Apple Maps
            </a>
            <a
              id="open-waze-link"
              href={wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-neutral-800 hover:bg-neutral-750 text-neutral-300 hover:text-white py-2.5 px-2 rounded-xl border border-neutral-700 text-center transition-colors truncate"
            >
              Waze
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
