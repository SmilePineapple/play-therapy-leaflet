const fs = require('fs');
const pdf = require('pdf-parse');

// Path to the PDF file
const pdfPath = '/Users/jacobdale-rourke/Desktop/Communication Matters/CM2025Timetablev4online.pdf';

async function debugPDF() {
  try {
    console.log('📄 Reading PDF file...');
    
    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found at: ${pdfPath}`);
    }
    
    // Read PDF file
    const dataBuffer = fs.readFileSync(pdfPath);
    
    console.log('🔍 Parsing PDF content...');
    const data = await pdf(dataBuffer);
    
    console.log('📝 Raw text content:');
    console.log('='.repeat(80));
    console.log(data.text);
    console.log('='.repeat(80));
    
    // Save raw text to file for analysis
    fs.writeFileSync('./data/raw-pdf-text.txt', data.text);
    console.log('💾 Raw text saved to ./data/raw-pdf-text.txt');
    
    // Look for session patterns
    const sessionMatches = data.text.match(/SESSION\s+\d+[\s\S]*?(?=SESSION\s+\d+|$)/gi);
    if (sessionMatches) {
      console.log(`\n🔍 Found ${sessionMatches.length} session blocks:`);
      sessionMatches.forEach((match, index) => {
        console.log(`\n--- SESSION ${index + 1} ---`);
        console.log(match.substring(0, 200) + '...');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugPDF();