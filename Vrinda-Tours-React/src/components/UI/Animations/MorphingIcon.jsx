import React, { Component } from 'react';
import { MorphIcon } from 'morphicons/react';
import {
  Menu, X,
  Eye, EyeOff,
  Check, Copy,
  Heart, HeartOff,
  ChevronDown, ChevronUp,
  ArrowRight, ArrowLeft,
  Plus, Minus,
  Search, SlidersHorizontal
} from 'lucide';

// Pre-mapped Lucide IconNodes for universal stroke morphing
const ICON_NODE_MAP = {
  menu: Menu,
  Menu,
  x: X,
  X,
  close: X,
  eye: Eye,
  Eye,
  eyeOff: EyeOff,
  'eye-off': EyeOff,
  EyeOff,
  check: Check,
  Check,
  copy: Copy,
  Copy,
  heart: Heart,
  Heart,
  heartOff: HeartOff,
  'heart-off': HeartOff,
  HeartOff,
  chevronDown: ChevronDown,
  'chevron-down': ChevronDown,
  ChevronDown,
  chevronUp: ChevronUp,
  'chevron-up': ChevronUp,
  ChevronUp,
  arrowRight: ArrowRight,
  'arrow-right': ArrowRight,
  ArrowRight,
  arrowLeft: ArrowLeft,
  'arrow-left': ArrowLeft,
  ArrowLeft,
  plus: Plus,
  Plus,
  minus: Minus,
  Minus,
  search: Search,
  Search,
  filter: SlidersHorizontal,
  SlidersHorizontal
};

class MorphErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('[MorphingIcon] Render fallback triggered:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

export default function MorphingIcon({
  icon,
  size = 20,
  color = 'currentColor',
  strokeWidth = 2,
  spring = 'bouncy',
  className = '',
  style = {},
  ...props
}) {
  // Resolve icon data: Array (IconNode) | string lookup | fallback
  let iconData = null;

  if (Array.isArray(icon)) {
    iconData = icon;
  } else if (typeof icon === 'string' && ICON_NODE_MAP[icon]) {
    iconData = ICON_NODE_MAP[icon];
  } else if (icon && typeof icon === 'object') {
    // If a React component function or object was passed, check displayName / name
    const compName = icon.displayName || icon.name || icon.render?.displayName || icon.render?.name;
    if (compName && ICON_NODE_MAP[compName]) {
      iconData = ICON_NODE_MAP[compName];
    }
  }

  // Fallback if not resolved
  if (!iconData) {
    iconData = Menu;
  }

  return (
    <MorphErrorBoundary
      fallback={
        <span
          className={`vt-morphing-icon-wrap vt-morph-fallback ${className}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 0,
            verticalAlign: 'middle',
            width: size,
            height: size,
            ...style,
          }}
        />
      }
    >
      <span
        className={`vt-morphing-icon-wrap ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 0,
          verticalAlign: 'middle',
          ...style,
        }}
      >
        <MorphIcon
          icon={iconData}
          size={size}
          color={color}
          strokeWidth={strokeWidth}
          spring={spring}
          {...props}
        />
      </span>
    </MorphErrorBoundary>
  );
}

export { MorphIcon, ICON_NODE_MAP };
