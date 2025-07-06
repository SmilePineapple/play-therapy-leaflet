-- Fix RLS policies for announcements table to allow admin inserts
-- Run this in your Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access" ON announcements;
DROP POLICY IF EXISTS "Admin insert access" ON announcements;
DROP POLICY IF EXISTS "Admin update access" ON announcements;
DROP POLICY IF EXISTS "Admin delete access" ON announcements;

-- Create comprehensive RLS policies for announcements
-- Public read access
CREATE POLICY "Public read access" ON announcements 
  FOR SELECT 
  USING (true);

-- Admin insert access (authenticated users can insert)
CREATE POLICY "Admin insert access" ON announcements 
  FOR INSERT 
  WITH CHECK (true);

-- Admin update access (authenticated users can update)
CREATE POLICY "Admin update access" ON announcements 
  FOR UPDATE 
  USING (true) 
  WITH CHECK (true);

-- Admin delete access (authenticated users can delete)
CREATE POLICY "Admin delete access" ON announcements 
  FOR DELETE 
  USING (true);

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'announcements';