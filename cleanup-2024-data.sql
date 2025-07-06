-- Cleanup Script: Remove 2024 Sessions and Duplicate Announcements
-- Run this in your Supabase SQL Editor
-- This script will clean up old 2024 data and duplicate announcements

DO $$
DECLARE
    deleted_sessions INTEGER;
    deleted_announcements INTEGER;
    deleted_2024_announcements INTEGER;
    remaining_sessions INTEGER;
    remaining_announcements INTEGER;
    earliest_date DATE;
    latest_date DATE;
BEGIN
    RAISE NOTICE '🧹 Starting cleanup of 2024 data and duplicates...';
    
    -- Step 1: Remove sessions with 2024 dates
    RAISE NOTICE '📅 Removing sessions with 2024 dates...';
    
    DELETE FROM sessions 
    WHERE start_time::text LIKE '%2024%' 
       OR end_time::text LIKE '%2024%'
       OR created_at::text LIKE '%2024%';
    
    GET DIAGNOSTICS deleted_sessions = ROW_COUNT;
    RAISE NOTICE '✅ Removed % sessions with 2024 dates', deleted_sessions;
    
    -- Step 2: Clean up duplicate announcements
    RAISE NOTICE '📢 Cleaning up duplicate announcements...';
    
    -- Keep only the latest version of each announcement title
    DELETE FROM announcements a1
    USING announcements a2
    WHERE a1.title = a2.title
      AND a1.id < a2.id;
    
    GET DIAGNOSTICS deleted_announcements = ROW_COUNT;
    RAISE NOTICE '✅ Removed % duplicate announcements', deleted_announcements;
    
    -- Step 3: Remove old 2024 announcements specifically
    DELETE FROM announcements 
    WHERE title LIKE '%2024%' 
       OR content LIKE '%2024%'
       OR summary LIKE '%2024%';
    
    GET DIAGNOSTICS deleted_2024_announcements = ROW_COUNT;
    RAISE NOTICE '✅ Removed % announcements containing 2024 references', deleted_2024_announcements;
    
    -- Step 4: Show current data counts
    RAISE NOTICE '📊 Current data summary:';
    
    -- Count remaining sessions
    SELECT COUNT(*) INTO remaining_sessions FROM sessions;
    RAISE NOTICE '   Sessions remaining: %', remaining_sessions;
    
    -- Count remaining announcements
    SELECT COUNT(*) INTO remaining_announcements FROM announcements;
    RAISE NOTICE '   Announcements remaining: %', remaining_announcements;
    
    -- Show date range of remaining sessions
    SELECT 
        MIN(start_time::date) as earliest_session,
        MAX(start_time::date) as latest_session
    INTO earliest_date, latest_date
    FROM sessions;
    
    RAISE NOTICE '   Session date range: % to %', earliest_date, latest_date;
    
    RAISE NOTICE '🎉 Cleanup completed successfully!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error during cleanup: %', SQLERRM;
        RAISE;
END $$;

-- Additional verification queries
-- Uncomment these to run separately for verification

/*
-- Verify no 2024 sessions remain
SELECT COUNT(*) as sessions_with_2024_dates
FROM sessions 
WHERE start_time::text LIKE '%2024%' 
   OR end_time::text LIKE '%2024%';

-- Show remaining session date distribution
SELECT 
    start_time::date as session_date,
    COUNT(*) as session_count
FROM sessions 
GROUP BY start_time::date 
ORDER BY session_date;

-- Show remaining announcements
SELECT 
    id,
    title,
    priority,
    category,
    created_at::date as created_date
FROM announcements 
ORDER BY created_at DESC;

-- Check for any remaining duplicates
SELECT 
    title,
    COUNT(*) as duplicate_count
FROM announcements 
GROUP BY title 
HAVING COUNT(*) > 1;
*/