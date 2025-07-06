-- SQL script to create admin_users table and set up admin authentication
-- Run this in your Supabase SQL editor

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_users table
CREATE POLICY "Admin users can read their own data" ON admin_users
  FOR SELECT USING (auth.email() = email);

CREATE POLICY "Admin users can update their own data" ON admin_users
  FOR UPDATE USING (auth.email() = email);

-- Insert default admin user
-- Note: You'll need to create this user in Supabase Auth first
INSERT INTO admin_users (email, name, role, is_active)
VALUES ('admin@communicationmatters.org', 'Admin User', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Grant necessary permissions
GRANT SELECT ON admin_users TO authenticated;
GRANT UPDATE ON admin_users TO authenticated;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = user_email AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin TO anon;

COMMENT ON TABLE admin_users IS 'Stores admin user information for the Communication Matters admin interface';
COMMENT ON FUNCTION is_admin IS 'Checks if a given email belongs to an active admin user';