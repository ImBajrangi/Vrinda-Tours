import { useEffect, useState, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, Heart, HeartOff, Check } from 'lucide-react';
import AnimatedIcon from './AnimatedIcon';
import './UI.css';

export default function Toast({ 
  message, 
  title, 
  desc, 
  type = 'info', 
  icon, 
  ctaText, 
  onCta, 
  duration = 3200, 
  onDismiss 
}) {
  const [stage, setStage] = useState('visible'); // 'visible' | 'exiting'
  const timerRef = useRef(null);
  const touchStartY = useRef(null);

  const triggerDismiss = () => {
    if (stage === 'exiting') return;
    setStage('exiting');
    if (timerRef.current) clearTimeout(timerRef.current);
    setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 280);
  };

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleMouseLeave = () => {
    if (stage === 'visible') {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        triggerDismiss();
      }, 2600);
    }
  };

  const handleTouchStart = (e) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (e.touches && e.touches[0]) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartY.current !== null && e.changedTouches && e.changedTouches[0]) {
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;
      if (deltaY < -15) {
        triggerDismiss();
        return;
      }
    }
    if (stage === 'visible') {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        triggerDismiss();
      }, 2600);
    }
  };

  useEffect(() => {
    if (message || title) {
      setStage('visible');
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        triggerDismiss();
      }, duration);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [message, title, duration]);

  if (!message && !title && stage !== 'exiting') return null;

  const rawTitle = title || message || '';
  const cleanTitle = String(rawTitle)
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

  const cleanDesc = desc
    ? String(desc)
        .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
        .replace(/\s+/g, ' ')
        .trim()
    : null;

  const titleLower = cleanTitle.toLowerCase();
  const isFavAction = titleLower.includes('favourite') || titleLower.includes('favorite') || titleLower.includes('saved');
  const isFavRemove = isFavAction && (titleLower.includes('remove') || titleLower.includes('unsaved'));
  const isFavAdd = isFavAction && !isFavRemove;

  const getEffectiveType = () => {
    if (isFavAdd) return 'fav-add';
    if (isFavRemove) return 'fav-remove';
    return type;
  };

  const effectiveType = getEffectiveType();

  const getIcon = () => {
    if (icon) return icon;
    if (isFavAdd) {
      return <Heart size={16} strokeWidth={2.5} color="#fb7185" fill="#f43f5e" />;
    }
    if (isFavRemove) {
      return <HeartOff size={16} strokeWidth={2.5} color="#fca5a5" />;
    }
    switch (type) {
      case 'success':
        return <Check size={16} strokeWidth={3} color="#4ade80" />;
      case 'error':
        return <AlertCircle size={16} strokeWidth={2.5} color="#f87171" />;
      case 'warning':
        return <AlertTriangle size={16} strokeWidth={2.5} color="#fbbf24" />;
      case 'loading':
        return <AnimatedIcon name="loading" size={18} strokeColor="#38bdf8" speed={1.2} loop={true} />;
      case 'info':
      default:
        return <Info size={16} strokeWidth={2.75} color="#38bdf8" />;
    }
  };

  return (
    <aside
      className={`dynamic-island-toast toast tp-dynamic-island ${type} type-${effectiveType} stage-${stage}`}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={triggerDismiss}
    >
      <div className={`dynamic-island-icon-wrap tp-island-glyph-wrap type-${effectiveType}`}>
        {getIcon()}
      </div>

      <div className="dynamic-island-content tp-island-content">
        <span className="dynamic-island-title tp-island-title">{cleanTitle}</span>
        {cleanDesc && (
          <>
            <span className="tp-island-dot">•</span>
            <span className="dynamic-island-desc tp-island-sub">{cleanDesc}</span>
          </>
        )}
      </div>
    </aside>
  );
}
