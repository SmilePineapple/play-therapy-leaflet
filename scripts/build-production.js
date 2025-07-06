#!/usr/bin/env node

/**
 * Production Build Script
 * This script prepares the application for production deployment by:
 * 1. Removing all console statements
 * 2. Running security checks
 * 3. Building the application
 * 4. Generating build report
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srcDir = path.join(__dirname, '..', 'src');
const buildDir = path.join(__dirname, '..', 'build');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function removeConsoleStatements(dir) {
  const files = fs.readdirSync(dir);
  let removedCount = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      removedCount += removeConsoleStatements(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;

      // Remove console.log, console.debug, console.info statements
      // Keep console.error and console.warn for production monitoring
      content = content.replace(/\s*console\.(log|debug|info)\([^;]*\);?/g, '');
      
      // Remove empty lines that might be left after console removal
      content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        const lines = originalContent.split('\n').length - content.split('\n').length;
        if (lines > 0) {
          removedCount += lines;
          log(`  ✓ Cleaned ${file} (${lines} console statements removed)`, 'green');
        }
      }
    }
  });

  return removedCount;
}

function runSecurityCheck() {
  log('\n🔒 Running security audit...', 'yellow');
  try {
    execSync('npm audit --audit-level=moderate', { stdio: 'inherit' });
    log('✓ Security audit passed', 'green');
  } catch (error) {
    log('⚠️  Security vulnerabilities found. Please review and fix.', 'yellow');
    // Don't fail the build for audit issues, just warn
  }
}

function buildApplication() {
  log('\n🏗️  Building application...', 'blue');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    log('✓ Build completed successfully', 'green');
  } catch (error) {
    log('❌ Build failed', 'red');
    process.exit(1);
  }
}

function generateBuildReport() {
  log('\n📊 Generating build report...', 'cyan');
  
  if (!fs.existsSync(buildDir)) {
    log('❌ Build directory not found', 'red');
    return;
  }

  const buildFiles = [];
  
  function scanBuildDir(dir, relativePath = '') {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      const relativeFilePath = path.join(relativePath, file);
      
      if (stat.isDirectory()) {
        scanBuildDir(filePath, relativeFilePath);
      } else {
        const sizeKB = (stat.size / 1024).toFixed(2);
        buildFiles.push({ path: relativeFilePath, size: sizeKB });
      }
    });
  }
  
  scanBuildDir(buildDir);
  
  // Sort by size (largest first)
  buildFiles.sort((a, b) => parseFloat(b.size) - parseFloat(a.size));
  
  log('\n📦 Build Summary:', 'cyan');
  log('================', 'cyan');
  
  const jsFiles = buildFiles.filter(f => f.path.endsWith('.js'));
  const cssFiles = buildFiles.filter(f => f.path.endsWith('.css'));
  const otherFiles = buildFiles.filter(f => !f.path.endsWith('.js') && !f.path.endsWith('.css'));
  
  if (jsFiles.length > 0) {
    log('\nJavaScript files:', 'yellow');
    jsFiles.forEach(file => {
      log(`  ${file.path}: ${file.size} KB`);
    });
  }
  
  if (cssFiles.length > 0) {
    log('\nCSS files:', 'yellow');
    cssFiles.forEach(file => {
      log(`  ${file.path}: ${file.size} KB`);
    });
  }
  
  const totalSize = buildFiles.reduce((sum, file) => sum + parseFloat(file.size), 0);
  log(`\nTotal build size: ${totalSize.toFixed(2)} KB`, 'magenta');
  
  // Check for large files
  const largeFiles = buildFiles.filter(f => parseFloat(f.size) > 500);
  if (largeFiles.length > 0) {
    log('\n⚠️  Large files detected (>500KB):', 'yellow');
    largeFiles.forEach(file => {
      log(`  ${file.path}: ${file.size} KB`, 'yellow');
    });
    log('Consider code splitting or optimization for these files.', 'yellow');
  }
}

function main() {
  log('🚀 Starting production build process...', 'blue');
  log('=====================================', 'blue');
  
  // Step 1: Clean console statements
  log('\n🧹 Removing debug console statements...', 'yellow');
  const removedStatements = removeConsoleStatements(srcDir);
  if (removedStatements > 0) {
    log(`✓ Removed ${removedStatements} console statements`, 'green');
  } else {
    log('✓ No console statements to remove', 'green');
  }
  
  // Step 2: Security check
  runSecurityCheck();
  
  // Step 3: Build application
  buildApplication();
  
  // Step 4: Generate report
  generateBuildReport();
  
  log('\n🎉 Production build completed successfully!', 'green');
  log('==========================================', 'green');
  log('\nNext steps:', 'cyan');
  log('1. Test the build locally: npm install -g serve && serve -s build', 'cyan');
  log('2. Deploy the build folder to your hosting service', 'cyan');
  log('3. Configure your web server for SPA routing', 'cyan');
}

if (require.main === module) {
  main();
}

module.exports = { removeConsoleStatements, runSecurityCheck, buildApplication, generateBuildReport };