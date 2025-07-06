import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { supabase } from '../../lib/supabase';
import './Analytics.css';

const Analytics = ({ user: _user }) => {
  const [analytics, setAnalytics] = useState({
    overview: {
      totalQuestions: 0,
      totalSessions: 0,
      totalAnnouncements: 0,
      totalBookmarks: 0,
      activeUsers: 0
    },
    questionStats: {
      pending: 0,
      approved: 0,
      rejected: 0,
      byCategory: []
    },
    sessionStats: {
      byType: [],
      byLocation: [],
      attendance: []
    },
    userActivity: {
      dailyActive: [],
      topActions: [],
      deviceTypes: []
    },
    timeRange: {
      questions: [],
      bookmarks: [],
      announcements: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('7d'); // 7d, 30d, 90d
  const [refreshing, setRefreshing] = useState(false);
  const [topActions, setTopActions] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loadingActions, setLoadingActions] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(false);

  useEffect(() => {
    loadAnalytics();
    loadRealAnalytics();
  }, [loadAnalytics, loadRealAnalytics, dateRange]);

  const loadRealAnalytics = async () => {
    setLoadingActions(true);
    setLoadingDevices(true);

    try {
      const [actionsData, devicesData] = await Promise.all([
        loadTopUserActions(),
        loadDeviceUsage()
      ]);

      setTopActions(actionsData);
      setDeviceTypes(devicesData);
    } catch (error) {
      console.error('Error loading real analytics:', error);
      // Fallback to mock data
      setTopActions(generateMockTopActions());
      setDeviceTypes(generateMockDeviceTypes());
    } finally {
      setLoadingActions(false);
      setLoadingDevices(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      const endDate = new Date();
      const startDate = new Date();

      switch (dateRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      const [overviewData, questionData, sessionData, bookmarkData, announcementData] = await Promise.all([
        loadOverviewStats(),
        loadQuestionStats(startDate, endDate),
        loadSessionStats(),
        loadBookmarkStats(startDate, endDate),
        loadAnnouncementStats(startDate, endDate)
      ]);

      setAnalytics({
        overview: overviewData,
        questionStats: questionData.stats,
        sessionStats: sessionData,
        userActivity: {
          dailyActive: generateMockDailyActive(startDate, endDate),
          topActions: topActions.length > 0 ? topActions : generateMockTopActions(),
          deviceTypes: deviceTypes.length > 0 ? deviceTypes : generateMockDeviceTypes()
        },
        timeRange: {
          questions: questionData.timeRange,
          bookmarks: bookmarkData,
          announcements: announcementData
        }
      });


    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadOverviewStats = async () => {
    const [questionsResult, sessionsResult, announcementsResult, bookmarksResult] = await Promise.all([
      supabase.from('questions').select('id', { count: 'exact', head: true }),
      supabase.from('sessions').select('id', { count: 'exact', head: true }),
      supabase.from('announcements').select('id', { count: 'exact', head: true }),
      supabase.from('bookmarks').select('id', { count: 'exact', head: true })
    ]);

    return {
      totalQuestions: questionsResult.count || 0,
      totalSessions: sessionsResult.count || 0,
      totalAnnouncements: announcementsResult.count || 0,
      totalBookmarks: bookmarksResult.count || 0,
      activeUsers: Math.floor(Math.random() * 150) + 50 // Mock data
    };
  };

  const loadQuestionStats = async (startDate, endDate) => {
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (questionsError) {
      console.error('Error loading questions:', questionsError);
      throw questionsError;
    }

    const stats = {
      pending: questions?.filter(q => q.status === 'pending').length || 0,
      approved: questions?.filter(q => q.status === 'approved').length || 0,
      rejected: questions?.filter(q => q.status === 'rejected').length || 0,
      byCategory: generateCategoryStats(questions || [])
    };

    const timeRange = generateTimeRangeData(questions || [], startDate, endDate);

    return { stats, timeRange };
  };

  const loadSessionStats = async () => {
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*');

    if (sessionsError) {
      console.error('Error loading sessions:', sessionsError);
      throw sessionsError;
    }

    const byType = {};
    const byLocation = {};

    sessions?.forEach(session => {
      const type = session.session_type || 'Unknown';
      const location = session.location || 'Unknown';

      byType[type] = (byType[type] || 0) + 1;
      byLocation[location] = (byLocation[location] || 0) + 1;
    });

    return {
      byType: Object.entries(byType).map(([name, value]) => ({ name, value })),
      byLocation: Object.entries(byLocation).map(([name, value]) => ({ name, value })),
      attendance: generateMockAttendance(sessions || [])
    };
  };

  const loadBookmarkStats = async (startDate, endDate) => {
    const { data: bookmarks, error: bookmarksError } = await supabase
      .from('bookmarks')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (bookmarksError) {
      console.error('Error loading bookmarks:', bookmarksError);
      throw bookmarksError;
    }

    return generateTimeRangeData(bookmarks || [], startDate, endDate);
  };

  const loadAnnouncementStats = async (startDate, endDate) => {
    const { data: announcements, error: announcementsError } = await supabase
      .from('announcements')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (announcementsError) {
      console.error('Error loading announcements:', announcementsError);
      throw announcementsError;
    }

    return generateTimeRangeData(announcements || [], startDate, endDate);
  };

  const generateCategoryStats = (questions) => {
    const categories = {};
    questions.forEach(question => {
      const category = question.category || 'General';
      categories[category] = (categories[category] || 0) + 1;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  const generateTimeRangeData = (items, startDate, endDate) => {
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const data = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const count = items.filter(item => {
        // Parse the datetime string as local time to avoid timezone conversion
        let itemDate;
        if (item.created_at.includes('T') && !item.created_at.includes('Z') && !item.created_at.includes('+')) {
          // Parse as local time by manually extracting components
          const [datePart] = item.created_at.split('T');
          const [year, month, day] = datePart.split('-').map(Number);
          itemDate = new Date(year, month - 1, day);
        } else {
          itemDate = new Date(item.created_at);
        }
        const itemDateStr = itemDate.toISOString().split('T')[0];
        return itemDateStr === dateStr;
      }).length;

      data.push({
        date: dateStr,
        count,
        label: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
      });
    }

    return data;
  };

  const generateMockDailyActive = (startDate, endDate) => {
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const data = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      data.push({
        date: date.toISOString().split('T')[0],
        users: Math.floor(Math.random() * 100) + 20,
        label: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
      });
    }

    return data;
  };

  const loadTopUserActions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_actions')
        .select('action_type')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        console.error('Error loading top user actions:', error);
        return generateMockTopActions();
      }

      // Count actions
      const actionCounts = {};
      data.forEach(item => {
        const action = item.action_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        actionCounts[action] = (actionCounts[action] || 0) + 1;
      });

      // Convert to array and sort
      return Object.entries(actionCounts)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    } catch (error) {
      console.error('Error in loadTopUserActions:', error);
      return generateMockTopActions();
    }
  };

  const generateMockTopActions = () => [
    { action: 'View Sessions', count: 1250 },
    { action: 'Submit Questions', count: 890 },
    { action: 'Bookmark Sessions', count: 650 },
    { action: 'View Announcements', count: 420 },
    { action: 'Download Materials', count: 280 }
  ];

  const loadDeviceUsage = async () => {
    try {
      const { data, error } = await supabase
        .from('user_actions')
        .select('device_type')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .not('device_type', 'is', null);

      if (error) {
        console.error('Error loading device usage:', error);
        return generateMockDeviceTypes();
      }

      // Count devices
      const deviceCounts = {};
      data.forEach(item => {
        const device = item.device_type.charAt(0).toUpperCase() + item.device_type.slice(1);
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      });

      const total = data.length;

      // Convert to array with percentages
      return Object.entries(deviceCounts)
        .map(([type, count]) => ({
          type,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Error in loadDeviceUsage:', error);
      return generateMockDeviceTypes();
    }
  };

  const generateMockDeviceTypes = () => [
    { type: 'Mobile', percentage: 65 },
    { type: 'Desktop', percentage: 28 },
    { type: 'Tablet', percentage: 7 }
  ];

  const generateMockAttendance = (sessions) => {
    return sessions.slice(0, 10).map(session => ({
      name: session.title,
      expected: Math.floor(Math.random() * 100) + 50,
      actual: Math.floor(Math.random() * 80) + 30
    }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  // const calculatePercentageChange = (current, previous) => {
  //   if (previous === 0) return current > 0 ? 100 : 0;
  //   return ((current - previous) / previous) * 100;
  // };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <div className="analytics-controls">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="date-range-select"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={handleRefresh}
            className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
            disabled={refreshing}
          >
            🔄 {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Overview Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">❓</div>
          <div className="stat-content">
            <h3>{formatNumber(analytics.overview.totalQuestions)}</h3>
            <p>Total Questions</p>
            <span className="stat-change positive">+12%</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{formatNumber(analytics.overview.totalSessions)}</h3>
            <p>Total Sessions</p>
            <span className="stat-change neutral">0%</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📢</div>
          <div className="stat-content">
            <h3>{formatNumber(analytics.overview.totalAnnouncements)}</h3>
            <p>Announcements</p>
            <span className="stat-change positive">+8%</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔖</div>
          <div className="stat-content">
            <h3>{formatNumber(analytics.overview.totalBookmarks)}</h3>
            <p>Bookmarks</p>
            <span className="stat-change positive">+15%</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{formatNumber(analytics.overview.activeUsers)}</h3>
            <p>Active Users</p>
            <span className="stat-change positive">+5%</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Question Status Chart */}
        <div className="chart-card">
          <h3>Question Status Distribution</h3>
          <div className="pie-chart">
            <div className="pie-chart-legend">
              <div className="legend-item">
                <span className="legend-color pending" />
                <span>Pending ({analytics.questionStats.pending})</span>
              </div>
              <div className="legend-item">
                <span className="legend-color approved" />
                <span>Approved ({analytics.questionStats.approved})</span>
              </div>
              <div className="legend-item">
                <span className="legend-color rejected" />
                <span>Rejected ({analytics.questionStats.rejected})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Session Types Chart */}
        <div className="chart-card">
          <h3>Sessions by Type</h3>
          <div className="bar-chart">
            {analytics.sessionStats.byType.map((item, index) => (
              <div key={`session-type-${item.name}-${index}`} className="bar-item">
                <div className="bar-label">{item.name}</div>
                <div className="bar-container">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(item.value / Math.max(...analytics.sessionStats.byType.map(i => i.value))) * 100}%`
                    }}
                  />
                  <span className="bar-value">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Range Activity */}
        <div className="chart-card full-width">
          <h3>Activity Over Time</h3>
          <div className="line-chart">
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-line questions" />
                <span>Questions</span>
              </div>
              <div className="legend-item">
                <span className="legend-line bookmarks" />
                <span>Bookmarks</span>
              </div>
              <div className="legend-item">
                <span className="legend-line announcements" />
                <span>Announcements</span>
              </div>
            </div>
            <div className="chart-area">
              {analytics.timeRange.questions.map((item, index) => (
                <div key={`time-point-${item.label}-${index}`} className="chart-point">
                  <div className="point-label">{item.label}</div>
                  <div className="point-values">
                    <div className="point-bar questions" style={{ height: `${(item.count / 10) * 100}%` }} />
                    <div className="point-bar bookmarks" style={{ height: `${(analytics.timeRange.bookmarks[index]?.count || 0) / 10 * 100}%` }} />
                    <div className="point-bar announcements" style={{ height: `${(analytics.timeRange.announcements[index]?.count || 0) / 10 * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Actions */}
        <div className="chart-card">
          <h3>Top User Actions {loadingActions && '(Loading...)'}</h3>
          <div className="action-list">
            {(topActions.length > 0 ? topActions : analytics.userActivity.topActions).map((action, index) => (
              <div key={`action-${action.action}-${index}`} className="action-item">
                <span className="action-rank">#{index + 1}</span>
                <span className="action-name">{action.action}</span>
                <span className="action-count">{formatNumber(action.count)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Device Types */}
        <div className="chart-card">
          <h3>Device Usage {loadingDevices && '(Loading...)'}</h3>
          <div className="device-chart">
            {(deviceTypes.length > 0 ? deviceTypes : analytics.userActivity.deviceTypes).map((device, index) => (
              <div key={`device-${device.type}-${index}`} className="device-item">
                <div className="device-info">
                  <span className="device-name">{device.type}</span>
                  <span className="device-percentage">{device.percentage}%</span>
                </div>
                <div className="device-bar">
                  <div
                    className="device-fill"
                    style={{ width: `${device.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

Analytics.propTypes = {
  user: PropTypes.shape({
    email: PropTypes.string
  })
};

export default Analytics;
