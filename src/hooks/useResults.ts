import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { RaceResult } from '../types';

export function useResults() {
  const [results, setResults] = useState<RaceResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, 'results'),
      orderBy('eventId'),
      orderBy('raceNumber')
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setResults(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as RaceResult)));
        setLoading(false);
      },
      (err) => {
        console.error('useResults error:', err);
        setError(err.message);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  return { results, loading, error };
}
