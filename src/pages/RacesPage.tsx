import { useDrivers } from '../hooks/useDrivers';
import { useEvents } from '../hooks/useEvents';
import { useResults } from '../hooks/useResults';
import { RaceHistoryCard } from '../components/ui/RaceHistoryCard';
import { Calendar } from 'lucide-react';

export function RacesPage() {
  const { drivers } = useDrivers();
  const { events } = useEvents();
  const { results } = useResults();

  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const pastEvents = sortedEvents.filter((e) => new Date(e.date) < new Date());
  const upcomingEvents = sortedEvents.filter((e) => new Date(e.date) >= new Date());

  return (
    <div className="page-container">
      <div className="mb-8">
        <div className="hero-stripe mb-3" />
        <h1 className="section-title">
          Storico <span>Gare</span>
        </h1>
        <p className="text-zinc-500 font-rajdhani mt-1">
          Tutti i risultati delle Gare 1 e Gara 2 per ogni appuntamento
        </p>
      </div>

      {events.length === 0 ? (
        <div className="racing-card rounded-xl p-16 text-center">
          <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="font-rajdhani text-zinc-500 text-xl">Nessun appuntamento programmato.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {upcomingEvents.length > 0 && (
            <section>
              <h2 className="font-rajdhani font-bold text-sm text-zinc-500 tracking-[0.2em] uppercase mb-4">
                Prossimi Appuntamenti
              </h2>
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <RaceHistoryCard
                    key={event.id}
                    event={event}
                    results={results}
                    drivers={drivers}
                  />
                ))}
              </div>
            </section>
          )}

          {pastEvents.length > 0 && (
            <section>
              <h2 className="font-rajdhani font-bold text-sm text-zinc-500 tracking-[0.2em] uppercase mb-4">
                Gare Disputate
              </h2>
              <div className="space-y-3">
                {pastEvents.map((event) => (
                  <RaceHistoryCard
                    key={event.id}
                    event={event}
                    results={results}
                    drivers={drivers}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
