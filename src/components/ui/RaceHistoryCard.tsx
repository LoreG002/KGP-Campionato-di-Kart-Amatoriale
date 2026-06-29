import type { Event, RaceResult, Driver } from '../../types';
import { Calendar, MapPin, Ruler, Flag, Zap, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface RaceHistoryCardProps {
  event: Event;
  results: RaceResult[];
  drivers: Driver[];
}

function RaceResultList({
  results,
  drivers,
  raceNum,
}: {
  results: RaceResult[];
  drivers: Driver[];
  raceNum: 1 | 2;
}) {
  const raceResults = results
    .filter((r) => r.raceNumber === raceNum)
    .sort((a, b) => {
      if (a.position === 0) return 1;
      if (b.position === 0) return -1;
      return a.position - b.position;
    });

  if (raceResults.length === 0) {
    return (
      <p className="text-zinc-600 font-rajdhani text-sm text-center py-4">
        Nessun risultato registrato
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {raceResults.map((r) => {
        const driver = drivers.find((d) => d.id === r.driverId);
        if (!driver) return null;
        return (
          <div
            key={r.id}
            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-zinc-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span
                className={`font-rajdhani font-bold text-lg w-7 text-right flex-shrink-0 ${
                  r.position === 1
                    ? 'text-yellow-400'
                    : r.position === 2
                    ? 'text-zinc-300'
                    : r.position === 3
                    ? 'text-amber-600'
                    : r.position === 0
                    ? 'text-red-500'
                    : 'text-zinc-500'
                }`}
              >
                {r.position === 0 ? 'DNF' : `${r.position}°`}
              </span>
              <img
                src={driver.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name)}&background=27272a&color=a3e635&size=64&font-size=0.4&bold=true`}
                alt={driver.name}
                className="w-7 h-7 rounded-full object-cover border border-zinc-700"
              />
              <span className="font-rajdhani font-semibold text-sm text-zinc-200">{driver.name}</span>
              <span className="text-zinc-600 text-[10px] font-rajdhani">#{driver.kartNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              {r.hasPole && (
                <span title="Pole Position" className="text-lime-400">
                  <Flag className="w-3.5 h-3.5" />
                </span>
              )}
              {r.hasBestLap && (
                <span title="Giro Veloce" className="text-purple-400">
                  <Zap className="w-3.5 h-3.5" />
                </span>
              )}
              {r.hasConsistency && (
                <span title="Costanza" className="text-cyan-400">
                  <Target className="w-3.5 h-3.5" />
                </span>
              )}
              {r.penaltyPoints > 0 && (
                <span className="text-red-500 font-rajdhani text-xs">-{r.penaltyPoints}pt</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function RaceHistoryCard({ event, results, drivers }: RaceHistoryCardProps) {
  const [expanded, setExpanded] = useState(false);

  const eventResults = results.filter((r) => r.eventId === event.id);
  const hasResults = eventResults.length > 0;

  return (
    <div className="racing-card rounded-xl overflow-hidden">
      {/* Card header */}
      <button
        className="w-full text-left px-5 py-4"
        onClick={() => setExpanded(!expanded)}
        id={`race-card-${event.id}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-zinc-500 text-[10px] font-rajdhani tracking-[0.25em] uppercase mb-1">
              {new Date(event.date).toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
            <h3 className="font-rajdhani font-bold text-xl text-white">{event.name}</h3>
            <div className="flex flex-wrap gap-3 mt-2">
              <span className="flex items-center gap-1 text-zinc-500 text-xs font-rajdhani">
                <MapPin className="w-3 h-3 text-lime-400" /> {event.circuitName}
              </span>
              <span className="flex items-center gap-1 text-zinc-500 text-xs font-rajdhani">
                <Ruler className="w-3 h-3 text-lime-400" /> {event.trackLength.toLocaleString('it-IT')} m
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!hasResults && (
              <span className="text-xs font-rajdhani text-zinc-600 tracking-wider uppercase">
                In attesa
              </span>
            )}
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-zinc-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-zinc-500" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded results */}
      {expanded && (
        <div className="border-t border-zinc-800 px-5 pb-5 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Gara 1 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-lime-400" />
                <p className="font-rajdhani font-bold text-sm text-white tracking-widest uppercase">
                  Gara 1
                </p>
              </div>
              <RaceResultList results={eventResults} drivers={drivers} raceNum={1} />
            </div>
            {/* Gara 2 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <p className="font-rajdhani font-bold text-sm text-white tracking-widest uppercase">
                  Gara 2
                </p>
              </div>
              <RaceResultList results={eventResults} drivers={drivers} raceNum={2} />
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-zinc-800">
            <span className="flex items-center gap-1 text-[10px] font-rajdhani text-zinc-600">
              <Flag className="w-3 h-3 text-lime-400" /> Pole (+2pt)
            </span>
            <span className="flex items-center gap-1 text-[10px] font-rajdhani text-zinc-600">
              <Zap className="w-3 h-3 text-purple-400" /> Giro Veloce (+2pt)
            </span>
            <span className="flex items-center gap-1 text-[10px] font-rajdhani text-zinc-600">
              <Target className="w-3 h-3 text-cyan-400" /> Costanza (+2pt)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
