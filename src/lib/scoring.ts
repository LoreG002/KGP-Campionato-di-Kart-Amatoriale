// ============================================================
// KART Championship Manager — Pure Scoring Engine
// ============================================================
// This module contains ONLY pure functions.
// No Firebase, no React, no side effects.
// ============================================================

import type {
  Driver,
  Event,
  RaceResult,
  RaceNumber,
  RaceScore,
  EventScore,
  StandingsEntry,
} from '../types';

// ── Points Table ────────────────────────────────────────────

const POSITION_POINTS: Record<number, number> = {
  1: 20,
  2: 17,
  3: 15,
  4: 13,
  5: 11,
  6: 9,
  7: 7,
  8: 5,
  9: 3,
  10: 1,
};

const PARTICIPATION_BONUS = 5;
const POLE_BONUS = 2;
const BEST_LAP_BONUS = 2;
const CONSISTENCY_BONUS = 2;

// Pilot name exempt from participation bonus (case-insensitive)
const NO_PARTICIPATION_BONUS_DRIVERS = ['Lorenzo Di Antonio'];

// ── Helpers ─────────────────────────────────────────────────

function getPositionPoints(position: number): number {
  if (position <= 0) return 0; // DNF / DNS
  return POSITION_POINTS[position] ?? 0;
}

function isExemptFromParticipation(driverName: string): boolean {
  return NO_PARTICIPATION_BONUS_DRIVERS.some(
    (name) => name.toLowerCase() === driverName.toLowerCase()
  );
}

// ── Per-Race Score Calculation ───────────────────────────────

/**
 * Calculates the raw score for a single race result.
 * Returns null if the driver has no result for this race.
 */
function calcRaceScore(
  result: RaceResult,
  driver: Driver,
  raceNumber: RaceNumber
): RaceScore {
  const positionPoints = getPositionPoints(result.position);

  // Participation bonus: awarded even to last-place finishers,
  // BUT excluded for exempt pilots (Max Verstappen rule).
  const participationBonus =
    result.position > 0 && !isExemptFromParticipation(driver.name)
      ? PARTICIPATION_BONUS
      : 0;

  const poleBonus = result.hasPole ? POLE_BONUS : 0;
  const bestLapBonus = result.hasBestLap ? BEST_LAP_BONUS : 0;
  const consistencyBonus = result.hasConsistency ? CONSISTENCY_BONUS : 0;
  const penalties = result.penaltyPoints > 0 ? result.penaltyPoints : 0;

  const rawPoints = Math.max(
    0,
    positionPoints +
      participationBonus +
      poleBonus +
      bestLapBonus +
      consistencyBonus -
      penalties
  );

  return {
    eventId: result.eventId,
    raceNumber,
    rawPoints,
    position: result.position,
    breakdown: {
      positionPoints,
      participationBonus,
      poleBonus,
      bestLapBonus,
      consistencyBonus,
      penalties,
    },
  };
}

// ── Per-Event Score Calculation ──────────────────────────────

/**
 * For a given driver + event, computes the EventScore applying
 * the "scarto" (discard) rule:
 *
 *   - If both Gara 1 and Gara 2 exist → discard the WORSE result.
 *   - If only one race exists → keep it (nothing to discard).
 *   - If driver did not participate → 0 points.
 */
function calcEventScore(
  driver: Driver,
  eventId: string,
  raceResults: RaceResult[]
): EventScore {
  const r1 = raceResults.find(
    (r) => r.eventId === eventId && r.raceNumber === 1
  );
  const r2 = raceResults.find(
    (r) => r.eventId === eventId && r.raceNumber === 2
  );

  const score1 = r1 ? calcRaceScore(r1, driver, 1) : undefined;
  const score2 = r2 ? calcRaceScore(r2, driver, 2) : undefined;

  // Both races present → apply scarto
  if (score1 !== undefined && score2 !== undefined) {
    const discardedRace: RaceNumber =
      score1.rawPoints <= score2.rawPoints ? 1 : 2;
    const keptPoints =
      discardedRace === 1 ? score2.rawPoints : score1.rawPoints;

    return {
      eventId,
      race1: score1,
      race2: score2,
      discardedRace,
      keptPoints,
    };
  }

  // Only one race present
  if (score1 !== undefined) {
    return {
      eventId,
      race1: score1,
      race2: undefined,
      discardedRace: null,
      keptPoints: score1.rawPoints,
    };
  }

  if (score2 !== undefined) {
    return {
      eventId,
      race1: undefined,
      race2: score2,
      discardedRace: null,
      keptPoints: score2.rawPoints,
    };
  }

  // Driver did not participate in this event
  return {
    eventId,
    race1: undefined,
    race2: undefined,
    discardedRace: null,
    keptPoints: 0,
  };
}

// ── Aggregate Stats ──────────────────────────────────────────

function aggregateStats(
  driver: Driver,
  eventScores: EventScore[],
  allResults: RaceResult[]
): Pick<StandingsEntry, 'wins' | 'podiums' | 'dnfs' | 'poles' | 'fastestLaps' | 'pointsHistory'> {
  let wins = 0;
  let podiums = 0;
  let dnfs = 0;
  let poles = 0;
  let fastestLaps = 0;
  const pointsHistory: number[] = [];

  const driverResults = allResults.filter((r) => r.driverId === driver.id);

  for (const es of eventScores) {
    pointsHistory.push(es.keptPoints);
  }

  for (const r of driverResults) {
    if (r.position === 1) wins++;
    if (r.position >= 1 && r.position <= 3) podiums++;
    if (r.position === 0) dnfs++;
    if (r.hasPole) poles++;
    if (r.hasBestLap) fastestLaps++;
  }

  return { wins, podiums, dnfs, poles, fastestLaps, pointsHistory };
}

// ── Main Export ──────────────────────────────────────────────

/**
 * Main scoring function. Receives raw Firestore data arrays and
 * returns a fully computed, ranked standings array.
 *
 * This function is PURE — no async, no side effects.
 *
 * @param drivers   - All drivers in the championship
 * @param events    - All events (sorted chronologically, oldest first)
 * @param results   - All race results from Firestore
 */
export function calculateStandings(
  drivers: Driver[],
  events: Event[],
  results: RaceResult[]
): StandingsEntry[] {
  // Sort events chronologically
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const entries: Omit<StandingsEntry, 'rank'>[] = drivers.map((driver) => {
    const driverResults = results.filter((r) => r.driverId === driver.id);

    // Compute per-event scores
    const eventScores: EventScore[] = sortedEvents.map((event) =>
      calcEventScore(driver, event.id, driverResults)
    );

    // Total points = sum of kept points across all events
    const totalPoints = eventScores.reduce(
      (sum, es) => sum + es.keptPoints,
      0
    );

    const stats = aggregateStats(driver, eventScores, driverResults);

    return {
      driver,
      totalPoints,
      eventScores,
      ...stats,
    };
  });

  // Sort by total points (descending), then by wins as tiebreaker
  entries.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    return b.wins - a.wins;
  });

  // Assign ranks (ties share the same rank)
  let currentRank = 1;
  const ranked: StandingsEntry[] = entries.map((entry, idx) => {
    if (idx > 0 && entry.totalPoints < entries[idx - 1].totalPoints) {
      currentRank = idx + 1;
    }
    return { ...entry, rank: currentRank };
  });

  return ranked;
}

// ── Convenience Exports ──────────────────────────────────────

/** Get points for a finishing position */
export { getPositionPoints };

/** All position → points mappings */
export { POSITION_POINTS };

/** Check if a driver name is exempt from participation bonus */
export { isExemptFromParticipation };
