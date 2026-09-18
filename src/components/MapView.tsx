import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Maximize2,
  Navigation,
  Layers,
  Crosshair,
  Sparkles,
  Zap,
  Clock,
  ArrowRight,
  X,
} from 'lucide-react';
import { Carpark, SearchLocation } from '../types';
import { formatDistance } from '../services/carparkService';

interface MapViewProps {
  carparks: Carpark[];
  centerCoords: { lat: number; lng: number };
  activeLocation?: SearchLocation | null;
  selectedCarpark: Carpark | null;
  onSelectCarpark: (carpark: Carpark | null) => void;
  onNavigate: (carpark: Carpark) => void;
  onViewDetails: (carpark: Carpark) => void;
  onCenterLocationClick: () => void;
}

export const MapView: React.FC<MapViewProps> = ({
  carparks,
  centerCoords,
  activeLocation,
  selectedCarpark,
  onSelectCarpark,
  onNavigate,
  onViewDetails,
  onCenterLocationClick,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const locationMarkerRef = useRef<L.Marker | null>(null);
  const [mapTheme, setMapTheme] = useState<'voyager' | 'dark'>('voyager');

  // Tile layers
  const tileUrls = {
    voyager:
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    dark:
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [centerCoords.lat, centerCoords.lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
      minZoom: 11,
      maxZoom: 19,
    });

    const tileLayer = L.tileLayer(tileUrls[mapTheme], {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Click map background deselects
    map.on('click', () => {
      onSelectCarpark(null);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when theme changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    L.tileLayer(tileUrls[mapTheme], {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);
  }, [mapTheme]);

  // Handle center coordinate changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([centerCoords.lat, centerCoords.lng], 15, {
      duration: 1.2,
    });
  }, [centerCoords.lat, centerCoords.lng]);

  // Update Location Marker (Current Search or GPS center)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (locationMarkerRef.current) {
      map.removeLayer(locationMarkerRef.current);
      locationMarkerRef.current = null;
    }

    const locIcon = L.divIcon({
      className: 'user-location-pin',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping"></div>
          <div class="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-lg relative z-10"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const marker = L.marker([centerCoords.lat, centerCoords.lng], {
      icon: locIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    locationMarkerRef.current = marker;
  }, [centerCoords.lat, centerCoords.lng]);

  // Render Carpark Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    carparks.forEach((cp) => {
      const isSelected = selectedCarpark?.id === cp.id;

      // Determine marker color by lot count
      let bgStyle = 'background-color: #10b981; border-color: #065f46; color: #ffffff;'; // Green
      if (cp.availableLots <= 5) {
        bgStyle = 'background-color: #f43f5e; border-color: #881337; color: #ffffff;'; // Red
      } else if (cp.availableLots <= 25) {
        bgStyle = 'background-color: #f59e0b; border-color: #78350f; color: #ffffff;'; // Amber
      }

      const ringClass = isSelected ? 'ring-4 ring-emerald-400 scale-125 z-50' : 'hover:scale-110';

      const customIcon = L.divIcon({
        className: 'custom-carpark-pin',
        html: `
          <div class="relative cursor-pointer transition-all duration-150 ${ringClass}" style="transform-origin: bottom center;">
            <div style="${bgStyle}" class="flex items-center gap-1 px-2 py-1 rounded-full shadow-lg border-2 text-[11px] font-bold tracking-tight whitespace-nowrap">
              <span>${cp.availableLots}</span>
              <span class="text-[9px] font-normal opacity-90">lots</span>
            </div>
            <div class="w-2 h-2 rotate-45 mx-auto -mt-1 shadow-sm" style="${bgStyle}"></div>
          </div>
        `,
        iconSize: [52, 28],
        iconAnchor: [26, 28],
      });

      const marker = L.marker([cp.lat, cp.lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 500 : 100,
      });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectCarpark(cp);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([cp.lat, cp.lng], 16, { duration: 0.8 });
        }
      });

      markersLayer.addLayer(marker);
    });
  }, [carparks, selectedCarpark]);

  // Center on Singapore bounds
  const fitSingaporeBounds = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyToBounds(
      [
        [1.23, 103.6],
        [1.47, 104.04],
      ],
      { duration: 1 }
    );
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-neutral-900">
      {/* The Leaflet Container */}
      <div
        ref={mapContainerRef}
        id="leaflet-map-canvas"
        className="w-full h-full z-10"
      />

      {/* Floating Map Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          id="recenter-current-loc-btn"
          type="button"
          onClick={onCenterLocationClick}
          title="Center on search location"
          className="p-2.5 rounded-xl bg-neutral-800/90 hover:bg-neutral-800 text-neutral-200 hover:text-emerald-400 border border-neutral-700/80 shadow-lg backdrop-blur-md transition-colors"
        >
          <Crosshair size={18} />
        </button>

        <button
          id="fit-singapore-btn"
          type="button"
          onClick={fitSingaporeBounds}
          title="Fit entire Singapore"
          className="p-2.5 rounded-xl bg-neutral-800/90 hover:bg-neutral-800 text-neutral-200 hover:text-emerald-400 border border-neutral-700/80 shadow-lg backdrop-blur-md transition-colors"
        >
          <Maximize2 size={18} />
        </button>

        <button
          id="toggle-map-theme-btn"
          type="button"
          onClick={() => setMapTheme(mapTheme === 'voyager' ? 'dark' : 'voyager')}
          title={`Switch to ${mapTheme === 'voyager' ? 'Dark' : 'Standard'} map`}
          className="p-2.5 rounded-xl bg-neutral-800/90 hover:bg-neutral-800 text-neutral-200 hover:text-emerald-400 border border-neutral-700/80 shadow-lg backdrop-blur-md transition-colors"
        >
          <Layers size={18} />
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute top-4 left-4 z-20 hidden sm:flex items-center gap-2 bg-neutral-900/85 backdrop-blur-md border border-neutral-800 rounded-lg px-2.5 py-1.5 text-[11px] text-neutral-300 shadow-md">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span>&gt;25 lots</span>
        </div>
        <span className="text-neutral-600">•</span>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          <span>6-25 lots</span>
        </div>
        <span className="text-neutral-600">•</span>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
          <span>&le;5 lots</span>
        </div>
      </div>

      {/* Selected Carpark Bottom Drawer Card (Floats over map) */}
      {selectedCarpark && (
        <div
          id="map-selected-carpark-drawer"
          className="absolute bottom-20 left-3 right-3 max-w-md mx-auto z-30 bg-neutral-900/95 backdrop-blur-md border border-neutral-700/90 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {selectedCarpark.agency}
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  {formatDistance(selectedCarpark.distanceKm)} away
                </span>
              </div>
              <h4 className="text-base font-semibold text-neutral-100 truncate">
                {selectedCarpark.name}
              </h4>
              <p className="text-xs text-neutral-400 truncate mt-0.5">
                {selectedCarpark.address}
              </p>
            </div>

            <button
              id="close-selected-carpark-drawer"
              type="button"
              onClick={() => onSelectCarpark(null)}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between bg-neutral-800/80 rounded-xl p-3 border border-neutral-700/50">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400">
                {selectedCarpark.availableLots}
              </span>
              <span className="text-xs text-neutral-400">
                lots available ({selectedCarpark.totalLots} total)
              </span>
            </div>

            <div className="text-right">
              <div className="text-xs font-semibold text-neutral-200">
                {selectedCarpark.rates.weekdayRate.split(',')[0]}
              </div>
              <div className="text-[10px] text-neutral-400">
                Grace: {selectedCarpark.rates.gracePeriodMins} mins
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              id="drawer-navigate-btn"
              type="button"
              onClick={() => onNavigate(selectedCarpark)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950"
            >
              <Navigation size={14} />
              <span>Drive Here</span>
            </button>

            <button
              id="drawer-details-btn"
              type="button"
              onClick={() => onViewDetails(selectedCarpark)}
              className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold py-2.5 px-3 rounded-xl border border-neutral-700 transition-colors flex items-center justify-center gap-1"
            >
              <span>Full Rates & Info</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
