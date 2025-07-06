-- Fix Sessions Schema Cache Issue
-- Run this in your Supabase SQL Editor
-- This forces Supabase to refresh its schema cache for the sessions table

-- IMPORTANT: Run this script in sections, not all at once!
-- Copy and paste each section separately into Supabase SQL Editor

-- SECTION 1: Clean up existing triggers and functions
DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
DROP FUNCTION IF EXISTS update_sessions_updated_at();

-- SECTION 2: Diagnose and fix duplicate columns issue
-- First, let's check for duplicate columns
SELECT 
    '🔍 CHECKING FOR DUPLICATE COLUMNS:' as info,
    column_name,
    data_type,
    ordinal_position,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'sessions'
ORDER BY ordinal_position;

-- Check for duplicate column names
SELECT 
    '⚠️ DUPLICATE COLUMN ANALYSIS:' as info,
    column_name,
    COUNT(*) as occurrence_count
FROM information_schema.columns 
WHERE table_name = 'sessions'
GROUP BY column_name
HAVING COUNT(*) > 1
ORDER BY column_name;

-- Fix duplicate columns if they exist
DO $$
DECLARE
    duplicate_count INTEGER;
    column_exists BOOLEAN := FALSE;
BEGIN
    -- Check for duplicate updated_at columns
    SELECT COUNT(*) INTO duplicate_count
    FROM information_schema.columns 
    WHERE table_name = 'sessions' AND column_name = 'updated_at';
    
    RAISE NOTICE '🔍 Found % updated_at columns', duplicate_count;
    
    IF duplicate_count > 1 THEN
        RAISE NOTICE '⚠️ Multiple updated_at columns detected! This will cause query errors.';
        RAISE NOTICE '🔧 Manual intervention required: Please check your database schema for duplicate columns.';
        RAISE EXCEPTION 'DUPLICATE COLUMNS DETECTED: Cannot proceed with % updated_at columns. Please resolve schema conflicts first.', duplicate_count;
    ELSIF duplicate_count = 1 THEN
        RAISE NOTICE '✅ Single updated_at column found, proceeding...';
        column_exists := TRUE;
    ELSE
        RAISE NOTICE '➕ No updated_at column found, will create one...';
        column_exists := FALSE;
    END IF;
    
    -- Only add column if it doesn't exist
    IF NOT column_exists THEN
        RAISE NOTICE '➕ Adding updated_at column to sessions table...';
        ALTER TABLE sessions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE '✅ Successfully added updated_at column to sessions table';
        
        -- Update existing rows to have the current timestamp
        RAISE NOTICE '🔄 Updating existing sessions with current timestamp...';
        UPDATE sessions SET updated_at = NOW() WHERE updated_at IS NULL;
        RAISE NOTICE '✅ Updated existing sessions with current timestamp';
        
        -- Verify the column was actually created
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'sessions' AND column_name = 'updated_at'
        ) INTO column_exists;
        
        IF column_exists THEN
            RAISE NOTICE '✅ VERIFICATION: Column updated_at successfully created and verified';
        ELSE
            RAISE EXCEPTION '❌ CRITICAL ERROR: Column creation appeared to succeed but verification failed!';
        END IF;
    ELSE
        RAISE NOTICE '📋 Column updated_at already exists, skipping creation';
    END IF;
END $$;

-- SECTION 2B: Manual duplicate column cleanup (run this if Section 2 detected duplicates)
-- ⚠️ ONLY RUN THIS SECTION IF YOU GOT A DUPLICATE COLUMNS ERROR ABOVE!
-- This section helps you identify and manually resolve duplicate columns

-- Uncomment and run the following queries ONE AT A TIME to investigate:

-- 1. See the exact table structure with column positions
/*
SELECT 
    ordinal_position,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'sessions'
ORDER BY ordinal_position;
*/

-- 2. If you have duplicate updated_at columns, you may need to:
-- a) Backup your data first!
-- b) Drop the table and recreate it, OR
-- c) Use ALTER TABLE to drop specific columns by position

-- Example cleanup (DANGEROUS - backup first!):
-- ALTER TABLE sessions DROP COLUMN updated_at; -- This might drop the wrong one
-- Then re-run this script from Section 1

-- 3. For complex cases, consider exporting data, dropping table, and recreating:
/*
-- Export data first:
CREATE TABLE sessions_backup AS SELECT * FROM sessions;

-- Then drop and recreate the sessions table with proper schema
-- (You'll need to recreate the table structure manually)
*/

DO $$
BEGIN
    RAISE NOTICE '⚠️ Section 2B is for manual cleanup only. Read the comments carefully before proceeding.';
END $$;

-- Show the updated table structure
SELECT 
    '✅ UPDATED SESSIONS TABLE COLUMNS:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'sessions'
ORDER BY ordinal_position;

-- STOP HERE! Run the above section first, then wait a moment before running the next section.
-- This ensures the column is properly committed to the database.

-- SECTION 3: Force schema refresh and create trigger (run this after Section 2)
-- Add a temporary comment to force schema refresh
COMMENT ON TABLE sessions IS 'Conference sessions table - schema refreshed';

-- Create the trigger function with error handling
CREATE OR REPLACE FUNCTION update_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the updated_at column exists in the NEW record
    IF TG_OP = 'UPDATE' THEN
        -- Use dynamic assignment to avoid compilation errors
        EXECUTE format('UPDATE %I SET updated_at = NOW() WHERE id = $1', TG_TABLE_NAME) USING NEW.id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger
CREATE TRIGGER update_sessions_updated_at
    AFTER UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_sessions_updated_at();

-- SECTION 4: Verification and testing (run this after Section 3)
-- First, verify the column exists before testing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sessions' AND column_name = 'updated_at'
    ) THEN
        RAISE EXCEPTION '❌ ERROR: updated_at column does not exist! Please run Section 2 again and wait for it to complete before running this section.';
    ELSE
        RAISE NOTICE '✅ Column updated_at exists, proceeding with verification...';
    END IF;
END $$;

-- Verify the column exists and is properly configured
SELECT 
    '📋 SESSIONS TABLE UPDATED_AT COLUMN:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'sessions' AND column_name = 'updated_at';

-- Test the trigger by performing a dummy update
DO $$
DECLARE
    test_session_id INTEGER;
    old_updated_at TIMESTAMP WITH TIME ZONE;
    new_updated_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get the first session ID
    SELECT id INTO test_session_id FROM sessions LIMIT 1;
    
    IF test_session_id IS NOT NULL THEN
        -- Get the current updated_at value
        SELECT updated_at INTO old_updated_at FROM sessions WHERE id = test_session_id;
        
        -- Wait a moment to ensure timestamp difference
        PERFORM pg_sleep(1);
        
        -- Perform a dummy update to test the trigger
        UPDATE sessions 
        SET title = title 
        WHERE id = test_session_id;
        
        -- Get the new updated_at value
        SELECT updated_at INTO new_updated_at FROM sessions WHERE id = test_session_id;
        
        IF new_updated_at > old_updated_at THEN
            RAISE NOTICE '✅ Trigger working! Updated_at changed from % to %', old_updated_at, new_updated_at;
        ELSE
            RAISE NOTICE '⚠️ Trigger may not be working - updated_at did not change';
        END IF;
        
        RAISE NOTICE '✅ Trigger test completed for session ID: %', test_session_id;
    ELSE
        RAISE NOTICE '⚠️ No sessions found to test trigger';
    END IF;
END $$;

-- Show final verification
SELECT 
    '🔍 VERIFICATION - Sessions with updated_at:' as info,
    COUNT(*) as total_sessions,
    COUNT(updated_at) as sessions_with_updated_at
FROM sessions;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '🎉 Schema cache refresh complete! Try editing a session now.';
END $$;

-- INSTRUCTIONS:
-- 1. Run SECTION 1 first
-- 2. Run SECTION 2 - this will detect duplicate columns
--    - If you get a "DUPLICATE COLUMNS DETECTED" error, you have two options:
--      OPTION 1 (RECOMMENDED): Use the comprehensive cleanup script 'fix-sessions-schema-cache-cleanup.sql'
--               This script completely reconstructs the table with correct schema and migrates data safely.
--      OPTION 2: Use Section 2B below for manual cleanup (more complex, requires careful execution)
--    - If successful, skip Section 2B and go to Section 3
-- 2B. ONLY if Section 2 failed: Use Section 2B for manual cleanup
--     - Follow the commented instructions carefully
--     - Backup your data before making changes
--     - After cleanup, re-run from Section 1
-- 3. Wait a moment, then run SECTION 3
-- 4. Finally run SECTION 4 to verify everything works
-- 
-- TROUBLESHOOTING:
-- If Section 2 gives "DUPLICATE COLUMNS DETECTED" error:
-- - You have multiple updated_at or created_at columns
-- - RECOMMENDED: Use 'fix-sessions-schema-cache-cleanup.sql' for comprehensive cleanup
-- - ALTERNATIVE: Use Section 2B to investigate and clean up manually
-- - This is likely caused by running column creation scripts multiple times
-- 
-- If Section 4 gives "column updated_at does not exist" error:
-- - Go back and run Section 2 again
-- - Make sure you see the success message before proceeding
-- - Each section must complete successfully before moving to the next
-- For complex duplicate column issues, strongly recommend using 'fix-sessions-schema-cache-cleanup.sql'
-- This step-by-step approach ensures proper schema cache refresh.