-- Cleanup Duplicate Announcements Script
-- Run this in your Supabase SQL Editor
-- This script removes duplicate announcements and old 2024 references

DO $$
DECLARE
    duplicate_count INTEGER;
    old_2024_count INTEGER;
    final_count INTEGER;
BEGIN
    RAISE NOTICE '📢 Starting announcement cleanup...';
    
    -- Show initial count
    SELECT COUNT(*) INTO duplicate_count FROM announcements;
    RAISE NOTICE '📊 Initial announcement count: %', duplicate_count;
    
    -- Step 1: Remove exact duplicates (same title, keep the one with highest ID)
    RAISE NOTICE '🔄 Removing duplicate announcements by title...';
    
    DELETE FROM announcements a1
    USING announcements a2
    WHERE a1.title = a2.title
      AND a1.id < a2.id;
    
    GET DIAGNOSTICS duplicate_count = ROW_COUNT;
    RAISE NOTICE '✅ Removed % duplicate announcements', duplicate_count;
    
    -- Step 2: Remove announcements with 2024 references
    RAISE NOTICE '📅 Removing announcements with 2024 references...';
    
    DELETE FROM announcements 
    WHERE title LIKE '%2024%' 
       OR content LIKE '%2024%'
       OR summary LIKE '%2024%';
    
    GET DIAGNOSTICS old_2024_count = ROW_COUNT;
    RAISE NOTICE '✅ Removed % announcements with 2024 references', old_2024_count;
    
    -- Step 3: Show final results
    SELECT COUNT(*) INTO final_count FROM announcements;
    RAISE NOTICE '📊 Final announcement count: %', final_count;
    
    -- Show remaining announcements summary
    RAISE NOTICE '📋 Remaining announcements by category:';
    
    FOR rec IN 
        SELECT 
            category,
            COUNT(*) as count
        FROM announcements 
        GROUP BY category 
        ORDER BY category
    LOOP
        RAISE NOTICE '   %: % announcements', rec.category, rec.count;
    END LOOP;
    
    RAISE NOTICE '🎉 Announcement cleanup completed!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error during cleanup: %', SQLERRM;
        RAISE;
END $$;

-- Verification queries - run these separately to check results
/*
-- Show all remaining announcements
SELECT 
    id,
    title,
    priority,
    category,
    created_at::date as created_date
FROM announcements 
ORDER BY priority DESC, created_at DESC;

-- Check for any remaining duplicates
SELECT 
    title,
    COUNT(*) as count
FROM announcements 
GROUP BY title 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Check for any remaining 2024 references
SELECT COUNT(*) as announcements_with_2024
FROM announcements 
WHERE title LIKE '%2024%' 
   OR content LIKE '%2024%'
   OR summary LIKE '%2024%';
*/