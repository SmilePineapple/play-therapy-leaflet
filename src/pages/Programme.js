import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { dbHelpers } from '../lib/supabase';
import { trackBookmarkAdd, trackBookmarkRemove } from '../utils/analytics';
import { mockSessions } from '../data/mockSessions.js';

const Programme = () => {
  const { announce, focusFirstHeading } = useAccessibility();
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    day: 'all',
    track: 'all',
    search: ''
  });
  const [bookmarkedSessions, setBookmarkedSessions] = useState([]);

  const loadSessions = useCallback(async () => {
    try {
      // Try to load from Supabase first, fallback to mock data
      const { data, error } = await dbHelpers.getSessions();

      let sessionsData;
      if (error || !data || data.length === 0) {
        sessionsData = mockSessions;
        announce('Conference programme loaded from local data');
      } else {
        sessionsData = data;
        announce('Conference programme loaded from database');
      }

      // Sort sessions by track number
      const sortedSessions = (sessionsData || []).sort((a, b) => {


        // Custom track sorting function
        const getTrackSortValue = (track) => {
          if (!track) return [999, 0]; // Default for missing tracks

          // Handle letter-prefixed tracks (P1, P2, etc.) - these should come after numbered tracks
          if (track.match(/^[A-Za-z]/)) {
            const num = parseFloat(track.replace(/[^0-9.]/g, '') || '999');
            return [1000 + num, 0]; // Add 1000 to put letter tracks after numbered tracks
          }

          // Handle decimal tracks (1.1, 1.2, 2.1, etc.)
          if (track.includes('.')) {
            const [major, minor] = track.split('.');
            return [parseFloat(major) || 0, parseFloat(minor) || 0];
          }

          // Handle simple number tracks
          return [parseFloat(track) || 0, 0];
        };

        const [majorA, minorA] = getTrackSortValue(a.track);
        const [majorB, minorB] = getTrackSortValue(b.track);


        // Sort by major track number first
        if (majorA !== majorB) {
          return majorA - majorB;
        }

        // If major tracks are the same, sort by minor track number
        if (minorA !== minorB) {
          return minorA - minorB;
        }

        // If tracks are the same, sort by time as secondary sort
        let dateA, dateB;

        if (a.start_time) {
          dateA = new Date(a.start_time);
        } else if (a.formatted_time) {
          // Parse from formatted_time like "2025-09-08T11:15:00 - 2025-09-08T12:00:00"
          const startTimeStr = a.formatted_time.split(' - ')[0];
          dateA = new Date(startTimeStr);
        } else if (a.time) {
          // Parse from time like "11.15 - 12.00" and combine with date
          const timeStr = a.time.split(' - ')[0];
          const [hour, minute] = timeStr.split('.').map(Number);
          dateA = new Date(2025, 8, 8, hour, minute); // September 8, 2025 (month is 0-indexed)
        } else {
          dateA = new Date(0); // fallback
        }

        if (b.start_time) {
          dateB = new Date(b.start_time);
        } else if (b.formatted_time) {
          const startTimeStr = b.formatted_time.split(' - ')[0];
          dateB = new Date(startTimeStr);
        } else if (b.time) {
          const timeStr = b.time.split(' - ')[0];
          const [hour, minute] = timeStr.split('.').map(Number);
          dateB = new Date(2025, 8, 8, hour, minute);
        } else {
          dateB = new Date(0);
        }

        return dateA - dateB;
      });

      setSessions(sortedSessions);

    } catch (error) {
      console.error('❌ Error loading sessions, using mock data:', error);
      setSessions(mockSessions);
      announce('Conference programme loaded from local data');
    } finally {
      setLoading(false);
    }
  }, [announce]);

  const loadBookmarks = useCallback(async () => {
    try {
      const { data: bookmarkIds, error } = await dbHelpers.getUserBookmarks();
      if (error) {
        console.error('❌ Error loading bookmarks from Supabase:', error);
        setBookmarkedSessions([]);
        return;
      }

      setBookmarkedSessions(Array.isArray(bookmarkIds) ? bookmarkIds : []);
    } catch (error) {
      console.error('❌ Error loading bookmarks:', error);
      setBookmarkedSessions([]);
    }
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...sessions];

    // Filter by day
    if (filters.day !== 'all') {
      filtered = filtered.filter(session => {
        let sessionDate;
        if (session.start_time) {
          sessionDate = new Date(session.start_time).toDateString();
        } else if (session.formatted_time) {
          const startTimeStr = session.formatted_time.split(' - ')[0];
          sessionDate = new Date(startTimeStr).toDateString();
        } else {
          // Fallback to a default date for sessions without proper date info
          sessionDate = new Date(2025, 8, 8).toDateString(); // September 8, 2025
        }
        return sessionDate === filters.day;
      });
    }

    // Filter by track
    if (filters.track !== 'all') {
      filtered = filtered.filter(session =>
        session.track?.toLowerCase() === filters.track.toLowerCase()
      );
    }

    // Filter by search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(session =>
        session.title?.toLowerCase().includes(searchTerm) ||
        session.abstract?.toLowerCase().includes(searchTerm) ||
        session.speaker?.toLowerCase().includes(searchTerm) ||
        session.category?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredSessions(filtered);

    // Announce filter results
    const resultCount = filtered.length;
    announce(`${resultCount} session${resultCount !== 1 ? 's' : ''} found`);
  }, [sessions, filters, announce]);

  useEffect(() => {
    const initializePage = async () => {
      focusFirstHeading();
      announce('Programme page loaded');

      await loadSessions();
      await loadBookmarks();
    };

    initializePage();
  }, [announce, focusFirstHeading, loadSessions, loadBookmarks]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const toggleBookmark = async (sessionId) => {
    const isCurrentlyBookmarked = bookmarkedSessions.includes(sessionId);

    try {
      let result;
      if (isCurrentlyBookmarked) {
        result = await dbHelpers.removeBookmark(sessionId);
      } else {
        result = await dbHelpers.addBookmark(sessionId);
      }

      if (result.error) {
        console.error('❌ Error toggling bookmark:', result.error);
        return;
      }

      // Track the bookmark action
      if (isCurrentlyBookmarked) {
        trackBookmarkRemove(sessionId, 'session');
      } else {
        trackBookmarkAdd(sessionId, 'session');
      }

      // Update local state only if Supabase operation succeeded
      setBookmarkedSessions(prev => {
        if (isCurrentlyBookmarked) {
          const newBookmarks = prev.filter(id => id !== sessionId);
          return newBookmarks;
        } else {
          const newBookmarks = [...prev, sessionId];
          return newBookmarks;
        }
      });

    } catch (error) {
      console.error('❌ Error toggling bookmark:', error);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
    setFilters({ day: 'all', track: 'all', search: '' });
    announce('Filters cleared');
  };

  // Get unique days and tracks for filter options
  const uniqueDays = [...new Set(sessions.map(session => {
    if (session.start_time) {
      return new Date(session.start_time).toDateString();
    } else if (session.formatted_time) {
      const startTimeStr = session.formatted_time.split(' - ')[0];
      return new Date(startTimeStr).toDateString();
    } else {
      return new Date(2025, 8, 8).toDateString(); // September 8, 2025
    }
  }))].sort();

  const uniqueTracks = [...new Set(sessions.map(session => session.track).filter(Boolean))].sort();

  const formatTime = (dateInput) => {


    // Handle null/undefined inputs
    if (!dateInput) {

      return '--:--';
    }

    let date;

    // If input is already a Date object, use it directly
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      // Parse the datetime string as local time to avoid timezone conversion
      // If the string doesn't have timezone info, treat it as local time
      if (dateInput.includes('T') && !dateInput.includes('Z') && !dateInput.includes('+')) {
        // Parse as local time by manually extracting components
        const [datePart, timePart] = dateInput.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hour, minute] = timePart.split(':').map(Number);
        date = new Date(year, month - 1, day, hour, minute);
      } else {
        date = new Date(dateInput);
      }
    } else {

      return '--:--';
    }

    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateInput) => {


    // Handle null/undefined inputs
    if (!dateInput) {

      return 'Invalid Date';
    }

    let date;

    // If input is already a Date object, use it directly
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      // Parse the datetime string as local time to avoid timezone conversion
      if (dateInput.includes('T') && !dateInput.includes('Z') && !dateInput.includes('+')) {
        // Parse as local time by manually extracting components
        const [datePart, timePart] = dateInput.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hour, minute] = timePart ? timePart.split(':').map(Number) : [0, 0];
        date = new Date(year, month - 1, day, hour, minute);
      } else {
        date = new Date(dateInput);
      }
    } else {

      return 'Invalid Date';
    }

    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-xl) var(--spacing-md)' }}>
        <div className="loading-content" role="status" aria-live="polite">
          <h1>Loading Conference Programme...</h1>
          <div className="loading-spinner" aria-hidden="true" />
        </div>
      </div>
    );
  }

  return (
    <div className="programme-page" data-testid="programme-page">
      <div className="container">
        <header className="page-header">
          <h1>Conference Programme</h1>
          <p className="page-description">
            Browse all conference sessions, bookmark your favorites, and build your personal agenda.
          </p>
        </header>

        {/* Filters */}
        <section className="filters-section" aria-labelledby="filters-title" data-testid="filter-sort-options">
          <h2 id="filters-title" className="sr-only">Filter Sessions</h2>

          <div className="filters-grid">
            {/* Search */}
            <div className="filter-group">
              <label htmlFor="search-input" className="filter-label">
                Search Sessions
              </label>
              <input
                id="search-input"
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by title, description, or speaker..."
                className="filter-input"
                aria-describedby="search-help"
              />
              <div id="search-help" className="sr-only">
                Search through session titles, descriptions, and speaker names
              </div>
            </div>

            {/* Day Filter */}
            <div className="filter-group">
              <label htmlFor="day-filter" className="filter-label">
                Conference Day
              </label>
              <select
                id="day-filter"
                value={filters.day}
                onChange={(e) => handleFilterChange('day', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Days</option>
                {uniqueDays.map(day => (
                  <option key={day} value={day}>
                    {formatDate(day)}
                  </option>
                ))}
              </select>
            </div>

            {/* Track Filter */}
            <div className="filter-group">
              <label htmlFor="track-filter" className="filter-label">
                Session Track
              </label>
              <select
                id="track-filter"
                value={filters.track}
                onChange={(e) => handleFilterChange('track', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Tracks</option>
                {uniqueTracks.map(track => (
                  <option key={track} value={track}>
                    {track}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="filter-group">
              <button
                onClick={clearFilters}
                className="btn btn-outline"
                disabled={filters.day === 'all' && filters.track === 'all' && !filters.search}
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="results-info" role="status" aria-live="polite">
            Showing {filteredSessions.length} of {sessions.length} sessions
          </div>
        </section>

        {/* Sessions List */}
        <section className="sessions-section" aria-labelledby="sessions-title">
          <h2 id="sessions-title" className="sr-only">Session List</h2>

          {filteredSessions.length === 0 ? (
            <div className="no-results" role="status" data-testid="empty-sessions">
              <h3>No sessions found</h3>
              <p>Try adjusting your filters or search terms.</p>
              <button onClick={clearFilters} className="btn btn-primary">
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="sessions-list" data-testid="sessions-list">
              {filteredSessions.map((session) => {
                const isBookmarked = bookmarkedSessions.includes(session.id);

                return (
                  <article key={session.id} className={`session-card ${session.status === 'cancelled' ? 'cancelled' : ''}`}>
                    <div className="session-time">
                      <time dateTime={session.start_time || session.formatted_time?.split(' - ')[0]}>
                        <span className="session-date">
                          {session.start_time ? formatDate(session.start_time) :
                            session.formatted_time ? formatDate(session.formatted_time.split(' - ')[0]) :
                              formatDate(new Date(2025, 8, 8))}
                        </span>
                        <span className="session-time-range">
                          {session.time ||
                           (session.start_time ? `${formatTime(session.start_time)} - ${formatTime(new Date(new Date(session.start_time).getTime() + 45 * 60000))}` :
                             session.formatted_time ? `${formatTime(session.formatted_time.split(' - ')[0])} - ${formatTime(session.formatted_time.split(' - ')[1])}` :
                               'Time TBA')}
                        </span>
                      </time>
                      {session.location && (
                        <div className="session-location">
                          📍 {session.location}
                        </div>
                      )}
                    </div>

                    <div className="session-content">
                      <div className="session-header">
                        <h3 className={`session-title ${session.status === 'cancelled' ? 'cancelled-session' : ''}`}>
                          <Link to={`/session/${session.id}`}>
                            {session.title}
                            {session.status === 'cancelled' && <span className="cancelled-indicator"> (CANCELLED)</span>}
                          </Link>
                        </h3>
                        {session.track && (
                          <span className="session-track">{session.track}</span>
                        )}
                        {session.status === 'cancelled' && (
                          <span className="status-badge status-cancelled">Cancelled</span>
                        )}
                      </div>

                      {session.speaker && (
                        <div className="session-speakers">
                          <span className="speakers-label">Speaker(s):</span>
                          <span className="speaker-name">{session.speaker}</span>
                        </div>
                      )}

                      {session.category && (
                        <div className="session-category">
                          <span className="category-label">Category:</span>
                          <span className="category-name">{session.category}</span>
                        </div>
                      )}

                      {session.abstract && (
                        <p className="session-description">
                          {session.abstract.length > 200
                            ? `${session.abstract.substring(0, 200)}...`
                            : session.abstract
                          }
                        </p>
                      )}

                      <div className="session-actions">
                        <Link
                          to={`/session/${session.id}`}
                          className="btn btn-primary"
                          onClick={() => announce(`Viewing details for ${session.title}`)}
                        >
                          View Details
                        </Link>

                        <button
                          onClick={() => toggleBookmark(session.id)}
                          className={`btn ${isBookmarked ? 'btn-secondary' : 'btn-outline'} ${session.status === 'cancelled' ? 'btn-disabled' : ''}`}
                          aria-pressed={isBookmarked}
                          title={session.status === 'cancelled' ? 'Session cancelled - cannot add to agenda' : (isBookmarked ? 'Remove from agenda' : 'Add to agenda')}
                          disabled={session.status === 'cancelled'}
                        >
                          <span aria-hidden="true">
                            {session.status === 'cancelled' ? '❌' : (isBookmarked ? '⭐' : '☆')}
                          </span>
                          {session.status === 'cancelled' ? 'Session Cancelled' : (isBookmarked ? 'In Agenda' : 'Add to Agenda')}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

    </div>
  );
};

export default Programme;
