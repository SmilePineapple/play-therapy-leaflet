import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { dbHelpers } from '../lib/supabase';

const MyAgenda = () => {
  const { announce, focusFirstHeading } = useAccessibility();
  const [sessions, setSessions] = useState([]);
  const [bookmarkedSessions, setBookmarkedSessions] = useState([]);
  const [agendaSessions, setAgendaSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('schedule'); // 'schedule' or 'list'
  const [selectedDay, setSelectedDay] = useState('all');

  const loadData = useCallback(async () => {
    try {
      // Load bookmarked sessions from Supabase
      const { data: bookmarkIds, error: bookmarksError } = await dbHelpers.getUserBookmarks();

      if (bookmarksError) {
        console.error('❌ Error loading bookmarks:', bookmarksError);
        announce('Error loading bookmarks');
        setError('Failed to load bookmarks');
        setLoading(false);
        return;
      }

      setBookmarkedSessions(Array.isArray(bookmarkIds) ? bookmarkIds : []);

      if (!bookmarkIds || bookmarkIds.length === 0) {
        setLoading(false);
        return;
      }

      // Load session details from Supabase
      const { data, error } = await dbHelpers.getSessions();

      if (error) {
        console.error('❌ Error loading sessions:', error);
        announce('Error loading session details');
        setError('Failed to load sessions');
        return;
      }

      setSessions(data || []);

    } catch (error) {
      console.error('❌ Error loading agenda data:', error);
      announce('Error loading agenda');
      setError('Failed to load agenda');
    } finally {
      setLoading(false);
    }
  }, [announce]);

  const filterAgendaSessions = useCallback(() => {
    // Filter sessions to only include bookmarked ones
    const bookmarked = sessions.filter(session =>
      bookmarkedSessions.includes(session.id)
    );

    // Filter by selected day if not 'all'
    let filtered = bookmarked;
    if (selectedDay !== 'all') {
      filtered = bookmarked.filter(session => {
        const sessionDate = new Date(session.start_time).toDateString();
        return sessionDate === selectedDay;
      });
    }

    // Sort by start time
    const sorted = filtered.sort((a, b) => {
      const dateA = new Date(a.start_time);
      const dateB = new Date(b.start_time);
      return dateA - dateB;
    });

    setAgendaSessions(sorted);
  }, [sessions, bookmarkedSessions, selectedDay]);

  useEffect(() => {
    focusFirstHeading();
    announce('My Agenda page loaded');

    loadData();
  }, [announce, focusFirstHeading, loadData]);

  useEffect(() => {
    filterAgendaSessions();
  }, [filterAgendaSessions]);

  const removeFromAgenda = async (sessionId) => {
    try {
      const { error } = await dbHelpers.removeBookmark(sessionId);

      if (error) {
        console.error('❌ Error removing bookmark:', error);
        announce('Error removing session from agenda');
        return;
      }

      // Update local state only if Supabase operation succeeded
      const newBookmarks = bookmarkedSessions.filter(id => id !== sessionId);
      setBookmarkedSessions(newBookmarks);
      announce('Session removed from agenda');

    } catch (error) {
      console.error('❌ Error removing bookmark:', error);
      announce('Error removing session from agenda');
    }
  };

  const exportAgenda = () => {
    const agendaText = agendaSessions.map(session => {
      const startTime = formatTime(session.start_time);
      const endTime = formatTime(session.end_time);
      const date = formatDate(session.start_time);
      const speakers = session.speakers?.map(s => s.name).join(', ') || 'TBA';

      return `${date} ${startTime}-${endTime}: ${session.title}\nSpeakers: ${speakers}\nLocation: ${session.location || 'TBA'}\n`;
    }).join('\n');

    const blob = new Blob([`Communication Matters Conference - My Agenda\n\n${agendaText}`], {
      type: 'text/plain'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-agenda.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    announce('Agenda exported as text file');
  };

  // Get unique days for filter
  const uniqueDays = [...new Set(sessions
    .filter(session => bookmarkedSessions.includes(session.id))
    .map(session => new Date(session.start_time).toDateString())
  )].sort();

  const formatTime = (dateString) => {
    // Parse the datetime string as local time to avoid timezone conversion
    let date;
    if (dateString.includes('T') && !dateString.includes('Z') && !dateString.includes('+')) {
      // Parse as local time by manually extracting components
      const [datePart, timePart] = dateString.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);
      date = new Date(year, month - 1, day, hour, minute);
    } else {
      date = new Date(dateString);
    }

    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    // Parse the datetime string as local time to avoid timezone conversion
    let date;
    if (dateString.includes('T') && !dateString.includes('Z') && !dateString.includes('+')) {
      // Parse as local time by manually extracting components
      const [datePart, timePart] = dateString.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute] = timePart ? timePart.split(':').map(Number) : [0, 0];
      date = new Date(year, month - 1, day, hour, minute);
    } else {
      date = new Date(dateString);
    }

    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const formatDateShort = (dateString) => {
    // Parse the datetime string as local time to avoid timezone conversion
    let date;
    if (dateString.includes('T') && !dateString.includes('Z') && !dateString.includes('+')) {
      // Parse as local time by manually extracting components
      const [datePart, timePart] = dateString.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute] = timePart ? timePart.split(':').map(Number) : [0, 0];
      date = new Date(year, month - 1, day, hour, minute);
    } else {
      date = new Date(dateString);
    }

    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const groupSessionsByDay = () => {
    const grouped = {};
    agendaSessions.forEach(session => {
      // Parse the datetime string as local time to avoid timezone conversion
      let date;
      if (session.start_time.includes('T') && !session.start_time.includes('Z') && !session.start_time.includes('+')) {
        // Parse as local time by manually extracting components
        const [datePart, timePart] = session.start_time.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hour, minute] = timePart.split(':').map(Number);
        date = new Date(year, month - 1, day, hour, minute);
      } else {
        date = new Date(session.start_time);
      }

      const dateString = date.toDateString();
      if (!grouped[dateString]) {
        grouped[dateString] = [];
      }
      grouped[dateString].push(session);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-xl) var(--spacing-md)' }}>
        <div className="loading-content" role="status" aria-live="polite">
          <h1>Loading Your Agenda...</h1>
          <div className="loading-spinner" aria-hidden="true" />
        </div>
      </div>
    );
  }

  if (bookmarkedSessions.length === 0) {
    return (
      <div className="my-agenda-page">
        <div className="container">
          <header className="page-header">
            <h1>My Agenda</h1>
            <p className="page-description">
              Your personal conference schedule
            </p>
          </header>

          <div className="empty-agenda">
            <div className="empty-content">
              <h2>Your agenda is empty</h2>
              <p>
                Start building your personal conference schedule by bookmarking sessions
                you want to attend.
              </p>
              <Link to="/programme" className="btn btn-primary">
                Browse Programme
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const groupedSessions = groupSessionsByDay();

  return (
    <div className="my-agenda-page">
      <div className="container">
        <header className="page-header">
          <h1>My Agenda</h1>
          <p className="page-description">
            Your personal conference schedule with {agendaSessions.length} session{agendaSessions.length !== 1 ? 's' : ''}
          </p>
        </header>

        {/* Controls */}
        <section className="agenda-controls" aria-labelledby="controls-title">
          <h2 id="controls-title" className="sr-only">Agenda Controls</h2>

          <div className="controls-grid">
            {/* View Mode Toggle */}
            <div className="control-group">
              <fieldset className="view-mode-toggle">
                <legend className="control-label">View Mode</legend>
                <div className="toggle-buttons">
                  <button
                    onClick={() => setViewMode('schedule')}
                    className={`btn ${viewMode === 'schedule' ? 'btn-primary' : 'btn-outline'}`}
                    aria-pressed={viewMode === 'schedule'}
                  >
                    📅 Schedule View
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline'}`}
                    aria-pressed={viewMode === 'list'}
                  >
                    📋 List View
                  </button>
                </div>
              </fieldset>
            </div>

            {/* Day Filter */}
            <div className="control-group">
              <label htmlFor="day-filter" className="control-label">
                Filter by Day
              </label>
              <select
                id="day-filter"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
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

            {/* Export Button */}
            <div className="control-group">
              <button
                onClick={exportAgenda}
                className="btn btn-secondary"
                disabled={agendaSessions.length === 0}
              >
                📄 Export Agenda
              </button>
            </div>
          </div>

          {/* Results Info */}
          <div className="results-info" role="status" aria-live="polite">
            {selectedDay === 'all'
              ? `Showing all ${agendaSessions.length} sessions in your agenda`
              : `Showing ${agendaSessions.length} sessions for ${formatDate(selectedDay)}`
            }
          </div>
        </section>

        {/* Agenda Content */}
        <section className="agenda-content" aria-labelledby="agenda-title">
          <h2 id="agenda-title" className="sr-only">Your Sessions</h2>

          {agendaSessions.length === 0 ? (
            <div className="no-sessions">
              <h3>No sessions for selected day</h3>
              <p>Try selecting a different day or view all days.</p>
              <button
                onClick={() => setSelectedDay('all')}
                className="btn btn-primary"
              >
                Show All Days
              </button>
            </div>
          ) : viewMode === 'schedule' ? (
            <div className="schedule-view">
              {Object.entries(groupedSessions).map(([date, daySessions]) => (
                <div key={date} className="day-schedule">
                  <h3 className="day-title">
                    {formatDate(date)}
                  </h3>

                  <div className="day-sessions">
                    {daySessions.map((session, sessionIndex) => {
                      const nextSession = daySessions[sessionIndex + 1];

                      // Parse end time as local time
                      let currentEnd;
                      if (session.end_time.includes('T') && !session.end_time.includes('Z') && !session.end_time.includes('+')) {
                        const [datePart, timePart] = session.end_time.split('T');
                        const [year, month, day] = datePart.split('-').map(Number);
                        const [hour, minute] = timePart.split(':').map(Number);
                        currentEnd = new Date(year, month - 1, day, hour, minute);
                      } else {
                        currentEnd = new Date(session.end_time);
                      }

                      // Parse next session start time as local time
                      let nextStart = null;
                      if (nextSession) {
                        if (nextSession.start_time.includes('T') && !nextSession.start_time.includes('Z') && !nextSession.start_time.includes('+')) {
                          const [datePart, timePart] = nextSession.start_time.split('T');
                          const [year, month, day] = datePart.split('-').map(Number);
                          const [hour, minute] = timePart.split(':').map(Number);
                          nextStart = new Date(year, month - 1, day, hour, minute);
                        } else {
                          nextStart = new Date(nextSession.start_time);
                        }
                      }

                      const hasGap = nextStart && (nextStart - currentEnd) > 15 * 60 * 1000; // 15+ minute gap

                      return (
                        <React.Fragment key={session.id}>
                          <article className={`schedule-session ${session.status === 'cancelled' ? 'cancelled' : ''}`}>
                            <div className="session-time">
                              <time dateTime={session.start_time}>
                                {formatTime(session.start_time)}
                              </time>
                              <span className="time-separator">-</span>
                              <time dateTime={session.end_time}>
                                {formatTime(session.end_time)}
                              </time>
                            </div>

                            <div className="session-details">
                              <h4 className={`session-title ${session.status === 'cancelled' ? 'cancelled-session' : ''}`}>
                                <Link to={`/session/${session.id}`}>
                                  {session.title}
                                  {session.status === 'cancelled' && <span className="cancelled-indicator"> (CANCELLED)</span>}
                                </Link>
                              </h4>
                              {session.status === 'cancelled' && (
                                <div className="cancellation-notice">
                                  <p><strong>⚠️ This session has been cancelled</strong></p>
                                  {session.cancellation_notes && (
                                    <p className="cancellation-notes">{session.cancellation_notes}</p>
                                  )}
                                </div>
                              )}

                              <div className="session-meta">
                                {session.location && (
                                  <span className="session-location">
                                    📍 {session.location}
                                  </span>
                                )}
                                {session.track && (
                                  <span className="session-track">
                                    {session.track}
                                  </span>
                                )}
                              </div>

                              {session.speakers && session.speakers.length > 0 && (
                                <div className="session-speakers">
                                  {session.speakers.map((speaker, idx) => (
                                    <span key={speaker.id || `speaker-${idx}`} className="speaker-name">
                                      {speaker.name}
                                      {idx < session.speakers.length - 1 && ', '}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <div className="session-actions">
                                <Link
                                  to={`/session/${session.id}`}
                                  className="btn btn-sm btn-primary"
                                >
                                  View Details
                                </Link>
                                <button
                                  onClick={() => removeFromAgenda(session.id)}
                                  className="btn btn-sm btn-outline"
                                  title="Remove from agenda"
                                >
                                  ❌ Remove
                                </button>
                              </div>
                            </div>
                          </article>

                          {hasGap && (
                            <div className="schedule-gap">
                              <span className="gap-text">
                                {Math.round((nextStart - currentEnd) / (60 * 1000))} minute break
                              </span>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="list-view">
              {agendaSessions.map((session) => (
                <article key={session.id} className={`list-session ${session.status === 'cancelled' ? 'cancelled' : ''}`}>
                  <div className="session-time">
                    <time dateTime={session.start_time}>
                      <span className="session-date">
                        {formatDateShort(session.start_time)}
                      </span>
                      <span className="session-time-range">
                        {formatTime(session.start_time)} - {formatTime(session.end_time)}
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
                      {session.status === 'cancelled' && (
                        <div className="cancellation-notice">
                          <p><strong>⚠️ This session has been cancelled</strong></p>
                          {session.cancellation_notes && (
                            <p className="cancellation-notes">{session.cancellation_notes}</p>
                          )}
                        </div>
                      )}
                      {session.track && (
                        <span className="session-track">{session.track}</span>
                      )}
                    </div>

                    {session.speakers && session.speakers.length > 0 && (
                      <div className="session-speakers">
                        <span className="speakers-label">Speakers:</span>
                        {session.speakers.map((speaker, index) => (
                          <span key={speaker.id || `speaker-${index}`} className="speaker-name">
                            {speaker.name}
                            {index < session.speakers.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="session-actions">
                      <Link
                        to={`/session/${session.id}`}
                        className="btn btn-primary"
                      >
                        View Details
                      </Link>

                      <button
                        onClick={() => removeFromAgenda(session.id)}
                        className="btn btn-outline"
                        title="Remove from agenda"
                      >
                        ❌ Remove from Agenda
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

    </div>
  );
};

export default MyAgenda;
