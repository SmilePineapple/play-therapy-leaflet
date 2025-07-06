/**
 * Global setup for Playwright tests
 * Communication Matters Conference App
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

/**
 * Global setup function that runs before all tests
 */
async function globalSetup() {
  console.log('🚀 Starting global test setup...');
  
  // Create test results directories
  const directories = [
    'test-results',
    'test-results/screenshots',
    'test-results/videos',
    'test-results/traces'
  ];
  
  directories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
  
  // Start a browser instance for admin authentication
  console.log('🌐 Setting up browser for authentication...');
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to the application
    console.log('🔗 Navigating to application...');
    await page.goto('http://localhost:3000');
    
    // Wait for the application to load
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Check if the application is running
    const title = await page.title();
    console.log(`📄 Application title: ${title}`);
    
    // Try to authenticate admin user and save state
    console.log('🔐 Attempting admin authentication...');
    await page.goto('http://localhost:3000/admin');
    
    // Wait for login form
    await page.waitForSelector('input[name="email"], input[type="email"]', { timeout: 10000 });
    
    // Fill login form
    await page.fill('input[name="email"], input[type="email"]', 'admin@communicationmatters.org');
    await page.fill('input[name="password"], input[type="password"]', 'AdminPass2024!');
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Wait for successful login or error
    try {
      await page.waitForSelector('[data-testid="admin-dashboard"], .dashboard', { timeout: 15000 });
      console.log('✅ Admin authentication successful');
      
      // Save authenticated state
      await context.storageState({ path: 'test-results/admin-auth.json' });
      console.log('💾 Admin authentication state saved');
    } catch (error) {
      console.log('⚠️  Admin authentication failed or dashboard not found');
      console.log('   This is expected if admin functionality is not yet implemented');
    }
    
  } catch (error) {
    console.log('⚠️  Application setup encountered issues:');
    console.log(`   ${error.message}`);
    console.log('   Tests will continue but some may fail if the app is not running');
  } finally {
    await browser.close();
  }
  
  // Create test environment info
  const envInfo = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    testUrl: 'http://localhost:3000',
    adminCredentials: {
      email: 'admin@communicationmatters.org',
      // Don't log the actual password for security
      passwordSet: true
    }
  };
  
  fs.writeFileSync(
    path.join(process.cwd(), 'test-results', 'environment.json'),
    JSON.stringify(envInfo, null, 2)
  );
  
  console.log('✅ Global setup completed successfully');
  console.log('📊 Test environment information saved to test-results/environment.json');
  console.log('');
}

module.exports = globalSetup;