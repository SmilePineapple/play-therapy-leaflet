-- Fix Content Moderation Issues
-- Run this in your Supabase SQL Editor
-- This addresses questions table schema and session editing issues

-- 1. Fix questions table - add missing 'response' column
DO $$
BEGIN
    -- Check if response column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'questions' AND column_name = 'response'
    ) THEN
        ALTER TABLE questions ADD COLUMN response TEXT;
        RAISE NOTICE '✅ Added response column to questions table';
    ELSE
        RAISE NOTICE '✅ response column already exists in questions table';
    END IF;
    
    -- Ensure other required columns exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'questions' AND column_name = 'status'
    ) THEN
        ALTER TABLE questions ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'answered'));
        RAISE NOTICE '✅ Added status column to questions table';
    ELSE
        RAISE NOTICE '✅ status column already exists in questions table';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'questions' AND column_name = 'responded_at'
    ) THEN
        ALTER TABLE questions ADD COLUMN responded_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE '✅ Added responded_at column to questions table';
    ELSE
        RAISE NOTICE '✅ responded_at column already exists in questions table';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'questions' AND column_name = 'responded_by'
    ) THEN
        ALTER TABLE questions ADD COLUMN responded_by TEXT;
        RAISE NOTICE '✅ Added responded_by column to questions table';
    ELSE
        RAISE NOTICE '✅ responded_by column already exists in questions table';
    END IF;
END $$;

-- 2. Ensure sessions table has proper structure for editing
DO $$
BEGIN
    -- Check if updated_at column exists in sessions table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sessions' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE sessions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE '✅ Added updated_at column to sessions table';
    ELSE
        RAISE NOTICE '✅ updated_at column already exists in sessions table';
    END IF;
END $$;

-- 3. Create or update trigger for sessions updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Ensure proper RLS policies for content moderation
-- Questions table policies
DROP POLICY IF EXISTS "Admin can update questions" ON questions;
CREATE POLICY "Admin can update questions" ON questions
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.email()
      AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.email()
      AND is_active = true
    )
  );

-- Sessions table policies
DROP POLICY IF EXISTS "Admin can update sessions" ON sessions;
CREATE POLICY "Admin can update sessions" ON sessions
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.email()
      AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.email()
      AND is_active = true
    )
  );

-- 5. Grant necessary permissions
GRANT UPDATE ON questions TO authenticated;
GRANT UPDATE ON sessions TO authenticated;

-- 6. Add debug logging
DO $$
BEGIN
    RAISE NOTICE '🔍 Content Moderation Database Fixes Applied:';
    RAISE NOTICE '✅ Questions table: Added response, status, responded_at, responded_by columns';
    RAISE NOTICE '✅ Sessions table: Added updated_at column and trigger';
    RAISE NOTICE '✅ RLS policies: Updated for admin content moderation';
    RAISE NOTICE '✅ Permissions: Granted UPDATE access to authenticated users';
    RAISE NOTICE '🔧 Next: Update ContentModerator.js to add search functionality';
END $$;

-- 7. Verify table structures
SELECT 
  '📋 QUESTIONS TABLE STRUCTURE:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'questions'
ORDER BY ordinal_position;

SELECT 
  '📋 SESSIONS TABLE STRUCTURE:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'sessions'
ORDER BY ordinal_position;

-- 8. Check RLS policies
SELECT 
  '🔒 QUESTIONS RLS POLICIES:' as info,
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd 
FROM pg_policies 
WHERE tablename = 'questions'
ORDER BY policyname;

SELECT 
  '🔒 SESSIONS RLS POLICIES:' as info,
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd 
FROM pg_policies 
WHERE tablename = 'sessions'
ORDER BY policyname;