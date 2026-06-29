import type { StandingsEntry, Event } from '../../types';
import { Trophy, ChevronDown, ChevronUp, Minus, Zap, Flag, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StandingsTableProps {
  standings: StandingsEntry[];
  events: Event[];
  onDriverClick: (entry: StandingsEntry) => void;
  compact?: boolean;
}

const rankColor = (rank: number) => {
  if (rank === 1) return 'text-yellow-400';
  if (rank === 2) return 'text-zinc-300';
  if (rank === 3) return 'text-amber-600';
  return 'text-zinc-500';
};

const rankBg = (rank: number) => {
  if (rank === 1) return 'bg-yellow-400/10';
  if (rank === 2) return 'bg-zinc-300/5';
  if (rank === 3) return 'bg-amber-600/10';
  return '';
};

export function StandingsTable({
  standings,
  events,
  onDriverClick,
  compact = false,
}: StandingsTableProps) {
  const displayStandings = compact ? standings.slice(0, 8) : standings;

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50">
      <table className="race-table w-full min-w-[600px]">
        <thead>
          <tr className="bg-zinc-900">
            <th className="text-left w-12">#</th>
            <th className="text-left">Pilota</th>
            <th className="text-center">Kart</th>
            {!compact && (
              <>
                <th className="text-center hidden sm:table-cell">
                  <div className="flex items-center justify-center gap-1">
                    <Trophy className="w-3 h-3" /> Vitt.
                  </div>
                </th>
                <th className="text-center hidden sm:table-cell">
                  <div className="flex items-center justify-center gap-1">
                    <Flag className="w-3 h-3" /> Pole
                  </div>
                </th>
                <th className="text-center hidden md:table-cell">
                  <div className="flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3" /> Giro V.
                  </div>
                </th>
                {events.map((e) => (
                  <th key={e.id} className="text-center hidden lg:table-cell text-[10px] max-w-[70px]">
                    {e.name.split(' ').slice(0, 2).join(' ')}
                  </th>
                ))}
              </>
            )}
            <th className="text-right">Punti</th>
          </tr>
        </thead>
        <tbody>
          {displayStandings.map((entry, idx) => {
            const prevRank = idx > 0 ? displayStandings[idx - 1].rank : null;
            const showTrend = prevRank !== null && entry.rank !== prevRank;

            return (
              <tr
                key={entry.driver.id}
                className={`cursor-pointer transition-colors ${rankBg(entry.rank)} hover:bg-white/5`}
                onClick={() => onDriverClick(entry)}
                id={`standings-row-${entry.driver.id}`}
              >
                {/* Rank */}
                <td>
                  <span className={`font-rajdhani font-bold text-lg ${rankColor(entry.rank)}`}>
                    {entry.rank}
                  </span>
                  {entry.rank <= 3 && (
                    <span className="ml-1 text-sm">
                      {entry.rank === 1 ? '🏆' : entry.rank === 2 ? '🥈' : '🥉'}
                    </span>
                  )}
                </td>

                {/* Driver */}
                <td>
                  <div className="flex items-center gap-3">
                    <img
                      src={entry.driver.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.driver.name)}&background=27272a&color=a3e635&size=64&font-size=0.4&bold=true`}
                      alt={entry.driver.name}
                      className="w-8 h-8 rounded-full object-cover border border-zinc-700 flex-shrink-0"
                    />
                    <div>
                      <p className="font-rajdhani font-semibold text-white text-sm leading-tight">
                        {entry.driver.name}
                      </p>
                      {entry.driver.team && (
                        <p className="text-zinc-600 text-[10px] font-rajdhani">{entry.driver.team}</p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Kart number */}
                <td className="text-center">
                  <span className="kart-badge">#{entry.driver.kartNumber}</span>
                </td>

                {!compact && (
                  <>
                    {/* Wins */}
                    <td className="text-center hidden sm:table-cell">
                      <span className="font-rajdhani font-semibold text-zinc-300">{entry.wins}</span>
                    </td>
                    {/* Poles */}
                    <td className="text-center hidden sm:table-cell">
                      <span className="font-rajdhani font-semibold text-zinc-300">{entry.poles}</span>
                    </td>
                    {/* Fastest laps */}
                    <td className="text-center hidden md:table-cell">
                      <span className="font-rajdhani font-semibold text-zinc-300">{entry.fastestLaps}</span>
                    </td>
                    {/* Per-event points */}
                    {events.map((event) => {
                      const es = entry.eventScores.find((s) => s.eventId === event.id);
                      const pts = es?.keptPoints ?? '-';
                      const isDiscarded = es?.discardedRace !== null && es !== undefined;
                      return (
                        <td key={event.id} className="text-center hidden lg:table-cell">
                          <span className={`font-rajdhani text-sm font-semibold ${typeof pts === 'number' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                            {pts}
                            {isDiscarded && (
                              <sup className="text-zinc-600 text-[8px] ml-0.5" title="Scarto applicato">*</sup>
                            )}
                          </span>
                        </td>
                      );
                    })}
                  </>
                )}

                {/* Total points */}
                <td className="text-right">
                  <span className={`font-rajdhani font-bold text-lg ${entry.rank === 1 ? 'text-yellow-400 text-glow-lime' : 'text-white'}`}>
                    {entry.totalPoints}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {compact && standings.length > 8 && (
        <div className="text-center py-3 border-t border-zinc-800">
        <Link
          to="/classifica"
          className="font-rajdhani text-xs tracking-widest text-zinc-500 hover:text-lime-400 uppercase transition-colors"
        >
          Vedi Classifica Completa →
        </Link>
      </div>
      )}
    </div>
  );
}
