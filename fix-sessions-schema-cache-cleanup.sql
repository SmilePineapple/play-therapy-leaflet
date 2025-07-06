-- Sessions Table Duplicate Column Cleanup Script
-- This script resolves duplicate columns in the sessions table
-- IMPORTANT: BACKUP YOUR DATABASE BEFORE RUNNING THIS SCRIPT!

-- 1. First, let's analyze the current table structure
SELECT 
    '🔍 CURRENT SESSIONS TABLE STRUCTURE:' as info,
    ordinal_position,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'sessions'
ORDER BY ordinal_position;

-- 2. Identify duplicate columns
SELECT 
    '⚠️ DUPLICATE COLUMNS:' as info,
    column_name,
    COUNT(*) as occurrence_count,
    string_agg(data_type, ', ') as data_types
FROM information_schema.columns 
WHERE table_name = 'sessions'
GROUP BY column_name
HAVING COUNT(*) > 1
ORDER BY column_name;

-- 3. Create a backup of the sessions table
DO $$
BEGIN
    RAISE NOTICE '📦 Creating backup of sessions table...';
    
    -- Drop backup table if it exists
    DROP TABLE IF EXISTS sessions_backup;
    
    -- Create backup table
    CREATE TABLE sessions_backup AS SELECT * FROM sessions;
    
    RAISE NOTICE '✅ Backup created: sessions_backup';
END $$;

-- 4. Create a new sessions table with correct schema
-- IMPORTANT: Customize this based on your actual requirements!
DO $$
BEGIN
    RAISE NOTICE '🔧 Creating new sessions table with correct schema...';
    
    -- Rename the current sessions table
    ALTER TABLE sessions RENAME TO sessions_old;
    
    -- Create new sessions table with correct schema
    -- CUSTOMIZE THIS BASED ON YOUR ACTUAL SCHEMA REQUIREMENTS!
    CREATE TABLE sessions (
        id INTEGER PRIMARY KEY,
        user_id UUID,
        title VARCHAR NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        speaker VARCHAR NOT NULL,
        description TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        factor_id UUID,
        start_time TIMESTAMP WITH TIME ZONE NOT NULL,
        end_time TIMESTAMP WITH TIME ZONE NOT NULL,
        aal TEXT,
        location VARCHAR,
        not_after TIMESTAMP WITH TIME ZONE,
        track VARCHAR,
        refreshed_at TIMESTAMP WITHOUT TIME ZONE,
        day VARCHAR,
        user_agent TEXT,
        ip INET,
        tag TEXT
    );
    
    RAISE NOTICE '✅ New sessions table created with correct schema';
END $$;

-- 5. Migrate data from old table to new table
DO $$
BEGIN
    RAISE NOTICE '🔄 Migrating data from old table to new table...';
    
    -- Insert data from old table to new table
    -- CUSTOMIZE THIS BASED ON YOUR ACTUAL SCHEMA!
    INSERT INTO sessions (
        id, user_id, title, created_at, speaker, description, 
        updated_at, factor_id, start_time, end_time, aal, location, 
        not_after, track, refreshed_at, day, user_agent, ip, tag
    )
    SELECT 
        id, user_id, title, created_at, speaker, description, 
        COALESCE(updated_at, NOW()), factor_id, start_time, end_time, aal, location, 
        not_after, track, refreshed_at, day, user_agent, ip, tag
    FROM sessions_old;
    
    RAISE NOTICE '✅ Data migration completed';
END $$;

-- 6. Verify the new table structure
SELECT 
    '✅ NEW SESSIONS TABLE STRUCTURE:' as info,
    ordinal_position,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'sessions'
ORDER BY ordinal_position;

-- 7. Verify data integrity
SELECT 
    '📊 DATA VERIFICATION:' as info,
    (SELECT COUNT(*) FROM sessions_old) as old_count,
    (SELECT COUNT(*) FROM sessions) as new_count;

-- 8. Create the updated_at trigger
DO $$
BEGIN
    RAISE NOTICE '⚙️ Creating updated_at trigger...';
    
    -- Create the trigger function
    CREATE OR REPLACE FUNCTION update_sessions_updated_at()
    RETURNS TRIGGER AS $func$
    BEGIN
        -- Use dynamic assignment to avoid compilation errors
        EXECUTE format('UPDATE %I SET updated_at = NOW() WHERE id = $1', TG_TABLE_NAME) USING NEW.id;
        RETURN NEW;
    END;
    $func$ language 'plpgsql';
    
    -- Create the trigger
    CREATE TRIGGER update_sessions_updated_at
        AFTER UPDATE ON sessions
        FOR EACH ROW
        EXECUTE FUNCTION update_sessions_updated_at();
    
    RAISE NOTICE '✅ Trigger created successfully';
END $$;

-- 9. Test the trigger
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

-- 10. Cleanup (OPTIONAL - only run when you're sure everything is working!)
/*
DO $$
BEGIN
    RAISE NOTICE '🧹 Cleaning up old tables...';
    
    -- Drop the old sessions table
    DROP TABLE sessions_old;
    
    RAISE NOTICE '✅ Cleanup completed';
END $$;
*/

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '🎉 Sessions table schema fixed! The table now has correct column structure with no duplicates.';
END $$;

-- IMPORTANT NOTES:
-- 1. This script creates a backup of your sessions table before making changes
-- 2. It creates a new sessions table with the correct schema
-- 3. It migrates data from the old table to the new table
-- 4. The old table is preserved as sessions_old for safety
-- 5. You should manually verify data integrity before dropping the old table
-- 6. CUSTOMIZE the schema and data migration based on your actual requirements!