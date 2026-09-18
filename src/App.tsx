import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Car,
  Wifi,
  Radio,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  Carpark,
  FilterOptions,
  NavTab,
  SearchLocation,
  SortOption,
} from './types';
import {
  INITIAL_CARPARKS,
  POPULAR_SG_LOCATIONS,
} from './data/singaporeCarparks';
import {
  getCarparksNear,
  filterAndSortCarparks,
  getSavedFavoriteIds,
  toggleFavoriteId,
  simulateRealtimeUpdate,
} from './services/carparkService';
import { BottomNav } from './components/BottomNav';
import { SearchBar } from './components/SearchBar';
import { MapView } from './components/MapView';
import { CarparkList } from './components/CarparkList';
import { CarparkDetailsModal } from './components/CarparkDetailsModal';
import { FavoritesView } from './components/FavoritesView';
import { RatesGuideView } from './components/RatesGuideView';
import { FilterModal } from './components/FilterModal';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('map');

  // Center Coordinates (Default to Orchard Road, Singapore)
  const [centerCoords, setCenterCoords] = useState<{ lat: number; lng: number }>({
    lat: 1.3048,
    lng: 103.8318,
  });
  const [activeLocationName, setActiveLocationName] = useState<string>('Orchard Road');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Carparks Data
  const [allCarparks, setAllCarparks] = useState<Carpark[]>(() =>
    getCarparksNear(1.3048, 103.8318, INITIAL_CARPARKS)
  );

  // Selected Carpark for Map Drawer and Details Modal
  const [selectedCarpark, setSelectedCarpark] = useState<Carpark | null>(null);
  const [detailsModalCarpark, setDetailsModalCarpark] = useState<Carpark | null>(null);

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => getSavedFavoriteIds());

  // Filter State
  const [filters, setFilters] = useState<FilterOptions>({
    vehicleType: 'C',
    agency: 'ALL',
    onlyWithLots: false,
    minLots: 0,
    evChargingOnly: false,
    coveredOnly: false,
    sortBy: 'distance',
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Status flags
  const [isLocating, setIsLocating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  // Recalculate distances whenever centerCoords change
  useEffect(() => {
    setAllCarparks((prev) =>
      getCarparksNear(centerCoords.lat, centerCoords.lng, prev)
    );
  }, [centerCoords.lat, centerCoords.lng]);

  // Compute filtered & sorted carparks
  const filteredCarparks = useMemo(() => {
    return filterAndSortCarparks(allCarparks, filters);
  }, [allCarparks, filters]);

  // Count active filters (non-defaults)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.agency !== 'ALL') count++;
    if (filters.onlyWithLots) count++;
    if (filters.minLots > 0) count++;
    if (filters.evChargingOnly) count++;
    if (filters.coveredOnly) count++;
    if (filters.sortBy !== 'distance') count++;
    return count;
  }, [filters]);

  // Handle Location Selection from SearchBar autocomplete or chips
  const handleSelectLocation = (loc: SearchLocation) => {
    setCenterCoords({ lat: loc.lat, lng: loc.lng });
    setActiveLocationName(loc.name);
    setSearchQuery(loc.name);
    setSelectedCarpark(null);
    showToast(`Centered on ${loc.name}`);
  };

  // Handle Free Search Query Change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // If user types and it exactly or strongly matches one of our popular locations, auto-center
    const exactMatch = POPULAR_SG_LOCATIONS.find(
      (l) => l.name.toLowerCase() === query.trim().toLowerCase()
    );
    if (exactMatch) {
      setCenterCoords({ lat: exactMatch.lat, lng: exactMatch.lng });
      setActiveLocationName(exactMatch.name);
    }
  };

  // Handle Current Location / GPS Click
  const handleCurrentLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          // Check if coordinates are reasonably in Singapore area (Lat 1.15 to 1.48, Lng 103.55 to 104.1)
          if (lat >= 1.15 && lat <= 1.48 && lng >= 103.55 && lng <= 104.1) {
            setCenterCoords({ lat, lng });
            setActiveLocationName('Your Singapore Location');
            setSearchQuery('Current Location');
            showToast('Found your Singapore GPS location');
          } else {
            // Outside SG or dev container sandbox: default to central SG Downtown
            setCenterCoords({ lat: 1.2839, lng: 103.8515 });
            setActiveLocationName('Raffles Place (Central CBD)');
            setSearchQuery('Raffles Place');
            showToast('Centered on Central Singapore (CBD)');
          }
          setIsLocating(false);
        },
        () => {
          // Geolocation denied or unavailable: graceful fallback to Singapore Central
          setCenterCoords({ lat: 1.2839, lng: 103.8515 });
          setActiveLocationName('Raffles Place (Central CBD)');
          setSearchQuery('Raffles Place');
          showToast('Location permission unavailable. Centered on Central CBD.');
          setIsLocating(false);
        },
        { timeout: 6000 }
      );
    } else {
      setCenterCoords({ lat: 1.2839, lng: 103.8515 });
      setActiveLocationName('Raffles Place (Central CBD)');
      showToast('Centered on Central Singapore');
      setIsLocating(false);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = (id: string) => {
    const updated = toggleFavoriteId(id);
    setFavorites(updated);
    const isNowFav = updated.includes(id);
    showToast(isNowFav ? 'Carpark saved to favorites' : 'Removed from favorites');
  };

  // Turn-by-Turn Navigation Trigger
  const handleNavigate = (carpark: Carpark) => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${carpark.lat},${carpark.lng}&travelmode=driving`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    showToast(`Launching navigation to ${carpark.name}`);
  };

  // Refresh / Simulate Live Lot Vacancy Fluctuation
  const handleRefreshLive = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setAllCarparks((prev) => simulateRealtimeUpdate(prev));
      setIsRefreshing(false);
      showToast('Real-time carpark availability updated');
    }, 600);
  };

  // Periodic subtle live sync simulation (every 40s)
  useEffect(() => {
    const interval = setInterval(() => {
      setAllCarparks((prev) => simulateRealtimeUpdate(prev));
    }, 40000);
    return () => clearInterval(interval);
  }, []);

  // Reset Filters
  const handleResetFilters = () => {
    setFilters({
      vehicleType: 'C',
      agency: 'ALL',
      onlyWithLots: false,
      minLots: 0,
      evChargingOnly: false,
      coveredOnly: false,
      sortBy: 'distance',
    });
    showToast('Filters reset to default');
  };

  return (
    <div className="flex flex-col h-screen w-full bg-neutral-900 text-neutral-100 overflow-hidden font-sans">
      {/* Top Application Bar */}
      <header
        id="app-header"
        className="shrink-0 z-30 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 px-4 py-2.5"
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between mb-2">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-sm">
              <Car size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold tracking-tight text-neutral-100">
                  SG Carpark Finder
                </h1>
                <span className="text-[10px] bg-red-600/80 text-white font-bold px-1.5 py-0.2 rounded leading-none">
                  SG
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-tight">
                Real-Time Lots Availability
              </p>
            </div>
          </div>

          {/* Real-time Status Indicator */}
          <div className="flex items-center gap-2">
            <button
              id="live-sync-indicator-btn"
              type="button"
              onClick={handleRefreshLive}
              title="Click to manually refresh lot counts"
              className="flex items-center gap-1.5 bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/80 rounded-full px-2.5 py-1 text-[11px] text-emerald-400 font-medium transition-colors"
            >
              <Radio size={12} className={isRefreshing ? 'animate-spin' : 'animate-pulse'} />
              <span>Live Sync</span>
            </button>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="max-w-2xl mx-auto">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onSelectLocation={handleSelectLocation}
            onCurrentLocationClick={handleCurrentLocation}
            isLocating={isLocating}
            onOpenFilter={() => setIsFilterModalOpen(true)}
            activeFilterCount={activeFilterCount}
          />
        </div>
      </header>

      {/* Main Content Area based on Bottom Nav Tab */}
      <main id="main-content-viewport" className="flex-1 relative overflow-y-auto">
        {activeTab === 'map' && (
          <MapView
            carparks={filteredCarparks}
            centerCoords={centerCoords}
            selectedCarpark={selectedCarpark}
            onSelectCarpark={setSelectedCarpark}
            onNavigate={handleNavigate}
            onViewDetails={(cp) => setDetailsModalCarpark(cp)}
            onCenterLocationClick={() => {
              setCenterCoords({ ...centerCoords });
              showToast(`Centered on ${activeLocationName}`);
            }}
          />
        )}

        {activeTab === 'list' && (
          <CarparkList
            carparks={filteredCarparks}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectCarpark={(cp) => setDetailsModalCarpark(cp)}
            onNavigate={handleNavigate}
            onRefreshLive={handleRefreshLive}
            isRefreshing={isRefreshing}
            filters={filters}
            onSortChange={(sort: SortOption) =>
              setFilters((prev) => ({ ...prev, sortBy: sort }))
            }
            onOpenFilter={() => setIsFilterModalOpen(true)}
            onResetFilters={handleResetFilters}
            selectedCarparkId={selectedCarpark?.id}
            activeLocationName={activeLocationName}
          />
        )}

        {activeTab === 'favorites' && (
          <FavoritesView
            carparks={allCarparks}
            favoriteIds={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectCarpark={(cp) => setDetailsModalCarpark(cp)}
            onNavigate={handleNavigate}
            onExploreClick={() => setActiveTab('map')}
          />
        )}

        {activeTab === 'guide' && <RatesGuideView />}
      </main>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div
          id="global-toast"
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-neutral-800/95 text-neutral-100 border border-emerald-500/50 text-xs font-medium py-2 px-4 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150 flex items-center gap-2"
        >
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Carpark Full Details Modal */}
      <CarparkDetailsModal
        carpark={detailsModalCarpark}
        onClose={() => setDetailsModalCarpark(null)}
        isFavorite={
          detailsModalCarpark ? favorites.includes(detailsModalCarpark.id) : false
        }
        onToggleFavorite={handleToggleFavorite}
        onNavigate={handleNavigate}
      />

      {/* Filters Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={(newFilters) => {
          setFilters(newFilters);
          showToast('Search filters applied');
        }}
        onResetFilters={handleResetFilters}
      />

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSelectedCarpark(null);
        }}
        favoritesCount={favorites.length}
      />
    </div>
  );
}
