import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'vt_theme_preference';

/**
 * useTheme — Uber-Grade Adaptive System Theme Hook
 * Supports: 'system' | 'dark' | 'light'
 * Automatically listens to OS system dark mode changes and synchronizes DOM, meta tags, and Leaflet map.
 */
export function useTheme() {
  const [themePreference, setThemePreference] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'system';
    } catch (e) {
      return 'system';
    }
  });

  const [systemIsDark, setSystemIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches || false;
  });

  // Calculate resolved active theme ('dark' | 'light')
  const resolvedTheme = themePreference === 'system' 
    ? (systemIsDark ? 'dark' : 'light') 
    : themePreference;

  // Listen to OS system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setSystemIsDark(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Synchronize document attributes, classList, and mobile status bar color
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const isDark = resolvedTheme === 'dark';

    root.setAttribute('data-theme', resolvedTheme);
    root.style.colorScheme = resolvedTheme;

    if (isDark) {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }

    // Update native browser/status-bar theme-color meta tag
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', isDark ? '#000000' : '#ffffff');
  }, [resolvedTheme]);

  const setTheme = useCallback((newTheme) => {
    setThemePreference(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch (e) {}
  }, []);

  return {
    themePreference, // 'system' | 'dark' | 'light'
    resolvedTheme,    // 'dark' | 'light'
    isDark: resolvedTheme === 'dark',
    setTheme,
    toggleTheme: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  };
}
