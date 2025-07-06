/**
 * Global teardown for Playwright tests
 * Communication Matters Conference App
 */

const fs = require('fs');
const path = require('path');

/**
 * Global teardown function that runs after all tests
 */
async function globalTeardown() {
  console.log('🧹 Starting global test teardown...');
  
  try {
    // Generate test summary report
    const testResultsDir = path.join(process.cwd(), 'test-results');
    const environmentFile = path.join(testResultsDir, 'environment.json');
    
    let envInfo = {};
    if (fs.existsSync(environmentFile)) {
      envInfo = JSON.parse(fs.readFileSync(environmentFile, 'utf8'));
    }
    
    // Create teardown summary
    const teardownInfo = {
      ...envInfo,
      teardownTimestamp: new Date().toISOString(),
      testExecutionCompleted: true,
      availableReports: {
        playwrightHtml: 'playwright-report/index.html',
        jestCoverage: 'coverage/lcov-report/index.html',
        testResults: 'test-results/',
        screenshots: 'test-results/screenshots/',
        videos: 'test-results/videos/',
        traces: 'test-results/traces/'
      }
    };
    
    // Save updated environment info
    fs.writeFileSync(
      environmentFile,
      JSON.stringify(teardownInfo, null, 2)
    );
    
    // Clean up temporary authentication files if they exist
    const authFile = path.join(testResultsDir, 'admin-auth.json');
    if (fs.existsSync(authFile)) {
      console.log('🗑️  Cleaning up authentication state file');
      fs.unlinkSync(authFile);
    }
    
    // Log summary of test artifacts
    console.log('📊 Test execution completed!');
    console.log('📁 Available test artifacts:');
    
    const playwrightReport = path.join(process.cwd(), 'playwright-report');
    if (fs.existsSync(playwrightReport)) {
      console.log('   • Playwright HTML Report: playwright-report/index.html');
    }
    
    const coverageReport = path.join(process.cwd(), 'coverage');
    if (fs.existsSync(coverageReport)) {
      console.log('   • Jest Coverage Report: coverage/lcov-report/index.html');
    }
    
    const screenshotsDir = path.join(testResultsDir, 'screenshots');
    if (fs.existsSync(screenshotsDir)) {
      const screenshots = fs.readdirSync(screenshotsDir);
      if (screenshots.length > 0) {
        console.log(`   • Screenshots: ${screenshots.length} files in test-results/screenshots/`);
      }
    }
    
    const videosDir = path.join(testResultsDir, 'videos');
    if (fs.existsSync(videosDir)) {
      const videos = fs.readdirSync(videosDir);
      if (videos.length > 0) {
        console.log(`   • Videos: ${videos.length} files in test-results/videos/`);
      }
    }
    
    const tracesDir = path.join(testResultsDir, 'traces');
    if (fs.existsSync(tracesDir)) {
      const traces = fs.readdirSync(tracesDir);
      if (traces.length > 0) {
        console.log(`   • Traces: ${traces.length} files in test-results/traces/`);
      }
    }
    
    console.log('\n🎯 To view test reports:');
    console.log('   npm run test:e2e:report  # View Playwright HTML report');
    console.log('   open coverage/lcov-report/index.html  # View Jest coverage');
    console.log('');
    
  } catch (error) {
    console.error('⚠️  Error during teardown:', error.message);
  }
  
  console.log('✅ Global teardown completed');
}

module.exports = globalTeardown;