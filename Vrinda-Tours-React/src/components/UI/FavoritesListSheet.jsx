import { useMemo } from 'react';
import { Heart, Navigation, Star, ArrowRight, Compass, Sparkles, BedDouble, UtensilsCrossed, Landmark, Home, Info, Trash2, X } from 'lucide-react';
import { calculateDistance, formatDistance, calculateETA } from '../../utils/distance';
import { useBottomSheetDrag } from '../../hooks/useBottomSheetDrag';
import './FavoritesListSheet.css';

export default function FavoritesListSheet({
  favoriteLocations = [],
  userPosition,
  onSelectLocation,
  onRemoveFavorite,
  onExploreAll,
  onClose
}) {
  const { isDragging, sheetStyle, handleProps, triggerClose } = useBottomSheetDrag(onClose);

  const getCategoryMeta = (category) => {
    switch (category) {
      case 'Temple':
        return { Icon: Landmark, color: '#b45309', bg: '#fef3c7' };
      case 'Holy Site':
        return { Icon: Sparkles, color: '#0284c7', bg: '#e0f2fe' };
      case 'Hotel':
        return { Icon: BedDouble, color: '#15803d', bg: '#dcfce7' };
      case 'Dining':
      case 'Restaurant':
        return { Icon: UtensilsCrossed, color: '#c2410c', bg: '#ffedd5' };
      case 'Town':
        return { Icon: Home, color: '#4f46e5', bg: '#e0e7ff' };
      default:
        return { Icon: Info, color: '#3f3f46', bg: '#f4f4f5' };
    }
  };

  return (
    <div 
      className={`fav-sheet-container ${isDragging ? 'dragging' : ''}`}
      style={sheetStyle}
    >
      {/* Top Drag Handle for Smooth Swipe Down to Dismiss */}
      <div 
        className="fav-sheet-handle-wrapper" 
        {...handleProps} 
        title="Drag down to dismiss"
      >
        <div className="fav-sheet-handle" />
      </div>

      {/* Header Bar */}
      <div className="fav-sheet-header">
        <div className="fav-sheet-title-group">
          <div className="fav-title-icon-badge">
            <Heart size={16} fill="#e11d48" color="#e11d48" />
          </div>
          <h3 className="fav-sheet-title">Saved Favourites</h3>
          <span className="fav-sheet-count">{favoriteLocations.length}</span>
        </div>

        <div className="fav-sheet-header-actions">
          {favoriteLocations.length > 0 && onExploreAll && (
            <button 
              type="button" 
              className="fav-sheet-explore-btn"
              onClick={onExploreAll}
              title="Browse all locations"
            >
              <Compass size={13} />
              <span>All Sites</span>
            </button>
          )}

          <button
            type="button"
            className="fav-sheet-close-btn"
            onClick={triggerClose}
            title="Close"
            aria-label="Close favourites"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Content */}
      {favoriteLocations.length === 0 ? (
        <div className="fav-empty-state">
          <div className="fav-empty-icon-circle">
            <Heart size={26} className="fav-empty-heart" />
          </div>
          <h4 className="fav-empty-title">No Favourites Yet</h4>
          <p className="fav-empty-desc">
            Tap the <span className="heart-inline-badge">❤️</span> on any sacred temple, holy site, hotel, or dining place to build your personal pilgrimage list.
          </p>
          <button 
            type="button" 
            className="fav-empty-cta-btn" 
            onClick={onExploreAll}
          >
            <Compass size={15} />
            <span>Explore Sacred Sites</span>
          </button>
        </div>
      ) : (
        <div className="fav-items-scroll-track">
          {favoriteLocations.map((loc) => {
            const meta = getCategoryMeta(loc.category);
            const CatIcon = meta.Icon;

            let distText = '';
            let etaText = '';
            if (userPosition && loc.lat && loc.lng) {
              const km = calculateDistance(userPosition.lat, userPosition.lng, loc.lat, loc.lng);
              distText = formatDistance(km);
              etaText = calculateETA(km);
            }

            return (
              <div 
                key={loc.name} 
                className="fav-item-card"
                onClick={() => onSelectLocation?.(loc)}
              >
                {/* Thumbnail */}
                <div className="fav-item-media">
                  {loc.image ? (
                    <img 
                      src={loc.image} 
                      alt={loc.name} 
                      className="fav-item-img"
                      loading="lazy"
                    />
                  ) : (
                    <div 
                      className="fav-item-fallback-icon"
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      <CatIcon size={20} />
                    </div>
                  )}
                  <button 
                    type="button" 
                    className="fav-item-unfav-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFavorite?.(loc);
                    }}
                    title="Remove from favourites"
                    aria-label="Remove favourite"
                  >
                    <Heart size={14} fill="#e11d48" color="#e11d48" />
                  </button>
                </div>

                {/* Details */}
                <div className="fav-item-info">
                  <div className="fav-item-top-row">
                    <span 
                      className="fav-item-cat-badge"
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      {loc.category}
                    </span>
                    {loc.rating && (
                      <span className="fav-item-rating">
                        <Star size={11} fill="#d97706" color="#d97706" />
                        {loc.rating}
                      </span>
                    )}
                  </div>

                  <h4 className="fav-item-name" title={loc.name}>{loc.name}</h4>
                  
                  {loc.description && (
                    <p className="fav-item-desc">{loc.description}</p>
                  )}

                  <div className="fav-item-footer-row">
                    {distText ? (
                      <span className="fav-item-distance">
                        <Navigation size={10} />
                        {distText} • {etaText}
                      </span>
                    ) : (
                      <span className="fav-item-points">+{loc.points || 15} pts</span>
                    )}

                    <span className="fav-item-view-prompt">
                      <span>View</span>
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
