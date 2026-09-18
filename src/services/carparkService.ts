import { Carpark, FilterOptions, SearchLocation } from '../types';
import { INITIAL_CARPARKS, POPULAR_SG_LOCATIONS } from '../data/singaporeCarparks';

const FAVORITES_STORAGE_KEY = 'sg_carpark_favorites';

/**
 * Calculates straight-line distance in kilometres using the Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

export function formatDistance(distanceKm?: number): string {
  if (distanceKm === undefined || distanceKm === null) return '--';
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

export function computeOccupancy(
  available: number,
  total: number
): 'high' | 'medium' | 'low' {
  if (total <= 0) return 'low';
  const ratio = available / total;
  if (ratio > 0.25 && available >= 20) return 'high'; // Green: Plenty of lots
  if (available > 5) return 'medium'; // Amber: Filling up
  return 'low'; // Red: Almost full or full
}

/**
 * Get all carparks augmented with distance from a specified coordinate
 */
export function getCarparksNear(
  centerLat: number,
  centerLng: number,
  carparks: Carpark[] = INITIAL_CARPARKS
): Carpark[] {
  return carparks.map((cp) => {
    const dist = calculateDistanceKm(centerLat, centerLng, cp.lat, cp.lng);
    return {
      ...cp,
      distanceKm: dist,
      occupancyStatus: computeOccupancy(cp.availableLots, cp.totalLots),
    };
  });
}

/**
 * Filter and sort carparks
 */
export function filterAndSortCarparks(
  carparks: Carpark[],
  filters: FilterOptions
): Carpark[] {
  let result = carparks.filter((cp) => {
    // Agency filter
    if (filters.agency !== 'ALL' && cp.agency !== filters.agency) {
      return false;
    }
    // Only with lots
    if (filters.onlyWithLots && cp.availableLots <= 0) {
      return false;
    }
    // Minimum available lots
    if (filters.minLots > 0 && cp.availableLots < filters.minLots) {
      return false;
    }
    // EV charging only
    if (filters.evChargingOnly && !cp.hasEVCharging) {
      return false;
    }
    // Covered only
    if (filters.coveredOnly && !cp.isCovered) {
      return false;
    }
    // Max hourly rate
    if (filters.maxHourlyRate && cp.rates.perHourEstimated > filters.maxHourlyRate) {
      return false;
    }
    return true;
  });

  // Sort
  result.sort((a, b) => {
    if (filters.sortBy === 'distance') {
      return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
    }
    if (filters.sortBy === 'availability') {
      return b.availableLots - a.availableLots;
    }
    if (filters.sortBy === 'price') {
      return a.rates.perHourEstimated - b.rates.perHourEstimated;
    }
    if (filters.sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  return result;
}

/**
 * Favorites persistence in localStorage
 */
export function getSavedFavoriteIds(): string[] {
  try {
    const data = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return data ? JSON.parse(data) : ['ION-ORC', 'BUGIS-JNC', 'MBS-01'];
  } catch {
    return ['ION-ORC', 'BUGIS-JNC'];
  }
}

export function saveFavoriteIds(ids: string[]): void {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export function toggleFavoriteId(id: string): string[] {
  const current = getSavedFavoriteIds();
  const exists = current.includes(id);
  const updated = exists ? current.filter((x) => x !== id) : [...current, id];
  saveFavoriteIds(updated);
  return updated;
}

/**
 * Simulate live real-time fluctuations to demonstrate real-time availability updates
 */
export function simulateRealtimeUpdate(carparks: Carpark[]): Carpark[] {
  return carparks.map((cp) => {
    // 35% chance to fluctuate by -3 to +3 lots
    if (Math.random() < 0.35) {
      const delta = Math.floor(Math.random() * 7) - 3;
      const newAvail = Math.max(0, Math.min(cp.totalLots, cp.availableLots + delta));
      return {
        ...cp,
        availableLots: newAvail,
        lastUpdated: 'Just now',
        occupancyStatus: computeOccupancy(newAvail, cp.totalLots),
      };
    }
    return cp;
  });
}

/**
 * ARCHITECTURE READY FOR LIVE API:
 * 
 * When ready to connect to real-time Singapore Gov LTA / Data.gov.sg API:
 * 
 * 1. Data.gov.sg endpoint:
 *    GET https://api.data.gov.sg/v1/transport/car-park-availability
 *    Response format:
 *    {
 *      "items": [
 *        {
 *          "timestamp": "2026-09-17T20:30:00+08:00",
 *          "carpark_data": [
 *            {
 *              "carpark_info": [{ "total_lots": "450", "lot_type": "C", "lots_available": "142" }],
 *              "carpark_number": "ACB",
 *              "update_datetime": "2026-09-17 20:28:14"
 *            }
 *          ]
 *        }
 *      ]
 *    }
 * 
 * 2. LTA DataMall endpoint:
 *    GET https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2
 *    Headers: { AccountKey: process.env.LTA_DATAMALL_KEY }
 *    Response format:
 *    {
 *      "value": [
 *        {
 *          "CarParkID": "1",
 *          "Area": "Marina",
 *          "Development": "Suntec City",
 *          "Location": "1.2935 103.8572",
 *          "AvailableLots": 935,
 *          "LotType": "C",
 *          "Agency": "LTA"
 *        }
 *      ]
 *    }
 */
export async function fetchLiveSingaporeLots(): Promise<{ success: boolean; data?: any }> {
  // Plug your real endpoint here when ready!
  return { success: false, data: null };
}
