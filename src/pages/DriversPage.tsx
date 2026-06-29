import { useState } from 'react';
import { useDrivers } from '../hooks/useDrivers';
import { useEvents } from '../hooks/useEvents';
import { useResults } from '../hooks/useResults';
import { useStandings } from '../hooks/useStandings';
import { DriverModal } from '../components/ui/DriverModal';
import type { StandingsEntry } from '../types';
import { Users } from 'lucide-react';
import { isExemptFromParticipation } from '../lib/scoring';

export function DriversPage() {
  const { drivers } = useDrivers();
  const { events } = useEvents();
  const { results } = useResults();
  const standings = useStandings(drivers, events, results);

  const [modalEntry, setModalEntry] = useState<StandingsEntry | null>(null);

  const getStandingEntry = (driverId: string) =>
    standings.find((s) => s.driver.id === driverId);

  return (
    <div className="page-container">
      <div className="mb-8">
        <div className="hero-stripe mb-3" />
        <h1 className="section-title">
          I <span>Piloti</span>
        </h1>
        <p className="text-zinc-500 font-rajdhani mt-1">
          Tutti i piloti iscritti al campionato. Clicca per la scheda dettaglio.
        </p>
      </div>

      {drivers.length === 0 ? (
        <div className="racing-card rounded-xl p-16 text-center">
          <Users className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="font-rajdhani text-zinc-500 text-xl">Nessun pilota registrato.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map((driver) => {
            const entry = getStandingEntry(driver.id);
            const isVerstappen = isExemptFromParticipation(driver.name);

            return (
              <button
                key={driver.id}
                onClick={() => entry && setModalEntry(entry)}
                className="racing-card rounded-xl p-5 text-left w-full group"
                id={`driver-card-${driver.id}`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <img
                      src={driver.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name)}&background=27272a&color=a3e635&size=128&font-size=0.4&bold=true`}
                      alt={driver.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-zinc-700 group-hover:border-lime-400/60 transition-colors"
                    />
                    {entry && entry.rank <= 3 && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-sm">
                        {entry.rank === 1 ? '🏆' : entry.rank === 2 ? '🥈' : '🥉'}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-rajdhani font-bold text-white text-lg leading-tight">
                      {driver.name}
                    </p>
                    {driver.team && (
                      <p className="text-zinc-500 text-xs font-rajdhani">{driver.team}</p>
                    )}
                    {isVerstappen && (
                      <p className="text-yellow-400 text-[10px] font-rajdhani mt-0.5">
                        ★ Regola speciale
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="kart-badge">#{driver.kartNumber}</span>
                  {entry ? (
                    <div className="text-right">
                      <p className="text-zinc-600 text-[10px] font-rajdhani tracking-widest uppercase">Pos.</p>
                      <p className="font-rajdhani font-bold text-lime-400 text-xl leading-none">{entry.rank}°</p>
                    </div>
                  ) : (
                    <span className="text-zinc-600 text-xs font-rajdhani">Nessuna gara</span>
                  )}
                  {entry && (
                    <div className="text-right">
                      <p className="text-zinc-600 text-[10px] font-rajdhani tracking-widest uppercase">Punti</p>
                      <p className="font-rajdhani font-bold text-white text-xl leading-none">{entry.totalPoints}</p>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {modalEntry && (
        <DriverModal
          entry={modalEntry}
          events={events}
          onClose={() => setModalEntry(null)}
        />
      )}
    </div>
  );
}
