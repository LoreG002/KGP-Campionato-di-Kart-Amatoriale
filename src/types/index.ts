// ============================================================
// KART Championship Manager — TypeScript Data Models
// ============================================================

// --- Firestore Collections ---

export interface Driver {
  id: string;
  name: string;
  kartNumber: number;
  photoUrl: string;
  /** Optional short bio or team name */
  team?: string;
}

export type WeatherCondition = 'sunny' | 'cloudy' | 'rain' | 'wet';

export interface Event {
  id: string;
  name: string;
  /** ISO date string, e.g. "2025-09-14" */
  date: string;
  circuitName: string;
  /** Track length in metres */
  trackLength: number;
  weather: WeatherCondition;
  /** Optional image URL for the circuit */
  imageUrl?: string;
}

export type RaceNumber = 1 | 2;

export interface RaceResult {
  id: string;
  eventId: string;
  /** 1 = Gara 1, 2 = Gara 2 */
  raceNumber: RaceNumber;
  driverId: string;
  /** Finishing position (1-based). 0 = DNF/DNS */
  position: number;
  /** Best qualifying time → pole position bonus */
  hasPole: boolean;
  /** Fastest lap in this race → +2 pts */
  hasBestLap: boolean;
  /** Most consistent lap times → +2 pts */
  hasConsistency: boolean;
  /** Points deducted as penalty (positive number) */
  penaltyPoints: number;
}

// ============================================================
// Computed / Derived Types (used by scoring engine)
// ============================================================

export interface RaceScore {
  eventId: string;
  raceNumber: RaceNumber;
  /** Raw points for this race BEFORE scarto logic */
  rawPoints: number;
  breakdown: {
    positionPoints: number;
    participationBonus: number;
    poleBonus: number;
    bestLapBonus: number;
    consistencyBonus: number;
    penalties: number;
  };
  position: number;
}

export interface EventScore {
  eventId: string;
  race1?: RaceScore;
  race2?: RaceScore;
  /** The race that gets discarded (worst result) */
  discardedRace: RaceNumber | null;
  /** Points kept after applying the discard rule */
  keptPoints: number;
}

export interface StandingsEntry {
  driver: Driver;
  totalPoints: number;
  eventScores: EventScore[];
  /** Rank in the championship (1-based) */
  rank: number;
  // Quick-access stats
  wins: number;
  podiums: number;
  dnfs: number;
  poles: number;
  fastestLaps: number;
  /** Points per event, in chronological order — used for sparkline */
  pointsHistory: number[];
}

// ============================================================
// Admin / Form State Types
// ============================================================

export interface EventFormData {
  name: string;
  date: string;
  circuitName: string;
  trackLength: number;
  weather: WeatherCondition;
  imageUrl?: string;
}

export interface RaceResultFormEntry {
  driverId: string;
  position: number;
  hasPole: boolean;
  hasBestLap: boolean;
  hasConsistency: boolean;
  penaltyPoints: number;
}

export interface DriverFormData {
  name: string;
  kartNumber: number;
  photoUrl: string;
  team?: string;
}

// ============================================================
// Auth
// ============================================================

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}
