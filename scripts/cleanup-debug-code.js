#!/usr/bin/env node

/**
 * Script to remove debug console statements while preserving essential error logging
 * This script will clean up the codebase for production deployment
 */

const fs = require('fs');
const path = require('path');

// Files to process
const filesToProcess = [
  'src/pages/Sponsors.js',
  'src/pages/Programme.js',
  'src/pages/QA.js',
  'src/components/Navigation.js',
  'src/lib/supabase.js',
  'src/hooks/useSupabaseData.js',
  'src/components/Loading.js',
  'src/pages/MyAgenda.js',
  'src/components/ErrorBoundary.js',
  'src/components/SkipLink.js',
  'src/pages/Map.js',
  'src/pages/Home.js',
  'src/pages/SessionDetail.js',
  'src/hooks/useQuestions.js',
  'src/App.js',
  'src/index.js',
  'src/components/AnnouncementModal.js',
  'src/pages/News.js',
  'src/contexts/AccessibilityContext.js',
  'src/utils/performance.js'
];

// Console statements to remove (debug/info level)
const debugPatterns = [
  /console\.log\([^)]*\);?\s*$/gm,
  /console\.debug\([^)]*\);?\s*$/gm,
  /console\.info\([^)]*\);?\s*$/gm
];

// Console statements to keep (error/warn level)
const keepPatterns = [
  /console\.error\(/,
  /console\.warn\(/
];

function shouldKeepLine(line) {
  // Keep error and warn statements
  return keepPatterns.some(pattern => pattern.test(line));
}

function cleanupFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️ File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  
  let removedCount = 0;
  const cleanedLines = lines.filter(line => {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) return true;
    
    // Keep lines that don't contain console statements
    if (!trimmedLine.includes('console.')) return true;
    
    // Keep error and warn statements
    if (shouldKeepLine(trimmedLine)) return true;
    
    // Remove debug console statements
    if (debugPatterns.some(pattern => pattern.test(trimmedLine))) {
      removedCount++;
      return false;
    }
    
    return true;
  });
  
  if (removedCount > 0) {
    const cleanedContent = cleanedLines.join('\n');
    fs.writeFileSync(fullPath, cleanedContent, 'utf8');
    console.log(`✅ Cleaned ${filePath}: removed ${removedCount} debug statements`);
  } else {
    console.log(`✨ ${filePath}: already clean`);
  }
}

function main() {
  console.log('🧹 Starting debug code cleanup...');
  console.log('📝 Removing console.log, console.debug, console.info statements');
  console.log('🔒 Keeping console.error and console.warn for production monitoring');
  console.log('');
  
  let totalRemoved = 0;
  
  filesToProcess.forEach(filePath => {
    cleanupFile(filePath);
  });
  
  console.log('');
  console.log('✅ Debug cleanup completed!');
  console.log('🚀 Codebase is now production-ready');
}

if (require.main === module) {
  main();
}

module.exports = { cleanupFile, main };