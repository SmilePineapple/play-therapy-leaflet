# Bookmarks Setup Instructions

This document explains how to set up the bookmarks functionality for the Communication Matters conference app.

## Database Setup

1. **Run the SQL Script**
   - Open your Supabase dashboard
   - Go to the SQL Editor
   - Copy and paste the contents of `add-bookmarks-table.sql`
   - Execute the script

2. **What the Script Creates**
   - `bookmarks` table to store user session bookmarks
   - Row Level Security (RLS) policies for public access
   - Helper functions:
     - `add_bookmark(session_id, user_ip)` - Add a bookmark
     - `remove_bookmark(session_id, user_ip)` - Remove a bookmark
     - `get_user_bookmarks(user_ip)` - Get all user bookmarks

## How It Works

### Anonymous User Support
The system supports both authenticated and anonymous users:
- **Authenticated users**: Bookmarks are tied to their user ID
- **Anonymous users**: Bookmarks are tied to their IP address

### Database Schema
```sql
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET, -- For anonymous users
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure one bookmark per session per user/IP
  UNIQUE(session_id, user_id),
  UNIQUE(session_id, ip_address)
);
```

### Code Changes Made

1. **Added Supabase Helper Functions** (`src/lib/supabase.js`)
   - `getUserBookmarks()` - Fetch user's bookmarked session IDs
   - `addBookmark(sessionId)` - Add a session to bookmarks
   - `removeBookmark(sessionId)` - Remove a session from bookmarks

2. **Updated Programme Page** (`src/pages/Programme.js`)
   - Changed `loadBookmarks()` to fetch from Supabase instead of localStorage
   - Updated `toggleBookmark()` to use Supabase functions
   - Removed localStorage dependency

3. **Updated My Agenda Page** (`src/pages/MyAgenda.js`)
   - Changed `loadData()` to fetch bookmarks from Supabase
   - Updated `removeFromAgenda()` to use Supabase
   - Removed localStorage dependency

## Migration from localStorage

If users have existing bookmarks in localStorage, they will need to re-bookmark their sessions. The old localStorage data will not be automatically migrated.

## Benefits of Supabase Bookmarks

1. **Persistence**: Bookmarks survive browser clearing, device changes
2. **Cross-device sync**: Users can access bookmarks from any device
3. **Data integrity**: Bookmarks are properly validated against existing sessions
4. **Analytics**: Can track popular sessions through bookmark counts
5. **Scalability**: Handles large numbers of users and bookmarks efficiently

## Testing

After setup:
1. Navigate to the Programme page
2. Click "Add to Agenda" on any session
3. Check browser console for success messages
4. Navigate to "My Agenda" to see bookmarked sessions
5. Try removing sessions from the agenda

## Troubleshooting

- **Bookmarks not saving**: Check Supabase console for RLS policy errors
- **Functions not found**: Ensure the SQL script was executed completely
- **Permission errors**: Verify the functions have proper GRANT statements
- **Sessions not showing**: Check that session IDs in bookmarks match actual session IDs