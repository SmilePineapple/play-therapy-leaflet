-- Fix Missing updated_at Column in Sessions Table
-- Run this in your Supabase SQL Editor

-- First, check if the updated_at column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sessions' AND column_name = 'updated_at'
    ) THEN
        RAISE NOTICE '➕ Adding updated_at column to sessions table...';
        ALTER TABLE sessions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        -- Update existing rows to have the current timestamp
        UPDATE sessions SET updated_at = NOW() WHERE updated_at IS NULL;
        
        RAISE NOTICE '✅ Successfully added updated_at column to sessions table';
    ELSE
        RAISE NOTICE '✅ updated_at column already exists in sessions table';
    END IF;
END $$;

-- Create or replace the trigger function for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger
DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_sessions_updated_at();

-- Verify the column was added
SELECT 
    '✅ SESSIONS TABLE COLUMNS:' as info,
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
    RAISE NOTICE '🎉 Sessions table updated_at column fix completed!';
END $$;