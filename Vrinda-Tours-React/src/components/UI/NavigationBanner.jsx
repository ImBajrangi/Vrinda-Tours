import { useState, useMemo, useEffect } from 'react';
import { 
  Navigation, 
  ExternalLink, 
  X, 
  Sparkles, 
  ChevronDown, 
  ChevronRight,
  Star,
  Heart
} from 'lucide-react';
import { locations } from '../../data/locations';
import { useFavorites } from '../../hooks/useFavorites';
import './NavigationBanner.css';

// Haversine exact distance formula
function getDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function NavigationBanner({ 
  route, 
  userPosition,
  isCardVisible = false,
  onExpandedChange,
  onExit, 
  onOpenExternal, 
  onSelectPlace 
}) {
  const [isExpanded, setIsExpanded] = useState(false); // Default sleek collapsed capsule
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const { favorites } = useFavorites();

  // Notify parent of expanded state changes for dynamic map control relocation
  const toggleExpanded = (val) => {
    setIsExpanded(val);
    if (onExpandedChange) {
      onExpandedChange(val);
    }
  };

  // Dynamic user-interest & proximity recommendation engine (1, 2, 3, or 4 adaptive count)
  const nearbyPlaces = useMemo(() => {
    if (!route?.destination?.lat || !route?.destination?.lng) return [];
    const destLat = route.destination.lat;
    const destLng = route.destination.lng;
    const destName = (route.destName || '').toLowerCase().trim();

    const scored = locations
      .filter((loc) => {
        const isCurrent = loc.name.toLowerCase().trim() === destName;
        return !isCurrent;
      })
      .map((loc) => {
        const distKm = getDistanceKm(destLat, destLng, loc.lat, loc.lng);
        const isFav = favorites.includes(loc.name);
        const rating = loc.rating || (loc.category === 'Temple' || loc.category === 'Holy Site' ? 4.9 : 4.4);
        const points = loc.points || 10;
        
        const proximityScore = 120 / (distKm + 0.15);
        const favBonus = isFav ? 60 : 0;
        const qualityScore = rating * 12 + points;
        const totalScore = proximityScore + favBonus + qualityScore;

        return {
          ...loc,
          distKm,
          isFav,
          rating,
          totalScore,
        };
      })
      .filter((loc) => loc.distKm <= 10)
      .sort((a, b) => b.totalScore - a.totalScore);

    const topCount = scored.length <= 2 ? scored.length : scored.length === 3 ? 3 : 4;
    return scored.slice(0, topCount);
  }, [route, favorites]);

  // Clean route summary string (prevents "via via MDR143W")
  const cleanSummary = useMemo(() => {
    if (!route?.summary || route.summary === 'Fastest route') return 'Fastest route';
    const s = route.summary.trim();
    return s.toLowerCase().startsWith('via ') ? s : `via ${s}`;
  }, [route]);

  // Relative progress towards destination (0 to 100)
  const progressPercent = useMemo(() => {
    if (!route?.origin || !route?.destination) return 25;
    const totalDist = route.distanceKm || 15;
    if (userPosition && userPosition.lat && userPosition.lng) {
      const remainingDist = getDistanceKm(userPosition.lat, userPosition.lng, route.destination.lat, route.destination.lng);
      const covered = Math.max(0, totalDist - remainingDist);
      const pct = Math.min(100, Math.max(10, Math.round((covered / totalDist) * 100)));
      return pct;
    }
    return 30; // Clean initial progress ring state
  }, [route, userPosition]);

  if (!route) return null;

  const handleSmoothClose = (e) => {
    e?.stopPropagation();
    setIsExiting(true);
    setTimeout(() => {
      onExit();
    }, 320);
  };

  const ringRadius = 16;
  const ringCircumference = 2 * Math.PI * ringRadius; // ~100.53
  const strokeOffset = ringCircumference - (progressPercent / 100) * ringCircumference;

  return (
    <div 
      className={`nav-hud-container ${isCardVisible ? 'relocated-above-card' : ''} ${isExpanded ? 'mode-expanded' : 'mode-capsule'}`}
    >
      {/* Dynamic Morphing Card / Island Capsule */}
      <div 
        className={`nav-hud-surface ${isExpanded ? 'is-expanded-card' : 'is-collapsed-capsule'} ${isExiting ? 'is-exiting' : ''}`}
        style={{
          '--rec-count': nearbyPlaces.length,
          '--nav-progress': `${progressPercent}%`,
        }}
        onClick={!isExpanded ? () => toggleExpanded(true) : undefined}
      >
        {/* ================= EXECUTIVE LIVE ACTIVITY CAPSULE ================= */}
        {!isExpanded ? (
          <div className="nav-capsule-content">
            <div className="nav-capsule-info">
              <span className="nav-capsule-title">{route.destName || 'Destination'}</span>
              <span className="nav-capsule-meta">
                <strong className="nav-capsule-eta">{route.durationMins} min</strong>
                <span className="nav-capsule-bullet">•</span>
                <span className="nav-capsule-dist">{route.distanceKm} km</span>
              </span>
            </div>

            {/* Circular Progress Ring with Navigation Action */}
            <button 
              type="button"
              className="nav-capsule-action-wrapper"
              onClick={(e) => {
                e.stopPropagation();
                onOpenExternal();
              }}
              title="Start live GPS in Google Maps"
              aria-label="Start live GPS in Google Maps"
            >
              <svg className="nav-capsule-ring-svg" viewBox="0 0 38 38" aria-hidden="true">
                <circle 
                  className="nav-ring-bg" 
                  cx="19" 
                  cy="19" 
                  r={ringRadius} 
                />
                <circle 
                  className="nav-ring-fg" 
                  cx="19" 
                  cy="19" 
                  r={ringRadius}
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={strokeOffset}
                />
              </svg>
              <div className="nav-capsule-action-btn">
                <Navigation size={14} fill="currentColor" />
              </div>
            </button>
          </div>
        ) : (
          /* ================= EXPANDED RICH HUD VIEW ================= */
          <div className="nav-expanded-card-content">
            {/* Top Interactive Collapse Handle */}
            <div 
              className="nav-hud-pull-pill" 
              onClick={() => toggleExpanded(false)}
              title="Tap to shrink to capsule"
              role="button"
              tabIndex={0}
            />

            {/* Header: Title, Subtitle, and Exit Action */}
            <div className="nav-hud-header">
              <div className="nav-hud-title-wrap">
                <h3 className="nav-hud-title">{route.destName || 'Destination'}</h3>
                <span className="nav-hud-subtitle">
                  {route.distanceKm} km • {cleanSummary}
                </span>
              </div>

              <button 
                type="button" 
                className="nav-hud-close"
                onClick={handleSmoothClose}
                title="Exit Navigation"
                aria-label="Exit Navigation"
              >
                <X size={15} />
              </button>
            </div>

            {/* Hero ETA Metrics Strip */}
            <div className="nav-hud-metrics-bar">
              <div className="nav-hud-eta-lead">
                <span className="nav-eta-value">{route.durationMins}</span>
                <span className="nav-eta-label">min</span>
              </div>

              <div className="nav-hud-details">
                {route.arrivalTime && (
                  <span className="nav-hud-arrival-badge">Arrive {route.arrivalTime}</span>
                )}
                <span className="nav-hud-traffic-tag">Typical traffic</span>
              </div>
            </div>

            {/* Dynamic Nearest Recommendations Drawer (1 to 4 Adaptive) */}
            {nearbyPlaces.length > 0 && (
              <div className="nav-hud-recs-wrapper">
                <button 
                  type="button" 
                  className={`nav-hud-recs-toggle ${showRecommendations ? 'open' : ''}`}
                  onClick={() => setShowRecommendations((prev) => !prev)}
                  aria-expanded={showRecommendations}
                >
                  <div className="nav-recs-toggle-left">
                    <Sparkles size={13} className="nav-recs-sparkle-icon" />
                    <span>Nearby Highlights ({nearbyPlaces.length})</span>
                  </div>
                  <ChevronDown 
                    size={14} 
                    className={`nav-recs-chevron-icon ${showRecommendations ? 'rotated' : ''}`} 
                  />
                </button>

                {/* CSS Grid Spring Morphing Container */}
                <div className={`nav-recs-drawer ${showRecommendations ? 'expanded' : ''}`}>
                  <div className="nav-recs-inner">
                    <div className="nav-recs-list">
                      {nearbyPlaces.map((place, idx) => (
                        <div 
                          key={place.name} 
                          className="nav-rec-row"
                          style={{ '--item-idx': idx }}
                          onClick={() => onSelectPlace && onSelectPlace(place)}
                          role="button"
                          tabIndex={0}
                          title={`Explore ${place.name}`}
                        >
                          <img 
                            className="nav-rec-thumb"
                            src={place.image || '/vrinda-vihar/radha-rani-temple-barsana.jpg'} 
                            alt={place.name} 
                            loading="lazy"
                            onError={(e) => { e.target.src = '/vrinda-vihar/radha-rani-temple-barsana.jpg'; }}
                          />

                          <div className="nav-rec-details">
                            <div className="nav-rec-name-row">
                              <span className="nav-rec-name">{place.name}</span>
                              {place.isFav && (
                                <Heart size={10} fill="#ef4444" color="#ef4444" className="nav-fav-badge" />
                              )}
                            </div>
                            <div className="nav-rec-sub-row">
                              <span className="nav-rec-category">{place.category}</span>
                              <span className="nav-rec-bullet">•</span>
                              <span className="nav-rec-rating">
                                <Star size={10} fill="#f59e0b" color="#f59e0b" /> {place.rating}
                              </span>
                            </div>
                          </div>

                          <div className="nav-rec-dist-badge">
                            <span className="nav-rec-dist-val">
                              {place.distKm < 1 
                                ? `${Math.round(place.distKm * 1000)}m` 
                                : `${place.distKm.toFixed(1)}km`}
                            </span>
                            <ChevronRight size={13} className="nav-rec-arrow" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Primary Navigation Action CTA */}
            <div className="nav-hud-actions">
              <button 
                type="button" 
                className="nav-hud-btn-primary"
                onClick={onOpenExternal}
                title="Start live GPS turn-by-turn navigation in Google Maps"
              >
                <Navigation size={15} fill="currentColor" className="nav-hud-arrow-icon" />
                <span>Start in Google Maps</span>
                <ExternalLink size={13} className="nav-hud-ext-icon" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
