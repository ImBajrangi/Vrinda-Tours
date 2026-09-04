import { useEffect, useState, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X, ArrowRight } from 'lucide-react';
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

  const getIcon = () => {
    if (icon) return icon;
    switch (type) {
      case 'success':
        return <CheckCircle2 size={14} strokeWidth={2.5} />;
      case 'error':
        return <AlertCircle size={14} strokeWidth={2.5} />;
      case 'warning':
        return <AlertTriangle size={14} strokeWidth={2.5} />;
      case 'info':
      default:
        return <Info size={14} strokeWidth={2.5} />;
    }
  };

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

  return (
    <aside
      className={`dynamic-island-toast toast tp-dynamic-island ${type} stage-${stage}`}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={triggerDismiss}
    >
      <div className={`dynamic-island-icon-wrap tp-island-glyph-wrap type-${type}`}>
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
