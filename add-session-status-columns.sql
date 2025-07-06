-- Add Status and Cancellation Notes Columns to Sessions Table
-- Run this in your Supabase SQL Editor

-- Add status column to sessions table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sessions' AND column_name = 'status'
    ) THEN
        RAISE NOTICE '➕ Adding status column to sessions table...';
        ALTER TABLE sessions ADD COLUMN status VARCHAR(20) DEFAULT 'active';
        
        -- Update existing sessions to have 'active' status
        UPDATE sessions SET status = 'active' WHERE status IS NULL;
        
        RAISE NOTICE '✅ Successfully added status column to sessions table';
    ELSE
        RAISE NOTICE '✅ status column already exists in sessions table';
    END IF;
END $$;

-- Add cancellation_notes column to sessions table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sessions' AND column_name = 'cancellation_notes'
    ) THEN
        RAISE NOTICE '➕ Adding cancellation_notes column to sessions table...';
        ALTER TABLE sessions ADD COLUMN cancellation_notes TEXT;
        
        RAISE NOTICE '✅ Successfully added cancellation_notes column to sessions table';
    ELSE
        RAISE NOTICE '✅ cancellation_notes column already exists in sessions table';
    END IF;
END $$;

-- Verify the columns were added
SELECT 
    '✅ SESSIONS TABLE COLUMNS (STATUS & CANCELLATION):' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'sessions' 
AND column_name IN ('status', 'cancellation_notes')
ORDER BY column_name;

-- Show sample data
SELECT 
    '📊 SAMPLE SESSIONS DATA:' as info,
    id,
    title,
    status,
    cancellation_notes,
    created_at
FROM sessions 
LIMIT 5;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '🎉 Sessions table status and cancellation columns added successfully!';
    RAISE NOTICE '📝 You can now:';
    RAISE NOTICE '   - Mark sessions as "active" or "cancelled"';
    RAISE NOTICE '   - Add cancellation notes when sessions are cancelled';
    RAISE NOTICE '   - View cancellation status in the admin interface';
END $$;