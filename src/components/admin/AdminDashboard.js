import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { supabase } from '../../lib/supabase';
import './AdminDashboard.css';

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalQuestions: 0,
    pendingQuestions: 0,
    totalAnnouncements: 0,
    totalSessions: 0,
    totalBookmarks: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {

    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {

      setLoading(true);
      setError('');

      // Load questions stats
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id, status, created_at');

      if (questionsError) {
        console.error('Error loading questions:', questionsError);
      }

      // Load announcements stats
      const { data: announcements, error: announcementsError } = await supabase
        .from('announcements')
        .select('id, created_at');

      if (announcementsError) {
        console.error('Error loading announcements:', announcementsError);
      }

      // Load sessions stats
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('id');

      if (sessionsError) {
        console.error('Error loading sessions:', sessionsError);
      }

      // Load bookmarks stats
      const { data: bookmarks, error: bookmarksError } = await supabase
        .from('bookmarks')
        .select('id');

      if (bookmarksError) {
        console.error('Error loading bookmarks:', bookmarksError);
      }

      // Calculate stats
      const totalQuestions = questions?.length || 0;
      const pendingQuestions = questions?.filter(q => q.status === 'pending').length || 0;
      const totalAnnouncements = announcements?.length || 0;
      const totalSessions = sessions?.length || 0;
      const totalBookmarks = bookmarks?.length || 0;

      // Get recent activity (last 10 questions)
      const recentActivity = questions
        ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        ?.slice(0, 10) || [];

      setStats({
        totalQuestions,
        pendingQuestions,
        totalAnnouncements,
        totalSessions,
        totalBookmarks,
        recentActivity
      });

    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
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
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-badge status-pending',
      approved: 'status-badge status-approved',
      rejected: 'status-badge status-rejected'
    };
    return statusClasses[status] || 'status-badge';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user?.name || user?.email}</p>
        <button
          onClick={loadDashboardStats}
          className="refresh-btn"
          title="Refresh dashboard data"
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="stats-grid" data-testid="dashboard-stats">
        <div className="stat-card" data-testid="total-questions-stat">
          <div className="stat-icon">❓</div>
          <div className="stat-content">
            <h3>Total Questions</h3>
            <div className="stat-number">{stats.totalQuestions}</div>
          </div>
        </div>

        <div className="stat-card pending" data-testid="pending-questions-stat">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pending Questions</h3>
            <div className="stat-number">{stats.pendingQuestions}</div>
          </div>
        </div>

        <div className="stat-card" data-testid="announcements-stat">
          <div className="stat-icon">📢</div>
          <div className="stat-content">
            <h3>Announcements</h3>
            <div className="stat-number">{stats.totalAnnouncements}</div>
          </div>
        </div>

        <div className="stat-card" data-testid="sessions-stat">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Sessions</h3>
            <div className="stat-number">{stats.totalSessions}</div>
          </div>
        </div>

        <div className="stat-card" data-testid="bookmarks-stat">
          <div className="stat-icon">🔖</div>
          <div className="stat-content">
            <h3>Bookmarks</h3>
            <div className="stat-number">{stats.totalBookmarks}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button className="action-btn primary">
              📝 Review Pending Questions
            </button>
            <button className="action-btn secondary">
              📢 Create Announcement
            </button>
            <button className="action-btn secondary">
              📊 View Analytics
            </button>
            <button className="action-btn secondary">
              🛡️ Content Moderation
            </button>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Recent Activity</h2>
          {stats.recentActivity.length > 0 ? (
            <div className="activity-list">
              {stats.recentActivity.map((activity, index) => (
                <div key={activity.id || `activity-${index}`} className="activity-item">
                  <div className="activity-content">
                    <span className="activity-type">Question submitted</span>
                    <span className="activity-time">{formatDate(activity.created_at)}</span>
                  </div>
                  <span className={getStatusBadge(activity.status)}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-activity">
              <p>No recent activity</p>
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <h2>System Status</h2>
          <div className="system-status">
            <div className="status-item">
              <span className="status-indicator online" />
              <span>Database Connection</span>
              <span className="status-text">Online</span>
            </div>
            <div className="status-item">
              <span className="status-indicator online" />
              <span>Authentication Service</span>
              <span className="status-text">Online</span>
            </div>
            <div className="status-item">
              <span className="status-indicator online" />
              <span>File Storage</span>
              <span className="status-text">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

AdminDashboard.propTypes = {
  user: PropTypes.shape({
    email: PropTypes.string,
    name: PropTypes.string
  })
};

export default AdminDashboard;
