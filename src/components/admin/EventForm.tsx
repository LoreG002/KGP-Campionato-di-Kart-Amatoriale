import { useState } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import type { Event, EventFormData, WeatherCondition } from '../../types';
import { Save, Trash2, X, AlertCircle } from 'lucide-react';

interface EventFormProps {
  existing?: Event;
  onDone: () => void;
}

const WEATHER_OPTIONS: { value: WeatherCondition; label: string }[] = [
  { value: 'sunny', label: '☀️ Sereno' },
  { value: 'cloudy', label: '☁️ Nuvoloso' },
  { value: 'rain', label: '🌧️ Pioggia' },
  { value: 'wet', label: '💧 Pista Bagnata' },
];

export function EventForm({ existing, onDone }: EventFormProps) {
  
  // Helper per formattare la data per l'input datetime-local (YYYY-MM-DDTHH:mm)
  const formatInitialDate = (dateStr?: string) => {
    if (!dateStr) return '';
    if (dateStr.includes('T')) {
      return dateStr.slice(0, 16); // Se ha già l'orario, lo taglia ai minuti (ignora i secondi)
    }
    return `${dateStr}T00:00`; // Se è solo data (YYYY-MM-DD), aggiunge la mezzanotte
  };

  const [form, setForm] = useState<EventFormData>({
    name: existing?.name ?? '',
    date: formatInitialDate(existing?.date),
    circuitName: existing?.circuitName ?? '',
    trackLength: existing?.trackLength ?? 1200,
    weather: existing?.weather ?? 'sunny',
    imageUrl: existing?.imageUrl ?? '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'trackLength' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!db) throw new Error('Firebase non configurato. Crea il file .env.local.');
      if (existing) {
        await updateDoc(doc(db, 'events', existing.id), {
          ...form,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'events'), {
          ...form,
          createdAt: serverTimestamp(),
        });
      }
      onDone();
    } catch (err: any) {
      setError(err.message ?? 'Errore durante il salvataggio');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existing) return;
    if (!window.confirm(`Eliminare l'appuntamento "${existing.name}"? L'operazione non è reversibile.`)) return;
    setLoading(true);
    try {
      if (!db) throw new Error('Firebase non configurato.');
      await deleteDoc(doc(db, 'events', existing.id));
      onDone();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white font-rajdhani text-sm placeholder-zinc-600 focus:outline-none focus:border-lime-400/60 focus:ring-1 focus:ring-lime-400/30 transition-all';
  const labelClass =
    'block text-zinc-400 text-xs font-rajdhani tracking-widest uppercase mb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-4" id="event-form">
      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm font-rajdhani">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelClass}>Nome Appuntamento</label>
          <input name="name" value={form.name} onChange={handleChange} required placeholder="Round 1 — Parma Karting" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Data e Ora</label>
          <input 
            name="date" 
            type="datetime-local" 
            value={form.date} 
            onChange={handleChange} 
            required 
            className={inputClass} 
          />
        </div>
        <div>
          <label className={labelClass}>Meteo</label>
          <select name="weather" value={form.weather} onChange={handleChange} className={inputClass}>
            {WEATHER_OPTIONS.map((w) => (
              <option key={w.value} value={w.value}>{w.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Nome Circuito</label>
          <input name="circuitName" value={form.circuitName} onChange={handleChange} required placeholder="Parma Karting" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Lunghezza Tracciato (m)</label>
          <input name="trackLength" type="number" min={100} max={5000} value={form.trackLength} onChange={handleChange} required className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>URL Immagine Circuito (opzionale)</label>
          <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://..." className={inputClass} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
          <Save className="w-4 h-4" />
          {loading ? 'Salvataggio...' : existing ? 'Aggiorna' : 'Crea Appuntamento'}
        </button>
        {existing && (
          <button type="button" onClick={handleDelete} disabled={loading} className="btn-danger flex items-center gap-2 px-4">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <button type="button" onClick={onDone} className="btn-ghost flex items-center gap-2 px-4">
          <X className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}