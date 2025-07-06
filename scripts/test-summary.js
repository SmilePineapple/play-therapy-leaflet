#!/usr/bin/env node
/**
 * Test Summary Script
 * Communication Matters Conference App
 * 
 * Provides a comprehensive overview of the test infrastructure and results
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TestSummary {
  constructor() {
    this.projectRoot = process.cwd();
    this.testResultsDir = path.join(this.projectRoot, 'test-results');
    this.playwrightReportDir = path.join(this.projectRoot, 'playwright-report');
    this.coverageDir = path.join(this.projectRoot, 'coverage');
  }

  /**
   * Display colorized console output
   */
  log(message, color = 'white') {
    const colors = {
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  /**
   * Display the main header
   */
  displayHeader() {
    this.log('\n' + '='.repeat(80), 'cyan');
    this.log('🧪 COMMUNICATION MATTERS CONFERENCE APP - TEST INFRASTRUCTURE', 'cyan');
    this.log('='.repeat(80), 'cyan');
  }

  /**
   * Display test infrastructure overview
   */
  displayInfrastructure() {
    this.log('\n📋 TEST INFRASTRUCTURE OVERVIEW', 'yellow');
    this.log('-'.repeat(50), 'yellow');
    
    const testFiles = [
      'tests/home.spec.js',
      'tests/qa.spec.js', 
      'tests/admin.spec.js',
      'tests/news.spec.js',
      'tests/programme.spec.js',
      'tests/sponsors.spec.js',
      'tests/map.spec.js',
      'tests/contact.spec.js',
      'tests/about.spec.js'
    ];
    
    this.log('\n🎯 Test Files Created:', 'green');
    testFiles.forEach(file => {
      const exists = fs.existsSync(path.join(this.projectRoot, file));
      const status = exists ? '✅' : '❌';
      this.log(`   ${status} ${file}`);
    });
    
    const configFiles = [
      'playwright.config.js',
      'tests/global-setup.js',
      'tests/global-teardown.js',
      'tests/utils/test-helpers.js',
      'tests/README.md',
      'scripts/run-all-tests.js',
      'scripts/test-summary.js'
    ];
    
    this.log('\n⚙️  Configuration Files:', 'green');
    configFiles.forEach(file => {
      const exists = fs.existsSync(path.join(this.projectRoot, file));
      const status = exists ? '✅' : '❌';
      this.log(`   ${status} ${file}`);
    });
  }

  /**
   * Display package.json test scripts
   */
  displayTestScripts() {
    this.log('\n🚀 AVAILABLE TEST COMMANDS', 'yellow');
    this.log('-'.repeat(50), 'yellow');
    
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const scripts = packageJson.scripts || {};
      
      const testScripts = Object.entries(scripts)
        .filter(([name]) => name.includes('test'))
        .sort();
      
      testScripts.forEach(([name, command]) => {
        this.log(`\n📝 npm run ${name}`, 'cyan');
        this.log(`   ${command}`, 'white');
      });
    }
  }

  /**
   * Display test coverage information
   */
  displayTestCoverage() {
    this.log('\n📊 TEST COVERAGE AREAS', 'yellow');
    this.log('-'.repeat(50), 'yellow');
    
    const coverageAreas = [
      '🏠 Home Page - Navigation, featured content, announcements',
      '❓ Q&A System - Form submission, validation, real-time updates',
      '👨‍💼 Admin Dashboard - Authentication, management, analytics',
      '📰 News & Announcements - Filtering, search, read status',
      '📅 Programme Schedule - Session management, bookmarking',
      '🤝 Sponsors - Tier display, contact information, links',
      '🗺️  Interactive Map - Location markers, venue information',
      '📞 Contact Forms - Validation, submission, department contacts',
      'ℹ️  About Page - Organization info, team profiles, reports'
    ];
    
    coverageAreas.forEach(area => {
      this.log(`   ${area}`, 'green');
    });
    
    this.log('\n🔍 Cross-cutting Concerns:', 'cyan');
    const concerns = [
      '♿ Accessibility (ARIA, keyboard navigation)',
      '📱 Responsive Design (mobile, tablet, desktop)',
      '⚡ Performance (load times, optimization)',
      '🔒 Security (form validation, XSS prevention)',
      '🎨 User Experience (loading states, error handling)'
    ];
    
    concerns.forEach(concern => {
      this.log(`   ${concern}`, 'white');
    });
  }

  /**
   * Display browser and device coverage
   */
  displayBrowserCoverage() {
    this.log('\n🌐 BROWSER & DEVICE COVERAGE', 'yellow');
    this.log('-'.repeat(50), 'yellow');
    
    const browsers = [
      '🖥️  Desktop Browsers:',
      '   • Chromium (1280x720)',
      '   • Firefox (1280x720)', 
      '   • WebKit/Safari (1280x720)',
      '',
      '📱 Mobile Devices:',
      '   • Pixel 5 (Android Chrome)',
      '   • iPhone 12 (Mobile Safari)',
      '',
      '📟 Tablet Devices:',
      '   • Chrome Tablet (768x1024)'
    ];
    
    browsers.forEach(browser => {
      this.log(`   ${browser}`, browser.includes('•') ? 'white' : 'cyan');
    });
  }

  /**
   * Check and display test results if available
   */
  displayTestResults() {
    this.log('\n📈 TEST RESULTS & REPORTS', 'yellow');
    this.log('-'.repeat(50), 'yellow');
    
    // Check for Playwright results
    const playwrightResults = path.join(this.testResultsDir, 'results.json');
    if (fs.existsSync(playwrightResults)) {
      try {
        const results = JSON.parse(fs.readFileSync(playwrightResults, 'utf8'));
        this.log('\n🎭 Playwright Test Results:', 'green');
        this.log(`   ✅ Passed: ${results.stats?.passed || 'N/A'}`, 'green');
        this.log(`   ❌ Failed: ${results.stats?.failed || 'N/A'}`, results.stats?.failed > 0 ? 'red' : 'white');
        this.log(`   ⏭️  Skipped: ${results.stats?.skipped || 'N/A'}`, 'yellow');
        this.log(`   ⏱️  Duration: ${results.stats?.duration || 'N/A'}ms`, 'white');
      } catch (error) {
        this.log('   ⚠️  Could not parse Playwright results', 'yellow');
      }
    }
    
    // Check for available reports
    this.log('\n📊 Available Reports:', 'cyan');
    
    const reports = [
      {
        name: 'Playwright HTML Report',
        path: path.join(this.playwrightReportDir, 'index.html'),
        command: 'npm run test:e2e:report'
      },
      {
        name: 'Jest Coverage Report', 
        path: path.join(this.coverageDir, 'lcov-report', 'index.html'),
        command: 'open coverage/lcov-report/index.html'
      },
      {
        name: 'Test Screenshots',
        path: path.join(this.testResultsDir, 'screenshots'),
        command: 'open test-results/screenshots/'
      },
      {
        name: 'Test Videos',
        path: path.join(this.testResultsDir, 'videos'),
        command: 'open test-results/videos/'
      }
    ];
    
    reports.forEach(report => {
      const exists = fs.existsSync(report.path);
      const status = exists ? '✅' : '⚪';
      this.log(`   ${status} ${report.name}`, exists ? 'green' : 'white');
      if (exists) {
        this.log(`      Command: ${report.command}`, 'white');
      }
    });
  }

  /**
   * Display quick start guide
   */
  displayQuickStart() {
    this.log('\n🚀 QUICK START GUIDE', 'yellow');
    this.log('-'.repeat(50), 'yellow');
    
    const steps = [
      '1️⃣  Install dependencies: npm install',
      '2️⃣  Install Playwright browsers: npx playwright install', 
      '3️⃣  Start development server: npm start',
      '4️⃣  Run all tests: npm run test:all',
      '5️⃣  View reports: npm run test:e2e:report'
    ];
    
    steps.forEach(step => {
      this.log(`   ${step}`, 'cyan');
    });
    
    this.log('\n💡 Pro Tips:', 'magenta');
    const tips = [
      '• Use npm run test:e2e:ui for interactive testing',
      '• Use npm run test:e2e:debug for debugging tests',
      '• Check tests/README.md for detailed documentation',
      '• Run specific tests: npx playwright test home.spec.js'
    ];
    
    tips.forEach(tip => {
      this.log(`   ${tip}`, 'white');
    });
  }

  /**
   * Display footer
   */
  displayFooter() {
    this.log('\n' + '='.repeat(80), 'cyan');
    this.log('🎉 Test infrastructure setup complete! Ready for comprehensive testing.', 'green');
    this.log('📚 For detailed documentation, see: tests/README.md', 'cyan');
    this.log('='.repeat(80), 'cyan');
    this.log('');
  }

  /**
   * Run the complete summary
   */
  run() {
    this.displayHeader();
    this.displayInfrastructure();
    this.displayTestScripts();
    this.displayTestCoverage();
    this.displayBrowserCoverage();
    this.displayTestResults();
    this.displayQuickStart();
    this.displayFooter();
  }
}

// Run the summary if this script is executed directly
if (require.main === module) {
  const summary = new TestSummary();
  summary.run();
}

module.exports = TestSummary;