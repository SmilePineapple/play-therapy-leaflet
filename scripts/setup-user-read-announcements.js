const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupUserReadAnnouncementsTable() {
  console.log('🔧 Setting up user_read_announcements table...');
  console.log('ℹ️  Note: You need to run the SQL commands manually in the Supabase SQL Editor.');
  console.log('ℹ️  Go to: https://supabase.com/dashboard/project/corcfxmrkhugmyqmbqkh/sql');
  console.log('');
  console.log('📋 Copy and paste the following SQL commands:');
  console.log('=' .repeat(80));
  
  const sqlCommands = `
-- Create user_read_announcements table
CREATE TABLE IF NOT EXISTS user_read_announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  announcement_id UUID NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_session_id TEXT, -- For anonymous users
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can only mark an announcement as read once
  UNIQUE(user_id, announcement_id),
  UNIQUE(user_session_id, announcement_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_read_announcements_user_id ON user_read_announcements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_read_announcements_announcement_id ON user_read_announcements(announcement_id);
CREATE INDEX IF NOT EXISTS idx_user_read_announcements_session_id ON user_read_announcements(user_session_id);
CREATE INDEX IF NOT EXISTS idx_user_read_announcements_read_at ON user_read_announcements(read_at);

-- Enable Row Level Security
ALTER TABLE user_read_announcements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own read announcements" ON user_read_announcements;
DROP POLICY IF EXISTS "Users can insert their own read announcements" ON user_read_announcements;
DROP POLICY IF EXISTS "Users can update their own read announcements" ON user_read_announcements;
DROP POLICY IF EXISTS "Anonymous users can manage session reads" ON user_read_announcements;

-- Policy for authenticated users to read their own read announcements
CREATE POLICY "Users can read their own read announcements" ON user_read_announcements
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for authenticated users to insert their own read announcements
CREATE POLICY "Users can insert their own read announcements" ON user_read_announcements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for authenticated users to update their own read announcements
CREATE POLICY "Users can update their own read announcements" ON user_read_announcements
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for anonymous users to manage their session-based reads
CREATE POLICY "Anonymous users can manage session reads" ON user_read_announcements
  FOR ALL USING (
    auth.uid() IS NULL AND 
    user_session_id IS NOT NULL AND 
    user_id IS NULL
  );

-- Function to mark an announcement as read
CREATE OR REPLACE FUNCTION mark_announcement_as_read(
  p_announcement_id UUID,
  p_user_session_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- For authenticated users
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO user_read_announcements (user_id, announcement_id)
    VALUES (auth.uid(), p_announcement_id)
    ON CONFLICT (user_id, announcement_id) 
    DO UPDATE SET 
      read_at = NOW(),
      updated_at = NOW();
    RETURN TRUE;
  
  -- For anonymous users
  ELSIF p_user_session_id IS NOT NULL THEN
    INSERT INTO user_read_announcements (user_session_id, announcement_id)
    VALUES (p_user_session_id, p_announcement_id)
    ON CONFLICT (user_session_id, announcement_id)
    DO UPDATE SET 
      read_at = NOW(),
      updated_at = NOW();
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Function to get user's read announcements
CREATE OR REPLACE FUNCTION get_user_read_announcements(
  p_user_session_id TEXT DEFAULT NULL
)
RETURNS TABLE(announcement_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- For authenticated users
  IF auth.uid() IS NOT NULL THEN
    RETURN QUERY
    SELECT ura.announcement_id
    FROM user_read_announcements ura
    WHERE ura.user_id = auth.uid();
  
  -- For anonymous users
  ELSIF p_user_session_id IS NOT NULL THEN
    RETURN QUERY
    SELECT ura.announcement_id
    FROM user_read_announcements ura
    WHERE ura.user_session_id = p_user_session_id;
  END IF;
END;
$$;

-- Verification: Check if table was created
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_read_announcements'
ORDER BY ordinal_position;

-- Verification: Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'user_read_announcements';
`;
  
  console.log(sqlCommands);
  console.log('=' .repeat(80));
  console.log('');
  console.log('✅ After running the SQL commands, the table will be ready for use.');
  console.log('🔗 Supabase SQL Editor: https://supabase.com/dashboard/project/corcfxmrkhugmyqmbqkh/sql');
}

// Run the setup
setupUserReadAnnouncementsTable();