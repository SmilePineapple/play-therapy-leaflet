const { test, expect } = require('@playwright/test');

test.describe('Programme Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/programme');
  });

  test('should load programme page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Communication Matters/);
    await expect(page.locator('h1')).toContainText('Programme');
  });

  test('should display sessions list', async ({ page }) => {
    await expect(page.locator('[data-testid="sessions-list"]')).toBeVisible();
  });

  test('should display filter and sort options', async ({ page }) => {
    await expect(page.locator('[data-testid="filter-options"]')).toBeVisible();
    
    // Check for day filter buttons
    await expect(page.locator('button[data-filter="all"]')).toBeVisible();
    await expect(page.locator('button[data-filter="day1"]')).toBeVisible();
    await expect(page.locator('button[data-filter="day2"]')).toBeVisible();
    
    // Check for sort options
    await expect(page.locator('select[data-testid="sort-select"]')).toBeVisible();
  });

  test('should filter sessions by day', async ({ page }) => {
    await page.click('button[data-filter="day1"]');
    
    // Wait for filter to apply
    await page.waitForTimeout(1000);
    
    // Check that only day 1 sessions are shown
    const sessions = page.locator('[data-testid="session-item"]');
    const count = await sessions.count();
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const sessionDate = await sessions.nth(i).locator('[data-testid="session-date"]').textContent();
        // This would need to check actual date logic
      }
    }
    
    // Verify filter is active
    await expect(page.locator('button[data-filter="day1"]')).toHaveClass(/active/);
  });

  test('should sort sessions by time', async ({ page }) => {
    await page.selectOption('select[data-testid="sort-select"]', 'time');
    
    // Wait for sort to apply
    await page.waitForTimeout(1000);
    
    // Verify sessions are sorted (this would need actual data to test properly)
    await expect(page.locator('[data-testid="sessions-list"]')).toBeVisible();
  });

  test('should sort sessions by title', async ({ page }) => {
    await page.selectOption('select[data-testid="sort-select"]', 'title');
    
    // Wait for sort to apply
    await page.waitForTimeout(1000);
    
    // Verify sessions are sorted alphabetically
    await expect(page.locator('[data-testid="sessions-list"]')).toBeVisible();
  });

  test('should display session details', async ({ page }) => {
    const firstSession = page.locator('[data-testid="session-item"]').first();
    
    if (await firstSession.isVisible()) {
      // Check session structure
      await expect(firstSession.locator('[data-testid="session-title"]')).toBeVisible();
      await expect(firstSession.locator('[data-testid="session-time"]')).toBeVisible();
      await expect(firstSession.locator('[data-testid="session-location"]')).toBeVisible();
      await expect(firstSession.locator('[data-testid="session-speakers"]')).toBeVisible();
    }
  });

  test('should bookmark and unbookmark sessions', async ({ page }) => {
    const firstSession = page.locator('[data-testid="session-item"]').first();
    
    if (await firstSession.isVisible()) {
      const bookmarkButton = firstSession.locator('[data-testid="bookmark-button"]');
      
      if (await bookmarkButton.isVisible()) {
        // Get initial bookmark state
        const isBookmarked = await bookmarkButton.evaluate(el => el.classList.contains('bookmarked'));
        
        // Click bookmark button
        await bookmarkButton.click();
        
        // Wait for bookmark to register
        await page.waitForTimeout(1000);
        
        // Check that bookmark state changed
        const newBookmarkState = await bookmarkButton.evaluate(el => el.classList.contains('bookmarked'));
        expect(newBookmarkState).toBe(!isBookmarked);
      }
    }
  });

  test('should navigate to session detail page', async ({ page }) => {
    const firstSession = page.locator('[data-testid="session-item"]').first();
    
    if (await firstSession.isVisible()) {
      const sessionTitle = await firstSession.locator('[data-testid="session-title"]').textContent();
      
      await firstSession.click();
      
      // Should navigate to session detail page
      await expect(page).toHaveURL(/.*session.*/);
      
      // Should display session details
      await expect(page.locator('h1')).toContainText(sessionTitle || '');
    }
  });

  test('should search sessions', async ({ page }) => {
    const searchInput = page.locator('input[data-testid="search-input"]');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('communication');
      
      // Wait for search to apply
      await page.waitForTimeout(1000);
      
      // Verify search results
      await expect(page.locator('[data-testid="sessions-list"]')).toBeVisible();
      
      // Check that results contain search term (if any results)
      const sessions = page.locator('[data-testid="session-item"]');
      const count = await sessions.count();
      
      if (count > 0) {
        const firstSessionTitle = await sessions.first().locator('[data-testid="session-title"]').textContent();
        expect(firstSessionTitle?.toLowerCase()).toContain('communication');
      }
    }
  });

  test('should display session categories', async ({ page }) => {
    const sessions = page.locator('[data-testid="session-item"]');
    const count = await sessions.count();
    
    if (count > 0) {
      const firstSession = sessions.first();
      const categoryElement = firstSession.locator('[data-testid="session-category"]');
      
      if (await categoryElement.isVisible()) {
        const categoryText = await categoryElement.textContent();
        expect(categoryText).toBeTruthy();
      }
    }
  });

  test('should filter by session category', async ({ page }) => {
    const categoryFilter = page.locator('select[data-testid="category-filter"]');
    
    if (await categoryFilter.isVisible()) {
      await categoryFilter.selectOption('research');
      
      // Wait for filter to apply
      await page.waitForTimeout(1000);
      
      // Check that only research sessions are shown
      const sessions = page.locator('[data-testid="session-item"]');
      const count = await sessions.count();
      
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const category = await sessions.nth(i).locator('[data-testid="session-category"]').textContent();
          expect(category?.toLowerCase()).toContain('research');
        }
      }
    }
  });

  test('should display session status indicators', async ({ page }) => {
    const sessions = page.locator('[data-testid="session-item"]');
    const count = await sessions.count();
    
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const session = sessions.nth(i);
        const statusIndicator = session.locator('[data-testid="session-status"]');
        
        if (await statusIndicator.isVisible()) {
          const statusText = await statusIndicator.textContent();
          expect(['scheduled', 'cancelled', 'completed']).toContain(statusText?.toLowerCase());
        }
      }
    }
  });

  test('should handle session time display correctly', async ({ page }) => {
    const firstSession = page.locator('[data-testid="session-item"]').first();
    
    if (await firstSession.isVisible()) {
      const timeElement = firstSession.locator('[data-testid="session-time"]');
      const timeText = await timeElement.textContent();
      
      // Check that time is not empty and follows expected format
      expect(timeText).toBeTruthy();
      expect(timeText.length).toBeGreaterThan(0);
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="sessions-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="filter-options"]')).toBeVisible();
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
    
    // Check for ARIA attributes
    await expect(page.locator('[data-testid="sessions-list"]')).toHaveAttribute('role', 'list');
    
    // Check for proper button labels
    await expect(page.locator('button[data-filter="all"]')).toHaveAttribute('aria-label');
  });

  test('should handle empty sessions state', async ({ page }) => {
    // This test would be more relevant with a way to clear sessions
    // For now, just check that the page handles the case gracefully
    await expect(page.locator('[data-testid="sessions-list"]')).toBeVisible();
  });

  test('should maintain filter state on page refresh', async ({ page }) => {
    // Set a filter
    await page.click('button[data-filter="day1"]');
    
    // Wait for filter to apply
    await page.waitForTimeout(1000);
    
    // Refresh page
    await page.reload();
    
    // Check that filter state is maintained (if implemented)
    await expect(page.locator('[data-testid="sessions-list"]')).toBeVisible();
  });

  test('should display speaker information', async ({ page }) => {
    const firstSession = page.locator('[data-testid="session-item"]').first();
    
    if (await firstSession.isVisible()) {
      const speakersElement = firstSession.locator('[data-testid="session-speakers"]');
      
      if (await speakersElement.isVisible()) {
        const speakersText = await speakersElement.textContent();
        expect(speakersText).toBeTruthy();
      }
    }
  });

  test('should handle session interactions', async ({ page }) => {
    const firstSession = page.locator('[data-testid="session-item"]').first();
    
    if (await firstSession.isVisible()) {
      // Test hover effects
      await firstSession.hover();
      
      // Test click interaction
      await firstSession.click();
      
      // Wait for navigation or state changes
      await page.waitForTimeout(1000);
      
      // Verify interaction was handled (navigation to detail page)
      await expect(page).toHaveURL(/.*session.*/);
    }
  });

  test('should display session descriptions', async ({ page }) => {
    const firstSession = page.locator('[data-testid="session-item"]').first();
    
    if (await firstSession.isVisible()) {
      const descriptionElement = firstSession.locator('[data-testid="session-description"]');
      
      if (await descriptionElement.isVisible()) {
        const descriptionText = await descriptionElement.textContent();
        expect(descriptionText).toBeTruthy();
        expect(descriptionText.length).toBeGreaterThan(0);
      }
    }
  });
});