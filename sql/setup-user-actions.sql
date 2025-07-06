-- Create user_actions table for tracking user activity
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

-- Create policy for users to insert their own actions
CREATE POLICY "Users can insert their own actions" ON user_actions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for admins to read all actions
CREATE POLICY "Admins can read all actions" ON user_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Insert some sample data for testing (only if there are existing users)
-- This will only insert data if there are users in the auth.users table
DO $$
DECLARE
  sample_user_id UUID;
BEGIN
  -- Get the first user ID from auth.users table
  SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
  
  -- Only insert sample data if we found a user
  IF sample_user_id IS NOT NULL THEN
    INSERT INTO user_actions (user_id, action_type, action_details, page_url, device_type, created_at) VALUES
      (sample_user_id, 'page_view', '{"page": "home"}', '/home', 'desktop', NOW() - INTERVAL '1 day'),
      (sample_user_id, 'question_submit', '{"question_id": 1}', '/qa', 'mobile', NOW() - INTERVAL '2 hours'),
      (sample_user_id, 'session_join', '{"session_id": 1}', '/sessions', 'tablet', NOW() - INTERVAL '3 hours'),
      (sample_user_id, 'bookmark_add', '{"content_id": 1}', '/news', 'desktop', NOW() - INTERVAL '1 hour'),
      (sample_user_id, 'page_view', '{"page": "qa"}', '/qa', 'mobile', NOW() - INTERVAL '30 minutes'),
      (sample_user_id, 'page_view', '{"page": "sessions"}', '/sessions', 'desktop', NOW() - INTERVAL '15 minutes'),
      (sample_user_id, 'announcement_view', '{"announcement_id": 1}', '/news', 'mobile', NOW() - INTERVAL '45 minutes'),
      (sample_user_id, 'session_register', '{"session_id": 2}', '/sessions', 'tablet', NOW() - INTERVAL '2 days'),
      (sample_user_id, 'question_submit', '{"question_id": 2}', '/qa', 'desktop', NOW() - INTERVAL '4 hours'),
      (sample_user_id, 'page_view', '{"page": "home"}', '/home', 'mobile', NOW() - INTERVAL '6 hours');
    
    RAISE NOTICE 'Sample user actions data inserted successfully';
  ELSE
    RAISE NOTICE 'No users found in auth.users table - skipping sample data insertion';
  END IF;
END $$;

-- Create function to track user actions
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

COMMENT ON TABLE user_actions IS 'Tracks user actions for analytics and monitoring';
COMMENT ON FUNCTION track_user_action IS 'Function to track user actions with proper security';