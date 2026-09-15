import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Layers, Check, X } from 'lucide-react';
import './MapStyleSwitcher.css';

// Authentic, high-fidelity miniature vector map illustrations
function CartoPreview() {
  return (
    <svg className="map-thumb-vector" viewBox="0 0 120 75" preserveAspectRatio="none" aria-hidden="true">
      <rect width="120" height="75" fill="#f4f3f0" />
      <path d="M 0,0 Q 25,20 40,0 Z" fill="#d8ecc5" />
      <path d="M 75,45 Q 95,30 120,40 L 120,75 L 80,75 Z" fill="#d8ecc5" />
      <path d="M 10,50 Q 25,40 35,55 Q 20,75 5,68 Z" fill="#cbe6b3" />
      <path d="M 0,38 Q 35,32 60,48 T 120,30" fill="none" stroke="#a4d1f2" strokeWidth="9" strokeLinecap="round" />
      <path d="M -5,18 L 125,58" fill="none" stroke="#ffffff" strokeWidth="5.5" />
      <path d="M -5,18 L 125,58" fill="none" stroke="#e0deda" strokeWidth="1" />
      <path d="M 45,-5 L 75,80" fill="none" stroke="#ffffff" strokeWidth="4" />
      <path d="M 15,24 L 55,78" fill="none" stroke="#ffffff" strokeWidth="2.5" />
      <path d="M 85,-5 L 20,80" fill="none" stroke="#fed7aa" strokeWidth="3" />
      <path d="M 85,-5 L 20,80" fill="none" stroke="#ea580c" strokeWidth="1.2" />
    </svg>
  );
}

function GoogleRoadmapPreview() {
  return (
    <svg className="map-thumb-vector" viewBox="0 0 120 75" preserveAspectRatio="none" aria-hidden="true">
      <rect width="120" height="75" fill="#ebe6df" />
      <rect x="10" y="8" width="28" height="20" rx="3" fill="#ffffff" opacity="0.9" />
      <rect x="75" y="8" width="35" height="22" rx="3" fill="#ffffff" opacity="0.9" />
      <rect x="15" y="44" width="38" height="24" rx="3" fill="#ffffff" opacity="0.9" />
      <path d="M 80,42 Q 100,38 115,50 L 115,70 Q 90,75 80,60 Z" fill="#c3e8ca" />
      <path d="M 0,25 Q 40,28 70,15 T 120,18" fill="none" stroke="#93c5fd" strokeWidth="7" strokeLinecap="round" />
      <path d="M -5,62 L 125,20" fill="none" stroke="#fde047" strokeWidth="6" />
      <path d="M -5,62 L 125,20" fill="none" stroke="#f59e0b" strokeWidth="1" />
      <path d="M 50,-5 L 60,80" fill="none" stroke="#ffffff" strokeWidth="3.5" />
      <path d="M 0,40 L 120,48" fill="none" stroke="#ffffff" strokeWidth="2.5" />
    </svg>
  );
}

function SatellitePreview() {
  return (
    <svg className="map-thumb-vector" viewBox="0 0 120 75" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="satGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e3a1e" />
          <stop offset="40%" stopColor="#2d4a27" />
          <stop offset="70%" stopColor="#1a2f1c" />
          <stop offset="100%" stopColor="#0f1d12" />
        </linearGradient>
        <radialGradient id="oceanGrad" cx="70%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#172554" />
          <stop offset="100%" stopColor="#081026" />
        </radialGradient>
      </defs>
      <rect width="120" height="75" fill="url(#satGrad)" />
      <path d="M 50,0 Q 80,30 65,75 L 120,75 L 120,0 Z" fill="url(#oceanGrad)" />
      <rect x="6" y="8" width="18" height="14" fill="#3f5e32" opacity="0.6" />
      <rect x="26" y="6" width="16" height="12" fill="#586f3b" opacity="0.5" />
      <rect x="8" y="24" width="22" height="18" fill="#4d6139" opacity="0.6" />
      <rect x="12" y="46" width="28" height="20" fill="#344e2b" opacity="0.7" />
      <path d="M 0,22 Q 40,28 75,55 L 120,68" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M 30,0 L 25,75" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.4" />
    </svg>
  );
}

function TerrainPreview() {
  return (
    <svg className="map-thumb-vector" viewBox="0 0 120 75" preserveAspectRatio="none" aria-hidden="true">
      <rect width="120" height="75" fill="#f7f5ef" />
      <path d="M 0,0 L 60,0 Q 40,35 0,50 Z" fill="#eadecc" opacity="0.8" />
      <path d="M 0,0 L 35,0 Q 20,25 0,35 Z" fill="#d9c7b0" opacity="0.8" />
      <path d="M 70,75 Q 85,30 120,20 L 120,75 Z" fill="#e8dcc8" opacity="0.7" />
      <path d="M 90,75 Q 100,45 120,40 L 120,75 Z" fill="#d6c2a8" opacity="0.7" />
      <path d="M 0,20 Q 30,30 50,10 T 100,5" fill="none" stroke="#c4b59d" strokeWidth="0.8" strokeDasharray="2,2" />
      <path d="M 0,40 Q 45,55 70,30 T 120,25" fill="none" stroke="#bda88c" strokeWidth="0.9" />
      <path d="M 10,75 Q 60,65 85,45 T 120,50" fill="none" stroke="#bda88c" strokeWidth="0.9" />
      <path d="M -5,55 Q 35,40 65,58 T 125,32" fill="none" stroke="#15803d" strokeWidth="1.8" strokeDasharray="3,2" />
    </svg>
  );
}

export const MAP_STYLES = [
  {
    id: 'carto',
    name: 'Default',
    sub: 'CARTO',
    component: CartoPreview,
  },
  {
    id: 'google',
    name: 'Roadmap',
    sub: 'Google',
    component: GoogleRoadmapPreview,
  },
  {
    id: 'satellite',
    name: 'Satellite',
    sub: 'Aerial',
    component: SatellitePreview,
  },
  {
    id: 'osm',
    name: 'Terrain',
    sub: 'OSM',
    component: TerrainPreview,
  },
];

export default function MapStyleSwitcher({ activeStyle = 'carto', onStyleChange }) {
  const [isOpen, setIsOpen] = useState(false);

  // Close on escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div className="map-style-switcher-wrapper">
      <button
        type="button"
        className={`map-style-toggle-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        title="Map Type & Layers"
        aria-label="Map Type"
        aria-expanded={isOpen}
      >
        <Layers size={18} />
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="map-type-modal-portal">
          {/* Backdrop */}
          <div 
            className="map-type-backdrop" 
            onClick={() => setIsOpen(false)} 
            aria-hidden="true" 
          />

          {/* Bottom Sheet / Floating Island */}
          <div className="map-type-sheet" role="dialog" aria-modal="true" aria-label="Map Type Selection">
            <div className="map-type-drag-handle" />

            <div className="map-type-header">
              <div className="map-type-title-group">
                <span className="map-type-title">Map Type</span>
                <span className="map-type-subtitle">Choose your preferred layer</span>
              </div>
              <button 
                type="button" 
                className="map-type-close" 
                onClick={() => setIsOpen(false)}
                aria-label="Close Map Type Modal"
              >
                <X size={15} />
              </button>
            </div>

            <div className="map-type-grid">
              {MAP_STYLES.map((style) => {
                const isSelected = activeStyle === style.id;
                const PreviewComponent = style.component;
                return (
                  <button
                    key={style.id}
                    type="button"
                    className={`map-type-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      onStyleChange(style.id);
                      setIsOpen(false);
                    }}
                    title={`Switch to ${style.name} (${style.sub}) map`}
                  >
                    <div className="map-type-thumbnail">
                      <PreviewComponent />
                      {isSelected && (
                        <div className="map-type-check">
                          <Check size={11} strokeWidth={3.5} />
                        </div>
                      )}
                    </div>

                    <div className="map-type-label-group">
                      <span className="map-type-name">{style.name}</span>
                      <span className="map-type-sub">{style.sub}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
