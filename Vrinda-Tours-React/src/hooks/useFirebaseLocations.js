import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { locations as staticLocations } from '../data/locations';

const STORAGE_KEY = 'vrinda_tours_locations';

function getCached() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || staticLocations; }
  catch { return staticLocations; }
}

export function useFirebaseLocations() {
  const [locations, setLocations] = useState(getCached);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub;
    try {
      const col = collection(firestore, 'locations');
      const q = query(col, orderBy('name', 'asc'));
      
      unsub = onSnapshot(q, (snap) => {
        if (snap.empty) {
          setLocations(staticLocations);
          setLoading(false);
          return;
        }

        const list = [];
        snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
        setLocations(list);
        setLoading(false);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
      }, (err) => {
        console.error('Firestore Locations Error:', err);
        setLoading(false);
      });
    } catch (err) {
      console.error('Firestore Locations Catch:', err);
      setLoading(false);
    }
    return () => unsub && unsub();
  }, []);

  return { locations, loading };
}
