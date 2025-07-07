import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { dbHelpers } from '../lib/supabase';
import { mockSessions } from '../data/mockSessions.js';
import Loading from '../components/Loading';

const SessionDetail = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { announce, focusFirstHeading } = useAccessibility();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  // Removed unused state variables: isAnonymous, submittingQuestion, showQuestionForm

  const loadSessionDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get from database first
      let sessionData = null;
      try {
        sessionData = await dbHelpers.getSession(sessionId);
      } catch (dbError) {
        console.warn('⚠️ Database unavailable, using mock data:', dbError.message);
        // Fallback to mock data
        sessionData = mockSessions.find(s => s.id === parseInt(sessionId, 10));
        if (sessionData) {
        }
      }

      if (!sessionData) {
        throw new Error('Session not found');
      }

      setSession(sessionData);
      announce(`Loaded session details for ${sessionData.title}`);

    } catch (err) {
      console.error('❌ Error loading session:', err);
      setError(err.message);
      announce('Error loading session details');
    } finally {
      setLoading(false);
    }
  }, [sessionId, announce]);

  useEffect(() => {
    loadSessionDetail();
  }, [sessionId, loadSessionDetail]);

  useEffect(() => {
    if (session && !loading) {
      focusFirstHeading();
    }
  }, [session, loading, focusFirstHeading]);

  useEffect(() => {
    // Check if session is bookmarked using Supabase
    const checkBookmarkStatus = async () => {
      try {
        const bookmarks = await dbHelpers.getUserBookmarks();
        setIsBookmarked(bookmarks.includes(parseInt(sessionId, 10)));
      } catch (error) {
        console.error('❌ Error checking bookmark status:', error);
        setIsBookmarked(false);
      }
    };

    checkBookmarkStatus();
  }, [sessionId]);

  const toggleBookmark = async () => {
    const sessionIdInt = parseInt(sessionId, 10);

    try {
      if (isBookmarked) {
        const result = await dbHelpers.removeBookmark(sessionIdInt);

        if (result.success) {
          setIsBookmarked(false);
          announce(`${session.title} removed from your agenda`);
        } else {
          console.error('❌ Failed to remove bookmark:', result.message);
        }
      } else {
        const result = await dbHelpers.addBookmark(sessionIdInt);

        if (result.success) {
          setIsBookmarked(true);
          announce(`${session.title} added to your agenda`);
        } else {
          console.error('❌ Failed to add bookmark:', result.message);
        }
      }
    } catch (error) {
      console.error('❌ Error toggling bookmark:', error);
      announce('Error updating bookmark. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return '';
    }

    if (typeof dateString === 'string' && dateString.includes('day')) {
      return dateString;
    }

    try {
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
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) {
      return '';
    }

    if (typeof timeString === 'string' && timeString.includes('-')) {
      return timeString;
    }

    try {
      // Parse the datetime string as local time to avoid timezone conversion
      let date;
      if (timeString.includes('T') && !timeString.includes('Z') && !timeString.includes('+')) {
        // Parse as local time by manually extracting components
        const [datePart, timePart] = timeString.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hour, minute] = timePart.split(':').map(Number);
        date = new Date(year, month - 1, day, hour, minute);
      } else {
        date = new Date(timeString);
      }

      return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      return timeString;
    }
  };

  if (loading) {
    return (
      <div className="session-detail-page">
        <div className="container">
          <Loading message="Loading session details..." />
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="session-detail-page">
        <div className="container">
          <div className="error-state">
            <h1>Session Not Found</h1>
            <p>Sorry, we couldn&apos;t find the session you&apos;re looking for.</p>
            <div className="error-actions">
              <Link to="/programme" className="btn btn-primary">
                ← Back to Programme
              </Link>
              <button
                onClick={() => navigate(-1)}
                className="btn btn-outline"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="session-detail-page">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="breadcrumb">
          <ol className="breadcrumb-list">
            <li className="breadcrumb-item">
              <Link to="/">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/programme">Programme</Link>
            </li>
            <li className="breadcrumb-item" aria-current="page">
              {session.title}
            </li>
          </ol>
        </nav>

        {/* Session Header */}
        <header className="session-header">
          <div className="session-meta">
            {session.track && (
              <span className="session-track">Track {session.track}</span>
            )}
            {session.category && (
              <span className="session-category-badge">{session.category}</span>
            )}
            {session.status === 'cancelled' && (
              <span className="status-badge status-cancelled">Cancelled</span>
            )}
          </div>

          <h1 className={`session-title ${session.status === 'cancelled' ? 'cancelled-session' : ''}`}>
            {session.title}
            {session.status === 'cancelled' && <span className="cancelled-indicator"> (CANCELLED)</span>}
          </h1>

          <div className="session-details">
            <div className="session-time-info">
              <time dateTime={session.start_time}>
                <span className="session-date">
                  📅 {formatDate(session.start_time || session.date)}
                </span>
                <span className="session-time">
                  🕐 {session.time || formatTime(session.start_time)}
                </span>
              </time>
              {session.location && (
                <div className="session-location">
                  📍 {session.location}
                </div>
              )}
            </div>

            {session.speaker && (
              <div className="session-speakers">
                <h2 className="speakers-heading">Speaker(s)</h2>
                <div className="speakers-list">
                  <span className="speaker-name">{session.speaker}</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Session Content */}
        <main className="session-content">
          {session.status === 'cancelled' && session.cancellation_notes && (
            <section className="cancellation-notice">
              <h2>Cancellation Notice</h2>
              <p className="cancellation-notes">{session.cancellation_notes}</p>
            </section>
          )}

          {session.abstract && (
            <section className="session-description">
              <h2>Session Description</h2>
              <div className="description-content">
                {session.abstract.split('\n').map((paragraph, index) => (
                  <p key={`abstract-paragraph-${index}`}>{paragraph}</p>
                ))}
              </div>
            </section>
          )}

          {session.session_number && (
            <section className="session-info">
              <h2>Session Information</h2>
              <dl className="session-details-list">
                <dt>Session Number</dt>
                <dd>{session.session_number}</dd>

                {session.abstract_number && (
                  <>
                    <dt>Abstract Number</dt>
                    <dd>{session.abstract_number}</dd>
                  </>
                )}

                {session.track && (
                  <>
                    <dt>Track</dt>
                    <dd>{session.track}</dd>
                  </>
                )}

                {session.category && (
                  <>
                    <dt>Category</dt>
                    <dd>{session.category}</dd>
                  </>
                )}

                {session.status === 'cancelled' && (
                  <>
                    <dt>Status</dt>
                    <dd className="status-cancelled">Cancelled</dd>
                  </>
                )}
              </dl>
            </section>
          )}
        </main>

        {/* Action Buttons */}
        <div className="session-actions">
          <button
            onClick={toggleBookmark}
            className={`btn ${isBookmarked ? 'btn-secondary' : 'btn-primary'} ${session.status === 'cancelled' ? 'btn-disabled' : ''}`}
            aria-pressed={isBookmarked}
            title={session.status === 'cancelled' ? 'Session cancelled - cannot add to agenda' : (isBookmarked ? 'Remove from agenda' : 'Add to agenda')}
            disabled={session.status === 'cancelled'}
          >
            <span aria-hidden="true">
              {session.status === 'cancelled' ? '❌' : (isBookmarked ? '⭐' : '☆')}
            </span>
            {session.status === 'cancelled' ? 'Session Cancelled' : (isBookmarked ? 'Remove from Agenda' : 'Add to Agenda')}
          </button>

          <Link to="/programme" className="btn btn-outline">
            ← Back to Programme
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="btn btn-outline"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionDetail;
