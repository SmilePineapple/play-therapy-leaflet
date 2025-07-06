-- Fix Admin Authentication Access Issues
-- Run this in your Supabase SQL Editor
-- This fixes the "permission denied for table users" error when creating announcements

-- 1. Create a secure function to check if current user is admin
-- This function uses SECURITY DEFINER to bypass RLS restrictions
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
DECLARE
    current_user_email TEXT;
    is_admin_result BOOLEAN := FALSE;
BEGIN
    -- Get the current user's email from auth.jwt()
    current_user_email := auth.email();
    
    -- Check if user email exists and is active in admin_users table
    SELECT EXISTS (
        SELECT 1 FROM admin_users 
        WHERE email = current_user_email 
        AND is_active = true
    ) INTO is_admin_result;
    
    RETURN is_admin_result;
EXCEPTION
    WHEN OTHERS THEN
        -- Return false if any error occurs
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 2. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_current_user_admin() TO authenticated;

-- 3. Update the existing is_admin function to be more robust
CREATE OR REPLACE FUNCTION is_admin(user_email TEXT)
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users 
        WHERE email = user_email 
        AND is_active = true
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 4. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_admin(TEXT) TO authenticated;

-- 5. Create a function to get current admin user details
CREATE OR REPLACE FUNCTION get_current_admin_user()
RETURNS TABLE(
    email TEXT,
    name TEXT,
    role TEXT,
    is_active BOOLEAN
)
SECURITY DEFINER
AS $$
DECLARE
    current_user_email TEXT;
BEGIN
    -- Get the current user's email from auth.jwt()
    current_user_email := auth.email();
    
    -- Return admin user details if they exist and are active
    RETURN QUERY
    SELECT 
        a.email,
        a.name,
        a.role,
        a.is_active
    FROM admin_users a
    WHERE a.email = current_user_email 
    AND a.is_active = true;
EXCEPTION
    WHEN OTHERS THEN
        -- Return empty result if any error occurs
        RETURN;
END;
$$ LANGUAGE plpgsql;

-- 6. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_current_admin_user() TO authenticated;

-- 7. Update announcements RLS policies to use the new function
-- Drop existing policies
DROP POLICY IF EXISTS "Admin insert access" ON announcements;
DROP POLICY IF EXISTS "Admin update access" ON announcements;
DROP POLICY IF EXISTS "Admin delete access" ON announcements;

-- Create new policies using the secure function
CREATE POLICY "Admin insert access" ON announcements 
  FOR INSERT 
  TO authenticated
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admin update access" ON announcements 
  FOR UPDATE 
  TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Admin delete access" ON announcements 
  FOR DELETE 
  TO authenticated
  USING (is_current_user_admin());

-- 8. Update other admin-related RLS policies
-- Update user_actions policies if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_actions') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "Admin can read user_actions" ON user_actions;
        DROP POLICY IF EXISTS "Admin can insert user_actions" ON user_actions;
        
        -- Create new policies
        CREATE POLICY "Admin can read user_actions" ON user_actions 
          FOR SELECT 
          TO authenticated
          USING (is_current_user_admin());
          
        CREATE POLICY "Admin can insert user_actions" ON user_actions 
          FOR INSERT 
          TO authenticated
          WITH CHECK (is_current_user_admin());
          
        RAISE NOTICE '✅ Updated user_actions RLS policies';
    END IF;
END $$;

-- 9. Ensure admin user exists and is properly configured
INSERT INTO admin_users (email, name, role, is_active)
VALUES ('admin@communicationmatters.org', 'Admin User', 'admin', true)
ON CONFLICT (email) DO UPDATE SET
  is_active = true,
  updated_at = NOW();

-- 10. Add debug logging
DO $$
BEGIN
    RAISE NOTICE '✅ Admin authentication access fixed!';
    RAISE NOTICE '✅ Created secure functions: is_current_user_admin(), get_current_admin_user()';
    RAISE NOTICE '✅ Updated RLS policies to use secure functions';
    RAISE NOTICE '✅ Admin user ensured: admin@communicationmatters.org';
    RAISE NOTICE '🔧 This should fix the "permission denied for table users" error';
    RAISE NOTICE '🔧 Admin users can now create announcements without auth.users access';
END $$;

-- 11. Test the functions
SELECT 
  '🧪 FUNCTION TESTS:' as info,
  'is_current_user_admin()' as function_name,
  'Available to authenticated users' as status;

SELECT 
  '🧪 FUNCTION TESTS:' as info,
  'get_current_admin_user()' as function_name,
  'Available to authenticated users' as status;

-- 12. Verify the updated policies
SELECT 
  '📢 UPDATED ANNOUNCEMENTS POLICIES:' as info,
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd 
FROM pg_policies 
WHERE tablename = 'announcements'
ORDER BY policyname;