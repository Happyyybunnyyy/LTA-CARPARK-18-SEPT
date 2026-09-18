import React from 'react';
import {
  BookOpen,
  Info,
  Clock,
  Car,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const RatesGuideView: React.FC = () => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 pb-24 pt-4">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
          <BookOpen size={20} className="text-emerald-400" />
          Singapore Parking Guide & Rates
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Official statutory board guidelines for HDB, URA, and commercial lots
        </p>
      </div>

      <div className="space-y-3.5">
        {/* HDB Standard Rates Card */}
        <div className="bg-neutral-800/60 border border-neutral-700/70 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase">
              HDB & URA
            </span>
            <h3 className="text-sm font-semibold text-neutral-100">
              Electronic Parking System (EPS) Charges
            </h3>
          </div>

          <div className="text-xs text-neutral-300 space-y-2 mt-3">
            <div className="bg-neutral-900/60 p-3 rounded-lg border border-neutral-800 flex justify-between items-center">
              <div>
                <div className="font-semibold text-neutral-200">Outside Central Area</div>
                <div className="text-neutral-400 text-[11px]">Heartlands & suburban estates</div>
              </div>
              <div className="text-right">
                <span className="font-bold text-emerald-400 text-sm">$0.60</span>
                <span className="text-neutral-400 text-[11px]"> / 30 mins</span>
              </div>
            </div>

            <div className="bg-neutral-900/60 p-3 rounded-lg border border-neutral-800 flex justify-between items-center">
              <div>
                <div className="font-semibold text-neutral-200">Central Area (CBD)</div>
                <div className="text-neutral-400 text-[11px]">Bugis, Tanjong Pagar, Outram, Bras Basah</div>
              </div>
              <div className="text-right">
                <span className="font-bold text-emerald-400 text-sm">$1.20</span>
                <span className="text-neutral-400 text-[11px]"> / 30 mins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grace Periods & Perks */}
        <div className="bg-neutral-800/60 border border-neutral-700/70 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-neutral-100">
              Standard Grace Periods
            </h3>
          </div>

          <div className="space-y-2.5 text-xs text-neutral-300">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-neutral-200">15-Minute HDB & URA Grace:</span>{' '}
                Motorists enjoy a complimentary 15-minute grace period across electronic parking car parks for drop-offs and deliveries.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-neutral-200">Shopping Mall Grace:</span>{' '}
                Most commercial shopping malls (CapitaLand, Frasers, Lendlease) provide 10 to 15 minutes grace before charging begins.
              </div>
            </div>
          </div>
        </div>

        {/* Special Schemes: Night Parking & Sunday FPS */}
        <div className="bg-neutral-800/60 border border-neutral-700/70 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={16} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-neutral-100">
              Night Parking & Free Sunday Schemes
            </h3>
          </div>

          <div className="space-y-3 text-xs text-neutral-300">
            <div className="p-3 bg-neutral-900/50 rounded-lg border border-neutral-800">
              <div className="font-semibold text-neutral-200 flex items-center justify-between">
                <span>HDB Night Parking Scheme</span>
                <span className="text-emerald-400 font-bold">$5.00 Cap</span>
              </div>
              <p className="text-neutral-400 text-[11px] mt-1">
                Charges from 10:30pm to 7:00am the following morning are capped at a maximum of $5.00 across non-central HDB car parks.
              </p>
            </div>

            <div className="p-3 bg-neutral-900/50 rounded-lg border border-neutral-800">
              <div className="font-semibold text-neutral-200 flex items-center justify-between">
                <span>Free Parking Scheme (Sundays & PH)</span>
                <span className="text-emerald-400 font-bold">FREE (7:30am - 10:30pm)</span>
              </div>
              <p className="text-neutral-400 text-[11px] mt-1">
                Designated HDB carparks carry the orange Free Parking Scheme signboard, allowing free parking on Sundays and public holidays.
              </p>
            </div>
          </div>
        </div>

        {/* Lot Markings & Demarcations */}
        <div className="bg-neutral-800/60 border border-neutral-700/70 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-neutral-100">
              Singapore Lot Demarcations
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center gap-1.5 font-semibold text-neutral-200">
                <span className="w-2.5 h-2.5 rounded bg-white border border-neutral-400 inline-block" />
                <span>White Lots</span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                Open to all visitors at all times (standard hourly parking rates apply).
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center gap-1.5 font-semibold text-neutral-200">
                <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" />
                <span>Red Lots</span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                Reserved 24/7 strictly for Season Parking Ticket holders. Non-holders risk summonses.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center gap-1.5 font-semibold text-neutral-200">
                <span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block" />
                <span>Red & White (Bi-Colour)</span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                Non-season parking allowed from 7:00am - 7:00pm on Mondays to Saturdays. Reserved for residents at night.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center gap-1.5 font-semibold text-neutral-200">
                <span className="w-2.5 h-2.5 rounded bg-emerald-400 inline-block" />
                <span>Green Lots (EV Charging)</span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                Reserved solely for electric vehicles actively charging. Idle fees may apply once full.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
