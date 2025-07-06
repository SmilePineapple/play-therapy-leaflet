-- Fix for approved questions not showing on QA page
-- Run this in your Supabase SQL Editor

-- Update all questions with status='approved' to have answered=true
UPDATE questions
SET answered = true
WHERE status = 'approved' AND (answered IS NULL OR answered = false);

-- Update all questions with status='answered' to have answered=true (just in case)
UPDATE questions
SET answered = true
WHERE status = 'answered' AND (answered IS NULL OR answered = false);

-- Update all questions with an answer to have answered=true and status='answered'
UPDATE questions
SET 
  answered = true,
  status = 'answered'
WHERE answer IS NOT NULL AND answer != '' AND (answered IS NULL OR answered = false);

-- Update all questions with a response to have answer=response if answer is empty
UPDATE questions
SET answer = response
WHERE response IS NOT NULL AND response != '' AND (answer IS NULL OR answer = '');

-- Count affected rows for verification
SELECT 
  '✅ Fixed Questions Status' as operation,
  COUNT(*) as count
FROM questions
WHERE status = 'approved' OR status = 'answered';