import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDrivers } from '../../hooks/useDrivers';
import { useEvents } from '../../hooks/useEvents';
import { useResults } from '../../hooks/useResults';
import { EventForm } from './EventForm';
import { RaceResultForm } from './RaceResultForm';
import { DriverForm } from './DriverForm';
import type { Event, Driver, RaceNumber } from '../../types';
import {
  LogOut,
  Plus,
  Calendar,
  Users,
  Flag,
  ChevronRight,
  Edit,
  ClipboardList,
} from 'lucide-react';

type AdminView =
  | 'dashboard'
  | 'new-event'
  | 'edit-event'
  | 'race-results'
  | 'new-driver'
  | 'edit-driver';

export function AdminDashboard() {
  const { user, signOut } = useAuth();
  const { drivers } = useDrivers();
  const { events } = useEvents();
  const { results } = useResults();

  const [view, setView] = useState<AdminView>('dashboard');
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>();
  const [selectedDriver, setSelectedDriver] = useState<Driver | undefined>();
  const [selectedRaceNum, setSelectedRaceNum] = useState<RaceNumber>(1);
  const [activeTab, setActiveTab] = useState<'events' | 'drivers'>('events');

  const upcomingEvents = events.filter((e) => new Date(e.date) >= new Date());
  const pastEvents = events.filter((e) => new Date(e.date) < new Date());

  const handleBack = () => {
    setView('dashboard');
    setSelectedEvent(undefined);
    setSelectedDriver(undefined);
  };

  const navBtnClass = (tab: 'events' | 'drivers') =>
    `px-4 py-2 rounded font-rajdhani font-bold text-sm tracking-widest uppercase transition-all ${
      activeTab === tab
        ? 'bg-lime-400 text-zinc-950'
        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
    }`;

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Admin header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-zinc-900 border-b border-zinc-800 h-14 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-lime-400 rounded flex items-center justify-center">
            <Flag className="w-4 h-4 text-zinc-950" />
          </div>
          <span className="font-rajdhani font-bold text-sm text-white tracking-widest uppercase">
            K-GP <span className="text-lime-400">Admin</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-500 text-xs font-rajdhani hidden sm:block">
            {user?.email}
          </span>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-red-400 transition-colors font-rajdhani text-sm"
            id="admin-signout"
          >
            <LogOut className="w-4 h-4" />
            Esci
          </button>
        </div>
      </div>

      <div className="pt-14 page-container">
        {/* Back button */}
        {view !== 'dashboard' && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-zinc-500 hover:text-white font-rajdhani text-sm transition-colors mb-6"
            id="admin-back"
          >
            ← Torna alla Dashboard
          </button>
        )}

        {/* ── DASHBOARD ── */}
        {view === 'dashboard' && (
          <div>
            <div className="mb-8">
              <h1 className="section-title mb-1">Dashboard <span>Admin</span></h1>
              <p className="text-zinc-500 font-rajdhani">
                Gestisci appuntamenti, risultati e piloti del campionato.
              </p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Piloti', value: drivers.length, icon: Users, color: 'text-lime-400' },
                { label: 'Appuntamenti', value: events.length, icon: Calendar, color: 'text-blue-400' },
                { label: 'Prossimi', value: upcomingEvents.length, icon: Flag, color: 'text-yellow-400' },
                { label: 'Risultati', value: results.length, icon: ClipboardList, color: 'text-purple-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="racing-card rounded-xl p-4">
                  <Icon className={`w-5 h-5 ${color} mb-2`} />
                  <p className={`font-rajdhani font-bold text-3xl ${color}`}>{value}</p>
                  <p className="text-zinc-500 text-xs font-rajdhani tracking-widest uppercase">{label}</p>
                </div>
              ))}
            </div>

            {/* Tab nav */}
            <div className="flex gap-2 mb-6">
              <button className={navBtnClass('events')} onClick={() => setActiveTab('events')}>
                Appuntamenti
              </button>
              <button className={navBtnClass('drivers')} onClick={() => setActiveTab('drivers')}>
                Piloti
              </button>
            </div>

            {/* Events tab */}
            {activeTab === 'events' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-rajdhani font-bold text-lg text-white uppercase tracking-widest">
                    Appuntamenti
                  </h2>
                  <button
                    onClick={() => { setSelectedEvent(undefined); setView('new-event'); }}
                    className="btn-primary flex items-center gap-2 text-sm"
                    id="add-event-btn"
                  >
                    <Plus className="w-4 h-4" /> Nuovo Appuntamento
                  </button>
                </div>

                {events.length === 0 ? (
                  <div className="racing-card rounded-xl p-8 text-center text-zinc-600 font-rajdhani">
                    Nessun appuntamento. Crea il primo!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((event) => {
                      const eventResults = results.filter((r) => r.eventId === event.id);
                      const hasG1 = eventResults.some((r) => r.raceNumber === 1);
                      const hasG2 = eventResults.some((r) => r.raceNumber === 2);

                      return (
                        <div key={event.id} className="racing-card rounded-xl p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-zinc-500 text-[10px] font-rajdhani tracking-widest uppercase mb-0.5">
                                {new Date(event.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </p>
                              <p className="font-rajdhani font-bold text-white">{event.name}</p>
                              <p className="text-zinc-500 text-xs font-rajdhani mt-0.5">{event.circuitName}</p>
                              <div className="flex gap-2 mt-2">
                                <span className={`text-[10px] font-rajdhani px-2 py-0.5 rounded border ${hasG1 ? 'border-lime-400/30 text-lime-400 bg-lime-400/10' : 'border-zinc-700 text-zinc-600'}`}>
                                  G1 {hasG1 ? '✓' : '—'}
                                </span>
                                <span className={`text-[10px] font-rajdhani px-2 py-0.5 rounded border ${hasG2 ? 'border-lime-400/30 text-lime-400 bg-lime-400/10' : 'border-zinc-700 text-zinc-600'}`}>
                                  G2 {hasG2 ? '✓' : '—'}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 flex-shrink-0">
                              <button
                                onClick={() => { setSelectedEvent(event); setSelectedRaceNum(1); setView('race-results'); }}
                                className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1"
                                id={`edit-race1-${event.id}`}
                              >
                                <Flag className="w-3 h-3" /> Gara 1
                              </button>
                              <button
                                onClick={() => { setSelectedEvent(event); setSelectedRaceNum(2); setView('race-results'); }}
                                className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1"
                                id={`edit-race2-${event.id}`}
                              >
                                <Flag className="w-3 h-3" /> Gara 2
                              </button>
                              <button
                                onClick={() => { setSelectedEvent(event); setView('edit-event'); }}
                                className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1"
                                id={`edit-event-${event.id}`}
                              >
                                <Edit className="w-3 h-3" /> Modifica
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Drivers tab */}
            {activeTab === 'drivers' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-rajdhani font-bold text-lg text-white uppercase tracking-widest">
                    Piloti
                  </h2>
                  <button
                    onClick={() => { setSelectedDriver(undefined); setView('new-driver'); }}
                    className="btn-primary flex items-center gap-2 text-sm"
                    id="add-driver-btn"
                  >
                    <Plus className="w-4 h-4" /> Nuovo Pilota
                  </button>
                </div>

                {drivers.length === 0 ? (
                  <div className="racing-card rounded-xl p-8 text-center text-zinc-600 font-rajdhani">
                    Nessun pilota registrato.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {drivers.map((driver) => (
                      <button
                        key={driver.id}
                        onClick={() => { setSelectedDriver(driver); setView('edit-driver'); }}
                        className="racing-card rounded-xl p-4 text-left flex items-center gap-3"
                        id={`edit-driver-${driver.id}`}
                      >
                        <img
                          src={driver.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name)}&background=27272a&color=a3e635&size=96&font-size=0.4&bold=true`}
                          alt={driver.name}
                          className="w-10 h-10 rounded-full object-cover border border-zinc-700 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-rajdhani font-bold text-white text-sm truncate">{driver.name}</p>
                          <p className="text-zinc-500 text-xs font-rajdhani">#{driver.kartNumber}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-600" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── NEW / EDIT EVENT ── */}
        {(view === 'new-event' || view === 'edit-event') && (
          <div className="max-w-2xl">
            <h2 className="section-title mb-6">
              {view === 'new-event' ? 'Nuovo' : 'Modifica'} <span>Appuntamento</span>
            </h2>
            <div className="racing-card rounded-xl p-6">
              <EventForm existing={selectedEvent} onDone={handleBack} />
            </div>
          </div>
        )}

        {/* ── RACE RESULTS ── */}
        {view === 'race-results' && selectedEvent && (
          <div>
            <h2 className="section-title mb-2">
              Risultati <span>Gara {selectedRaceNum}</span>
            </h2>
            <p className="text-zinc-500 font-rajdhani mb-6">{selectedEvent.name}</p>
            <RaceResultForm
              event={selectedEvent}
              drivers={drivers}
              raceNumber={selectedRaceNum}
              existingResults={results.filter((r) => r.eventId === selectedEvent.id)}
              onDone={handleBack}
            />
          </div>
        )}

        {/* ── NEW / EDIT DRIVER ── */}
        {(view === 'new-driver' || view === 'edit-driver') && (
          <div className="max-w-xl">
            <h2 className="section-title mb-6">
              {view === 'new-driver' ? 'Nuovo' : 'Modifica'} <span>Pilota</span>
            </h2>
            <div className="racing-card rounded-xl p-6">
              <DriverForm existing={selectedDriver} onDone={handleBack} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
