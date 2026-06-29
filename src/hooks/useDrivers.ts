import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { Driver } from '../types';

export function useDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'drivers'), orderBy('name'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setDrivers(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Driver)));
        setLoading(false);
      },
      (err) => {
        console.error('useDrivers error:', err);
        setError(err.message);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  return { drivers, loading, error };
}
