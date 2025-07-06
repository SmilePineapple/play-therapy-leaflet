-- Final Fix for Sessions Updated_At Trigger Issue
-- Run this in your Supabase SQL Editor
-- This script resolves the "record 'new' has no field 'updated_at'" error

DO $$
BEGIN
    RAISE NOTICE '🔧 Starting comprehensive sessions trigger cleanup and fix...';
END $$;

-- STEP 1: Drop all existing triggers on sessions table
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    RAISE NOTICE '🧹 Cleaning up existing triggers on sessions table...';
    
    FOR trigger_record IN 
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'sessions'::regclass 
        AND tgname LIKE '%updated_at%'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON sessions', trigger_record.tgname);
        RAISE NOTICE '🗑️ Dropped trigger: %', trigger_record.tgname;
    END LOOP;
END $$;

-- STEP 2: Drop all existing trigger functions related to sessions updated_at
DO $$
BEGIN
    RAISE NOTICE '🧹 Cleaning up existing trigger functions...';
    
    DROP FUNCTION IF EXISTS update_sessions_updated_at() CASCADE;
    DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
    
    RAISE NOTICE '✅ Cleaned up trigger functions';
END $$;

-- STEP 3: Ensure updated_at column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'sessions' AND column_name = 'updated_at'
    ) THEN
        RAISE NOTICE '➕ Adding updated_at column to sessions table...';
        ALTER TABLE sessions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        -- Update existing rows
        UPDATE sessions SET updated_at = NOW() WHERE updated_at IS NULL;
        
        RAISE NOTICE '✅ Successfully added updated_at column';
    ELSE
        RAISE NOTICE '✅ updated_at column already exists';
    END IF;
END $$;

-- STEP 4: Create the correct trigger function
CREATE OR REPLACE FUNCTION update_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    -- This function runs BEFORE UPDATE
    -- NEW record contains the updated values
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 5: Create the trigger with proper timing
CREATE TRIGGER set_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_sessions_updated_at();

DO $$
BEGIN
    RAISE NOTICE '✅ Created new BEFORE UPDATE trigger: set_sessions_updated_at';
END $$;

-- STEP 6: Test the trigger (with column existence check)
DO $$
DECLARE
    test_session_id INTEGER;
    old_updated_at TIMESTAMP WITH TIME ZONE;
    new_updated_at TIMESTAMP WITH TIME ZONE;
    column_exists BOOLEAN;
BEGIN
    -- First check if updated_at column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sessions' AND column_name = 'updated_at'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        RAISE NOTICE '❌ Cannot test trigger: updated_at column does not exist!';
        RAISE NOTICE '🔧 Please ensure STEP 3 completed successfully before running this test';
        RETURN;
    END IF;
    
    -- Get the first session ID
    SELECT id INTO test_session_id FROM sessions LIMIT 1;
    
    IF test_session_id IS NOT NULL THEN
        -- Get current updated_at
        EXECUTE format('SELECT updated_at FROM sessions WHERE id = %s', test_session_id) INTO old_updated_at;
        
        -- Wait a moment
        PERFORM pg_sleep(1);
        
        -- Test update (this should trigger the function)
        UPDATE sessions 
        SET title = title 
        WHERE id = test_session_id;
        
        -- Get new updated_at
        EXECUTE format('SELECT updated_at FROM sessions WHERE id = %s', test_session_id) INTO new_updated_at;
        
        IF new_updated_at > old_updated_at THEN
            RAISE NOTICE '✅ Trigger test PASSED! Updated_at changed from % to %', old_updated_at, new_updated_at;
        ELSE
            RAISE NOTICE '❌ Trigger test FAILED! Updated_at did not change';
        END IF;
    ELSE
        RAISE NOTICE '⚠️ No sessions found to test trigger';
    END IF;
END $$;

-- STEP 7: Verify final state
SELECT 
    '🔍 ACTIVE TRIGGERS ON SESSIONS TABLE:' as info,
    tgname as trigger_name,
    CASE 
        WHEN tgtype & 2 = 2 THEN 'BEFORE'
        WHEN tgtype & 4 = 4 THEN 'AFTER'
        ELSE 'OTHER'
    END as timing,
    CASE 
        WHEN tgtype & 16 = 16 THEN 'UPDATE'
        WHEN tgtype & 8 = 8 THEN 'INSERT'
        WHEN tgtype & 32 = 32 THEN 'DELETE'
        ELSE 'OTHER'
    END as event
FROM pg_trigger 
WHERE tgrelid = 'sessions'::regclass
AND tgname LIKE '%updated_at%';

-- STEP 8: Show updated_at column info
SELECT 
    '✅ SESSIONS UPDATED_AT COLUMN:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'sessions' AND column_name = 'updated_at';

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '🎉 Sessions trigger fix completed!';
    RAISE NOTICE '📝 The updated_at column will now be automatically updated on session changes';
    RAISE NOTICE '🔧 ContentModerator.js should now work without "record new has no field updated_at" errors';
END $$;