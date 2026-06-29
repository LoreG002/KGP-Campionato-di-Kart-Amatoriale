import type { StandingsEntry } from '../../types';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Trophy, Flag } from 'lucide-react';

const RANK_CONFIG = [
  { label: '1°', podiumClass: 'podium-1', color: '#fbbf24', icon: '🏆', badge: 'P1' },
  { label: '2°', podiumClass: 'podium-2', color: '#a1a1aa', icon: '🥈', badge: 'P2' },
  { label: '3°', podiumClass: 'podium-3', color: '#b45309', icon: '🥉', badge: 'P3' },
];

interface TopThreeCardsProps {
  top3: StandingsEntry[];
  onDriverClick: (entry: StandingsEntry) => void;
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const chartData = data.map((pts, i) => ({ i, pts }));
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="pts"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
        <Tooltip
          contentStyle={{
            background: '#18181b',
            border: '1px solid #3f3f46',
            borderRadius: '6px',
            fontSize: '12px',
            fontFamily: 'Rajdhani, sans-serif',
          }}
          formatter={(v: unknown) => [`${v} pt`, 'Punti']}
          labelFormatter={(i: unknown) => `Gara ${Number(i) + 1}`}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function TopThreeCards({ top3, onDriverClick }: TopThreeCardsProps) {
  if (top3.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-600 font-rajdhani text-lg">
        Nessun risultato ancora registrato.
      </div>
    );
  }

  // Order for display: 2nd – 1st – 3rd (podium style)
  const displayOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
      {displayOrder.map((entry) => {
        const rankIndex = entry.rank - 1;
        const cfg = RANK_CONFIG[rankIndex] ?? RANK_CONFIG[2];

        return (
          <button
            key={entry.driver.id}
            id={`top3-driver-${entry.driver.id}`}
            onClick={() => onDriverClick(entry)}
            className={`racing-card rounded-xl p-5 text-left cursor-pointer w-full transition-all duration-300 
              ${cfg.podiumClass} 
              ${entry.rank === 1 ? 'sm:scale-105 sm:-translate-y-2' : ''}
            `}
          >
            {/* Rank badge */}
            <div className="flex items-center justify-between mb-4">
              <span
                className="font-rajdhani font-bold text-2xl"
                style={{ color: cfg.color }}
              >
                {cfg.icon} {cfg.label}
              </span>
              <span className="kart-badge">#{entry.driver.kartNumber}</span>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-full overflow-hidden border-2 flex-shrink-0"
                style={{ borderColor: cfg.color }}
              >
                <img
                  src={entry.driver.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.driver.name)}&background=18181b&color=${cfg.color.replace('#', '')}&size=96&font-size=0.4&bold=true`}
                  alt={entry.driver.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-rajdhani font-bold text-white text-lg leading-tight">
                  {entry.driver.name}
                </p>
                {entry.driver.team && (
                  <p className="text-zinc-500 text-xs font-rajdhani">{entry.driver.team}</p>
                )}
              </div>
            </div>

            {/* Points */}
            <div className="mb-4">
              <p className="text-zinc-500 text-xs font-rajdhani tracking-widest uppercase mb-1">Punti Totali</p>
              <p className="font-rajdhani font-bold text-3xl" style={{ color: cfg.color }}>
                {entry.totalPoints} <span className="text-base font-normal text-zinc-500">pts</span>
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex gap-4 text-xs mb-4">
              <div className="flex items-center gap-1">
                <Trophy className="w-3 h-3 text-yellow-400" />
                <span className="text-zinc-400 font-rajdhani">{entry.wins} vitt.</span>
              </div>
              <div className="flex items-center gap-1">
                <Flag className="w-3 h-3 text-lime-400" />
                <span className="text-zinc-400 font-rajdhani">{entry.poles} pole</span>
              </div>
            </div>

            {/* Sparkline */}
            <div className="h-10">
              <Sparkline data={entry.pointsHistory} color={cfg.color} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
