import { useState } from 'react';
import { useDrivers } from '../hooks/useDrivers';
import { useEvents } from '../hooks/useEvents';
import { useResults } from '../hooks/useResults';
import { useStandings } from '../hooks/useStandings';
import { HeroSection } from '../components/ui/HeroSection';
import { TopThreeCards } from '../components/ui/TopThreeCards';
import { StandingsTable } from '../components/ui/StandingsTable';
import { DriverModal } from '../components/ui/DriverModal';
import type { StandingsEntry, Event } from '../types';

export function HomePage() {
  const { drivers, loading: dLoading } = useDrivers();
  const { events, loading: eLoading } = useEvents();
  const { results, loading: rLoading } = useResults();
  const standings = useStandings(drivers, events, results);

  const [modalEntry, setModalEntry] = useState<StandingsEntry | null>(null);

  const isLoading = dLoading || eLoading || rLoading;

  const now = new Date();
  const nextEvent: Event | null =
    events
      .filter((e) => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] ?? null;

  const top3 = standings.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <HeroSection nextEvent={nextEvent} />

      {/* Top 3 Section */}
      <section className="bg-zinc-950 py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="hero-stripe mb-3" />
            <h2 className="section-title">
              Podio <span>Campionato</span>
            </h2>
            <p className="text-zinc-500 font-rajdhani mt-1">
              I tre piloti in testa alla classifica generale
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-lime-400/30 border-t-lime-400 rounded-full animate-spin" />
            </div>
          ) : (
            <TopThreeCards
              top3={top3}
              onDriverClick={(entry) => setModalEntry(entry)}
            />
          )}
        </div>
      </section>

      {/* Standings */}
      <section className="bg-zinc-900/30 py-16 px-4 sm:px-6 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="hero-stripe mb-3" />
              <h2 className="section-title">
                Classifica <span>Generale</span>
              </h2>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-lime-400/30 border-t-lime-400 rounded-full animate-spin" />
            </div>
          ) : standings.length === 0 ? (
            <div className="racing-card rounded-xl p-12 text-center">
              <p className="font-rajdhani text-zinc-500 text-lg">
                Nessun risultato ancora registrato.<br />
                <span className="text-zinc-700 text-sm">Il campionato sta per iniziare!</span>
              </p>
            </div>
          ) : (
            <StandingsTable
              standings={standings}
              events={events}
              onDriverClick={(entry) => setModalEntry(entry)}
              compact
            />
          )}
        </div>
      </section>

      {/* Driver */}
      {modalEntry && (
        <DriverModal
          entry={modalEntry}
          events={events}
          onClose={() => setModalEntry(null)}
        />
      )}
    </>
  );
}
