import React from 'react';
import { X, Check, Filter } from 'lucide-react';
import { FilterOptions, AgencyType, VehicleType, SortOption } from '../types';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onApplyFilters: (newFilters: FilterOptions) => void;
  onResetFilters: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}) => {
  const [localFilters, setLocalFilters] = React.useState<FilterOptions>(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isOpen]);

  if (!isOpen) return null;

  const agencyOptions: ('ALL' | AgencyType)[] = ['ALL', 'HDB', 'URA', 'Commercial'];

  const handleSave = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    onResetFilters();
    onClose();
  };

  return (
    <div
      id="filter-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="filter-modal-dialog"
        className="w-full max-w-md bg-neutral-900 border border-neutral-700/80 rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto p-5 shadow-2xl animate-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-emerald-400" />
            <h3 className="text-base font-bold text-neutral-100">
              Filter Parking Lots
            </h3>
          </div>
          <button
            id="close-filters-btn"
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200"
          >
            <X size={18} />
          </button>
        </div>

        <div className="py-4 space-y-5">
          {/* Agency Filter */}
          <div>
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2">
              Managing Agency
            </label>
            <div className="grid grid-cols-4 gap-2">
              {agencyOptions.map((agency) => {
                const isSelected = localFilters.agency === agency;
                return (
                  <button
                    key={agency}
                    id={`agency-filter-${agency.toLowerCase()}`}
                    type="button"
                    onClick={() =>
                      setLocalFilters((prev) => ({ ...prev, agency }))
                    }
                    className={`text-xs py-2 px-1 rounded-xl font-medium border transition-colors text-center ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-750'
                    }`}
                  >
                    {agency}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2">
              Sort Order
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'distance' as SortOption, label: 'Nearest Distance' },
                { id: 'availability' as SortOption, label: 'Most Lots Free' },
                { id: 'price' as SortOption, label: 'Lowest Parking Rate' },
                { id: 'name' as SortOption, label: 'Name (A to Z)' },
              ].map((sort) => {
                const isSelected = localFilters.sortBy === sort.id;
                return (
                  <button
                    key={sort.id}
                    id={`sort-option-${sort.id}`}
                    type="button"
                    onClick={() =>
                      setLocalFilters((prev) => ({ ...prev, sortBy: sort.id }))
                    }
                    className={`p-2.5 rounded-xl border text-left font-medium transition-colors ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-750'
                    }`}
                  >
                    {sort.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Availability threshold */}
          <div>
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2">
              Minimum Available Lots
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[0, 10, 25, 50].map((count) => {
                const isSelected = localFilters.minLots === count;
                return (
                  <button
                    key={count}
                    id={`min-lots-filter-${count}`}
                    type="button"
                    onClick={() =>
                      setLocalFilters((prev) => ({ ...prev, minLots: count }))
                    }
                    className={`text-xs py-2 rounded-xl font-medium border transition-colors ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-750'
                    }`}
                  >
                    {count === 0 ? 'Any' : `${count}+ lots`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="space-y-3 pt-1">
            <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/60 cursor-pointer">
              <span className="text-xs font-medium text-neutral-200">
                Only show carparks with vacant lots
              </span>
              <input
                id="only-with-lots-checkbox"
                type="checkbox"
                checked={localFilters.onlyWithLots}
                onChange={(e) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    onlyWithLots: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/60 cursor-pointer">
              <span className="text-xs font-medium text-neutral-200">
                Electric Vehicle (EV) Charging available
              </span>
              <input
                id="ev-charging-checkbox"
                type="checkbox"
                checked={localFilters.evChargingOnly}
                onChange={(e) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    evChargingOnly: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/60 cursor-pointer">
              <span className="text-xs font-medium text-neutral-200">
                Covered / Multi-storey (MSCP) only
              </span>
              <input
                id="covered-parking-checkbox"
                type="checkbox"
                checked={localFilters.coveredOnly}
                onChange={(e) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    coveredOnly: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-neutral-800 flex items-center gap-2">
          <button
            id="reset-filter-modal-btn"
            type="button"
            onClick={handleReset}
            className="flex-1 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-xs font-semibold transition-colors"
          >
            Reset All
          </button>
          <button
            id="apply-filter-modal-btn"
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 text-xs font-bold transition-colors shadow-md shadow-emerald-950"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
