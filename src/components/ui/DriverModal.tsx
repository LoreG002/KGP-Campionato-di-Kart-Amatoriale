import { useEffect } from 'react';
import type { StandingsEntry, Event } from '../../types';
import {
  X,
  Trophy,
  Flag,
  Zap,
  Target,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DriverModalProps {
  entry: StandingsEntry;
  events: Event[];
  onClose: () => void;
}

export function DriverModal({ entry, events, onClose }: DriverModalProps) {
  const { driver } = entry;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Chart data
  const chartData = events
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((event, i) => {
      const es = entry.eventScores.find((s) => s.eventId === event.id);
      return {
        name: event.name.split(' ').slice(0, 2).join(' '),
        punti: es?.keptPoints ?? 0,
      };
    });

  const StatBox = ({
    icon: Icon,
    label,
    value,
    color = 'text-white',
  }: {
    icon: React.ElementType;
    label: string;
    value: number | string;
    color?: string;
  }) => (
    <div className="bg-zinc-800/60 rounded-lg p-4 flex flex-col gap-1 border border-zinc-700/50">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-lime-400" />
        <span className="text-zinc-500 text-xs font-rajdhani tracking-widest uppercase">{label}</span>
      </div>
      <span className={`font-rajdhani font-bold text-2xl ${color}`}>{value}</span>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      id="driver-modal-backdrop"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        id="driver-modal-panel"
      >
        {/* Header stripe */}
        <div className="h-1 rounded-t-2xl bg-gradient-to-r from-lime-400 to-lime-400/0" />

        <div className="p-6">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
            id="driver-modal-close"
            aria-label="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Driver identity */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-lime-400/50 flex-shrink-0 glow-lime">
              <img
                src={driver.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name)}&background=18181b&color=a3e635&size=128&font-size=0.4&bold=true`}
                alt={driver.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-zinc-500 text-xs font-rajdhani tracking-[0.3em] uppercase mb-1">
                Scheda Pilota
              </p>
              <h2 className="font-rajdhani font-bold text-3xl text-white leading-tight">
                {driver.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="kart-badge">#{driver.kartNumber}</span>
                {driver.team && (
                  <span className="text-zinc-500 text-xs font-rajdhani">{driver.team}</span>
                )}
              </div>
            </div>
            <div className="ml-auto text-right hidden sm:block">
              <p className="text-zinc-500 text-xs font-rajdhani tracking-widest uppercase">Posizione</p>
              <p className="font-rajdhani font-bold text-5xl text-lime-400 text-glow-lime">
                {entry.rank}°
              </p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatBox icon={Trophy} label="Vittorie" value={entry.wins} color="text-yellow-400" />
            <StatBox icon={Target} label="Podi" value={entry.podiums} color="text-zinc-300" />
            <StatBox icon={Flag} label="Pole" value={entry.poles} color="text-lime-400" />
            <StatBox icon={Zap} label="Giri Veloci" value={entry.fastestLaps} color="text-purple-400" />
          </div>

          {/* Total points hero */}
          <div className="bg-zinc-800/40 rounded-xl p-4 mb-6 border border-zinc-700/50 flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-xs font-rajdhani tracking-widest uppercase mb-1">Punti Totali</p>
              <p className="font-rajdhani font-bold text-4xl text-lime-400">{entry.totalPoints}</p>
            </div>
            {entry.dnfs > 0 && (
              <div className="flex items-center gap-2 text-zinc-500">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <div className="text-right">
                  <p className="text-xs font-rajdhani text-zinc-500 tracking-widest uppercase">Ritiri</p>
                  <p className="font-rajdhani font-bold text-xl text-red-400">{entry.dnfs}</p>
                </div>
              </div>
            )}
          </div>

          {/* Points chart */}
          {chartData.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-lime-400" />
                <p className="font-rajdhani font-bold text-sm text-white tracking-widest uppercase">
                  Andamento Punti
                </p>
              </div>
              <div className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/50">
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'Rajdhani' }}
                      axisLine={{ stroke: '#3f3f46' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'Rajdhani' }}
                      axisLine={false}
                      tickLine={false}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#18181b',
                        border: '1px solid #3f3f46',
                        borderRadius: '8px',
                        fontFamily: 'Rajdhani, sans-serif',
                        fontSize: '13px',
                      }}
                      formatter={(v: unknown) => [`${v} punti`, 'Punti']}
                    />
                    <Line
                      type="monotone"
                      dataKey="punti"
                      stroke="#a3e635"
                      strokeWidth={2.5}
                      dot={{ fill: '#a3e635', r: 3 }}
                      activeDot={{ r: 5, fill: '#bef264' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Per-event breakdown */}
          {entry.eventScores.length > 0 && (
            <div className="mt-6">
              <p className="font-rajdhani font-bold text-sm text-white tracking-widest uppercase mb-3">
                Dettaglio Appuntamenti
              </p>
              <div className="space-y-2">
                {entry.eventScores.map((es) => {
                  const event = events.find((e) => e.id === es.eventId);
                  if (!event) return null;
                  return (
                    <div key={es.eventId} className="flex items-center justify-between bg-zinc-800/40 rounded-lg px-4 py-3 border border-zinc-700/30">
                      <div>
                        <p className="font-rajdhani font-semibold text-sm text-white">{event.name}</p>
                        <div className="flex gap-3 mt-0.5">
                          {es.race1 && (
                            <span className={`text-xs font-rajdhani ${es.discardedRace === 1 ? 'text-zinc-600 line-through' : 'text-zinc-400'}`}>
                              G1: {es.race1.rawPoints}pt {es.discardedRace === 1 ? '(scartata)' : ''}
                            </span>
                          )}
                          {es.race2 && (
                            <span className={`text-xs font-rajdhani ${es.discardedRace === 2 ? 'text-zinc-600 line-through' : 'text-zinc-400'}`}>
                              G2: {es.race2.rawPoints}pt {es.discardedRace === 2 ? '(scartata)' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-rajdhani font-bold text-lime-400 text-lg">
                        {es.keptPoints} <span className="text-xs text-zinc-500">pts</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
