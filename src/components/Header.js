import React, { useState } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';

const Header = () => {
  const {
    highContrast,
    fontSize,
    toggleHighContrast,
    changeFontSize,
    announce
  } = useAccessibility();

  const [controlsExpanded, setControlsExpanded] = useState(false);

  const handleAccessibilityChange = (action, description) => {
    action();
    announce(description);
  };

  return (
    <header className="header" role="banner">
      <div className="container">
        <div className="header-content">
          {/* Logo and Title */}
          <div className="header-brand">
            <h1 className="header-title">
              <span className="sr-only">Communication Matters</span>
              <span aria-hidden="true">CM</span> Conference 2025
            </h1>
            <p className="header-subtitle">AAC Conference App</p>
          </div>

          {/* Accessibility Controls */}
          <div className="header-controls-wrapper">
            {/* Toggle Button */}
            <button
              className="accessibility-toggle"
              onClick={() => {
                setControlsExpanded(!controlsExpanded);
                announce(`Accessibility controls ${!controlsExpanded ? 'expanded' : 'collapsed'}`);
              }}
              aria-expanded={controlsExpanded}
              aria-controls="accessibility-controls"
              title={`${controlsExpanded ? 'Hide' : 'Show'} accessibility controls`}
            >
              <span className="toggle-icon" aria-hidden="true">
                {controlsExpanded ? '🔼' : '⚙️'}
              </span>
              <span className="toggle-text">
                {controlsExpanded ? 'Hide' : 'Settings'}
              </span>
            </button>

            {/* Collapsible Controls */}
            <div
               id="accessibility-controls"
               className={`header-controls ${controlsExpanded ? 'expanded' : 'collapsed'}`}
               role="toolbar"
               aria-label="Accessibility controls"
               aria-hidden={!controlsExpanded}
            >
              <div className="control-group">
                <span className="control-label" id="contrast-label">Display:</span>
                <button
                  className={`btn btn-outline ${highContrast ? 'active' : ''}`}
                  onClick={() => handleAccessibilityChange(
                    toggleHighContrast,
                    `High contrast mode ${!highContrast ? 'enabled' : 'disabled'}`
                  )}
                  aria-labelledby="contrast-label"
                  aria-pressed={highContrast}
                  title={`${highContrast ? 'Disable' : 'Enable'} high contrast mode`}
                  tabIndex={controlsExpanded ? 0 : -1}
                >
                  <span aria-hidden="true">🎨</span>
                  {highContrast ? 'Off' : 'High Contrast'}
                </button>
              </div>

              <div className="control-group">
                <span className="control-label" id="font-label">Text Size:</span>
                <div className="font-size-controls" role="radiogroup" aria-labelledby="font-label">
                  {['small', 'off', 'large', 'xl'].map((size) => (
                    <button
                      key={size}
                      className={`btn btn-outline ${fontSize === size ? 'active' : ''}`}
                      onClick={() => handleAccessibilityChange(
                        () => changeFontSize(size),
                        `Font size changed to ${size}`
                      )}
                      role="radio"
                      aria-checked={fontSize === size}
                      title={`Set font size to ${size}`}
                      tabIndex={controlsExpanded ? 0 : -1}
                    >
                      <span className={`font-demo font-${size}`}>A</span>
                      <span className="sr-only">{size}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </header>
  );
};

export default Header;
