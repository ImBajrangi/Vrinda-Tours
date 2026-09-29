import React from 'react';
import './JellyIcon.css';

/**
 * JellyIcon Component
 * Faithfully delivers the "FontAwesome Jelly" aesthetic:
 * 1. Lamé Superellipse ("Squircle") geometry
 * 2. Chubby rounded stroke caps & joins (strokeWidth: 2.35, round linecap/linejoin)
 * 3. Elastic jelly bounce & squash-and-stretch micro-physics on hover/tap
 * 4. Three authentic variants: 'regular' (clean stroke), 'duo' (frosted pill + stroke), 'fill' (solid jelly drop)
 * 100% open-source, zero subscription or license fees.
 */
export default function JellyIcon({
  icon: IconComponent,
  size = 20,
  containerSize,
  variant = 'duo', // 'regular' | 'duo' | 'fill'
  color = 'blue',  // 'rose' | 'amber' | 'blue' | 'emerald' | 'indigo' | 'slate'
  strokeWidth = 2.35,
  interactive = true,
  wobble = false,
  className = '',
  style = {},
  onClick,
  title,
  ...rest
}) {
  const boxDim = containerSize || Math.round(size * 1.85);

  const containerClasses = [
    'jelly-icon-container',
    `jelly-variant-${variant}`,
    `jelly-color-${color}`,
    interactive ? 'jelly-interactive' : '',
    wobble ? 'jelly-wobble' : '',
    className
  ].filter(Boolean).join(' ');

  const containerStyle = {
    width: boxDim,
    height: boxDim,
    minWidth: boxDim,
    minHeight: boxDim,
    ...style
  };

  return (
    <div
      className={containerClasses}
      style={containerStyle}
      onClick={onClick}
      title={title}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...rest}
    >
      {IconComponent && (
        <IconComponent
          size={size}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="jelly-inner-glyph"
        />
      )}
    </div>
  );
}
