const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

// Function to parse end time from time string
function parseEndDateTime(date, time) {
  const dateStr = convertDayToDate(date);
  const [startTime, endTime] = time.split(' - ');
  if (endTime) {
    const [hours, minutes] = endTime.split('.');
    return `${dateStr}T${hours.padStart(2, '0')}:${minutes}:00`;
  }
  // If no end time, add 45 minutes to start time
  const [startHours, startMinutes] = startTime.split('.');
  const startDate = new Date(`${dateStr}T${startHours.padStart(2, '0')}:${startMinutes}:00`);
  startDate.setMinutes(startDate.getMinutes() + 45);
  return startDate.toISOString().slice(0, 19);
}

// Function to transform session data for Supabase
function transformSessionData(session) {
  return {
    title: session.title,
    speaker: session.speaker,
    description: `Session ${session.session_number} - Track ${session.track}\n\nAbstract #${session.abstract_number}\n\nCategory: ${session.category}`,
    location: session.location.replace(/,$/, ''), // Remove trailing comma
    start_time: parseDateTime(session.date, session.time),
    end_time: parseEndDateTime(session.date, session.time),
    track: session.track,
    day: session.date
  };
}

async function importSessions() {
  try {
    console.log('📄 Reading parsed sessions data...');
    const sessionsPath = path.join(__dirname, '..', 'src', 'data', 'parsed-sessions.json');
    const rawData = fs.readFileSync(sessionsPath, 'utf8');
    const sessions = JSON.parse(rawData);

    console.log(`🔍 Found ${sessions.length} sessions to import`);

    // Transform the data
    const transformedSessions = sessions.map(transformSessionData);

    console.log('🗄️ Clearing existing sessions...');
    // Clear existing sessions (optional - remove this if you want to keep existing data)
    const { error: deleteError } = await supabase
      .from('sessions')
      .delete()
      .neq('id', 0); // Delete all records

    if (deleteError) {
      console.warn('⚠️ Warning clearing existing sessions:', deleteError.message);
    }

    console.log('📤 Importing sessions to Supabase...');
    console.log('📝 Note: If you get RLS policy errors, please run the setup-sessions-policy.sql script in your Supabase SQL Editor first.');
    
    // Import in smaller batches to avoid potential issues
    const batchSize = 10;
    let successCount = 0;
    
    for (let i = 0; i < transformedSessions.length; i += batchSize) {
      const batch = transformedSessions.slice(i, i + batchSize);
      console.log(`📤 Importing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(transformedSessions.length/batchSize)} (${batch.length} sessions)...`);
      
      const { data, error } = await supabase
        .from('sessions')
        .insert(batch);

      if (error) {
        console.error(`❌ Error importing batch ${Math.floor(i/batchSize) + 1}:`, error);
        if (error.code === '42501') {
          console.error('🔒 RLS Policy Error: Please run the setup-sessions-policy.sql script in your Supabase SQL Editor to allow session inserts.');
          console.error('📄 The script is located at: scripts/setup-sessions-policy.sql');
        }
        return;
      } else {
        successCount += batch.length;
        console.log(`✅ Successfully imported batch ${Math.floor(i/batchSize) + 1} (${successCount}/${transformedSessions.length} total)`);
      }
    }

    console.log('✅ Successfully imported all sessions!');
    console.log(`📊 Imported ${successCount} sessions`);
    
    // Show sample of imported data
    console.log('\n📋 Sample imported sessions:');
    transformedSessions.slice(0, 3).forEach((session, index) => {
      console.log(`\n${index + 1}. ${session.title}`);
      console.log(`   Speaker: ${session.speaker}`);
      console.log(`   Time: ${session.start_time} - ${session.end_time}`);
      console.log(`   Location: ${session.location}`);
      console.log(`   Track: ${session.track}`);
      console.log(`   Day: ${session.day}`);
    });

    console.log('\n🎉 Session import completed successfully!');

  } catch (error) {
    console.error('❌ Error during import:', error);
  }
}

// Run the import
importSessions();