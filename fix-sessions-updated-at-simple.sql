-- Simple Direct Fix for Sessions Updated_At Column
-- Run this in your Supabase SQL Editor
-- This script directly adds the updated_at column without complex checks

DO $$
BEGIN
    RAISE NOTICE '🔧 Starting simple sessions updated_at column fix...';
END $$;

-- STEP 1: Clean up any existing triggers first
DROP TRIGGER IF EXISTS set_sessions_updated_at ON sessions;
DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
DROP FUNCTION IF EXISTS update_sessions_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

DO $$
BEGIN
    RAISE NOTICE '✅ Cleaned up existing triggers and functions';
END $$;

-- STEP 2: Add the updated_at column directly (ignore if exists error)
DO $$
BEGIN
    BEGIN
        ALTER TABLE sessions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE '✅ Added updated_at column to sessions table';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE '✅ updated_at column already exists, skipping creation';
    END;
END $$;

-- STEP 3: Update any NULL values in existing rows
UPDATE sessions SET updated_at = NOW() WHERE updated_at IS NULL;

DO $$
BEGIN
    RAISE NOTICE '✅ Updated existing rows with current timestamp';
END $$;

-- STEP 4: Create the trigger function
CREATE OR REPLACE FUNCTION update_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    RAISE NOTICE '✅ Created trigger function';
END $$;

-- STEP 5: Create the trigger
CREATE TRIGGER set_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_sessions_updated_at();

DO $$
BEGIN
    RAISE NOTICE '✅ Created BEFORE UPDATE trigger';
END $$;

-- STEP 6: Verify the column exists
DO $$
DECLARE
    column_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns 
    WHERE table_name = 'sessions' AND column_name = 'updated_at';
    
    IF column_count > 0 THEN
        RAISE NOTICE '✅ VERIFICATION: updated_at column exists in sessions table';
    ELSE
        RAISE EXCEPTION '❌ CRITICAL: updated_at column was not created!';
    END IF;
END $$;

-- STEP 7: Test with a simple query
DO $$
DECLARE
    test_count INTEGER;
BEGIN
    SELECT COUNT(updated_at) INTO test_count FROM sessions LIMIT 1;
    RAISE NOTICE '✅ Test query successful - updated_at column is accessible';
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION '❌ Test query failed: %', SQLERRM;
END $$;

-- STEP 8: Show final table structure
SELECT 
    '📋 SESSIONS TABLE COLUMNS:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'sessions'
ORDER BY ordinal_position;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '🎉 Simple sessions updated_at fix completed!';
    RAISE NOTICE '📝 The updated_at column should now exist and work properly';
    RAISE NOTICE '🔧 Try cancelling a session in ContentModerator now';
END $$;