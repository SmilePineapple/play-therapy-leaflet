-- Fix RLS policies for admin_users and announcements tables (Version 2)
-- Run this in your Supabase SQL Editor
-- This version handles existing policies gracefully

-- 1. Fix admin_users RLS policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can read admin_users" ON admin_users;
DROP POLICY IF EXISTS "Admin users can read their own data" ON admin_users;
DROP POLICY IF EXISTS "Admin users can update their own data" ON admin_users;

-- Create proper RLS policies for admin_users
-- Allow authenticated users to read their own admin record
CREATE POLICY "Admin users can read their own data" ON admin_users
  FOR SELECT 
  TO authenticated
  USING (auth.email() = email);

-- Allow authenticated users to update their own admin record
CREATE POLICY "Admin users can update their own data" ON admin_users
  FOR UPDATE 
  TO authenticated
  USING (auth.email() = email);

-- Grant necessary permissions
GRANT SELECT ON admin_users TO authenticated;
GRANT UPDATE ON admin_users TO authenticated;

-- 2. Fix announcements RLS policies
-- Drop existing policies
DROP POLICY IF EXISTS "Public read access" ON announcements;
DROP POLICY IF EXISTS "Admin insert access" ON announcements;
DROP POLICY IF EXISTS "Admin update access" ON announcements;
DROP POLICY IF EXISTS "Admin delete access" ON announcements;

-- Create proper RLS policies for announcements
-- Public read access (anyone can read announcements)
CREATE POLICY "Public read access" ON announcements 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- Admin insert access (only authenticated admins can insert)
CREATE POLICY "Admin insert access" ON announcements 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.email()
      AND is_active = true
    )
  );

-- Admin update access (only authenticated admins can update)
CREATE POLICY "Admin update access" ON announcements 
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.email()
      AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.email()
      AND is_active = true
    )
  );

-- Admin delete access (only authenticated admins can delete)
CREATE POLICY "Admin delete access" ON announcements 
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.email()
      AND is_active = true
    )
  );

-- 3. Ensure admin user exists
-- Insert default admin user if it doesn't exist
INSERT INTO admin_users (email, name, role, is_active)
VALUES ('admin@communicationmatters.org', 'Admin User', 'admin', true)
ON CONFLICT (email) DO UPDATE SET
  is_active = true,
  updated_at = NOW();

-- 4. Add debug logging
DO $$
BEGIN
    RAISE NOTICE '✅ RLS policies fixed successfully!';
    RAISE NOTICE '✅ Admin user created/updated: admin@communicationmatters.org';
    RAISE NOTICE '✅ Please ensure this user exists in Supabase Auth';
    RAISE NOTICE '✅ Announcements table now has proper admin-only policies';
    RAISE NOTICE '✅ Admin users can now read their own records';
    RAISE NOTICE '🔍 Debug: View Details button removed from News.js';
    RAISE NOTICE '🔍 Debug: Read More button enhanced with console logging';
END $$;

-- 5. Verify the policies are working
-- Check announcements policies
SELECT 
  '📢 ANNOUNCEMENTS POLICIES:' as info,
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd 
FROM pg_policies 
WHERE tablename = 'announcements'
ORDER BY policyname;

-- Check admin_users policies
SELECT 
  '👤 ADMIN_USERS POLICIES:' as info,
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd 
FROM pg_policies 
WHERE tablename = 'admin_users'
ORDER BY policyname;

-- Check if admin user exists
SELECT 
  '🔍 ADMIN USER CHECK:' as info,
  email,
  name,
  role,
  is_active,
  created_at
FROM admin_users 
WHERE email = 'admin@communicationmatters.org';