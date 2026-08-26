import { useState, useEffect, useCallback } from 'react';

const FAVORITES_STORAGE_KEY = 'vrinda_user_favourites';
const FAVORITES_EVENT = 'vrinda_favorites_updated';

// Helper to get cached favorites from localStorage
function getStoredFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error loading favourites from cache:', e);
    return [];
  }
}

// Helper to persist favorites to localStorage and notify listeners
function saveFavorites(favs) {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favs));
    window.dispatchEvent(new CustomEvent(FAVORITES_EVENT, { detail: favs }));
  } catch (e) {
    console.error('Error saving favourites to cache:', e);
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(getStoredFavorites);

  useEffect(() => {
    const handleSync = (e) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setFavorites(e.detail);
      } else {
        setFavorites(getStoredFavorites());
      }
    };

    window.addEventListener(FAVORITES_EVENT, handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener(FAVORITES_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const getKey = useCallback((locOrName) => {
    if (!locOrName) return null;
    if (typeof locOrName === 'string') return locOrName;
    return locOrName.name || locOrName.id || null;
  }, []);

  const isFavorite = useCallback((locOrName) => {
    const key = getKey(locOrName);
    if (!key) return false;
    return favorites.includes(key);
  }, [favorites, getKey]);

  const toggleFavorite = useCallback((locOrName) => {
    const key = getKey(locOrName);
    if (!key) return { isFav: false, key: '' };

    setFavorites((prev) => {
      const exists = prev.includes(key);
      const updated = exists ? prev.filter((k) => k !== key) : [...prev, key];
      saveFavorites(updated);
      return updated;
    });

    const isFav = !favorites.includes(key);
    return { isFav, key };
  }, [favorites, getKey]);

  const removeFavorite = useCallback((locOrName) => {
    const key = getKey(locOrName);
    if (!key) return;

    setFavorites((prev) => {
      const updated = prev.filter((k) => k !== key);
      saveFavorites(updated);
      return updated;
    });
  }, [getKey]);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    favoritesCount: favorites.length,
  };
}
