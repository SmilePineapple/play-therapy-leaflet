import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { dbHelpers } from '../lib/supabase';

const Navigation = () => {
  const location = useLocation();
  const { announce, handleKeyboardNavigation } = useAccessibility();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigationItems = [
    { path: '/', label: 'Home', icon: '🏠', description: 'Conference home page' },
    { path: '/programme', label: 'Programme', icon: '📅', description: 'Conference schedule and sessions' },
    { path: '/my-agenda', label: 'My Agenda', icon: '⭐', description: 'Your bookmarked sessions' },
    { path: '/map', label: 'Map', icon: '🗺️', description: 'Venue map and directions' },
    { path: '/announcements', label: 'News', icon: '📢', description: 'Latest announcements', hasNotification: true },
    { path: '/qa', label: 'Q&A', icon: '❓', description: 'Questions and answers' },
    { path: '/sponsors', label: 'Sponsors', icon: '🏢', description: 'Conference sponsors' }
  ];

  // Load unread announcement count
  const loadUnreadCount = async () => {
    try {
      const { data: announcements, error: announcementsError } = await dbHelpers.getAnnouncements();
      if (announcementsError) {
        console.error('Error loading announcements for count:', announcementsError);
        return;
      }

      const { data: readAnnouncements, error: readError } = await dbHelpers.getUserReadAnnouncements();
      if (readError) {
        console.error('Error loading read announcements for count:', readError);
        return;
      }

      const readIds = readAnnouncements || [];
      const unreadAnnouncements = announcements.filter(announcement =>
        !readIds.includes(announcement.id)
      );

      setUnreadCount(unreadAnnouncements.length);
    } catch (error) {
      console.error('Exception loading unread count:', error);
    }
  };

  useEffect(() => {
    loadUnreadCount();

    // Refresh count when returning to announcements page
    const handleVisibilityChange = () => {
      if (!document.hidden && location.pathname === '/announcements') {
        setTimeout(loadUnreadCount, 500); // Small delay to allow for any pending updates
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    const newState = !mobileMenuOpen;
    setMobileMenuOpen(newState);
    announce(`Mobile menu ${newState ? 'opened' : 'closed'}`);
  };

  const handleNavClick = (item) => {
    setMobileMenuOpen(false);
    announce(`Navigating to ${item.label}`);
  };

  const handleKeyDown = (event, item) => {
    handleKeyboardNavigation(event, {
      onEnter: () => handleNavClick(item),
      onEscape: () => {
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          announce('Mobile menu closed');
        }
      }
    });
  };

  return (
    <nav className="navigation" role="navigation" aria-label="Main navigation">
      <div className="container">
        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-button"
          onClick={toggleMobileMenu}
          aria-expanded={mobileMenuOpen}
          aria-controls="main-nav-list"
          aria-label="Toggle navigation menu"
        >
          <span className="hamburger-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="mobile-menu-text">
            {mobileMenuOpen ? 'Close Menu' : 'Menu'}
          </span>
        </button>

        {/* Navigation List */}
        <ul
          id="main-nav-list"
          className={`nav-list ${mobileMenuOpen ? 'mobile-open' : ''}`}
          role="menubar"
        >
          {navigationItems.map((item, index) => {
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path} className="nav-item" role="none">
                <Link
                  to={item.path}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    handleNavClick(item);
                    if (item.path === '/announcements') {
                      // Refresh count after navigating to announcements
                      setTimeout(loadUnreadCount, 1000);
                    }
                  }}
                  onKeyDown={(e) => handleKeyDown(e, item)}
                  role="menuitem"
                  aria-current={isActive ? 'page' : undefined}
                  aria-describedby={`nav-desc-${index}`}
                  tabIndex={mobileMenuOpen || window.innerWidth > 768 ? 0 : -1}
                >
                  <span className="nav-icon-container" style={{ position: 'relative', display: 'inline-block' }}>
                    <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                    {item.hasNotification && unreadCount > 0 && (
                      <span
                        className="notification-badge"
                        aria-label={`${unreadCount} unread announcements`}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          borderRadius: '50%',
                          minWidth: '18px',
                          height: '18px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid white',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                        }}
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </span>
                  <span className="nav-text">{item.label}</span>
                  {isActive && <span className="sr-only">(current page)</span>}
                </Link>
                <div id={`nav-desc-${index}`} className="sr-only">
                  {item.description}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

    </nav>
  );
};

export default Navigation;
