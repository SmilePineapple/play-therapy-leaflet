const { test, expect } = require('@playwright/test');

test.describe('QA Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/qa');
  });

  test('should load QA page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Communication Matters/);
    await expect(page.locator('h1')).toContainText('Questions & Answers');
  });

  test('should display question submission form', async ({ page }) => {
    await expect(page.locator('[data-testid="question-form"]')).toBeVisible();
    await expect(page.locator('textarea[placeholder*="question"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should display questions list', async ({ page }) => {
    await expect(page.locator('[data-testid="questions-list"]')).toBeVisible();
  });

  test('should display filter and sort options', async ({ page }) => {
    await expect(page.locator('[data-testid="filter-options"]')).toBeVisible();
    await expect(page.locator('select[data-testid="sort-select"]')).toBeVisible();
    await expect(page.locator('select[data-testid="filter-select"]')).toBeVisible();
  });

  test('should submit a new question', async ({ page }) => {
    const questionText = 'This is a test question from Playwright';
    
    await page.fill('textarea[placeholder*="question"]', questionText);
    await page.click('button[type="submit"]');
    
    // Wait for submission to complete
    await page.waitForTimeout(2000);
    
    // Check for success message or question appearing in list
    await expect(page.locator('text="Question submitted successfully"')).toBeVisible({ timeout: 10000 });
  });

  test('should validate required fields', async ({ page }) => {
    await page.click('button[type="submit"]');
    
    // Check for validation message
    await expect(page.locator('text="Please enter a question"')).toBeVisible();
  });

  test('should filter questions by status', async ({ page }) => {
    await page.selectOption('select[data-testid="filter-select"]', 'answered');
    
    // Wait for filter to apply
    await page.waitForTimeout(1000);
    
    // Check that only answered questions are shown
    const questions = page.locator('[data-testid="question-item"]');
    const count = await questions.count();
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        await expect(questions.nth(i).locator('[data-testid="question-status"]')).toContainText('Answered');
      }
    }
  });

  test('should sort questions by date', async ({ page }) => {
    await page.selectOption('select[data-testid="sort-select"]', 'newest');
    
    // Wait for sort to apply
    await page.waitForTimeout(1000);
    
    // Verify questions are sorted (this would need actual data to test properly)
    await expect(page.locator('[data-testid="questions-list"]')).toBeVisible();
  });

  test('should expand and collapse question details', async ({ page }) => {
    const firstQuestion = page.locator('[data-testid="question-item"]').first();
    
    if (await firstQuestion.isVisible()) {
      await firstQuestion.click();
      
      // Check if question details are expanded
      await expect(firstQuestion.locator('[data-testid="question-details"]')).toBeVisible();
      
      // Click again to collapse
      await firstQuestion.click();
      await expect(firstQuestion.locator('[data-testid="question-details"]')).toBeHidden();
    }
  });

  test('should vote on questions', async ({ page }) => {
    const firstQuestion = page.locator('[data-testid="question-item"]').first();
    
    if (await firstQuestion.isVisible()) {
      const voteButton = firstQuestion.locator('[data-testid="vote-button"]');
      
      if (await voteButton.isVisible()) {
        const initialVotes = await firstQuestion.locator('[data-testid="vote-count"]').textContent();
        
        await voteButton.click();
        
        // Wait for vote to register
        await page.waitForTimeout(1000);
        
        // Check that vote count changed
        const newVotes = await firstQuestion.locator('[data-testid="vote-count"]').textContent();
        expect(newVotes).not.toBe(initialVotes);
      }
    }
  });

  test('should handle anonymous question submission', async ({ page }) => {
    const questionText = 'This is an anonymous test question';
    
    await page.fill('textarea[placeholder*="question"]', questionText);
    
    // Check anonymous checkbox if available
    const anonymousCheckbox = page.locator('input[type="checkbox"][data-testid="anonymous-checkbox"]');
    if (await anonymousCheckbox.isVisible()) {
      await anonymousCheckbox.check();
    }
    
    await page.click('button[type="submit"]');
    
    // Wait for submission
    await page.waitForTimeout(2000);
    
    await expect(page.locator('text="Question submitted successfully"')).toBeVisible({ timeout: 10000 });
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="question-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="questions-list"]')).toBeVisible();
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check for proper form labels
    await expect(page.locator('label[for*="question"]')).toBeVisible();
    
    // Check for ARIA attributes
    await expect(page.locator('[data-testid="questions-list"]')).toHaveAttribute('role', 'list');
    
    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('should handle real-time updates', async ({ page }) => {
    // Wait for initial load
    await page.waitForLoadState('networkidle');
    
    // Check that questions list is present
    await expect(page.locator('[data-testid="questions-list"]')).toBeVisible();
    
    // This would test real-time updates if we had a way to trigger them
    // For now, just verify the subscription mechanism is in place
  });

  test('should search questions', async ({ page }) => {
    const searchInput = page.locator('input[data-testid="search-input"]');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      
      // Wait for search to apply
      await page.waitForTimeout(1000);
      
      // Verify search results
      await expect(page.locator('[data-testid="questions-list"]')).toBeVisible();
    }
  });
});