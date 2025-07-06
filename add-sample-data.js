const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addSampleQuestions() {
  console.log('🔍 Adding sample questions to database...');
  
  const sampleQuestions = [
    {
      text: 'What time is lunch today?',
      anonymous: false,
      votes: 5,
      answered: true,
      answer: 'Lunch is at 12:30',
      answered_by: 'Conference Organizer',
      answered_at: new Date().toISOString(),
      author_name: 'Conference Attendee'
    },
    {
      text: 'Where can I find the exhibition hall?',
      anonymous: false,
      votes: 3,
      answered: true,
      answer: 'The exhibition hall is on the ground floor, follow the signs from the main entrance.',
      answered_by: 'Venue Staff',
      answered_at: new Date().toISOString(),
      author_name: 'Sarah Johnson'
    },
    {
      text: 'Will the presentations be recorded?',
      anonymous: true,
      votes: 8,
      answered: false,
      author_name: 'Anonymous'
    },
    {
      text: 'Is there WiFi available throughout the venue?',
      anonymous: false,
      votes: 2,
      answered: true,
      answer: 'Yes, WiFi is available. Network: ConferenceWiFi, Password: AAC2025',
      answered_by: 'IT Support',
      answered_at: new Date().toISOString(),
      author_name: 'Mike Chen'
    },
    {
      text: 'What accessibility features are available?',
      anonymous: false,
      votes: 12,
      answered: false,
      author_name: 'Alex Thompson'
    }
  ];

  try {
    // First, check if questions already exist
    const { data: existingQuestions, error: fetchError } = await supabase
      .from('questions')
      .select('*');
    
    if (fetchError) {
      console.error('❌ Error fetching existing questions:', fetchError);
      return;
    }
    
    console.log(`📊 Found ${existingQuestions?.length || 0} existing questions`);
    
    if (existingQuestions && existingQuestions.length > 0) {
      console.log('✅ Questions already exist in database');
      console.log('📋 Existing questions:');
      existingQuestions.forEach((q, index) => {
        console.log(`   ${index + 1}. ${q.text} (${q.votes} votes, ${q.answered ? 'answered' : 'unanswered'})`);
      });
      return;
    }
    
    // Insert sample questions
    const { data, error } = await supabase
      .from('questions')
      .insert(sampleQuestions)
      .select();
    
    if (error) {
      console.error('❌ Error inserting questions:', error);
      return;
    }
    
    console.log('✅ Successfully added sample questions!');
    console.log(`📊 Added ${data?.length || 0} questions`);
    
    // Verify the insertion
    const { data: allQuestions, error: verifyError } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (verifyError) {
      console.error('❌ Error verifying questions:', verifyError);
      return;
    }
    
    console.log('\n📋 All questions in database:');
    allQuestions?.forEach((q, index) => {
      console.log(`   ${index + 1}. ${q.text} (${q.votes} votes, ${q.answered ? 'answered' : 'unanswered'})`);
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

addSampleQuestions();