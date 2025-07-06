-- Simple Script: Remove Only 2024 Sessions
-- Run this in your Supabase SQL Editor
-- This script removes only sessions with 2024 dates, keeping announcements intact

DO $$
DECLARE
    deleted_count INTEGER;
    remaining_count INTEGER;
BEGIN
    RAISE NOTICE '🗓️ Removing sessions with 2024 dates...';
    
    -- Remove sessions with 2024 in start_time, end_time, or created_at
    DELETE FROM sessions 
    WHERE start_time::text LIKE '%2024%' 
       OR end_time::text LIKE '%2024%'
       OR created_at::text LIKE '%2024%'
       OR description LIKE '%2024%';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '✅ Removed % sessions with 2024 dates', deleted_count;
    
    -- Count remaining sessions
    SELECT COUNT(*) INTO remaining_count FROM sessions;
    RAISE NOTICE '📊 Sessions remaining in database: %', remaining_count;
    
    -- Show date range of remaining sessions
    IF remaining_count > 0 THEN
        DECLARE
            earliest_date DATE;
            latest_date DATE;
        BEGIN
            SELECT 
                MIN(start_time::date),
                MAX(start_time::date)
            INTO earliest_date, latest_date
            FROM sessions;
            
            RAISE NOTICE '📅 Session date range: % to %', earliest_date, latest_date;
        END;
    END IF;
    
    RAISE NOTICE '🎉 2024 session cleanup completed!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error during cleanup: %', SQLERRM;
        RAISE;
END $$;

-- Verification query - run this separately to check results
/*
SELECT 
    COUNT(*) as total_sessions,
    MIN(start_time::date) as earliest_date,
    MAX(start_time::date) as latest_date
FROM sessions;

-- Check for any remaining 2024 references
SELECT COUNT(*) as sessions_with_2024
FROM sessions 
WHERE start_time::text LIKE '%2024%' 
   OR end_time::text LIKE '%2024%'
   OR description LIKE '%2024%';
*/