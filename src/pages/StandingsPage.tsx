import { useState } from 'react';
import { useDrivers } from '../hooks/useDrivers';
import { useEvents } from '../hooks/useEvents';
import { useResults } from '../hooks/useResults';
import { useStandings } from '../hooks/useStandings';
import { StandingsTable } from '../components/ui/StandingsTable';
import { DriverModal } from '../components/ui/DriverModal';
import type { StandingsEntry } from '../types';
import { Info } from 'lucide-react';

export function StandingsPage() {
  const { drivers } = useDrivers();
  const { events } = useEvents();
  const { results } = useResults();
  const standings = useStandings(drivers, events, results);

  const [modalEntry, setModalEntry] = useState<StandingsEntry | null>(null);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <div className="hero-stripe mb-3" />
        <h1 className="section-title">
          Classifica <span>Generale</span>
        </h1>
        <p className="text-zinc-500 font-rajdhani mt-1">
          Punti calcolati con regola dello scarto applicata
        </p>
      </div>

      {/* Scarto rule explanation */}
      <div className="flex items-start gap-3 bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4 mb-8">
        <Info className="w-5 h-5 text-lime-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-rajdhani font-bold text-sm text-white mb-1">Regola dello Scarto</p>
          <p className="text-zinc-400 text-sm font-rajdhani leading-relaxed">
            Per ogni appuntamento, viene scartato il risultato peggiore tra Gara 1 e Gara 2 (inclusi i bonus).
            Il punteggio viene indicato con <strong className="text-zinc-300">*</strong> nella tabella.
            La regola <strong className="text-yellow-400">Verstappen</strong> esclude Lorenzo Di Antonio dal bonus partecipazione (+5pt).
          </p>
        </div>
      </div>

      {standings.length === 0 ? (
        <div className="racing-card rounded-xl p-16 text-center">
          <p className="font-rajdhani text-zinc-500 text-xl">
            Nessun risultato ancora disponibile.
          </p>
        </div>
      ) : (
        <StandingsTable
          standings={standings}
          events={events}
          onDriverClick={(entry) => setModalEntry(entry)}
          compact={false}
        />
      )}

      {/* Legend */}
      {standings.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-4 text-xs font-rajdhani text-zinc-600">
          <span>* = scarto applicato a questa gara</span>
          <span>Clicca su un pilota per aprire la scheda dettaglio</span>
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
