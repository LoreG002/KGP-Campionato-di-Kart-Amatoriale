import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { Event } from '../types';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setEvents(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Event)));
        setLoading(false);
      },
      (err) => {
        console.error('useEvents error:', err);
        setError(err.message);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  return { events, loading, error };
}
