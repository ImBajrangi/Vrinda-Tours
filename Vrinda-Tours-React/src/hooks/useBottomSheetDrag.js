import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Uber-Grade High-Performance Bottom Sheet Drag-to-Dismiss Hook
 * Features:
 * - Velocity-aware flick detection (snappy dismiss on fast swipe down)
 * - 1:1 hardware accelerated translation with zero lag
 * - Resistance when pulling up (rubber-band dampening)
 * - Touch-action: none support to prevent browser viewport conflicts
 */
export function useBottomSheetDrag(onClose, threshold = 80) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const startTimeRef = useRef(0);
  const lastTimeRef = useRef(0);
  const lastYRef = useRef(0);
  const velocityRef = useRef(0);
  const rafRef = useRef(null);

  const startDrag = useCallback((clientY) => {
    startYRef.current = clientY;
    currentYRef.current = clientY;
    lastYRef.current = clientY;
    startTimeRef.current = Date.now();
    lastTimeRef.current = startTimeRef.current;
    velocityRef.current = 0;
    setIsDragging(true);
    document.body.classList.add('sheet-dragging');
  }, []);

  const moveDrag = useCallback((clientY) => {
    if (!isDragging) return;
    const now = Date.now();
    const dt = Math.max(1, now - lastTimeRef.current);
    const dy = clientY - lastYRef.current;
    velocityRef.current = dy / dt; // px per ms

    lastTimeRef.current = now;
    lastYRef.current = clientY;
    currentYRef.current = clientY;

    // Only allow pulling down (delta >= 0), with slight resistance if pulled up
    const rawDelta = clientY - startYRef.current;
    const delta = rawDelta < 0 ? rawDelta * 0.2 : rawDelta;
    setDragY(delta);

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      document.documentElement.style.setProperty('--card-drag-offset', `${Math.max(0, delta)}px`);
    });
  }, [isDragging]);

  const endDrag = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    document.body.classList.remove('sheet-dragging');

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const delta = currentYRef.current - startYRef.current;
    const velocity = velocityRef.current; // Positive = downward flick

    // Dismiss if dragged past threshold OR flicked downward with high velocity
    const isFlickDismiss = velocity > 0.45 && delta > 20;
    const isDistanceDismiss = delta > threshold;

    if (isFlickDismiss || isDistanceDismiss) {
      setIsClosing(true);
      setTimeout(() => {
        setIsClosing(false);
        setDragY(0);
        document.documentElement.style.setProperty('--card-drag-offset', '0px');
        onClose?.();
      }, 200);
    } else {
      // Snap back smoothly
      setDragY(0);
      document.documentElement.style.setProperty('--card-drag-offset', '0px');
    }
  }, [isDragging, threshold, onClose]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.body.classList.remove('sheet-dragging');
      document.documentElement.style.setProperty('--card-drag-offset', '0px');
    };
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (e.touches && e.touches.length > 0) {
      startDrag(e.touches[0].clientY);
    }
  }, [startDrag]);

  const handleTouchMove = useCallback((e) => {
    if (e.touches && e.touches.length > 0) {
      moveDrag(e.touches[0].clientY);
    }
  }, [moveDrag]);

  const handleTouchEnd = useCallback(() => {
    endDrag();
  }, [endDrag]);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    startDrag(e.clientY);

    const onMouseMove = (ev) => {
      moveDrag(ev.clientY);
    };

    const onMouseUp = () => {
      endDrag();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [startDrag, moveDrag, endDrag]);

  const triggerClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    document.documentElement.style.setProperty('--card-drag-offset', '0px');
    setTimeout(() => {
      setIsClosing(false);
      onClose?.();
    }, 200);
  }, [isClosing, onClose]);

  const sheetStyle = {
    transform: isClosing 
      ? 'translateY(100%)' 
      : dragY > 0 
        ? `translateY(${dragY}px)` 
        : undefined,
    transition: isDragging ? 'none' : 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.28s ease',
    opacity: isClosing ? 0 : dragY > 0 ? Math.max(0.3, 1 - dragY / 400) : 1,
    touchAction: 'none'
  };

  const handleProps = {
    onMouseDown: handleMouseDown,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    style: { touchAction: 'none', cursor: 'grab' }
  };

  return {
    dragY,
    isDragging,
    isClosing,
    sheetStyle,
    handleProps,
    triggerClose
  };
}
