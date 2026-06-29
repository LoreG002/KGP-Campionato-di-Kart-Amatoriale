import { useMemo } from 'react';
import { calculateStandings } from '../lib/scoring';
import type { Driver, Event, RaceResult, StandingsEntry } from '../types';

export function useStandings(
  drivers: Driver[],
  events: Event[],
  results: RaceResult[]
): StandingsEntry[] {
  return useMemo(
    () => calculateStandings(drivers, events, results),
    [drivers, events, results]
  );
}
