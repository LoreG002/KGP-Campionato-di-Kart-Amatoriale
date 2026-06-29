

export interface Driver {
  id: string;
  name: string;
  kartNumber: number;
  photoUrl: string;
  team?: string;
}

export type WeatherCondition = 'sunny' | 'cloudy' | 'rain' | 'wet';

export interface Event {
  id: string;
  name: string;
  date: string;
  circuitName: string;
  trackLength: number;
  weather: WeatherCondition;
  imageUrl?: string;
}

export type RaceNumber = 1 | 2;

export interface RaceResult {
  id: string;
  eventId: string;
  raceNumber: RaceNumber;
  driverId: string;
  position: number;
  hasPole: boolean;
  hasBestLap: boolean;
  hasConsistency: boolean;
  penaltyPoints: number;
}


export interface RaceScore {
  eventId: string;
  raceNumber: RaceNumber;
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
  discardedRace: RaceNumber | null;
  keptPoints: number;
}

export interface StandingsEntry {
  driver: Driver;
  totalPoints: number;
  eventScores: EventScore[];
  rank: number;
  wins: number;
  podiums: number;
  dnfs: number;
  poles: number;
  fastestLaps: number;
  pointsHistory: number[];
}

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


export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}
