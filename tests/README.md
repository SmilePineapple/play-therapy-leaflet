# Communication Matters Conference App - Test Suite

This directory contains comprehensive end-to-end (E2E) tests for the Communication Matters Conference App using Playwright.

## 📁 Test Structure

```
tests/
├── README.md                 # This documentation
├── global-setup.js          # Global test setup (authentication, environment)
├── global-teardown.js       # Global test cleanup and reporting
├── utils/
│   └── test-helpers.js      # Shared test utilities and helpers
├── home.spec.js             # Home page tests
├── qa.spec.js               # Q&A page tests
├── admin.spec.js            # Admin dashboard tests
├── news.spec.js             # News/announcements tests
├── programme.spec.js        # Programme/schedule tests
├── sponsors.spec.js         # Sponsors page tests
├── map.spec.js              # Interactive map tests
├── contact.spec.js          # Contact form tests
└── about.spec.js            # About page tests
```

## 🚀 Running Tests

### Prerequisites

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```
   The app should be running on `http://localhost:3000`

### Test Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with browser UI (headed mode)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug

# Open Playwright UI for interactive testing
npm run test:e2e:ui

# View test reports
npm run test:e2e:report

# Run all tests (unit + E2E)
npm run test:all
```

### Running Specific Tests

```bash
# Run tests for a specific page
npx playwright test home.spec.js
npx playwright test admin.spec.js

# Run tests matching a pattern
npx playwright test --grep "navigation"
npx playwright test --grep "form validation"

# Run tests on specific browsers
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project="Mobile Chrome"
```

## 🧪 Test Coverage

### Pages Tested

- **Home Page** (`home.spec.js`)
  - Page loading and navigation
  - Featured sessions display
  - Recent announcements
  - Quick actions functionality
  - Responsive design

- **Q&A Page** (`qa.spec.js`)
  - Question submission form
  - Form validation
  - Question filtering and sorting
  - Voting functionality
  - Real-time updates

- **Admin Dashboard** (`admin.spec.js`)
  - Authentication flow
  - Dashboard statistics
  - Question management
  - Content moderation
  - Analytics display

- **News Page** (`news.spec.js`)
  - Announcement listing
  - Filtering (all, unread, important)
  - Mark as read functionality
  - Search capabilities

- **Programme Page** (`programme.spec.js`)
  - Session listings
  - Filtering by day/time/category
  - Session bookmarking
  - Speaker information
  - Session details

- **Sponsors Page** (`sponsors.spec.js`)
  - Sponsor listings by tier
  - Logo and website links
  - Contact information
  - Advertisement handling

- **Map Page** (`map.spec.js`)
  - Interactive map display
  - Location markers
  - Venue information
  - Accessibility features
  - Directions and navigation

- **Contact Page** (`contact.spec.js`)
  - Contact form validation
  - Form submission
  - Contact information display
  - Department contacts

- **About Page** (`about.spec.js`)
  - Organization information
  - Team member profiles
  - Mission and values
  - Annual reports

### Cross-cutting Concerns

- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Responsive Design**: Mobile, tablet, and desktop viewports
- **Performance**: Page load times, image loading
- **Security**: Form validation, XSS prevention
- **User Experience**: Loading states, error handling, feedback

## 🛠 Test Utilities

### Helper Functions (`utils/test-helpers.js`)

- `loginAsAdmin()` - Authenticate as admin user
- `waitForPageLoad()` - Wait for page to fully load
- `fillContactForm()` - Fill out contact forms
- `checkElementVisibility()` - Verify element visibility
- `takeScreenshot()` - Capture screenshots for debugging
- `checkAccessibility()` - Basic accessibility checks
- `testResponsiveDesign()` - Test across different viewports
- `mockApiResponse()` - Mock API responses for testing
- `handleModal()` - Interact with modal dialogs
- `generateTestData()` - Generate test data
- `verifyFormValidation()` - Test form validation

### Global Setup

- Creates test result directories
- Sets up admin authentication state
- Captures environment information
- Prepares test database (if applicable)

### Global Teardown

- Generates test summary reports
- Cleans up authentication files
- Lists available test artifacts
- Provides report viewing instructions

## 📊 Test Reports

After running tests, several reports are generated:

### Playwright HTML Report
```bash
npm run test:e2e:report
# Opens: playwright-report/index.html
```

### Test Artifacts
- **Screenshots**: `test-results/screenshots/`
- **Videos**: `test-results/videos/`
- **Traces**: `test-results/traces/`
- **JSON Results**: `test-results/results.json`
- **JUnit XML**: `test-results/results.xml`

## 🔧 Configuration

### Browser Projects

- **Desktop**: Chromium, Firefox, WebKit (1280x720)
- **Mobile**: Pixel 5, iPhone 12
- **Tablet**: Chrome (768x1024)

### Test Settings

- **Timeout**: 30 seconds per test
- **Expect Timeout**: 10 seconds for assertions
- **Retries**: 2 retries on CI, 0 locally
- **Parallel**: Fully parallel execution
- **Screenshots**: On failure only
- **Videos**: Retained on failure
- **Traces**: On first retry

## 🐛 Debugging Tests

### Debug Mode
```bash
npm run test:e2e:debug
```

### Playwright UI
```bash
npm run test:e2e:ui
```

### Manual Debugging
```bash
# Run specific test with debug
npx playwright test home.spec.js --debug

# Run with headed browser
npx playwright test --headed

# Slow motion
npx playwright test --headed --slowMo=1000
```

### Viewing Traces
```bash
npx playwright show-trace test-results/traces/trace.zip
```

## 📝 Writing New Tests

### Test File Template
```javascript
const { test, expect } = require('@playwright/test');
const { 
  waitForPageLoad, 
  checkElementVisibility,
  testResponsiveDesign 
} = require('./utils/test-helpers');

test.describe('Page Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/page-url');
    await waitForPageLoad(page);
  });

  test('should load page correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Expected Title/);
    // Add more assertions
  });

  test('should be responsive', async ({ page }) => {
    await testResponsiveDesign(page);
  });
});
```

### Best Practices

1. **Use descriptive test names**
2. **Group related tests with `test.describe()`**
3. **Use `test.beforeEach()` for common setup**
4. **Leverage helper functions from `test-helpers.js`**
5. **Test both positive and negative scenarios**
6. **Include accessibility and responsive design tests**
7. **Use meaningful assertions with good error messages**
8. **Keep tests independent and isolated**

## 🔍 Troubleshooting

### Quick Fixes for Common Issues

**🚨 IMPORTANT: If experiencing login failures, page load timeouts, or concurrency issues:**

```bash
# Use the optimized UI configuration
npm run test:e2e:ui

# For maximum stability (recommended for troubleshooting)
npm run test:e2e:ui-stable
```

### Common Issues

1. **Admin login failures/timeouts**: 
   - Use `npm run test:e2e:ui-stable` (single worker, enhanced retries)
   - Check `tests/TROUBLESHOOTING.md` for detailed solutions

2. **Page load timing issues**:
   - Enhanced `waitForPageLoad()` function now handles React loading states
   - Increased timeouts in `playwright.config.ui.js`

3. **"Strict mode violation" errors**:
   - Use `TestHelpers.getFirstVisibleElement()` for multiple element matches
   - More specific selectors to avoid conflicts

4. **Too many concurrent tests**:
   - Reduced workers to 1-2 in optimized configs
   - Disabled full parallelism to prevent resource conflicts

5. **Server not running**: Ensure `npm start` is running on port 3000
6. **Browser installation**: Run `npx playwright install`

### Detailed Troubleshooting

For comprehensive troubleshooting information, see:
**📖 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)**

This guide covers:
- Root cause analysis for each issue type
- Step-by-step solutions with code examples
- Configuration optimizations
- Best practices for stable testing

### Environment Variables

Create `.env.local` file with:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_key
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=admin_password
```

## 🚀 CI/CD Integration

For continuous integration:

```yaml
# .github/workflows/tests.yml
- name: Install dependencies
  run: npm ci

- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run tests
  run: npm run test:all

- name: Upload test results
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: |
      playwright-report/
      test-results/
      coverage/
```

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Library](https://testing-library.com/)
- [Accessibility Testing](https://playwright.dev/docs/accessibility-testing)