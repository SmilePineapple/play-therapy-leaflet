const { defineConfig, devices } = require('@playwright/test');

/**
 * Optimized Playwright configuration for UI mode testing
 * This configuration addresses common issues with:
 * - Admin authentication timeouts
 * - Page loading timing issues
 * - Test concurrency conflicts
 * - Strict mode violations
 */
module.exports = defineConfig({
  testDir: './tests',
  
  // Disable parallelism for UI mode to prevent resource conflicts
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  
  // Increased retries for flaky tests
  retries: 2,
  
  // Single worker for UI mode to prevent conflicts
  workers: 1,
  
  // Global setup and teardown
  globalSetup: require.resolve('./tests/global-setup.js'),
  globalTeardown: require.resolve('./tests/global-teardown.js'),
  
  // Extended timeouts for better stability
  timeout: 90 * 1000, // 90 seconds per test
  expect: {
    timeout: 20 * 1000, // 20 seconds for assertions
  },
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['list'] // Add list reporter for better UI mode feedback
  ],
  
  // Output directory
  outputDir: 'test-results/',
  
  // Global test configuration
  use: {
    // Extended timeouts
    actionTimeout: 30 * 1000, // 30 seconds for actions
    navigationTimeout: 60 * 1000, // 60 seconds for navigation
    
    // Base URL
    baseURL: 'http://localhost:3001',
    
    // Enhanced debugging for UI mode
    trace: 'on', // Always capture traces in UI mode
    screenshot: 'on', // Always capture screenshots
    video: 'on', // Always capture videos
    
    // Browser context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Reduce flakiness
    launchOptions: {
      slowMo: 100, // Add 100ms delay between actions
    },
  },
  
  // Test projects - reduced set for UI mode
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Additional options for stability
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--no-sandbox',
            '--disable-dev-shm-usage'
          ],
          slowMo: 100
        }
      },
    },
    
    // Uncomment for additional browser testing in UI mode
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
  
  // Web server configuration with extended timeout
  webServer: {
    command: 'PORT=3001 npm start',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000, // 3 minutes for server startup
    stdout: 'pipe',
    stderr: 'pipe',
  },
});