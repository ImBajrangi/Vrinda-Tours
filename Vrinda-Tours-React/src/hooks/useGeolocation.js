import { useState, useEffect, useRef, useCallback } from 'react';

export function useGeolocation() {
  const [position, setPosition] = useState(() => {
    try {
      const cached = localStorage.getItem('vt_user_pos');
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const watchRef = useRef(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }
    
    if (watchRef.current !== null) return; // Already watching

    setLoading(true);
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(loc);
        setLoading(false);
        try { localStorage.setItem('vt_user_pos', JSON.stringify(loc)); } catch {}
      },
      (err) => { setError(err.message); setLoading(false); },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  }, []);

  // Auto-request on mount
  useEffect(() => {
    requestLocation();
    return () => {
      if (watchRef.current !== null) {
        navigator.geolocation.clearWatch(watchRef.current);
        watchRef.current = null;
      }
    };
  }, [requestLocation]);

  return { position, loading, error, requestLocation };
}
