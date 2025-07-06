# Playwright Test Troubleshooting Guide

## Common Issues and Solutions

### 1. Admin Login Failures

**Symptoms:**
- Tests get stuck on "Signing In..." state
- Login form becomes disabled and never progresses
- Authentication timeouts

**Root Causes:**
- Network timing issues during authentication
- React state updates not completing
- Supabase authentication delays
- Form validation preventing submission

**Solutions:**
- Use the improved `TestHelpers.loginAsAdmin()` with retry logic
- Increased timeouts for authentication flows
- Better waiting strategies for form state changes
- Enhanced error handling and recovery

**Example Fix:**
```javascript
// Instead of:
await page.goto('/admin');
await page.fill('input[type="email"]', email);
await page.click('button[type="submit"]');

// Use:
await TestHelpers.loginAsAdmin(page);
```

### 2. Page Load Timing Issues

**Symptoms:**
- Tests fail with "element not found" errors
- Pages stuck in loading states
- Content not fully rendered when tests run

**Root Causes:**
- React components still mounting
- API calls not completed
- Loading spinners not disappearing
- Network requests still pending

**Solutions:**
- Enhanced `waitForPageLoad()` function
- Multiple loading state checks
- React-specific waiting strategies
- Network idle detection

**Example Fix:**
```javascript
// Instead of:
await page.goto('/programme');
await expect(page.locator('h1')).toBeVisible();

// Use:
await page.goto('/programme');
await TestHelpers.waitForPageLoad(page);
await TestHelpers.waitForElementSafe(page, 'h1');
```

### 3. Strict Mode Violations (Multiple Elements)

**Symptoms:**
- "strict mode violation: locator resolved to X elements"
- Tests failing when multiple h1 or similar elements exist
- Inconsistent element selection

**Root Causes:**
- Multiple h1 elements (header + page title)
- Loading states creating duplicate elements
- React rendering multiple instances temporarily

**Solutions:**
- Use `getFirstVisibleElement()` helper
- More specific selectors
- Wait for loading states to complete
- Use `waitForElementSafe()` for robust element waiting

**Example Fix:**
```javascript
// Instead of:
await expect(page.locator('h1')).toBeVisible();

// Use:
const heading = await TestHelpers.getFirstVisibleElement(page, 'h1');
await expect(heading).toBeVisible();

// Or use more specific selectors:
await expect(page.locator('main h1')).toBeVisible();
```

### 4. Test Concurrency Issues

**Symptoms:**
- Tests interfering with each other
- Resource conflicts
- Inconsistent test results
- Database state conflicts

**Root Causes:**
- Too many parallel workers
- Shared authentication state
- Database race conditions
- Port conflicts

**Solutions:**
- Reduced worker count (1-2 workers)
- Disabled full parallelism
- Isolated test environments
- Better cleanup between tests

**Configuration:**
```javascript
// playwright.config.js
module.exports = {
  workers: 2, // Reduced from default
  fullyParallel: false, // Disabled
  retries: 1, // Added retries
};
```

## Optimized Test Commands

### For UI Mode Testing (Recommended)
```bash
# Use the optimized UI configuration
npm run test:e2e:ui

# For maximum stability (single worker)
npm run test:e2e:ui-stable
```

### For Headless Testing
```bash
# Standard headless with optimizations
npm run test:e2e

# With browser visible for debugging
npm run test:e2e:headed
```

### For Debugging Specific Issues
```bash
# Debug mode with step-by-step execution
npm run test:e2e:debug

# Run specific test file
npx playwright test tests/admin.spec.js --headed

# Run specific test with retries
npx playwright test tests/admin.spec.js --retries=3
```

## Configuration Files

### Standard Configuration
- **File:** `playwright.config.js`
- **Use:** Regular test runs, CI/CD
- **Workers:** 2 (reduced from default)
- **Timeouts:** Increased for stability

### UI Mode Configuration
- **File:** `playwright.config.ui.js`
- **Use:** Interactive testing, debugging
- **Workers:** 1 (maximum stability)
- **Features:** Enhanced tracing, slower execution

## Best Practices

### 1. Always Use Helper Functions
```javascript
const { TestHelpers } = require('./utils/test-helpers');

// Login
await TestHelpers.loginAsAdmin(page);

// Page loading
await TestHelpers.waitForPageLoad(page);

// Element waiting
const element = await TestHelpers.waitForElementSafe(page, selector);
```

### 2. Handle Loading States
```javascript
// Wait for page to fully load
await TestHelpers.waitForPageLoad(page);

// Check for loading indicators
const isLoading = await TestHelpers.isVisibleWithRetry(page, '.loading');
if (isLoading) {
  await page.waitForSelector('.loading', { state: 'hidden' });
}
```

### 3. Use Specific Selectors
```javascript
// Instead of generic selectors
await page.locator('h1').click();

// Use specific, unique selectors
await page.locator('[data-testid="page-title"]').click();
await page.locator('main h1').click();
await page.locator('h1:has-text("Specific Title")').click();
```

### 4. Add Proper Error Handling
```javascript
try {
  await TestHelpers.loginAsAdmin(page);
} catch (error) {
  console.log('Login failed, taking screenshot...');
  await TestHelpers.takeScreenshot(page, 'login-failure');
  throw error;
}
```

## Debugging Tips

### 1. Enable Verbose Logging
```bash
DEBUG=pw:api npx playwright test
```

### 2. Use Browser Developer Tools
```javascript
// Add breakpoint in test
await page.pause();
```

### 3. Capture More Information
```javascript
// Take screenshot on failure
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await TestHelpers.takeScreenshot(page, `failure-${testInfo.title}`);
  }
});
```

### 4. Check Network Activity
```javascript
// Monitor network requests
page.on('response', response => {
  console.log(`Response: ${response.status()} ${response.url()}`);
});
```

## Performance Optimization

### 1. Reduce Test Scope
- Run specific test files during development
- Use focused tests (`test.only`) for debugging
- Skip non-essential tests temporarily

### 2. Optimize Selectors
- Use `data-testid` attributes
- Avoid complex CSS selectors
- Cache frequently used elements

### 3. Minimize Network Requests
- Mock external APIs when possible
- Use static test data
- Implement proper cleanup

## Getting Help

If you continue to experience issues:

1. Check the test artifacts in `test-results/`
2. Review the HTML report: `npm run test:e2e:report`
3. Enable debug mode: `npm run test:e2e:debug`
4. Check the console logs for specific error messages
5. Use the troubleshooting commands above

For persistent issues, consider:
- Updating Playwright: `npm install @playwright/test@latest`
- Clearing test cache: `rm -rf test-results/`
- Restarting the development server
- Checking system resources (memory, CPU)