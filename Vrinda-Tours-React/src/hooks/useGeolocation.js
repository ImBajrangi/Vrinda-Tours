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
        setError(null);
        try { localStorage.setItem('vt_user_pos', JSON.stringify(loc)); } catch {}
      },
      (err) => {
        // Graceful handling of temporary location errors (e.g. kCLErrorLocationUnknown)
        if (err.code === 2 || err.code === 3) {
          // Position unavailable or timeout - keep last known position
          setLoading(false);
        } else {
          setError(err.message);
          setLoading(false);
        }
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
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
