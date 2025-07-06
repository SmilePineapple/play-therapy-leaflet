import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { dbHelpers } from '../lib/supabase';

const Home = () => {
  const { announce, focusFirstHeading } = useAccessibility();
  const [stats, setStats] = useState({
    totalSessions: 0,
    bookmarkedSessions: 0,
    unreadAnnouncements: 0
  });
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    focusFirstHeading();
    announce('Welcome to Communication Matters Conference');

    loadHomeData();
  }, [focusFirstHeading, announce]);

  const loadHomeData = async () => {
    try {
      // Load sessions count
      const { data: sessions } = await dbHelpers.getSessions();

      // Load recent announcements
      const { data: announcements } = await dbHelpers.getAnnouncements();

      // Get bookmarked sessions from Supabase
      const bookmarked = await dbHelpers.getUserBookmarks();

      // Get last read announcement timestamp
      const lastRead = localStorage.getItem('cm-last-read-announcement');
      const unreadCount = announcements?.filter(a =>
        !lastRead || new Date(a.created_at) > new Date(lastRead)
      ).length || 0;

      setStats({
        totalSessions: sessions?.length || 0,
        bookmarkedSessions: bookmarked.length,
        unreadAnnouncements: unreadCount
      });

      setRecentAnnouncements(announcements?.slice(0, 3) || []);

    } catch (error) {
      console.error('❌ Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Browse Programme',
      description: 'View all conference sessions and speakers',
      icon: '📅',
      link: '/programme',
      color: 'primary'
    },
    {
      title: 'My Agenda',
      description: `${stats.bookmarkedSessions} bookmarked sessions`,
      icon: '⭐',
      link: '/my-agenda',
      color: 'secondary',
      badge: stats.bookmarkedSessions > 0 ? stats.bookmarkedSessions : null
    },
    {
      title: 'Venue Map',
      description: 'Find your way around the conference venue',
      icon: '🗺️',
      link: '/map',
      color: 'primary'
    },
    {
      title: 'Latest News',
      description: 'Conference announcements and updates',
      icon: '📢',
      link: '/announcements',
      color: 'secondary',
      badge: stats.unreadAnnouncements > 0 ? stats.unreadAnnouncements : null
    }
  ];

  if (loading) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-xl) var(--spacing-md)' }}>
        <div className="loading-content" role="status" aria-live="polite">
          <h1>Loading Conference Information...</h1>
          <div className="loading-spinner" aria-hidden="true" />
        </div>
      </div>
    );
  }

  return (
    <div className="home-page" data-testid="homePage">
      <div className="container">
        {/* Hero Section */}
        <section className="hero-section" aria-labelledby="hero-title">
          <h1 id="hero-title" className="hero-title">
            Welcome to Communication Matters Conference 2025
          </h1>
          <p className="hero-subtitle">
            Your accessible guide to the AAC conference experience
          </p>

          {/* Conference Stats */}
          <div className="stats-grid" role="region" aria-label="Conference statistics">
            <div className="stat-card">
              <span className="stat-number" aria-label={`${stats.totalSessions} total sessions`}>
                {stats.totalSessions}
              </span>
              <span className="stat-label">Sessions</span>
            </div>
            <div className="stat-card">
              <span className="stat-number" aria-label={`${stats.bookmarkedSessions} bookmarked sessions`}>
                {stats.bookmarkedSessions}
              </span>
              <span className="stat-label">In My Agenda</span>
            </div>
            <div className="stat-card">
              <span className="stat-number" aria-label={`${stats.unreadAnnouncements} unread announcements`}>
                {stats.unreadAnnouncements}
              </span>
              <span className="stat-label">New Updates</span>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions" aria-labelledby="quick-actions-title" data-testid="quick-actions">
          <h2 id="quick-actions-title">Quick Access</h2>
          <div className="actions-grid">
            {quickActions.map((action, index) => (
              <Link
                key={action.link}
                to={action.link}
                className={`action-card btn-${action.color}`}
                onClick={() => {
                  announce(`Navigating to ${action.title}`);
                }}
                aria-describedby={`action-desc-${index}`}
              >
                <div className="action-icon" aria-hidden="true">
                  {action.icon}
                  {action.badge && (
                    <span className="action-badge" aria-label={`${action.badge} items`}>
                      {action.badge}
                    </span>
                  )}
                </div>
                <div className="action-content">
                  <h3 className="action-title">{action.title}</h3>
                  <p id={`action-desc-${index}`} className="action-description">
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Announcements */}
        {recentAnnouncements.length > 0 && (
          <section className="recent-announcements" aria-labelledby="announcements-title" data-testid="recent-announcements">
            <h2 id="announcements-title">Latest Updates</h2>
            <div className="announcements-list">
              {recentAnnouncements.map((announcement, index) => (
                <article key={announcement.id} className="announcement-card">
                  <h3 className="announcement-title">{announcement.title}</h3>
                  <p className="announcement-content">
                    {announcement.content.length > 150
                      ? `${announcement.content.substring(0, 150)}...`
                      : announcement.content
                    }
                  </p>
                  <time className="announcement-time" dateTime={announcement.created_at}>
                    {new Date(announcement.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </time>
                </article>
              ))}
            </div>
            <Link to="/announcements" className="btn btn-outline">
              View All Announcements
            </Link>
          </section>
        )}

        {/* Accessibility Info */}
        <section className="accessibility-info" aria-labelledby="accessibility-title">
          <h2 id="accessibility-title">Accessibility Features</h2>
          <div className="accessibility-grid">
            <div className="accessibility-feature">
              <span className="feature-icon" aria-hidden="true">🎨</span>
              <h3>High Contrast Mode</h3>
              <p>Toggle high contrast colors in the header for better visibility</p>
            </div>
            <div className="accessibility-feature">
              <span className="feature-icon" aria-hidden="true">📝</span>
              <h3>Adjustable Text Size</h3>
              <p>Change text size using the controls in the header</p>
            </div>
            <div className="accessibility-feature">
              <span className="feature-icon" aria-hidden="true">⌨️</span>
              <h3>Keyboard Navigation</h3>
              <p>Navigate using Tab, Enter, and arrow keys throughout the app</p>
            </div>
            <div className="accessibility-feature">
              <span className="feature-icon" aria-hidden="true">🔊</span>
              <h3>Screen Reader Support</h3>
              <p>Optimized for VoiceOver, NVDA, and other screen readers</p>
            </div>
          </div>
        </section>
      </div>

    </div>
  );
};

export default Home;
