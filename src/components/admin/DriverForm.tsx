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
import type { Driver, DriverFormData } from '../../types';
import { Save, Trash2, X, AlertCircle } from 'lucide-react';

interface DriverFormProps {
  existing?: Driver;
  onDone: () => void;
}

export function DriverForm({ existing, onDone }: DriverFormProps) {
  const [form, setForm] = useState<DriverFormData>({
    name: existing?.name ?? '',
    kartNumber: existing?.kartNumber ?? 1,
    photoUrl: existing?.photoUrl ?? '',
    team: existing?.team ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'kartNumber' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!db) throw new Error('Firebase non configurato. Crea il file .env.local.');
      const data = {
        name: form.name.trim(),
        kartNumber: form.kartNumber,
        photoUrl: form.photoUrl.trim(),
        team: form.team?.trim() ?? '',
      };
      if (existing) {
        await updateDoc(doc(db, 'drivers', existing.id), {
          ...data,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'drivers'), {
          ...data,
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
    if (!window.confirm(`Eliminare il pilota "${existing.name}"?`)) return;
    setLoading(true);
    try {
      if (!db) throw new Error('Firebase non configurato.');
      await deleteDoc(doc(db, 'drivers', existing.id));
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

  const previewUrl =
    form.photoUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'P')}&background=27272a&color=a3e635&size=96&font-size=0.4&bold=true`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" id="driver-form">
      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
          <p className="text-red-400 text-sm font-rajdhani">{error}</p>
        </div>
      )}

      {/* Avatar preview */}
      <div className="flex items-center gap-4">
        <img
          src={previewUrl}
          alt="Preview"
          className="w-14 h-14 rounded-full object-cover border-2 border-lime-400/30"
        />
        <p className="text-zinc-500 text-xs font-rajdhani">
          Anteprima avatar. Inserisci un URL per usare una foto personalizzata.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelClass}>Nome Pilota</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Max Verstappen"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Numero Kart</label>
          <input
            name="kartNumber"
            type="number"
            min={1}
            max={99}
            value={form.kartNumber}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Team / Club (opzionale)</label>
          <input
            name="team"
            value={form.team}
            onChange={handleChange}
            placeholder="Racing Team Alfa"
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>URL Foto (opzionale)</label>
          <input
            name="photoUrl"
            value={form.photoUrl}
            onChange={handleChange}
            placeholder="https://..."
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Salvataggio...' : existing ? 'Aggiorna Pilota' : 'Aggiungi Pilota'}
        </button>
        {existing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="btn-danger flex items-center gap-2 px-4"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onDone}
          className="btn-ghost flex items-center gap-2 px-4"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
