-- Add User Read Announcements Table for Persistent Read Status
-- Run this in your Supabase SQL Editor

DO $$
BEGIN
    RAISE NOTICE '🔧 Starting user read announcements table setup...';
END $$;

-- STEP 1: Create the user_read_announcements table
CREATE TABLE IF NOT EXISTS user_read_announcements (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    announcement_id INTEGER REFERENCES announcements(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_session_id TEXT, -- For anonymous users
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, announcement_id), -- Prevent duplicate reads for authenticated users
    UNIQUE(user_session_id, announcement_id) -- Prevent duplicate reads for anonymous users
);

DO $$
BEGIN
    RAISE NOTICE '✅ Created user_read_announcements table';
END $$;

-- STEP 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_read_announcements_user_id ON user_read_announcements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_read_announcements_announcement_id ON user_read_announcements(announcement_id);
CREATE INDEX IF NOT EXISTS idx_user_read_announcements_session_id ON user_read_announcements(user_session_id);
CREATE INDEX IF NOT EXISTS idx_user_read_announcements_read_at ON user_read_announcements(read_at);

DO $$
BEGIN
    RAISE NOTICE '✅ Created indexes for user_read_announcements table';
END $$;

-- STEP 3: Enable Row Level Security
ALTER TABLE user_read_announcements ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    RAISE NOTICE '✅ Enabled RLS for user_read_announcements table';
END $$;

-- STEP 4: Create RLS policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own read status" ON user_read_announcements;
DROP POLICY IF EXISTS "Users can insert their own read status" ON user_read_announcements;
DROP POLICY IF EXISTS "Users can update their own read status" ON user_read_announcements;
DROP POLICY IF EXISTS "Anonymous users can manage their session reads" ON user_read_announcements;

-- Policy for authenticated users to read their own read status
CREATE POLICY "Users can read their own read status" ON user_read_announcements
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy for authenticated users to insert their own read status
CREATE POLICY "Users can insert their own read status" ON user_read_announcements
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy for authenticated users to update their own read status
CREATE POLICY "Users can update their own read status" ON user_read_announcements
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy for anonymous users (using session ID)
CREATE POLICY "Anonymous users can manage their session reads" ON user_read_announcements
    FOR ALL
    TO anon
    USING (user_session_id IS NOT NULL AND user_id IS NULL)
    WITH CHECK (user_session_id IS NOT NULL AND user_id IS NULL);

DO $$
BEGIN
    RAISE NOTICE '✅ Created RLS policies for user_read_announcements table';
END $$;

-- STEP 5: Create helper function to mark announcement as read
CREATE OR REPLACE FUNCTION mark_announcement_as_read(
    p_announcement_id INTEGER,
    p_user_session_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get current user ID if authenticated
    current_user_id := auth.uid();
    
    -- Insert or update read status
    IF current_user_id IS NOT NULL THEN
        -- Authenticated user
        INSERT INTO user_read_announcements (user_id, announcement_id)
        VALUES (current_user_id, p_announcement_id)
        ON CONFLICT (user_id, announcement_id) 
        DO UPDATE SET read_at = NOW();
    ELSE
        -- Anonymous user
        IF p_user_session_id IS NOT NULL THEN
            INSERT INTO user_read_announcements (user_session_id, announcement_id)
            VALUES (p_user_session_id, p_announcement_id)
            ON CONFLICT (user_session_id, announcement_id) 
            DO UPDATE SET read_at = NOW();
        ELSE
            RETURN FALSE;
        END IF;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    RAISE NOTICE '✅ Created mark_announcement_as_read function';
END $$;

-- STEP 6: Create helper function to get user's read announcements
CREATE OR REPLACE FUNCTION get_user_read_announcements(
    p_user_session_id TEXT DEFAULT NULL
)
RETURNS TABLE(announcement_id INTEGER, read_at TIMESTAMP WITH TIME ZONE)
SECURITY DEFINER
AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get current user ID if authenticated
    current_user_id := auth.uid();
    
    IF current_user_id IS NOT NULL THEN
        -- Authenticated user
        RETURN QUERY
        SELECT ura.announcement_id, ura.read_at
        FROM user_read_announcements ura
        WHERE ura.user_id = current_user_id;
    ELSE
        -- Anonymous user
        IF p_user_session_id IS NOT NULL THEN
            RETURN QUERY
            SELECT ura.announcement_id, ura.read_at
            FROM user_read_announcements ura
            WHERE ura.user_session_id = p_user_session_id;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    RAISE NOTICE '✅ Created get_user_read_announcements function';
END $$;

-- STEP 7: Verify the table structure
SELECT 
    '📋 USER_READ_ANNOUNCEMENTS TABLE COLUMNS:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_read_announcements'
ORDER BY ordinal_position;

-- STEP 8: Show RLS policies
SELECT 
    '🔒 USER_READ_ANNOUNCEMENTS RLS POLICIES:' as info,
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd 
FROM pg_policies 
WHERE tablename = 'user_read_announcements'
ORDER BY policyname;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '🎉 User read announcements table setup completed!';
    RAISE NOTICE '📝 Users can now persistently track read announcements';
    RAISE NOTICE '🔧 Next: Update the frontend code to use the database instead of localStorage';
END $$;