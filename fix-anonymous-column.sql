-- Fix for missing columns in questions table
-- Run this in your Supabase SQL Editor to add missing columns

-- Add missing columns if they don't exist
ALTER TABLE questions ADD COLUMN IF NOT EXISTS anonymous BOOLEAN DEFAULT false;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS answered BOOLEAN DEFAULT false;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS votes INTEGER DEFAULT 0;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS answer TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS answered_by TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS answered_at TIMESTAMP WITH TIME ZONE;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'questions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show current table structure (run this separately in psql if needed)
-- \d questions;