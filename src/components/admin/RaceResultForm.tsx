import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import type {
  Event,
  Driver,
  RaceResult,
  RaceNumber,
  RaceResultFormEntry,
} from '../../types';
import { Save, Trash2, AlertCircle, Info } from 'lucide-react';
import { getPositionPoints, isExemptFromParticipation } from '../../lib/scoring';

interface RaceResultFormProps {
  event: Event;
  drivers: Driver[];
  raceNumber: RaceNumber;
  existingResults?: RaceResult[];
  onDone: () => void;
}

const POSITION_OPTIONS = [
  { value: 0, label: 'DNF / Non classificato' },
  ...Array.from({ length: 15 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}° posto`,
  })),
];

export function RaceResultForm({
  event,
  drivers,
  raceNumber,
  existingResults = [],
  onDone,
}: RaceResultFormProps) {
  const [entries, setEntries] = useState<RaceResultFormEntry[]>(() =>
    drivers.map((d) => {
      const ex = existingResults.find(
        (r) => r.driverId === d.id && r.raceNumber === raceNumber
      );
      return {
        driverId: d.id,
        position: ex?.position ?? 0,
        hasPole: ex?.hasPole ?? false,
        hasBestLap: ex?.hasBestLap ?? false,
        hasConsistency: ex?.hasConsistency ?? false,
        penaltyPoints: ex?.penaltyPoints ?? 0,
      };
    })
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const updateEntry = (
    driverId: string,
    field: keyof RaceResultFormEntry,
    value: number | boolean
  ) => {
    setEntries((prev) =>
      prev.map((e) => (e.driverId === driverId ? { ...e, [field]: value } : e))
    );
    setSuccess(false);
  };

  const calcPreview = (entry: RaceResultFormEntry) => {
    const driver = drivers.find((d) => d.id === entry.driverId);
    if (!driver) return 0;
    const pos = getPositionPoints(entry.position);
    const part = entry.position > 0 && !isExemptFromParticipation(driver.name) ? 5 : 0;
    const pole = entry.hasPole ? 2 : 0;
    const bestLap = entry.hasBestLap ? 2 : 0;
    const consistency = entry.hasConsistency ? 2 : 0;
    return Math.max(0, pos + part + pole + bestLap + consistency - entry.penaltyPoints);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!db) throw new Error('Firebase non configurato. Crea il file .env.local.');
      const firestore = db;
      // Validate: no duplicate positions (except 0)
      const nonZeroPositions = entries
        .map((e) => e.position)
        .filter((p) => p > 0);
      const unique = new Set(nonZeroPositions);
      if (unique.size !== nonZeroPositions.length) {
        throw new Error('Due o più piloti hanno la stessa posizione. Correggi prima di salvare.');
      }

      // Validate: max 1 pole, 1 best lap, 1 consistency per race
      const poles = entries.filter((e) => e.hasPole).length;
      const bestLaps = entries.filter((e) => e.hasBestLap).length;
      const consistencies = entries.filter((e) => e.hasConsistency).length;
      if (poles > 1) throw new Error('La Pole Position può essere assegnata a un solo pilota.');
      if (bestLaps > 1) throw new Error('Il Giro Veloce può essere assegnato a un solo pilota.');
      if (consistencies > 1) throw new Error('La Costanza può essere assegnata a un solo pilota.');

      // Delete existing results for this event+race
      const q = query(
        collection(firestore, 'results'),
        where('eventId', '==', event.id),
        where('raceNumber', '==', raceNumber)
      );
      const snap = await getDocs(q);
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));

      // Write new results (only for drivers with a position set)
      const toWrite = entries.filter((e) => e.position > 0 || existingResults.find((r) => r.driverId === e.driverId));
      await Promise.all(
        toWrite.map((entry) =>
          addDoc(collection(firestore, 'results'), {
            eventId: event.id,
            raceNumber,
            driverId: entry.driverId,
            position: entry.position,
            hasPole: entry.hasPole,
            hasBestLap: entry.hasBestLap,
            hasConsistency: entry.hasConsistency,
            penaltyPoints: entry.penaltyPoints,
            createdAt: serverTimestamp(),
          })
        )
      );

      setSuccess(true);
    } catch (err: any) {
      setError(err.message ?? 'Errore durante il salvataggio');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-white font-rajdhani text-sm focus:outline-none focus:border-lime-400/60 transition-all';

  const checkboxClass =
    'w-4 h-4 rounded border-zinc-600 bg-zinc-800 cursor-pointer accent-lime-400';

  return (
    <form onSubmit={handleSubmit} id={`race-result-form-${raceNumber}`}>
      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-red-400 text-sm font-rajdhani">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-lime-400/10 border border-lime-400/30 rounded-lg p-3 mb-4">
          <p className="text-lime-400 text-sm font-rajdhani">✓ Risultati salvati con successo!</p>
        </div>
      )}

      {/* Info banner for Verstappen rule */}
      <div className="flex items-center gap-2 bg-zinc-800/60 border border-zinc-700 rounded-lg p-3 mb-4">
        <Info className="w-4 h-4 text-zinc-400 flex-shrink-0" />
        <p className="text-zinc-500 text-xs font-rajdhani">
          <strong className="text-zinc-300">Regola Verstappen:</strong> Max Verstappen non riceve il bonus partecipazione (+5pt).
          La colonna "Totale Anteprima" tiene conto di questa regola.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full min-w-[700px] race-table">
          <thead>
            <tr className="bg-zinc-900">
              <th className="text-left">Pilota</th>
              <th className="text-center">Posizione</th>
              <th className="text-center">
                <span title="Pole Position (+2pt)" className="cursor-help">🏁 Pole</span>
              </th>
              <th className="text-center">
                <span title="Giro Veloce (+2pt)" className="cursor-help">⚡ Giro V.</span>
              </th>
              <th className="text-center">
                <span title="Pilota più costante (+2pt)" className="cursor-help">🎯 Costanza</span>
              </th>
              <th className="text-center">Penalità (pt)</th>
              <th className="text-center text-lime-400">Totale</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => {
              const entry = entries.find((e) => e.driverId === driver.id)!;
              const preview = calcPreview(entry);
              const isVerstappen = isExemptFromParticipation(driver.name);

              return (
                <tr key={driver.id} className={isVerstappen ? 'bg-yellow-500/5' : ''}>
                  <td>
                    <div className="flex items-center gap-2">
                      <img
                        src={driver.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name)}&background=27272a&color=a3e635&size=64&font-size=0.4&bold=true`}
                        alt={driver.name}
                        className="w-7 h-7 rounded-full object-cover border border-zinc-700"
                      />
                      <div>
                        <p className="font-rajdhani font-semibold text-sm text-white">{driver.name}</p>
                        {isVerstappen && (
                          <p className="text-yellow-400 text-[10px] font-rajdhani">No bonus partecipazione</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="text-center">
                    <select
                      value={entry.position}
                      onChange={(e) => updateEntry(driver.id, 'position', Number(e.target.value))}
                      className={`${inputClass} w-40`}
                    >
                      {POSITION_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="text-center">
                    <input
                      type="checkbox"
                      checked={entry.hasPole}
                      onChange={(e) => updateEntry(driver.id, 'hasPole', e.target.checked)}
                      className={checkboxClass}
                    />
                  </td>
                  <td className="text-center">
                    <input
                      type="checkbox"
                      checked={entry.hasBestLap}
                      onChange={(e) => updateEntry(driver.id, 'hasBestLap', e.target.checked)}
                      className={checkboxClass}
                    />
                  </td>
                  <td className="text-center">
                    <input
                      type="checkbox"
                      checked={entry.hasConsistency}
                      onChange={(e) => updateEntry(driver.id, 'hasConsistency', e.target.checked)}
                      className={checkboxClass}
                    />
                  </td>
                  <td className="text-center">
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={entry.penaltyPoints}
                      onChange={(e) => updateEntry(driver.id, 'penaltyPoints', Number(e.target.value))}
                      className={`${inputClass} w-20 text-center`}
                    />
                  </td>
                  <td className="text-center">
                    <span className={`font-rajdhani font-bold text-lg ${preview > 0 ? 'text-lime-400' : 'text-zinc-600'}`}>
                      {preview}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Salvataggio...' : `Salva Gara ${raceNumber}`}
        </button>
        <button type="button" onClick={onDone} className="btn-ghost">
          Chiudi
        </button>
      </div>
    </form>
  );
}
