import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('off');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

  // Load accessibility preferences from localStorage
  useEffect(() => {

    const savedHighContrast = localStorage.getItem('cm-high-contrast') === 'true';
    const savedFontSize = localStorage.getItem('cm-font-size') || 'off';
    const savedReducedMotion = localStorage.getItem('cm-reduced-motion') === 'true';

    setHighContrast(savedHighContrast);
    setFontSize(savedFontSize);
    setReducedMotion(savedReducedMotion);

    // Check for system preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion && !savedReducedMotion) {
      setReducedMotion(true);
      localStorage.setItem('cm-reduced-motion', 'true');
    }
  }, []);

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // High contrast mode
    if (highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }

    // Font size
    body.classList.remove('font-small', 'font-off', 'font-large', 'font-xl');
    body.classList.add(`font-${fontSize}`);

    // Reduced motion
    if (reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms');
      root.style.setProperty('--transition-duration', '0.01ms');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }
  }, [highContrast, fontSize, reducedMotion]);

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem('cm-high-contrast', newValue.toString());

    // Announce change to screen readers
    announce(`High contrast mode ${newValue ? 'enabled' : 'disabled'}`);
  };

  const changeFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem('cm-font-size', size);
    announce(`Font size changed to ${size}`);
  };

  const toggleReducedMotion = () => {
    const newValue = !reducedMotion;
    setReducedMotion(newValue);
    localStorage.setItem('cm-reduced-motion', newValue.toString());
    announce(`Reduced motion ${newValue ? 'enabled' : 'disabled'}`);
  };

  // Screen reader announcements
  const announce = useCallback((message, priority = 'polite') => {

    const announcement = {
      id: Date.now(),
      message,
      priority,
      timestamp: new Date()
    };

    setAnnouncements(prev => [...prev, announcement]);

    // Update live region
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.textContent = message;

      // Clear after announcement
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }

    // Clean up old announcements
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
    }, 5000);
  }, []);

  // Focus management
  const focusMainContent = useCallback(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      announce('Main content focused');
    }
  }, [announce]);

  const focusFirstHeading = useCallback(() => {
    const firstHeading = document.querySelector('main h1, main h2');
    if (firstHeading) {
      firstHeading.setAttribute('tabindex', '-1');
      firstHeading.focus();
      announce(`Focused on ${firstHeading.textContent}`);
    }
  }, [announce]);

  // Keyboard navigation helpers
  const handleKeyboardNavigation = (event, options = {}) => {
    const { onEscape, onEnter, onArrowUp, onArrowDown, onArrowLeft, onArrowRight } = options;

    switch (event.key) {
      case 'Escape':
        if (onEscape) {
          onEscape(event);
        }
        break;
      case 'Enter':
        if (onEnter) {
          onEnter(event);
        }
        break;
      case 'ArrowUp':
        if (onArrowUp) {
          event.preventDefault();
          onArrowUp(event);
        }
        break;
      case 'ArrowDown':
        if (onArrowDown) {
          event.preventDefault();
          onArrowDown(event);
        }
        break;
      case 'ArrowLeft':
        if (onArrowLeft) {
          event.preventDefault();
          onArrowLeft(event);
        }
        break;
      case 'ArrowRight':
        if (onArrowRight) {
          event.preventDefault();
          onArrowRight(event);
        }
        break;
      default:
        break;
    }
  };

  const value = {
    // State
    highContrast,
    fontSize,
    reducedMotion,
    announcements,

    // Actions
    toggleHighContrast,
    changeFontSize,
    toggleReducedMotion,
    announce,
    focusMainContent,
    focusFirstHeading,
    handleKeyboardNavigation
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// PropTypes validation
AccessibilityProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default AccessibilityContext;
