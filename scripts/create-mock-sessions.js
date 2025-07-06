const fs = require('fs');
const path = require('path');

// Function to convert day name to date
function convertDayToDate(dayName) {
  const dayMap = {
    'Monday': '2025-09-08',
  'Tuesday': '2025-09-09',
  'Wednesday': '2025-09-10',
  'Thursday': '2025-09-11',
  'Friday': '2025-09-12'
  };
  return dayMap[dayName] || '2025-09-08';
}

// Function to parse time and create full datetime
function parseDateTime(date, time) {
  const dateStr = convertDayToDate(date);
  const [startTime] = time.split(' - ');
  const [hours, minutes] = startTime.split('.');
  return `${dateStr}T${hours.padStart(2, '0')}:${minutes}:00`;
}

// Function to transform session data for the app
function transformSessionData(session, index) {
  return {
    id: index + 1,
    title: session.title,
    speaker: session.speaker,
    abstract: `Session ${session.session_number} - Track ${session.track}\n\nAbstract #${session.abstract_number}`,
    category: session.category,
    location: session.location.replace(/,$/, ''), // Remove trailing comma
    start_time: parseDateTime(session.date, session.time),
    track: session.track,
    session_number: parseInt(session.session_number),
    abstract_number: session.abstract_number,
    date: session.date,
    time: session.time,
    bookmarked: false
  };
}

async function createMockSessions() {
  try {
    console.log('📄 Reading parsed sessions data...');
    const sessionsPath = path.join(__dirname, '..', 'data', 'parsed-sessions.json');
    const rawData = fs.readFileSync(sessionsPath, 'utf8');
    const sessions = JSON.parse(rawData);

    console.log(`🔍 Found ${sessions.length} sessions to transform`);

    // Transform the data
    const transformedSessions = sessions.map(transformSessionData);

    // Create mock data file for the app
    const mockDataPath = path.join(__dirname, '..', 'src', 'data', 'mockSessions.js');
    
    // Ensure the data directory exists
    const dataDir = path.dirname(mockDataPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const mockDataContent = `// Auto-generated mock session data from PDF
// Generated on: ${new Date().toISOString()}

export const mockSessions = ${JSON.stringify(transformedSessions, null, 2)};

export default mockSessions;
`;

    fs.writeFileSync(mockDataPath, mockDataContent, 'utf8');

    console.log('✅ Successfully created mock sessions data!');
    console.log(`📊 Created ${transformedSessions.length} sessions`);
    console.log(`📁 Saved to: ${mockDataPath}`);
    
    // Show sample of created data
    console.log('\n📋 Sample sessions:');
    transformedSessions.slice(0, 3).forEach((session, index) => {
      console.log(`\n${index + 1}. ${session.title}`);
      console.log(`   Speaker: ${session.speaker}`);
      console.log(`   Time: ${session.start_time}`);
      console.log(`   Location: ${session.location}`);
      console.log(`   Track: ${session.track}`);
    });

    console.log('\n🎉 Mock session data creation completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Update Programme.js to use the mock data');
    console.log('   2. Test the Programme page with real conference data');

  } catch (error) {
    console.error('❌ Error during mock data creation:', error);
  }
}

// Run the script
createMockSessions();