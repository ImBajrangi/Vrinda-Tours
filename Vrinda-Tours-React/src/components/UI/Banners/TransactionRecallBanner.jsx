import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRight, Clock } from 'lucide-react';
import './TransactionRecallBanner.css';

/**
 * Format remaining milliseconds into "Xd Yh Zm" countdown
 */
function formatTimeRemaining(ms) {
  if (ms <= 0) return 'Holding Expiring Soon';
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m left`;
  }
  return `${hours}h ${minutes}m left`;
}

export default function TransactionRecallBanner({ onResumeReservation, isModalOpen }) {
  const [pendingTx, setPendingTx] = useState(null);
  const [timeLeftStr, setTimeLeftStr] = useState('');
  const [isDismissed, setIsDismissed] = useState(false);
  const [stage, setStage] = useState('visible'); // 'visible' | 'exiting'

  // Load and refresh pending transaction state
  const loadPendingTransaction = useCallback(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const raw = localStorage.getItem('vt_pending_reservation');
      if (!raw) {
        setPendingTx(null);
        return;
      }
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.packageItem) {
        setPendingTx(null);
        return;
      }

      // Ensure holdTimerExpiresAt exists with random 1-3 days window
      if (!parsed.holdTimerExpiresAt) {
        const randomDays = Math.floor(Math.random() * 2) + 1; // 1 or 2 days
        const randomHours = Math.floor(Math.random() * 18) + 4; // 4 to 22 hours
        parsed.holdTimerExpiresAt = Date.now() + (randomDays * 24 + randomHours) * 3600 * 1000;
        localStorage.setItem('vt_pending_reservation', JSON.stringify(parsed));
      }

      setPendingTx(parsed);
      setStage('visible');
    } catch {
      setPendingTx(null);
    }
  }, []);

  useEffect(() => {
    loadPendingTransaction();

    const handleUpdate = () => {
      loadPendingTransaction();
      setIsDismissed(false);
      setStage('visible');
    };

    window.addEventListener('vt:pending_reservation_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('vt:pending_reservation_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadPendingTransaction]);

  // Live timer interval ticker
  useEffect(() => {
    if (!pendingTx || !pendingTx.holdTimerExpiresAt) return;

    const updateTimer = () => {
      const remaining = pendingTx.holdTimerExpiresAt - Date.now();
      setTimeLeftStr(formatTimeRemaining(remaining));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // update every minute

    return () => clearInterval(interval);
  }, [pendingTx]);

  if (!pendingTx || isModalOpen || (isDismissed && stage !== 'exiting')) {
    return null;
  }
  if (typeof document === 'undefined') return null;

  const { packageItem } = pendingTx;

  const handleResume = () => {
    if (onResumeReservation && packageItem) {
      setStage('exiting');
      setTimeout(() => {
        setIsDismissed(true);
        onResumeReservation(packageItem);
      }, 220);
    }
  };

  const handleDismiss = () => {
    if (stage === 'exiting') return;
    setStage('exiting');
    setTimeout(() => {
      setIsDismissed(true);
    }, 320);
  };

  return createPortal(
    <aside className={`vt-recall-banner-wrap stage-${stage}`} aria-label="Resume Pending Pilgrimage Reservation">
      <div className="vt-recall-banner-bar">
        {/* Left Thumbnail */}
        <div className="vt-recall-thumb-wrap">
          <img
            src={packageItem.image}
            alt={packageItem.title}
            className="vt-recall-thumb"
            loading="lazy"
          />
        </div>

        {/* Center Info */}
        <div className="vt-recall-info">
          <h4 className="vt-recall-title">{packageItem.title}</h4>
          <div className="vt-recall-meta">
            <Clock size={11} className="vt-recall-timer-icon" />
            <span>Reserved • {timeLeftStr}</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="vt-recall-actions">
          <button
            type="button"
            className="vt-recall-btn-resume"
            onClick={handleResume}
          >
            <span>Resume</span>
            <ArrowRight size={13} />
          </button>
          <button
            type="button"
            className="vt-recall-close-btn"
            onClick={handleDismiss}
            aria-label="Dismiss reminder"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </aside>,
    document.body
  );
}
