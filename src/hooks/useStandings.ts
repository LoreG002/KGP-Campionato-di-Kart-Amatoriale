import { useMemo } from 'react';
import { calculateStandings } from '../lib/scoring';
import type { Driver, Event, RaceResult, StandingsEntry } from '../types';

/**
 * Memoized hook that recomputes the full championship standings
 * whenever drivers, events, or results change.
 */
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
