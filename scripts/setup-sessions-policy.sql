-- Add insert policy for sessions table to allow data import
-- Run this in Supabase SQL Editor before importing sessions

-- Drop existing policy if it exists (ignore errors if it doesn't exist)
DROP POLICY IF EXISTS "Public insert access" ON sessions;

-- Create policy to allow public insert for sessions (for data import)
CREATE POLICY "Public insert access" ON sessions FOR INSERT WITH CHECK (true);

-- Grant necessary permissions
GRANT INSERT ON sessions TO anon;
GRANT INSERT ON sessions TO authenticated;

-- Note: You may want to remove or restrict this policy after import for security