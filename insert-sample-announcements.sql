-- Insert sample announcements with content for testing
-- Run this in your Supabase SQL editor

-- Clear existing announcements first (optional)
-- DELETE FROM announcements;

-- First, let's check if the summary column exists and add it if needed
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS summary TEXT;

-- Insert sample announcements with substantial content
INSERT INTO announcements (title, content, summary, priority, category) VALUES
('Welcome to Communication Matters 2025!', 
 'We are absolutely delighted to welcome you to this year''s Communication Matters Conference! This is our biggest event yet, with over 200 sessions, workshops, and presentations from leading experts in the field of augmentative and alternative communication. Please check your programme for any last-minute updates and don''t forget to visit our exhibition area where you can meet with sponsors and see the latest AAC technologies. We hope you have an amazing and inspiring conference experience!', 
 'Welcome message for conference attendees with important information about the event.', 
 'important', 
 'general'),

('Lunch Menu and Dietary Requirements', 
 'Today''s lunch menu has been carefully designed to accommodate all dietary requirements. We have a wide selection of vegetarian, vegan, and gluten-free options available. Our catering team has worked hard to ensure that all meals are clearly labeled with allergen information. Please see the catering desk on the ground floor for detailed ingredient lists and to speak with our catering manager if you have any specific dietary concerns. Lunch will be served from 12:30 PM to 2:00 PM in the main dining hall.', 
 'Information about lunch options and dietary accommodations.', 
 'normal', 
 'catering'),

('Emergency Procedures and Safety Information', 
 'For the safety and security of all attendees, please familiarize yourself with the emergency procedures for this venue. Emergency exits are clearly marked throughout the building. In case of fire alarm, please evacuate calmly using the nearest exit and gather at the designated assembly point in the main car park. Do not use elevators during an emergency. If you require assistance during evacuation, please inform a member of staff or volunteer who will ensure you receive appropriate help. First aid stations are located on each floor near the main reception areas.', 
 'Important safety and emergency information for all attendees.', 
 'urgent', 
 'venue'),

('Workshop Materials and Resources', 
 'All workshop materials and handouts are available for download from the conference app and website. Simply navigate to the Programme section and click on your chosen session to access downloadable resources. We encourage you to download materials in advance as WiFi may be limited during peak times. Physical copies of essential materials will be available at each workshop location, but digital access ensures you have everything you need. Don''t forget to bring a device for taking notes and accessing digital resources during sessions.', 
 'Information about accessing workshop materials and resources.', 
 'normal', 
 'general'),

('Networking Reception Tonight', 
 'Join us tonight for our annual networking reception in the main atrium from 6:00 PM to 8:00 PM. This is a wonderful opportunity to connect with fellow professionals, researchers, and advocates in the AAC community. Light refreshments and drinks will be provided. We''ll also have a special presentation from our keynote speaker at 7:00 PM. The reception is included in your conference registration, so please bring your badge for entry. We look forward to seeing you there for an evening of great conversation and community building!', 
 'Details about tonight''s networking reception and special presentation.', 
 'important', 
 'general'),

('Technology Support and WiFi Access', 
 'Free WiFi is available throughout the venue. Network name: CM2025_Guest, Password: Communication2025. If you experience any technical difficulties with the conference app, presentation equipment, or need assistance with accessibility technology, our tech support team is available at the help desk on the ground floor. They can also provide device charging stations and basic technical troubleshooting. For urgent technical issues during presentations, please contact a venue staff member immediately.', 
 'WiFi details and information about technical support services.', 
 'normal', 
 'technical');

-- Verify the data was inserted
SELECT id, title, LENGTH(content) as content_length, LENGTH(summary) as summary_length, priority, category 
FROM announcements 
ORDER BY created_at DESC;