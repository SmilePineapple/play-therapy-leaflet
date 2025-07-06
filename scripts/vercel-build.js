#!/usr/bin/env node

/**
 * Custom Vercel Build Script
 * This script ensures proper handling of the public folder during Vercel deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.join(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const buildDir = path.join(projectRoot, 'build');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function verifyPublicFolder() {
  log('🔍 Verifying public folder structure...', 'cyan');
  
  if (!fs.existsSync(publicDir)) {
    log('❌ Public directory not found!', 'red');
    process.exit(1);
  }
  
  const indexHtmlPath = path.join(publicDir, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    log('❌ index.html not found in public directory!', 'red');
    process.exit(1);
  }
  
  log('✅ Public folder structure verified', 'green');
  
  // List public folder contents for debugging
  const publicFiles = fs.readdirSync(publicDir);
  log(`📁 Public folder contents: ${publicFiles.join(', ')}`, 'blue');
}

function runBuild() {
  log('🏗️  Running React build...', 'blue');
  
  try {
    // Set environment variables for debugging
    process.env.GENERATE_SOURCEMAP = 'false';
    process.env.CI = 'false';
    
    execSync('npm run build', { 
      stdio: 'inherit',
      cwd: projectRoot,
      env: { ...process.env }
    });
    
    log('✅ Build completed successfully', 'green');
  } catch (error) {
    log('❌ Build failed', 'red');
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

function verifyBuildOutput() {
  log('🔍 Verifying build output...', 'cyan');
  
  if (!fs.existsSync(buildDir)) {
    log('❌ Build directory not found!', 'red');
    process.exit(1);
  }
  
  const buildIndexPath = path.join(buildDir, 'index.html');
  if (!fs.existsSync(buildIndexPath)) {
    log('❌ index.html not found in build directory!', 'red');
    process.exit(1);
  }
  
  log('✅ Build output verified', 'green');
  
  // List build folder contents for debugging
  const buildFiles = fs.readdirSync(buildDir);
  log(`📁 Build folder contents: ${buildFiles.join(', ')}`, 'blue');
}

function main() {
  log('🚀 Starting Vercel build process...', 'blue');
  log('=====================================', 'blue');
  
  // Step 1: Verify public folder
  verifyPublicFolder();
  
  // Step 2: Run build
  runBuild();
  
  // Step 3: Verify build output
  verifyBuildOutput();
  
  log('\n🎉 Vercel build completed successfully!', 'green');
  log('======================================', 'green');
}

if (require.main === module) {
  main();
}

module.exports = { verifyPublicFolder, runBuild, verifyBuildOutput };