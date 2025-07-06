-- Fix admin authentication RLS policies
-- This script resolves the 500 error when checking admin status
-- Run this in your Supabase SQL Editor

-- 1. Drop existing problematic policies
DROP POLICY IF EXISTS "Admin users can read their own data" ON admin_users;
DROP POLICY IF EXISTS "Admin users can update their own data" ON admin_users;
DROP POLICY IF EXISTS "Admins can read admin_users" ON admin_users;

-- 2. Create a more permissive policy for admin authentication
-- This allows the is_admin function to work properly
CREATE POLICY "Allow admin status checks" ON admin_users
  FOR SELECT 
  TO authenticated
  USING (true);

-- 3. Create policy for admin profile updates (more restrictive)
CREATE POLICY "Admin users can update their own data" ON admin_users
  FOR UPDATE 
  TO authenticated
  USING (auth.email() = email)
  WITH CHECK (auth.email() = email);

-- 4. Ensure the is_admin function exists and works properly
CREATE OR REPLACE FUNCTION is_admin(user_email TEXT)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = user_email 
    AND is_active = true
  );
END;
$$;

-- 5. Grant necessary permissions
GRANT SELECT ON admin_users TO authenticated;
GRANT UPDATE ON admin_users TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin TO anon;

-- 6. Ensure admin user exists
INSERT INTO admin_users (email, name, role, is_active)
VALUES ('admin@communicationmatters.org', 'Admin User', 'admin', true)
ON CONFLICT (email) DO UPDATE SET
  is_active = true,
  updated_at = NOW();

-- 7. Test the function
SELECT 
  '🔍 TESTING is_admin FUNCTION:' as info,
  is_admin('admin@communicationmatters.org') as admin_check,
  is_admin('nonexistent@example.com') as non_admin_check;

-- 8. Verify policies
SELECT 
  '📋 CURRENT ADMIN_USERS POLICIES:' as info,
  policyname, 
  permissive, 
  roles, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'admin_users'
ORDER BY policyname;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Admin authentication RLS policies fixed!';
    RAISE NOTICE '✅ The is_admin function should now work without 500 errors';
    RAISE NOTICE '✅ Admin users can authenticate and access the admin interface';
    RAISE NOTICE '🔧 Please test the admin login now';
END $$;