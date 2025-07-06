const fs = require('fs');
const pdf = require('pdf-parse');

// Path to the 2025 PDF file
const pdfPath = '/Users/jacobdale-rourke/Desktop/Communication Matters/CM2025Timetablev1online.pdf';

// Function to parse session data from text
function parseSessionData(text) {
  console.log('🔍 Debug: Starting to parse session data...');
  const sessions = [];
  
  // Split into lines for easier processing
  const lines = text.split('\n');
  console.log(`🔍 Debug: Found ${lines.length} lines in PDF`);
  
  // Find SESSION blocks
   for (let i = 0; i < lines.length; i++) {
     const line = lines[i].trim();
     
     // Look for SESSION X or EXHIBITOR SESSION X lines
     if (line.match(/^(EXHIBITOR\s+)?SESSION\s+\d+$/)) {
       const sessionMatch = line.match(/(EXHIBITOR\s+)?SESSION\s+(\d+)/);
       const sessionNumber = sessionMatch[2];
       const isExhibitorSession = !!sessionMatch[1];
       
       console.log(`🔍 Debug: Found session ${sessionNumber} (exhibitor: ${isExhibitorSession})`);
       
       // Get the next few lines to find session details
       let sessionBlock = [];
       let sessionTime = '';
       let sessionDate = '';
       
       for (let j = i; j < Math.min(i + 50, lines.length); j++) {
         sessionBlock.push(lines[j]);
         
         // Look for time information in the next line after SESSION
         if (j === i + 1) {
           const timeLine = lines[j].trim();
           const timeMatch = timeLine.match(/(Monday|Tuesday|Wednesday|Thursday|Friday)\s+(\d{1,2}\.\d{2})\s*-\s*(\d{1,2}\.\d{2})/);
           if (timeMatch) {
             sessionDate = timeMatch[1];
             sessionTime = `${timeMatch[2]} - ${timeMatch[3]}`;
             console.log(`🔍 Debug: Session ${sessionNumber} - ${sessionDate} ${sessionTime}`);
           }
         }
         
         // Stop when we hit the next SESSION or a major break
         if (j > i && (lines[j].match(/^(EXHIBITOR\s+)?SESSION\s+\d+$/) || lines[j].includes('BREAK:') || lines[j].includes('LUNCH:') || lines[j].includes('Tea/coffee and Farewell'))) {
           break;
         }
       }
       
       // Parse individual session items within this block
       const sessionItems = parseSessionItems(sessionBlock.join('\n'), sessionNumber, sessionDate, sessionTime);
       console.log(`🔍 Debug: Found ${sessionItems.length} items in session ${sessionNumber}`);
       sessions.push(...sessionItems);
     }
     
     // Look for Poster sessions
     if (line.match(/^Posters$/)) {
       console.log('🔍 Debug: Found Poster session');
       // Get the next few lines to find poster details
       let posterBlock = [];
       let posterTime = '';
       let posterDate = '';
       
       for (let j = i; j < Math.min(i + 100, lines.length); j++) {
         posterBlock.push(lines[j]);
         
         // Look for time information in the next line after Posters
         if (j === i + 1) {
           const timeLine = lines[j].trim();
           const timeMatch = timeLine.match(/(Monday|Tuesday|Wednesday|Thursday|Friday)\s+(\d{1,2}\.\d{2})\s*-\s*(\d{1,2}\.\d{2})/); 
           if (timeMatch) {
             posterDate = timeMatch[1];
             posterTime = `${timeMatch[2]} - ${timeMatch[3]}`;
             console.log(`🔍 Debug: Poster session - ${posterDate} ${posterTime}`);
           }
         }
         
         // Stop when we hit the next major section
         if (j > i && (lines[j].match(/^(EXHIBITOR\s+)?SESSION\s+\d+$/) || lines[j].includes('Tuesday 09.00 - 09.10'))) {
           break;
         }
       }
       
       // Parse poster items
       const posterItems = parsePosterItems(posterBlock.join('\n'), posterDate, posterTime);
       console.log(`🔍 Debug: Found ${posterItems.length} poster items`);
       sessions.push(...posterItems);
     }
   }
  
  console.log(`🔍 Debug: Total sessions parsed: ${sessions.length}`);
  return sessions;
}

// Function to parse poster items
function parsePosterItems(posterBlock, posterDate, posterTime) {
  const items = [];
  
  // Look for poster items like "P1 Clinical and Professional..."
  const itemMatches = posterBlock.match(/P\d+\s+[^\n]+[\s\S]*?(?=P\d+|$)/g);
  
  if (itemMatches) {
    itemMatches.forEach(itemText => {
      const item = parsePosterItem(itemText, posterDate, posterTime);
      if (item && item.title && item.title.length > 5) {
        items.push(item);
      }
    });
  }
  
  return items;
}

// Function to parse individual poster item
function parsePosterItem(itemText, posterDate, posterTime) {
  const session = {
    session_number: 'Poster',
    title: '',
    speaker: '',
    time: posterTime,
    date: posterDate,
    category: '',
    location: 'Parkinson Court',
    track: '',
    abstract_number: ''
  };
  
  const lines = itemText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  if (lines.length < 3) return null;
  
  // First line: category (e.g., "P1 Clinical and Professional Service Delivery")
  const categoryLine = lines[0];
  const categoryMatch = categoryLine.match(/^(P\d+)\s+(.+)$/);
  if (categoryMatch) {
    session.track = categoryMatch[1];
    session.category = categoryMatch[2];
  }
  
  // Look for abstract number (#XX)
  const abstractMatch = itemText.match(/#(\d+)/);
  if (abstractMatch) {
    session.abstract_number = abstractMatch[1];
  }
  
  // Extract title (usually after the abstract number)
  const titleMatch = itemText.match(/#\d+\s*\n([^\n]+)/);
  if (titleMatch) {
    session.title = titleMatch[1].trim();
  }
  
  // Extract speaker (usually the line after title)
  const speakerMatch = itemText.match(/#\d+\s*\n[^\n]+\n([^\n]+)/);
  if (speakerMatch) {
    const speakerLine = speakerMatch[1].trim();
    // Make sure it's not a location line
    if (!speakerLine.includes('Parkinson Court')) {
      session.speaker = speakerLine;
    }
  }
  
  return session;
}

// Function to parse individual session items within a session block
 function parseSessionItems(sessionBlock, sessionNumber, sessionDate, sessionTime) {
   const items = [];
   
   // Look for session items like "1.1 Personal Stories..." or "7.1 Exhibitor Presentation"
   const itemMatches = sessionBlock.match(/\d+\.\d+\*?\s+(?:WORKSHOP\s+|LIGHTNING TALKS\s+|Exhibitor Presentation\s+)?[^\n]+[\s\S]*?(?=\d+\.\d+|$)/g);
   
   if (itemMatches) {
     itemMatches.forEach(itemText => {
       const item = parseSessionItem(itemText, sessionNumber, sessionDate, sessionTime);
       if (item && item.title && item.title.length > 5) {
         items.push(item);
       }
     });
   }
   
   return items;
 }

// Function to parse individual session item
 function parseSessionItem(itemText, sessionNumber, sessionDate, sessionTime) {
   const session = {
     session_number: sessionNumber,
     title: '',
     speaker: '',
     time: sessionTime,
     date: sessionDate,
     category: '',
     location: '',
     track: '',
     abstract_number: ''
   };
   
   const lines = itemText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
   
   if (lines.length < 3) return null;
   
   // First line: category (e.g., "1.1 Personal Stories and Case Studies")
   const categoryLine = lines[0];
   const categoryMatch = categoryLine.match(/^(\d+\.\d+\*?)\s+(.+)$/);
   if (categoryMatch) {
     session.track = categoryMatch[1];
     session.category = categoryMatch[2];
   }
   
   // Look for abstract number (#XX)
   const abstractMatch = itemText.match(/#(\d+)/);
   if (abstractMatch) {
     session.abstract_number = abstractMatch[1];
   }
   
   // Extract title (usually after the abstract number)
   const titleMatch = itemText.match(/#\d+\s*\n([^\n]+)/);
   if (titleMatch) {
     session.title = titleMatch[1].trim();
   }
   
   // Extract speaker (usually the line after title)
   const speakerMatch = itemText.match(/#\d+\s*\n[^\n]+\n([^\n]+)/);
   if (speakerMatch) {
     const speakerLine = speakerMatch[1].trim();
     // Make sure it's not a location line
     if (!speakerLine.includes('Michael Sadler') && !speakerLine.includes('Clothworkers') && !speakerLine.includes('Stage@Leeds')) {
       session.speaker = speakerLine;
     }
   }
   
   // Extract location (lines containing room information)
   const locationLines = lines.filter(line => 
     line.includes('Michael Sadler') || 
     line.includes('Clothworkers') || 
     line.includes('Stage@Leeds') ||
     line.includes('Esther Simpson')
   );
   
   if (locationLines.length > 0) {
     session.location = locationLines[0];
   }
   
   return session;
 }

// Function to format date and time for 2025
function formatDateTime(date, time) {
  // Updated date mappings for 2025 conference
  const dateMap = {
    'Monday': '2025-09-08',
    'Tuesday': '2025-09-09',
    'Wednesday': '2025-09-10',
    'Thursday': '2025-09-11',
    'Friday': '2025-09-12'
  };
  
  const baseDate = dateMap[date] || '2025-09-08';
  
  if (time) {
    const [startTime, endTime] = time.split(' - ');
    const startDateTime = `${baseDate}T${startTime.replace('.', ':')}:00`;
    const endDateTime = `${baseDate}T${endTime.replace('.', ':')}:00`;
    return `${startDateTime} - ${endDateTime}`;
  }
  
  return baseDate;
}

async function main() {
  try {
    console.log('📄 Reading 2025 PDF file...');
    
    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found at: ${pdfPath}`);
    }
    
    // Read PDF file
    const dataBuffer = fs.readFileSync(pdfPath);
    
    console.log('🔍 Parsing 2025 PDF content...');
    const data = await pdf(dataBuffer);
    
    console.log('📝 Extracting 2025 session data...');
    const sessions = parseSessionData(data.text);
    
    console.log(`✅ Found ${sessions.length} sessions for 2025`);
    
    // Format sessions with proper date/time and add unique IDs
    const formattedSessions = sessions.map((session, index) => ({
      id: index + 1,
      ...session,
      formatted_time: formatDateTime(session.date, session.time)
    }));
    
    // Create data directory if it doesn't exist
    const dataDir = './data';
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Save to JSON file
    const outputPath = `${dataDir}/parsed-sessions-2025.json`;
    fs.writeFileSync(outputPath, JSON.stringify(formattedSessions, null, 2));
    
    console.log(`💾 Saved 2025 parsed data to: ${outputPath}`);
    
    // Also save to src/data for the app
    const srcDataDir = './src/data';
    if (!fs.existsSync(srcDataDir)) {
      fs.mkdirSync(srcDataDir, { recursive: true });
    }
    
    const srcOutputPath = `${srcDataDir}/parsed-sessions.json`;
    fs.writeFileSync(srcOutputPath, JSON.stringify(formattedSessions, null, 2));
    
    console.log(`💾 Updated app data at: ${srcOutputPath}`);
    
    // Display sample sessions
    console.log('\n📋 Sample 2025 sessions:\n');
    formattedSessions.slice(0, 5).forEach((session, index) => {
      console.log(`${index + 1}. ${session.title}`);
      console.log(`   Speaker: ${session.speaker}`);
      console.log(`   Time: ${session.formatted_time}`);
      console.log(`   Location: ${session.location}`);
      console.log(`   Track: ${session.track}`);
      console.log('');
    });
    
    console.log('🎉 2025 PDF parsing completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

main();