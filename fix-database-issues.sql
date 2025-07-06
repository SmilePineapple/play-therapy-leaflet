-- Comprehensive fix for database issues
-- Run this in your Supabase SQL Editor

-- 1. Fix questions table - add responded_at column if it doesn't exist
DO $$
BEGIN
    -- Check if responded_at column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'questions' AND column_name = 'responded_at'
    ) THEN
        ALTER TABLE questions ADD COLUMN responded_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added responded_at column to questions table';
    ELSE
        RAISE NOTICE 'responded_at column already exists in questions table';
    END IF;
    
    -- Check if responded_by column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'questions' AND column_name = 'responded_by'
    ) THEN
        ALTER TABLE questions ADD COLUMN responded_by TEXT;
        RAISE NOTICE 'Added responded_by column to questions table';
    ELSE
        RAISE NOTICE 'responded_by column already exists in questions table';
    END IF;
END $$;

-- 2. Ensure user_actions table exists and has proper RLS policies
CREATE TABLE IF NOT EXISTS user_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  action_details JSONB,
  page_url TEXT,
  user_agent TEXT,
  device_type VARCHAR(20),
  ip_address INET,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_action_type ON user_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_user_actions_created_at ON user_actions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_actions_device_type ON user_actions(device_type);

-- Enable Row Level Security
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own actions" ON user_actions;
DROP POLICY IF EXISTS "Admins can read all actions" ON user_actions;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON user_actions;
DROP POLICY IF EXISTS "Allow admins to read all" ON user_actions;

-- Create policy for authenticated users to insert their own actions
CREATE POLICY "Allow authenticated users to insert" ON user_actions
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policy for admins to read all actions
CREATE POLICY "Allow admins to read all" ON user_actions
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND is_active = true
    )
  );

-- 3. Ensure announcements table has proper RLS policies
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

-- Admin insert access
CREATE POLICY "Admin insert access" ON announcements 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND is_active = true
    )
  );

-- Admin update access
CREATE POLICY "Admin update access" ON announcements 
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND is_active = true
    )
  );

-- Admin delete access
CREATE POLICY "Admin delete access" ON announcements 
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND is_active = true
    )
  );

-- 4. Create function to track user actions (if it doesn't exist)
CREATE OR REPLACE FUNCTION track_user_action(
  p_action_type VARCHAR(50),
  p_action_details JSONB DEFAULT NULL,
  p_page_url TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_device_type VARCHAR(20) DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  action_id UUID;
BEGIN
  INSERT INTO user_actions (
    user_id,
    action_type,
    action_details,
    page_url,
    user_agent,
    device_type
  ) VALUES (
    auth.uid(),
    p_action_type,
    p_action_details,
    p_page_url,
    p_user_agent,
    p_device_type
  )
  RETURNING id INTO action_id;
  
  RETURN action_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION track_user_action TO authenticated;

-- 5. Verify admin_users table exists
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for admin_users (only admins can read)
DROP POLICY IF EXISTS "Admins can read admin_users" ON admin_users;
CREATE POLICY "Admins can read admin_users" ON admin_users
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND au.is_active = true
    )
  );

-- Create is_admin function
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin TO anon;

-- Add comments
COMMENT ON TABLE user_actions IS 'Tracks user actions for analytics and monitoring';
COMMENT ON FUNCTION track_user_action IS 'Function to track user actions with proper security';
COMMENT ON TABLE admin_users IS 'Stores admin user information for the Communication Matters admin interface';
COMMENT ON FUNCTION is_admin IS 'Checks if a given email belongs to an active admin user';

-- Final verification
DO $$
BEGIN
    RAISE NOTICE 'Database fixes completed successfully!';
    RAISE NOTICE 'Please verify:';
    RAISE NOTICE '1. questions table has responded_at and responded_by columns';
    RAISE NOTICE '2. user_actions table has proper RLS policies';
    RAISE NOTICE '3. announcements table has admin access policies';
    RAISE NOTICE '4. admin_users table exists with proper functions';
END $$;