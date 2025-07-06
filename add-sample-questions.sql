-- Add sample questions to test the QA page
-- Run this in your Supabase SQL Editor

-- Insert sample questions with different statuses
INSERT INTO questions (question, session_id, anonymous, votes, answered, response, responded_by, responded_at, created_at) VALUES
('What time is lunch today?', NULL, false, 5, true, 'Lunch is at 12:30', 'Conference Organizer', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '2 hours'),
('Can you provide more details about the AAC assessment strategies session?', NULL, true, 3, false, NULL, NULL, NULL, NOW() - INTERVAL '3 hours'),
('Is there WiFi available in all conference rooms?', NULL, false, 8, true, 'Yes, WiFi is available throughout the venue. The network name is "CM2025" and the password is "communication".', 'IT Support', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '4 hours'),
('Will the presentations be recorded and available later?', NULL, false, 12, true, 'Yes, all main sessions will be recorded and made available to registered attendees within 48 hours after the conference.', 'Conference Director', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '5 hours'),
('Where can I find information about local restaurants?', NULL, true, 2, false, NULL, NULL, NULL, NOW() - INTERVAL '1 hour'),
('Are there any accessibility accommodations available?', NULL, false, 6, true, 'Yes, we have sign language interpreters, hearing loops, and wheelchair accessible venues. Please contact registration for specific needs.', 'Accessibility Coordinator', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '6 hours'),
('What is the dress code for the conference?', NULL, false, 1, false, NULL, NULL, NULL, NOW() - INTERVAL '30 minutes'),
('Can I get a certificate of attendance?', NULL, false, 4, true, 'Yes, certificates of attendance will be emailed to all registered participants within one week of the conference.', 'Registration Team', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '7 hours');

-- Update the questions count to ensure proper display
UPDATE questions SET votes = votes + 0 WHERE id IS NOT NULL;

SELECT 'Sample questions added successfully!' as message;
SELECT COUNT(*) as total_questions FROM questions;
SELECT COUNT(*) as answered_questions FROM questions WHERE answered = true;
SELECT COUNT(*) as unanswered_questions FROM questions WHERE answered = false;