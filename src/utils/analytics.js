import { supabase } from '../lib/supabase';

/**
 * Utility functions for tracking user actions and analytics
 */

// Detect device type based on user agent
const getDeviceType = () => {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/tablet|ipad|playbook|silk/.test(userAgent)) {
    return 'tablet';
  }

  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(userAgent)) {
    return 'mobile';
  }

  return 'desktop';
};

// Get current page URL
const getCurrentPageUrl = () => {
  return window.location.pathname + window.location.search;
};

// Track user action
export const trackUserAction = async (actionType, actionDetails = null) => {
  try {


    // Only track if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {

      return null;
    }


    const actionData = {
      user_id: user.id,
      action_type: actionType,
      action_details: actionDetails,
      page_url: getCurrentPageUrl(),
      user_agent: navigator.userAgent,
      device_type: getDeviceType(),
      session_id: sessionStorage.getItem('session_id') || 'anonymous'
    };


    const { data, error } = await supabase
      .from('user_actions')
      .insert(actionData)
      .select();

    if (error) {

      return null;
    } else {

    }

    return data[0];
  } catch (error) {

    return null;
  }
};

// Specific tracking functions for common actions
export const trackPageView = (pageName) => {
  return trackUserAction('page_view', { page: pageName });
};

export const trackQuestionSubmit = (questionId) => {
  return trackUserAction('question_submit', { question_id: questionId });
};

export const trackSessionJoin = (sessionId) => {
  return trackUserAction('session_join', { session_id: sessionId });
};

export const trackSessionRegister = (sessionId) => {
  return trackUserAction('session_register', { session_id: sessionId });
};

export const trackBookmarkAdd = (contentId, contentType) => {
  return trackUserAction('bookmark_add', { content_id: contentId, content_type: contentType });
};

export const trackBookmarkRemove = (contentId, contentType) => {
  return trackUserAction('bookmark_remove', { content_id: contentId, content_type: contentType });
};

export const trackAnnouncementView = (announcementId) => {
  return trackUserAction('announcement_view', { announcement_id: announcementId });
};

export const trackSearchQuery = (query, resultsCount) => {
  return trackUserAction('search_query', { query, results_count: resultsCount });
};

export const trackProfileUpdate = () => {
  return trackUserAction('profile_update');
};

export const trackCommentPost = (contentId, contentType) => {
  return trackUserAction('comment_post', { content_id: contentId, content_type: contentType });
};

export const trackFileDownload = (fileName, fileType) => {
  return trackUserAction('file_download', { file_name: fileName, file_type: fileType });
};

// Initialize session tracking
export const initializeSession = () => {
  if (!sessionStorage.getItem('session_id')) {
    sessionStorage.setItem('session_id', `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  }
};

// Hook for automatic page view tracking (import React in component that uses this)
export const usePageTracking = (pageName) => {
  // This hook should be used in components that already import React
  // React.useEffect(() => {
  //   trackPageView(pageName);
  // }, [pageName]);

};

// Batch tracking for multiple actions
export const trackBatchActions = async (actions) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }

    const actionData = actions.map(action => ({
      user_id: user.id,
      action_type: action.type,
      action_details: action.details || null,
      page_url: getCurrentPageUrl(),
      user_agent: navigator.userAgent,
      device_type: getDeviceType(),
      session_id: sessionStorage.getItem('session_id') || 'anonymous'
    }));

    const { data, error } = await supabase
      .from('user_actions')
      .insert(actionData)
      .select();

    if (error) {

      return null;
    }

    return data;
  } catch (error) {

    return null;
  }
};

const analyticsExports = {
  trackUserAction,
  trackPageView,
  trackQuestionSubmit,
  trackSessionJoin,
  trackSessionRegister,
  trackBookmarkAdd,
  trackBookmarkRemove,
  trackAnnouncementView,
  trackSearchQuery,
  trackProfileUpdate,
  trackCommentPost,
  trackFileDownload,
  initializeSession,
  trackBatchActions
};

export default analyticsExports;
