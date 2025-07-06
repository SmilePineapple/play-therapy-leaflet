import React, { useState, useEffect, useCallback } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { dbHelpers, subscriptions } from '../lib/supabase';
import { trackAnnouncementView } from '../utils/analytics';
import Loading from '../components/Loading';
import styles from './News.module.css';

const News = () => {
  const { announce, focusFirstHeading } = useAccessibility();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'urgent', 'general', 'schedule'
  const [readAnnouncements, setReadAnnouncements] = useState([]);
  const [expandedAnnouncement, setExpandedAnnouncement] = useState(null);

  const loadAnnouncements = useCallback(async () => {
    try {
      const { data, error } = await dbHelpers.getAnnouncements();

      if (error) {
        console.error('❌ Error loading announcements:', error);
        announce('Error loading announcements');
        return;
      }

      // Sort announcements by priority and date
      const sortedAnnouncements = (data || []).sort((a, b) => {
        // Urgent announcements first
        if (a.priority === 'urgent' && b.priority !== 'urgent') {
          return -1;
        }
        if (b.priority === 'urgent' && a.priority !== 'urgent') {
          return 1;
        }

        // Then by date (newest first)
        return new Date(b.created_at) - new Date(a.created_at);
      });

      setAnnouncements(sortedAnnouncements);

    } catch (error) {
      console.error('❌ Error loading announcements:', error);
      announce('Error loading announcements');
    } finally {
      setLoading(false);
    }
  }, [announce]);

  useEffect(() => {
    const initializeData = async () => {
      focusFirstHeading();
      announce('Conference news and announcements page loaded');

      await loadReadStatus();
      await loadAnnouncements();
    };

    initializeData();

    // Set up real-time subscription for new announcements
    const unsubscribe = subscriptions.subscribeToAnnouncements((newAnnouncement) => {
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      announce(`New announcement: ${newAnnouncement.title}`);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [announce, focusFirstHeading, loadAnnouncements]);

  const loadReadStatus = async () => {
    try {
      const { data, error } = await dbHelpers.getUserReadAnnouncements();

      if (error) {
        console.error('❌ Error loading read status:', error);
        // Fallback to localStorage for backward compatibility
        const readIds = JSON.parse(localStorage.getItem('cm-read-announcements') || '[]');
        setReadAnnouncements(readIds);
        return;
      }

      setReadAnnouncements(data || []);
    } catch (error) {
      console.error('❌ Exception loading read status:', error);
      // Fallback to localStorage
      const readIds = JSON.parse(localStorage.getItem('cm-read-announcements') || '[]');
      setReadAnnouncements(readIds);
    }
  };

  const markAsRead = async (announcementId) => {
    if (!readAnnouncements.includes(announcementId)) {
      try {
        const { success, error } = await dbHelpers.markAnnouncementAsRead(announcementId);

        if (success) {
          const newReadIds = [...readAnnouncements, announcementId];
          setReadAnnouncements(newReadIds);
        } else {
          console.error('❌ Failed to mark as read in database:', error);
          // Fallback to localStorage
          const newReadIds = [...readAnnouncements, announcementId];
          setReadAnnouncements(newReadIds);
          localStorage.setItem('cm-read-announcements', JSON.stringify(newReadIds));
        }
      } catch (error) {
        console.error('❌ Exception marking as read:', error);
        // Fallback to localStorage
        const newReadIds = [...readAnnouncements, announcementId];
        setReadAnnouncements(newReadIds);
        localStorage.setItem('cm-read-announcements', JSON.stringify(newReadIds));
      }
    }
  };

  const markAllAsRead = async () => {
    const allIds = filteredAnnouncements.map(a => a.id);
    const unreadIds = allIds.filter(id => !readAnnouncements.includes(id));

    if (unreadIds.length === 0) {
      announce('All announcements are already marked as read');
      return;
    }

    try {
      const { success, error } = await dbHelpers.markAllAnnouncementsAsRead(unreadIds);

      if (success) {
        const newReadIds = [...new Set([...readAnnouncements, ...allIds])];
        setReadAnnouncements(newReadIds);
        announce(`${unreadIds.length} announcements marked as read`);
      } else {
        console.error('❌ Failed to mark all as read in database:', error);
        // Fallback to localStorage
        const newReadIds = [...new Set([...readAnnouncements, ...allIds])];
        setReadAnnouncements(newReadIds);
        localStorage.setItem('cm-read-announcements', JSON.stringify(newReadIds));
        announce('All visible announcements marked as read (offline mode)');
      }
    } catch (error) {
      console.error('❌ Exception marking all as read:', error);
      // Fallback to localStorage
      const newReadIds = [...new Set([...readAnnouncements, ...allIds])];
      setReadAnnouncements(newReadIds);
      localStorage.setItem('cm-read-announcements', JSON.stringify(newReadIds));
      announce('All visible announcements marked as read (offline mode)');
    }
  };

  const toggleExpanded = async (announcementId) => {
    setExpandedAnnouncement(prev => prev === announcementId ? null : announcementId);
    await markAsRead(announcementId);

    const announcement = announcements.find(a => a.id === announcementId);
    if (announcement) {
      announce(expandedAnnouncement === announcementId
        ? 'Announcement collapsed'
        : `Expanded announcement: ${announcement.title}`
      );
    }
  };

  // Track announcement interactions for analytics
  const trackAnnouncementInteraction = (announcement, action) => {
    trackAnnouncementView(announcement.id);
  };

  // Filter announcements based on selected filter
  const filteredAnnouncements = announcements.filter(announcement => {
    if (filter === 'all') {
      return true;
    }
    return announcement.priority === filter || announcement.category === filter;
  });

  const unreadCount = filteredAnnouncements.filter(a => !readAnnouncements.includes(a.id)).length;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor((now - date) / (1000 * 60));
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return '🚨';
      case 'important': return '⚠️';
      default: return '📢';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'schedule': return '📅';
      case 'venue': return '📍';
      case 'technical': return '💻';
      case 'catering': return '🍽️';
      case 'transport': return '🚌';
      default: return '📢';
    }
  };

  if (loading) {
    return (
      <Loading
        message="Loading Conference News..."
        size="large"
      />
    );
  }

  return (
    <div className={styles.newsPage} data-testid="news-page">
      <div className="container">
        <header className={styles.pageHeader}>
          <h1>Conference News & Announcements</h1>
          <p className={styles.pageDescription}>
            Stay updated with the latest conference information, schedule changes, and important announcements.
          </p>
        </header>

        {/* Summary Stats */}
        <section className={styles.newsStats} aria-labelledby="stats-title">
          <h2 id="stats-title" className="sr-only">Announcement Statistics</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{announcements.length}</span>
              <span className={styles.statLabel}>Total Announcements</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{unreadCount}</span>
              <span className={styles.statLabel}>Unread</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{announcements.filter(a => a.priority === 'urgent').length}</span>
              <span className={styles.statLabel}>Urgent</span>
            </div>
          </div>
        </section>

        {/* Filters and Actions */}
        <section className={styles.newsControls} aria-labelledby="controls-title">
          <h2 id="controls-title" className="sr-only">Filter and Actions</h2>

          <div className={styles.controlsGrid}>
            {/* Filter Buttons */}
            <div className={styles.filterGroup} data-testid="filter-options">
              <fieldset className={styles.filterFieldset}>
                <legend className={styles.filterLegend}>Filter Announcements</legend>
                <div className={styles.filterButtons}>
                  {[
                    { value: 'all', label: 'All', icon: '📢' },
                    { value: 'urgent', label: 'Urgent', icon: '🚨' },
                    { value: 'schedule', label: 'Schedule', icon: '📅' },
                    { value: 'venue', label: 'Venue', icon: '📍' },
                    { value: 'general', label: 'General', icon: 'ℹ️' }
                  ].map(filterOption => (
                    <button
                      key={filterOption.value}
                      onClick={() => setFilter(filterOption.value)}
                      className={`${styles.filterBtn} ${filter === filterOption.value ? styles.active : ''}`}
                      aria-pressed={filter === filterOption.value}
                      data-testid={`filter-${filterOption.value}`}
                    >
                      <span aria-hidden="true">{filterOption.icon}</span>
                      {filterOption.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>

            {/* Actions */}
            <div className={styles.actionsGroup}>
              <button
                onClick={markAllAsRead}
                className="btn btn-secondary"
                disabled={unreadCount === 0}
              >
                📖 Mark All Read
              </button>
              <button
                onClick={loadAnnouncements}
                className="btn btn-outline"
                title="Refresh announcements"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* Results Info */}
          <div className={styles.resultsInfo} role="status" aria-live="polite">
            Showing {filteredAnnouncements.length} announcement{filteredAnnouncements.length !== 1 ? 's' : ''}
            {unreadCount > 0 && ` (${unreadCount} unread)`}
          </div>
        </section>

        {/* Announcements List */}
        <section className={styles.announcementsSection} aria-labelledby="announcements-title">
          <h2 id="announcements-title" className="sr-only">Announcements List</h2>

          {filteredAnnouncements.length === 0 ? (
            <div className={styles.noAnnouncements} data-testid="empty-announcements">
              <h3>No announcements found</h3>
              <p>There are no announcements matching your current filter.</p>
              <button onClick={() => setFilter('all')} className="btn btn-primary">
                Show All Announcements
              </button>
            </div>
          ) : (
            <div className={styles.announcementsList} data-testid="announcements-list">
              {filteredAnnouncements.map((announcement) => {
                const isRead = readAnnouncements.includes(announcement.id);
                const isExpanded = expandedAnnouncement === announcement.id;

                return (
                  <article
                    key={announcement.id}
                    className={`${styles.announcementCard} ${!isRead ? styles.unread : ''} ${announcement.priority === 'urgent' ? styles.urgent : ''}`}
                  >
                    <header className={styles.announcementHeader}>
                      <div className={styles.announcementMeta}>
                        <span className={styles.priorityIcon} aria-hidden="true">
                          {getPriorityIcon(announcement.priority)}
                        </span>
                        <span className={styles.categoryIcon} aria-hidden="true">
                          {getCategoryIcon(announcement.category)}
                        </span>
                        <time className={styles.announcementTime} dateTime={announcement.created_at}>
                          {formatDate(announcement.created_at)}
                        </time>
                        {!isRead && (
                          <span className={styles.unreadIndicator} aria-label="Unread">
                            🔵
                          </span>
                        )}
                      </div>

                      <h3 className={styles.announcementTitle}>
                        {announcement.title}
                      </h3>

                      {announcement.priority === 'urgent' && (
                        <div className={styles.urgentBanner} role="alert">
                          🚨 URGENT ANNOUNCEMENT
                        </div>
                      )}
                    </header>

                    <div className={styles.announcementContent}>
                      <div
                        id={`announcement-${announcement.id}-summary`}
                        className={styles.announcementSummary}
                      >
                        {announcement.summary || announcement.content?.substring(0, 150) + '...'}
                      </div>

                      {(() => {
                        // Show Read More button if:
                        // 1. There's content that's longer than what's shown in summary, OR
                        // 2. There's both summary and content (and they're different)
                        const hasLongContent = announcement.content && announcement.content.length > 150;
                        const hasSeparateSummary = announcement.summary && announcement.content &&
                          announcement.summary !== announcement.content &&
                          announcement.summary !== announcement.content.substring(0, 150) + '...';
                        return hasLongContent || hasSeparateSummary;
                      })() && (
                        <div className={styles.announcementActions}>
                          <button
                            onClick={async () => {
                              await toggleExpanded(announcement.id);
                            }}
                            className={`${styles.accessibleButton} ${styles.expandButton}`}
                            aria-expanded={isExpanded}
                            aria-label={isExpanded ? `Collapse full content for ${announcement.title}` : `Read full content for ${announcement.title}`}
                            aria-describedby={`announcement-${announcement.id}-summary`}
                          >
                            <span className={styles.buttonIcon} aria-hidden="true">
                              {isExpanded ? '📖' : '👁️'}
                            </span>
                            <span className={styles.buttonText}>
                              {isExpanded ? 'Show Less' : 'Read More'}
                            </span>
                            <span className={styles.buttonArrow} aria-hidden="true">
                              {isExpanded ? '▲' : '▼'}
                            </span>
                          </button>
                        </div>
                      )}

                      {isExpanded && (
                        <div
                          id={`announcement-${announcement.id}-content`}
                          className={styles.announcementFullContent}
                        >
                          <div className={styles.fullContentText}>
                            {announcement.content}
                          </div>

                          {announcement.action_url && (
                            <div className={styles.announcementAction}>
                              <a
                                href={announcement.action_url}
                                className="btn btn-primary"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {announcement.action_text || 'Learn More'}
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <footer className={styles.announcementFooter}>
                      <div className={styles.announcementTags}>
                        {announcement.priority && (
                          <span className={`${styles.tag} ${styles[`priority${announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}`]}`}>
                            {announcement.priority}
                          </span>
                        )}
                        {announcement.category && (
                          <span className={`${styles.tag} ${styles[`category${announcement.category.charAt(0).toUpperCase() + announcement.category.slice(1)}`]}`}>
                            {announcement.category}
                          </span>
                        )}
                      </div>

                      <div className={styles.announcementFooterActions}>
                        {!isRead && (
                          <button
                            onClick={() => markAsRead(announcement.id)}
                            className="btn btn-sm btn-outline"
                          >
                            ✓ Mark as Read
                          </button>
                        )}

                        {announcement.action_url && !isExpanded && (
                          <a
                            href={announcement.action_url}
                            className="btn btn-sm btn-primary"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {announcement.action_text || 'Learn More'}
                          </a>
                        )}
                      </div>
                    </footer>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Modal removed as requested */}
    </div>
  );
};

export default News;
