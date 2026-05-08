import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { firestore } from '../config/firebase';

const STORAGE_KEY = 'vrinda_tours_drivers';

function getCached() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

export function useFirebaseDrivers() {
  const [drivers, setDrivers] = useState(getCached);
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    let unsub;
    try {
      const col = collection(firestore, 'drivers');
      unsub = onSnapshot(col, (snap) => {
        const list = [];
        snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setDrivers(list);
        setFirebaseReady(true);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
      }, () => {
        setFirebaseReady(false);
      });
    } catch {
      setFirebaseReady(false);
    }
    return () => unsub && unsub();
  }, []);

  return { drivers, firebaseReady };
}
