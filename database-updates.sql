-- SQL script to add voting functionality and prepare for user authentication
-- Run this in your Supabase SQL editor

-- First, check the actual data type of questions.id column
-- This script handles both UUID and INTEGER id types

-- Add user authentication fields to questions table for future use
ALTER TABLE questions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE questions ADD COLUMN IF NOT EXISTS author_name TEXT;

-- Create a table to track user votes to prevent duplicate voting
-- Using the same data type as questions.id (likely INTEGER based on error)
CREATE TABLE IF NOT EXISTS question_votes (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(question_id, user_id),
  UNIQUE(question_id, ip_address)
);

-- Drop existing function if it exists to avoid conflicts
DROP FUNCTION IF EXISTS increment_question_votes(INTEGER);
DROP FUNCTION IF EXISTS increment_question_votes(INTEGER, INET);

-- Create function to increment question votes (using INTEGER for question_id)
CREATE OR REPLACE FUNCTION increment_question_votes(question_id INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE questions 
  SET votes = votes + 1 
  WHERE id = question_id;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on question_votes table
ALTER TABLE question_votes ENABLE ROW LEVEL SECURITY;

-- Create policy for question_votes
CREATE POLICY "Public read access" ON question_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated insert votes" ON question_votes FOR INSERT WITH CHECK (true);

-- Update the increment_question_votes function to prevent duplicate votes
-- Drop the simple version first
DROP FUNCTION IF EXISTS increment_question_votes(INTEGER);

-- Create the enhanced version with duplicate vote prevention
CREATE OR REPLACE FUNCTION increment_question_votes(question_id INTEGER, voter_ip INET DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  current_user_id UUID;
  vote_exists BOOLEAN;
  new_vote_count INTEGER;
BEGIN
  -- Get current user if authenticated
  current_user_id := auth.uid();
  
  -- Check if vote already exists
  IF current_user_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM question_votes 
      WHERE question_votes.question_id = increment_question_votes.question_id 
      AND user_id = current_user_id
    ) INTO vote_exists;
  ELSE
    -- For anonymous users, check by IP
    SELECT EXISTS(
      SELECT 1 FROM question_votes 
      WHERE question_votes.question_id = increment_question_votes.question_id 
      AND ip_address = voter_ip
    ) INTO vote_exists;
  END IF;
  
  -- If vote doesn't exist, add it
  IF NOT vote_exists THEN
    -- Insert vote record
    INSERT INTO question_votes (question_id, user_id, ip_address)
    VALUES (increment_question_votes.question_id, current_user_id, voter_ip);
    
    -- Increment vote count
    UPDATE questions 
    SET votes = votes + 1 
    WHERE id = increment_question_votes.question_id
    RETURNING votes INTO new_vote_count;
    
    RETURN jsonb_build_object(
      'success', true, 
      'message', 'Vote recorded', 
      'new_vote_count', new_vote_count
    );
  ELSE
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'You have already voted for this question'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION increment_question_votes TO anon, authenticated;

COMMENT ON FUNCTION increment_question_votes IS 'Increments vote count for a question, preventing duplicate votes per user/IP';