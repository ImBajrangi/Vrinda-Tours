import React, { useState, useRef, useEffect } from 'react';
import { ChevronsUpDown, Check, Sparkles } from 'lucide-react';
import './RichSelectDropdown.css';

/**
 * RichSelectDropdown - Luxury Editorial Dropdown Select
 * Supports title, description, custom badges, dark/light themes, and keyboard navigation.
 */
export default function RichSelectDropdown({
  label,
  placeholder = 'Select an option',
  options = [],
  value,
  onChange,
  theme = 'light', // 'light' | 'dark'
  className = '',
  disabled = false,
  error = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value || opt.id === value);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div
      className={`rich-select-wrapper ${theme} ${className} ${disabled ? 'disabled' : ''} ${error ? 'has-error' : ''}`}
      ref={dropdownRef}
    >
      {label && <label className="rich-select-label">{label}</label>}

      <button
        type="button"
        className={`rich-select-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <span className={`rich-select-trigger-text ${!selectedOption ? 'placeholder' : ''}`}>
          {selectedOption ? (selectedOption.label || selectedOption.title || selectedOption.name) : placeholder}
        </span>
        <ChevronsUpDown size={16} className={`rich-select-chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="rich-select-menu" role="listbox">
          {options.map((option) => {
            const optVal = option.value !== undefined ? option.value : option.id;
            const isSelected = selectedOption && (selectedOption.value === optVal || selectedOption.id === optVal);

            return (
              <div
                key={optVal}
                className={`rich-select-item ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  if (onChange) onChange(optVal, option);
                  setIsOpen(false);
                }}
                role="option"
                aria-selected={isSelected}
              >
                <div className="rich-select-item-header">
                  <div className="rich-select-item-title-row">
                    {option.icon && <span className="rich-select-item-icon">{option.icon}</span>}
                    <h5 className="rich-select-item-title">{option.label || option.title || option.name}</h5>
                  </div>
                  {isSelected && <Check size={15} className="rich-select-check-icon" />}
                </div>

                {(option.desc || option.description) && (
                  <p className="rich-select-item-desc">{option.desc || option.description}</p>
                )}

                {option.badge && (
                  <div className="rich-select-badge-wrap">
                    <span className={`rich-select-item-badge ${option.badgeColor || 'indigo'}`}>
                      {option.badgeIcon !== false && <Sparkles size={11} />}
                      <span>{option.badge}</span>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="rich-select-error-msg">{error}</p>}
    </div>
  );
}
