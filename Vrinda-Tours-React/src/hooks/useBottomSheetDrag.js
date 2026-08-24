import { useState, useRef, useCallback } from 'react';

/**
 * High-performance drag-to-dismiss gesture hook for bottom sheets and floating dialogs.
 * Provides 60fps touch and mouse drag-down physics with strict text selection suppression.
 */
export function useBottomSheetDrag(onClose, threshold = 65) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);

  const startDrag = useCallback((clientY) => {
    startYRef.current = clientY;
    currentYRef.current = clientY;
    setIsDragging(true);
    // Clear any text selection that may have occurred
    window.getSelection()?.removeAllRanges();
  }, []);

  const moveDrag = useCallback((clientY) => {
    if (!isDragging) return;
    const delta = Math.max(0, clientY - startYRef.current);
    currentYRef.current = clientY;
    setDragY(delta);
  }, [isDragging]);

  const endDrag = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    // Restore body selection
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';

    const delta = Math.max(0, currentYRef.current - startYRef.current);
    if (delta > threshold) {
      setIsClosing(true);
      setDragY(380);
      setTimeout(() => {
        setDragY(0);
        setIsClosing(false);
        onClose?.();
      }, 220);
    } else {
      setDragY(0);
    }
  }, [isDragging, threshold, onClose]);

  const handleTouchStart = useCallback((e) => {
    startDrag(e.touches[0].clientY);
  }, [startDrag]);

  const handleTouchMove = useCallback((e) => {
    moveDrag(e.touches[0].clientY);
  }, [moveDrag]);

  const handleTouchEnd = useCallback(() => {
    endDrag();
  }, [endDrag]);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    // Prevent default browser text selection drag behavior
    e.preventDefault();
    window.getSelection()?.removeAllRanges();
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    startDrag(e.clientY);

    const onMouseMove = (ev) => {
      ev.preventDefault();
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
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose?.();
    }, 220);
  }, [onClose]);

  const sheetStyle = {
    transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
    transition: isDragging ? 'none' : (isClosing ? 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s' : undefined),
    opacity: dragY > 0 ? Math.max(0.15, 1 - dragY / 300) : (isClosing ? 0 : undefined),
    WebkitUserSelect: isDragging ? 'none' : undefined,
    userSelect: isDragging ? 'none' : undefined
  };

  const handleProps = {
    onMouseDown: handleMouseDown,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
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
