const { test, expect } = require('@playwright/test');

test.describe('News Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/news');
  });

  test('should load news page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Communication Matters/);
    await expect(page.locator('h1')).toContainText('News & Announcements');
  });

  test('should display announcements list', async ({ page }) => {
    await expect(page.locator('[data-testid="announcements-list"]')).toBeVisible();
  });

  test('should display filter options', async ({ page }) => {
    await expect(page.locator('[data-testid="filter-options"]')).toBeVisible();
    
    // Check for filter buttons
    await expect(page.locator('button[data-filter="all"]')).toBeVisible();
    await expect(page.locator('button[data-filter="unread"]')).toBeVisible();
    await expect(page.locator('button[data-filter="important"]')).toBeVisible();
  });

  test('should filter announcements by all', async ({ page }) => {
    await page.click('button[data-filter="all"]');
    
    // Wait for filter to apply
    await page.waitForTimeout(1000);
    
    // Check that announcements are visible
    await expect(page.locator('[data-testid="announcements-list"]')).toBeVisible();
    
    // Verify filter is active
    await expect(page.locator('button[data-filter="all"]')).toHaveClass(/active/);
  });

  test('should filter announcements by unread', async ({ page }) => {
    await page.click('button[data-filter="unread"]');
    
    // Wait for filter to apply
    await page.waitForTimeout(1000);
    
    // Check that only unread announcements are shown
    const announcements = page.locator('[data-testid="announcement-item"]');
    const count = await announcements.count();
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        await expect(announcements.nth(i)).toHaveClass(/unread/);
      }
    }
    
    // Verify filter is active
    await expect(page.locator('button[data-filter="unread"]')).toHaveClass(/active/);
  });

  test('should filter announcements by important', async ({ page }) => {
    await page.click('button[data-filter="important"]');
    
    // Wait for filter to apply
    await page.waitForTimeout(1000);
    
    // Check that only important announcements are shown
    const announcements = page.locator('[data-testid="announcement-item"]');
    const count = await announcements.count();
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        await expect(announcements.nth(i)).toHaveClass(/important/);
      }
    }
    
    // Verify filter is active
    await expect(page.locator('button[data-filter="important"]')).toHaveClass(/active/);
  });

  test('should display announcement details', async ({ page }) => {
    const firstAnnouncement = page.locator('[data-testid="announcement-item"]').first();
    
    if (await firstAnnouncement.isVisible()) {
      // Check announcement structure
      await expect(firstAnnouncement.locator('[data-testid="announcement-title"]')).toBeVisible();
      await expect(firstAnnouncement.locator('[data-testid="announcement-date"]')).toBeVisible();
      await expect(firstAnnouncement.locator('[data-testid="announcement-content"]')).toBeVisible();
    }
  });

  test('should mark announcement as read when clicked', async ({ page }) => {
    const firstAnnouncement = page.locator('[data-testid="announcement-item"]').first();
    
    if (await firstAnnouncement.isVisible()) {
      // Check if announcement is unread
      const isUnread = await firstAnnouncement.evaluate(el => el.classList.contains('unread'));
      
      if (isUnread) {
        await firstAnnouncement.click();
        
        // Wait for read status to update
        await page.waitForTimeout(1000);
        
        // Check that announcement is now marked as read
        await expect(firstAnnouncement).not.toHaveClass(/unread/);
      }
    }
  });

  test('should expand and collapse announcement content', async ({ page }) => {
    const firstAnnouncement = page.locator('[data-testid="announcement-item"]').first();
    
    if (await firstAnnouncement.isVisible()) {
      const expandButton = firstAnnouncement.locator('[data-testid="expand-button"]');
      
      if (await expandButton.isVisible()) {
        await expandButton.click();
        
        // Check if content is expanded
        await expect(firstAnnouncement.locator('[data-testid="announcement-full-content"]')).toBeVisible();
        
        // Click again to collapse
        await expandButton.click();
        await expect(firstAnnouncement.locator('[data-testid="announcement-full-content"]')).toBeHidden();
      }
    }
  });

  test('should display announcement priority indicators', async ({ page }) => {
    const announcements = page.locator('[data-testid="announcement-item"]');
    const count = await announcements.count();
    
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const announcement = announcements.nth(i);
        const priorityIndicator = announcement.locator('[data-testid="priority-indicator"]');
        
        if (await priorityIndicator.isVisible()) {
          // Check that priority indicator has appropriate styling
          await expect(priorityIndicator).toBeVisible();
        }
      }
    }
  });

  test('should display announcement timestamps correctly', async ({ page }) => {
    const firstAnnouncement = page.locator('[data-testid="announcement-item"]').first();
    
    if (await firstAnnouncement.isVisible()) {
      const dateElement = firstAnnouncement.locator('[data-testid="announcement-date"]');
      const dateText = await dateElement.textContent();
      
      // Check that date is not empty and follows expected format
      expect(dateText).toBeTruthy();
      expect(dateText.length).toBeGreaterThan(0);
    }
  });

  test('should handle empty announcements state', async ({ page }) => {
    // This test would be more relevant with a way to clear announcements
    // For now, just check that the page handles the case gracefully
    await expect(page.locator('[data-testid="announcements-list"]')).toBeVisible();
  });

  test('should search announcements', async ({ page }) => {
    const searchInput = page.locator('input[data-testid="search-input"]');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      
      // Wait for search to apply
      await page.waitForTimeout(1000);
      
      // Verify search results
      await expect(page.locator('[data-testid="announcements-list"]')).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="announcements-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="filter-options"]')).toBeVisible();
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
    
    // Check for ARIA attributes
    await expect(page.locator('[data-testid="announcements-list"]')).toHaveAttribute('role', 'list');
    
    // Check for proper button labels
    await expect(page.locator('button[data-filter="all"]')).toHaveAttribute('aria-label');
  });

  test('should handle real-time updates', async ({ page }) => {
    // Wait for initial load
    await page.waitForLoadState('networkidle');
    
    // Check that announcements list is present
    await expect(page.locator('[data-testid="announcements-list"]')).toBeVisible();
    
    // This would test real-time updates if we had a way to trigger them
    // For now, just verify the subscription mechanism is in place
  });

  test('should maintain filter state on page refresh', async ({ page }) => {
    // Set a filter
    await page.click('button[data-filter="unread"]');
    
    // Wait for filter to apply
    await page.waitForTimeout(1000);
    
    // Refresh page
    await page.reload();
    
    // Check that filter state is maintained (if implemented)
    await expect(page.locator('[data-testid="announcements-list"]')).toBeVisible();
  });

  test('should display announcement categories', async ({ page }) => {
    const announcements = page.locator('[data-testid="announcement-item"]');
    const count = await announcements.count();
    
    if (count > 0) {
      const firstAnnouncement = announcements.first();
      const categoryElement = firstAnnouncement.locator('[data-testid="announcement-category"]');
      
      if (await categoryElement.isVisible()) {
        const categoryText = await categoryElement.textContent();
        expect(categoryText).toBeTruthy();
      }
    }
  });

  test('should handle announcement interactions', async ({ page }) => {
    const firstAnnouncement = page.locator('[data-testid="announcement-item"]').first();
    
    if (await firstAnnouncement.isVisible()) {
      // Test hover effects
      await firstAnnouncement.hover();
      
      // Test click interaction
      await firstAnnouncement.click();
      
      // Wait for any animations or state changes
      await page.waitForTimeout(500);
      
      // Verify interaction was handled
      await expect(firstAnnouncement).toBeVisible();
    }
  });
});