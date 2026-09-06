import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';
import checkCircleAnimation from '../../assets/animations/check-circle.json';
import './AnimatedCheckCircle.css';

/**
 * Apple-Grade Interactive Animated Check Circle / Tick Box
 * Leverages check-circle.json timeline:
 * - Frame 0: Clean un-ticked circle (static SVG state)
 * - Frame 0 -> 30: Smooth dynamic drawing and micro-bounce of checkmark
 * - Frame 30: Full static checked state
 * - Frame 30 -> 0: Reversible untick transition
 */
export default function AnimatedCheckCircle({
  checked = undefined,
  size = 22,
  color = '#0f172a',
  loop = false,
  autoplay = true,
  className = '',
  style = {},
  onClick = undefined,
  disabled = false
}) {
  const containerRef = useRef(null);
  const animInstanceRef = useRef(null);
  const isInitialMount = useRef(true);
  const prevCheckedRef = useRef(checked);

  // Initialize Lottie instance
  useEffect(() => {
    if (!containerRef.current) return;

    let animData = checkCircleAnimation;
    if (color) {
      try {
        const jsonStr = JSON.stringify(checkCircleAnimation);
        animData = JSON.parse(jsonStr);

        let rgb = [0.06, 0.09, 0.16, 1]; // Default dark slate
        if (color.startsWith('#')) {
          const hex = color.replace('#', '');
          if (hex.length === 6) {
            rgb = [
              parseInt(hex.slice(0, 2), 16) / 255,
              parseInt(hex.slice(2, 4), 16) / 255,
              parseInt(hex.slice(4, 6), 16) / 255,
              1
            ];
          } else if (hex.length === 3) {
            rgb = [
              parseInt(hex[0] + hex[0], 16) / 255,
              parseInt(hex[1] + hex[1], 16) / 255,
              parseInt(hex[2] + hex[2], 16) / 255,
              1
            ];
          }
        } else if (color === 'white' || color === '#fff' || color === '#ffffff') {
          rgb = [1, 1, 1, 1];
        }

        if (animData.layers?.[0]?.shapes) {
          animData.layers[0].shapes.forEach((shapeGroup) => {
            if (shapeGroup.it) {
              shapeGroup.it.forEach((item) => {
                if (item.ty === 'st' && item.c?.k) {
                  item.c.k = rgb;
                }
              });
            }
          });
        }
      } catch {
        animData = checkCircleAnimation;
      }
    }

    if (animInstanceRef.current) {
      animInstanceRef.current.destroy();
    }

    const instance = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: loop,
      autoplay: checked === undefined ? autoplay : false,
      animationData: animData
    });

    animInstanceRef.current = instance;

    // Set initial frame based on controlled `checked` state
    if (checked !== undefined) {
      if (checked) {
        instance.goToAndStop(30, true);
      } else {
        instance.goToAndStop(0, true);
      }
    }

    isInitialMount.current = true;
    prevCheckedRef.current = checked;

    return () => {
      if (instance) {
        instance.destroy();
      }
    };
  }, [color, loop]);

  // Handle controlled state transitions (ticking / unticking)
  useEffect(() => {
    const instance = animInstanceRef.current;
    if (!instance || checked === undefined) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (checked) {
        instance.goToAndStop(30, true);
      } else {
        instance.goToAndStop(0, true);
      }
      prevCheckedRef.current = checked;
      return;
    }

    if (prevCheckedRef.current !== checked) {
      if (checked) {
        // Forward transition: Play 0 -> 30 (draw circle and checkmark)
        instance.setDirection(1);
        instance.play();
      } else {
        // Reverse transition: Play 30 -> 0 (cleanly erase checkmark back to circle)
        instance.setDirection(-1);
        instance.play();
      }
      prevCheckedRef.current = checked;
    }
  }, [checked]);

  return (
    <div
      ref={containerRef}
      className={`vt-anim-check-circle ${checked === true ? 'is-checked' : checked === false ? 'is-unchecked' : ''} ${disabled ? 'is-disabled' : ''} ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        cursor: onClick ? 'pointer' : 'inherit',
        ...style
      }}
      onClick={(e) => {
        if (!disabled && onClick) {
          onClick(e);
        }
      }}
      role={onClick ? 'checkbox' : undefined}
      aria-checked={checked}
      aria-label="Interactive Tick Box"
    />
  );
}

/**
 * Interactive Checkbox Wrapper using AnimatedCheckCircle
 */
export function AnimatedCheckbox({
  checked = false,
  onChange = () => {},
  label = '',
  size = 20,
  color = '#0f172a',
  className = '',
  disabled = false
}) {
  return (
    <label
      className={`vt-animated-checkbox-label ${checked ? 'is-checked' : ''} ${disabled ? 'is-disabled' : ''} ${className}`}
      onClick={(e) => {
        e.preventDefault();
        if (disabled) return;
        onChange(!checked);
      }}
    >
      <div className="vt-animated-checkbox-box" style={{ width: size, height: size }}>
        <AnimatedCheckCircle
          checked={checked}
          size={size}
          color={color}
          disabled={disabled}
        />
      </div>
      {label && <span className="vt-animated-checkbox-text">{label}</span>}
    </label>
  );
}

/**
 * Interactive Radio Button Wrapper using AnimatedCheckCircle
 */
export function AnimatedRadioButton({
  checked = false,
  onChange = () => {},
  label = '',
  name = '',
  value = '',
  size = 22,
  color = '#0f172a',
  className = '',
  disabled = false
}) {
  return (
    <label
      className={`vt-animated-radio-label ${checked ? 'is-checked' : ''} ${disabled ? 'is-disabled' : ''} ${className}`}
      onClick={(e) => {
        e.preventDefault();
        if (disabled) return;
        onChange(value || true);
      }}
    >
      <div className="vt-animated-radio-box" style={{ width: size, height: size }}>
        <AnimatedCheckCircle
          checked={checked}
          size={size}
          color={color}
          disabled={disabled}
        />
      </div>
      {label && <span className="vt-animated-radio-text">{label}</span>}
    </label>
  );
}
