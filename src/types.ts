export type VehicleType = 'C' | 'M' | 'H'; // Car, Motorcycle, Heavy Vehicle

export type AgencyType = 'HDB' | 'URA' | 'LTA' | 'Commercial';

export interface CarparkRates {
  weekdayRate: string;
  saturdayRate: string;
  sundayPHRate: string;
  gracePeriodMins: number;
  perHourEstimated: number; // For sorting by price
  nightParkingCapped?: string;
}

export interface CarparkLotBreakdown {
  carLots: { total: number; available: number };
  motorcycleLots?: { total: number; available: number };
  heavyLots?: { total: number; available: number };
}

export interface Carpark {
  id: string; // e.g. "ACB", "ION", "MBS", "BM29"
  name: string;
  address: string;
  district: string;
  agency: AgencyType;
  lat: number;
  lng: number;
  totalLots: number;
  availableLots: number;
  lotType: VehicleType;
  lotsBreakdown?: CarparkLotBreakdown;
  rates: CarparkRates;
  heightLimitM?: number;
  hasEVCharging: boolean;
  evChargersCount?: number;
  isCovered: boolean;
  hasCCTV: boolean;
  distanceKm?: number;
  lastUpdated: string;
  occupancyStatus: 'high' | 'medium' | 'low'; // high availability (>30%), medium (10-30%), low (<10% or 0)
}

export interface SearchLocation {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  district: string;
}

export type SortOption = 'distance' | 'availability' | 'price' | 'name';

export interface FilterOptions {
  vehicleType: VehicleType;
  agency: 'ALL' | AgencyType;
  onlyWithLots: boolean;
  minLots: number;
  evChargingOnly: boolean;
  coveredOnly: boolean;
  sortBy: SortOption;
  maxHourlyRate?: number;
}

export type NavTab = 'map' | 'list' | 'favorites' | 'guide';
