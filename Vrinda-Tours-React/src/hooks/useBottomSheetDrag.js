import { useState, useRef, useCallback } from 'react';

/**
 * High-performance drag-to-dismiss gesture hook for bottom sheets and floating dialogs.
 * Uses CSS custom properties (--drag-y) to preserve horizontal centering and avoid inline style clobbering.
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
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';

    const delta = Math.max(0, currentYRef.current - startYRef.current);
    if (delta > threshold) {
      setIsClosing(true);
      setTimeout(() => {
        setIsClosing(false);
        setDragY(0);
        onClose?.();
      }, 280);
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
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose?.();
    }, 280);
  }, [isClosing, onClose]);

  const sheetStyle = {
    '--drag-y': dragY > 0 ? `${dragY}px` : '0px',
    transition: isDragging ? 'none' : undefined,
    opacity: dragY > 0 ? Math.max(0.15, 1 - dragY / 320) : undefined,
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
