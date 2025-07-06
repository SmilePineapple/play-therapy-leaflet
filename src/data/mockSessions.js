// Auto-generated mock session data from PDF
// Generated on: 2025-01-07T10:30:00.000Z
// Updated for 2025 Conference (September 8-12, 2025)

// Import the parsed sessions data
// Using JS module instead of JSON for better Vercel compatibility
import parsedSessionsData from './parsed-sessions.js';

console.log('🔧 Debug - mockSessions.js loaded, parsedSessionsData length:', parsedSessionsData?.length || 'undefined');


// Transform parsed data to match expected format
const transformedSessions = parsedSessionsData.map(session => {

  return {
    ...session,
    start_time: session.formatted_time ? session.formatted_time.split(' - ')[0] : '2025-09-08T10:00:00',
    abstract: `Session ${session.session_number} - Track ${session.track}\n\nAbstract #${session.abstract_number}`,
    bookmarked: false
  };
});


export const mockSessions = transformedSessions;
