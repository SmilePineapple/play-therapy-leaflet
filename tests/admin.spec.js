const { test, expect } = require('@playwright/test');

// Admin credentials
const ADMIN_EMAIL = 'admin@communicationmatters.org';
const ADMIN_PASSWORD = 'AdminPass2024!';

test.describe('Admin Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
  });

  test('should load admin page and show login form', async ({ page }) => {
    await expect(page).toHaveTitle(/Communication Matters/);
    await expect(page.locator('h1')).toContainText('Admin Login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should validate login form fields', async ({ page }) => {
    await page.click('button[type="submit"]');
    
    // Check for validation messages
    await expect(page.locator('text="Email is required"')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid@email.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Wait for error message
    await expect(page.locator('text="Invalid credentials"')).toBeVisible({ timeout: 10000 });
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await expect(page.locator('h1')).toContainText('Admin Dashboard', { timeout: 15000 });
    await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
  });

  test.describe('Admin Dashboard (Authenticated)', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto('/admin');
      await page.fill('input[type="email"]', ADMIN_EMAIL);
      await page.fill('input[type="password"]', ADMIN_PASSWORD);
      await page.click('button[type="submit"]');
      
      // Wait for dashboard to load
      await expect(page.locator('h1')).toContainText('Admin Dashboard', { timeout: 15000 });
    });

    test('should display dashboard statistics', async ({ page }) => {
      await expect(page.locator('[data-testid="stats-total-questions"]')).toBeVisible();
      await expect(page.locator('[data-testid="stats-pending-questions"]')).toBeVisible();
      await expect(page.locator('[data-testid="stats-total-sessions"]')).toBeVisible();
      await expect(page.locator('[data-testid="stats-total-announcements"]')).toBeVisible();
    });

    test('should display admin navigation tabs', async ({ page }) => {
      await expect(page.locator('[data-testid="tab-dashboard"]')).toBeVisible();
      await expect(page.locator('[data-testid="tab-questions"]')).toBeVisible();
      await expect(page.locator('[data-testid="tab-content"]')).toBeVisible();
      await expect(page.locator('[data-testid="tab-analytics"]')).toBeVisible();
    });

    test('should switch to questions management tab', async ({ page }) => {
      await page.click('[data-testid="tab-questions"]');
      
      await expect(page.locator('[data-testid="questions-manager"]')).toBeVisible();
      await expect(page.locator('h2')).toContainText('Question Management');
    });

    test('should switch to content moderation tab', async ({ page }) => {
      await page.click('[data-testid="tab-content"]');
      
      await expect(page.locator('[data-testid="content-moderator"]')).toBeVisible();
      await expect(page.locator('h2')).toContainText('Content Moderation');
    });

    test('should switch to analytics tab', async ({ page }) => {
      await page.click('[data-testid="tab-analytics"]');
      
      await expect(page.locator('[data-testid="analytics-dashboard"]')).toBeVisible();
      await expect(page.locator('h2')).toContainText('Analytics');
    });

    test('should manage questions in questions tab', async ({ page }) => {
      await page.click('[data-testid="tab-questions"]');
      
      // Wait for questions to load
      await page.waitForTimeout(2000);
      
      const questionItems = page.locator('[data-testid="question-item"]');
      const count = await questionItems.count();
      
      if (count > 0) {
        // Test selecting a question
        await questionItems.first().click();
        
        // Check if question details are shown
        await expect(page.locator('[data-testid="question-details"]')).toBeVisible();
        
        // Test status update
        const statusSelect = page.locator('select[data-testid="status-select"]');
        if (await statusSelect.isVisible()) {
          await statusSelect.selectOption('answered');
        }
      }
    });

    test('should handle content moderation', async ({ page }) => {
      await page.click('[data-testid="tab-content"]');
      
      // Wait for content to load
      await page.waitForTimeout(2000);
      
      // Check for session management
      await expect(page.locator('[data-testid="sessions-section"]')).toBeVisible();
      
      // Check for announcements management
      await expect(page.locator('[data-testid="announcements-section"]')).toBeVisible();
    });

    test('should display analytics data', async ({ page }) => {
      await page.click('[data-testid="tab-analytics"]');
      
      // Wait for analytics to load
      await page.waitForTimeout(3000);
      
      // Check for analytics charts/data
      await expect(page.locator('[data-testid="page-views-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-actions-chart"]')).toBeVisible();
    });

    test('should logout successfully', async ({ page }) => {
      const logoutButton = page.locator('[data-testid="logout-button"]');
      
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        
        // Should redirect to login page
        await expect(page.locator('h1')).toContainText('Admin Login');
        await expect(page.locator('input[type="email"]')).toBeVisible();
      }
    });

    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
      
      // Check that tabs are accessible on mobile
      await expect(page.locator('[data-testid="tab-questions"]')).toBeVisible();
    });

    test('should handle real-time updates', async ({ page }) => {
      await page.click('[data-testid="tab-questions"]');
      
      // Wait for initial load
      await page.waitForLoadState('networkidle');
      
      // Check that questions list is present and updating
      await expect(page.locator('[data-testid="questions-list"]')).toBeVisible();
    });

    test('should search and filter content', async ({ page }) => {
      await page.click('[data-testid="tab-content"]');
      
      const searchInput = page.locator('input[data-testid="search-input"]');
      
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
        
        // Wait for search to apply
        await page.waitForTimeout(1000);
        
        // Verify search results
        await expect(page.locator('[data-testid="content-list"]')).toBeVisible();
      }
    });
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check for proper form labels
    await expect(page.locator('label[for="email"]')).toBeVisible();
    await expect(page.locator('label[for="password"]')).toBeVisible();
    
    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
    
    // Check for ARIA attributes
    await expect(page.locator('form')).toHaveAttribute('role', 'form');
  });

  test('should handle session persistence', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await expect(page.locator('h1')).toContainText('Admin Dashboard', { timeout: 15000 });
    
    // Refresh page
    await page.reload();
    
    // Should still be logged in
    await expect(page.locator('h1')).toContainText('Admin Dashboard', { timeout: 10000 });
  });
});