import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

export const FESTIVE_COLORS = [
  '#ff6b4a', // Saffron vermilion
  '#fbbf24', // Golden yellow
  '#10b981', // Emerald green
  '#6366f1', // Royal indigo
  '#f43f5e', // Rose
  '#38bdf8', // Celestial cyan
  '#eab308'  // Radiant gold
];

export const PASTEL_COLORS = [
  '#a786ff',
  '#fd8bbc',
  '#eca184',
  '#f8deb1'
];

export const MICRO_COLORS = [
  '#10b981', // Emerald
  '#fbbf24', // Gold
  '#ff6b4a', // Saffron
  '#34d399'  // Mint
];

/**
 * Trigger continuous side cannons using requestAnimationFrame
 * (Magic UI / shadcn ConfettiSideCannons pattern)
 */
export function triggerSideCannons(options = {}) {
  const duration = (options.duration || 3) * 1000;
  const end = Date.now() + duration;
  const colors = options.colors || FESTIVE_COLORS;
  const zIndex = options.zIndex || 999999;

  const frame = () => {
    if (Date.now() > end) return;

    confetti({
      particleCount: options.particleCount || 2,
      angle: 60,
      spread: 55,
      startVelocity: 60,
      origin: { x: 0, y: options.y ?? 0.5 },
      colors,
      zIndex,
      disableForReducedMotion: true
    });
    confetti({
      particleCount: options.particleCount || 2,
      angle: 120,
      spread: 55,
      startVelocity: 60,
      origin: { x: 1, y: options.y ?? 0.5 },
      colors,
      zIndex,
      disableForReducedMotion: true
    });

    requestAnimationFrame(frame);
  };

  frame();
}

/**
 * Trigger continuous multi-origin fireworks celebration
 */
export function triggerFireworks(options = {}) {
  const duration = (options.duration || 3) * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: options.zIndex || 999999,
    colors: options.colors || FESTIVE_COLORS,
    disableForReducedMotion: true
  };

  const randomInRange = (min, max) => Math.random() * (max - min) + min;

  const interval = window.setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = Math.floor(40 * (timeLeft / duration));
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    });
  }, 250);
}

/**
 * Trigger quick dual-corner burst
 */
export function triggerCannons(options = {}) {
  const zIndex = options.zIndex || 999999;
  const colors = options.colors || FESTIVE_COLORS;

  confetti({
    particleCount: options.count ? Math.floor(options.count / 2) : 35,
    angle: 60,
    spread: 55,
    startVelocity: 55,
    origin: { x: 0.05, y: 0.92 },
    colors,
    zIndex,
    disableForReducedMotion: true
  });

  confetti({
    particleCount: options.count ? Math.floor(options.count / 2) : 35,
    angle: 120,
    spread: 55,
    startVelocity: 55,
    origin: { x: 0.95, y: 0.92 },
    colors,
    zIndex,
    disableForReducedMotion: true
  });
}

/**
 * Trigger localized micro-sparkles
 */
export function triggerMicro(options = {}) {
  confetti({
    particleCount: options.count || 18,
    spread: 50,
    startVelocity: 22,
    ticks: 45,
    scalar: 0.7,
    origin: {
      x: options.originX ? (typeof options.originX === 'string' ? parseFloat(options.originX) / 100 : options.originX) : 0.7,
      y: options.originY ? (typeof options.originY === 'string' ? parseFloat(options.originY) / 100 : options.originY) : 0.28
    },
    colors: options.colors || MICRO_COLORS,
    zIndex: options.zIndex || 999999,
    disableForReducedMotion: true
  });
}

/**
 * Universal celebration trigger dispatcher
 */
export function triggerCelebration(options = {}) {
  if (typeof window === 'undefined') return;

  const mode = options.mode || (options.count && options.count < 30 ? 'micro' : 'cannon');

  if (mode === 'side-cannons' || mode === 'cannons-stream' || mode === 'stream') {
    triggerSideCannons(options);
  } else if (mode === 'fireworks') {
    triggerFireworks(options);
  } else if (mode === 'micro') {
    triggerMicro(options);
  } else {
    triggerSideCannons(options);
  }
}

/**
 * Standalone Side Cannons Trigger Component
 */
export function ConfettiSideCannons({ label = 'Trigger Side Cannons', className = '', style = {}, colors = PASTEL_COLORS, duration = 3 }) {
  const handleClick = () => {
    triggerSideCannons({ duration, colors });
  };

  return (
    <div className={`relative inline-block ${className}`} style={style}>
      <button
        type="button"
        onClick={handleClick}
        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
      >
        {label}
      </button>
    </div>
  );
}

/**
 * Standalone Fireworks Trigger Component
 */
export function ConfettiFireworks({ label = 'Trigger Fireworks', className = '', style = {}, duration = 4 }) {
  const handleClick = () => {
    triggerFireworks({ duration });
  };

  return (
    <div className={`relative inline-block ${className}`} style={style}>
      <button
        type="button"
        onClick={handleClick}
        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
      >
        {label}
      </button>
    </div>
  );
}

/**
 * Global Confetti Event Listener Component
 */
export default function Confetti() {
  useEffect(() => {
    const handleEvent = (e) => {
      triggerCelebration(e.detail || {});
    };
    window.addEventListener('vt:confetti:burst', handleEvent);
    return () => {
      window.removeEventListener('vt:confetti:burst', handleEvent);
    };
  }, []);

  return null;
}
