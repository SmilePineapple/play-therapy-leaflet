# User Analytics System Setup

This document describes the user analytics system implemented for tracking user behavior and generating real-time analytics data.

## Overview

The analytics system tracks user actions throughout the application and stores them in a dedicated `user_actions` table. This data is then used to generate real-time analytics in the admin dashboard.

## Database Setup

### 1. Run the SQL Script

Execute the following SQL script in your Supabase SQL Editor:

```bash
sql/setup-user-actions.sql
```

This script will:
- Create the `user_actions` table
- Set up proper indexes for performance
- Enable Row Level Security (RLS)
- Create policies for user data access
- Insert sample data for testing
- Create a helper function `track_user_action`

### 2. Table Structure

The `user_actions` table includes:
- `id` - Unique identifier
- `user_id` - Reference to authenticated user
- `action_type` - Type of action performed
- `action_details` - JSON data with additional context
- `page_url` - URL where action occurred
- `user_agent` - Browser information
- `device_type` - Device category (desktop/mobile/tablet)
- `ip_address` - User's IP address
- `session_id` - Session identifier
- `created_at` - Timestamp

## Tracked Actions

The system automatically tracks the following user actions:

### Page Views
- **Action Type**: `page_view`
- **Trigger**: When user navigates to any page
- **Details**: `{ page: "page_name" }`

### Question Submissions
- **Action Type**: `question_submit`
- **Trigger**: When user submits a question in Q&A
- **Details**: `{ question_id: number }`

### Session Interactions
- **Action Type**: `session_register` / `session_join`
- **Trigger**: When user registers for or joins a session
- **Details**: `{ session_id: number }`

### Bookmark Actions
- **Action Type**: `bookmark_add` / `bookmark_remove`
- **Trigger**: When user bookmarks or unbookmarks content
- **Details**: `{ content_id: number, content_type: "session" }`

### Announcement Views
- **Action Type**: `announcement_view`
- **Trigger**: When user opens an announcement
- **Details**: `{ announcement_id: number }`

## Analytics Utility Functions

The `src/utils/analytics.js` file provides utility functions for tracking:

```javascript
import { trackPageView, trackQuestionSubmit, trackBookmarkAdd } from '../utils/analytics';

// Track page view
trackPageView('home');

// Track question submission
trackQuestionSubmit(questionId);

// Track bookmark action
trackBookmarkAdd(sessionId, 'session');
```

## Integration Points

Analytics tracking has been integrated into:

1. **App.js** - Automatic page view tracking
2. **QA.js** - Question submission tracking
3. **Programme.js** - Session bookmark tracking
4. **News.js** - Announcement view tracking

## Admin Analytics Dashboard

The admin analytics dashboard now displays real data:

### Top User Actions
- Shows the 5 most common user actions from the last 7 days
- Data is pulled from the `user_actions` table
- Falls back to mock data if no real data is available

### Device Usage
- Shows device type distribution (Desktop/Mobile/Tablet)
- Calculated from `device_type` field in user actions
- Displays both count and percentage

## Privacy and Security

### Row Level Security (RLS)
- Users can only insert their own actions
- Only admins can read all user actions
- Data is automatically filtered by user permissions

### Data Collection
- Only authenticated users' actions are tracked
- No personally identifiable information is stored beyond user_id
- IP addresses are stored for analytics but not displayed in admin interface

## Testing

### Sample Data
The setup script includes sample data for testing the analytics dashboard.

### Verification
1. Navigate through the application while logged in
2. Perform various actions (submit questions, bookmark sessions, etc.)
3. Check the admin analytics dashboard for real-time data
4. Verify that Top User Actions and Device Usage show real data

## Troubleshooting

### No Data Showing
1. Verify the `user_actions` table exists in Supabase
2. Check that RLS policies are properly configured
3. Ensure users are authenticated when performing actions
4. Check browser console for any JavaScript errors

### Analytics Not Updating
1. Refresh the admin analytics page
2. Check that the time range includes recent activity
3. Verify that the analytics functions are being called

### Performance Issues
1. Ensure database indexes are created (included in setup script)
2. Consider archiving old data if the table becomes very large
3. Monitor query performance in Supabase dashboard

## Future Enhancements

- Real-time analytics updates using Supabase subscriptions
- More detailed user journey tracking
- Custom date range selection in analytics
- Export functionality for analytics data
- User behavior heatmaps
- A/B testing framework integration