import React from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';

const SkipLink = () => {
  const { focusMainContent, announce } = useAccessibility();

  const handleSkipToMain = (e) => {
    e.preventDefault();
    focusMainContent();
    announce('Skipped to main content');
  };

  return (
    <a
      href="#main-content"
      className="skip-link"
      onClick={handleSkipToMain}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleSkipToMain(e);
        }
      }}
    >
      Skip to main content
    </a>
  );
};

export default SkipLink;
