-- SQL script to add bookmarks functionality
-- Run this in your Supabase SQL editor

-- Create bookmarks table to store user session bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET, -- For anonymous users
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure one bookmark per session per user/IP
  UNIQUE(session_id, user_id),
  UNIQUE(session_id, ip_address)
);

-- Enable RLS on bookmarks table
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policies for bookmarks
CREATE POLICY "Public read access" ON bookmarks FOR SELECT USING (true);
CREATE POLICY "Public insert bookmarks" ON bookmarks FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete bookmarks" ON bookmarks FOR DELETE USING (true);

-- Function to add a bookmark
CREATE OR REPLACE FUNCTION add_bookmark(session_id INTEGER, user_ip INET DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  current_user_id UUID;
  bookmark_exists BOOLEAN;
BEGIN
  -- Get current user if authenticated
  current_user_id := auth.uid();
  
  -- Check if bookmark already exists
  IF current_user_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM bookmarks 
      WHERE bookmarks.session_id = add_bookmark.session_id 
      AND user_id = current_user_id
    ) INTO bookmark_exists;
  ELSE
    -- For anonymous users, check by IP
    SELECT EXISTS(
      SELECT 1 FROM bookmarks 
      WHERE bookmarks.session_id = add_bookmark.session_id 
      AND ip_address = user_ip
    ) INTO bookmark_exists;
  END IF;
  
  -- If bookmark doesn't exist, add it
  IF NOT bookmark_exists THEN
    INSERT INTO bookmarks (session_id, user_id, ip_address)
    VALUES (add_bookmark.session_id, current_user_id, user_ip);
    
    RETURN jsonb_build_object(
      'success', true, 
      'message', 'Bookmark added',
      'action', 'added'
    );
  ELSE
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'Session already bookmarked',
      'action', 'none'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove a bookmark
CREATE OR REPLACE FUNCTION remove_bookmark(session_id INTEGER, user_ip INET DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  current_user_id UUID;
  rows_deleted INTEGER;
BEGIN
  -- Get current user if authenticated
  current_user_id := auth.uid();
  
  -- Delete bookmark
  IF current_user_id IS NOT NULL THEN
    DELETE FROM bookmarks 
    WHERE bookmarks.session_id = remove_bookmark.session_id 
    AND user_id = current_user_id;
  ELSE
    -- For anonymous users, delete by IP
    DELETE FROM bookmarks 
    WHERE bookmarks.session_id = remove_bookmark.session_id 
    AND ip_address = user_ip;
  END IF;
  
  GET DIAGNOSTICS rows_deleted = ROW_COUNT;
  
  IF rows_deleted > 0 THEN
    RETURN jsonb_build_object(
      'success', true, 
      'message', 'Bookmark removed',
      'action', 'removed'
    );
  ELSE
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'Bookmark not found',
      'action', 'none'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user bookmarks
CREATE OR REPLACE FUNCTION get_user_bookmarks(user_ip INET DEFAULT NULL)
RETURNS TABLE(session_id INTEGER) AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get current user if authenticated
  current_user_id := auth.uid();
  
  -- Return bookmarked session IDs
  IF current_user_id IS NOT NULL THEN
    RETURN QUERY
    SELECT b.session_id FROM bookmarks b
    WHERE b.user_id = current_user_id;
  ELSE
    -- For anonymous users, get by IP
    RETURN QUERY
    SELECT b.session_id FROM bookmarks b
    WHERE b.ip_address = user_ip;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION add_bookmark TO anon, authenticated;
GRANT EXECUTE ON FUNCTION remove_bookmark TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_bookmarks TO anon, authenticated;

COMMENT ON TABLE bookmarks IS 'Stores user session bookmarks for building personal agendas';
COMMENT ON FUNCTION add_bookmark IS 'Adds a session bookmark for the current user or IP';
COMMENT ON FUNCTION remove_bookmark IS 'Removes a session bookmark for the current user or IP';
COMMENT ON FUNCTION get_user_bookmarks IS 'Gets all bookmarked session IDs for the current user or IP';