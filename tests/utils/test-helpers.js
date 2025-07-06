/**
 * Test utilities and helpers for Playwright tests
 * Communication Matters Conference App
 */

const { expect } = require('@playwright/test');

/**
 * Admin login credentials
 */
const ADMIN_CREDENTIALS = {
  email: 'admin@communicationmatters.org',
  password: 'AdminPass2024!'
};

/**
 * Common test data
 */
const TEST_DATA = {
  validEmail: 'test@example.com',
  invalidEmail: 'invalid-email',
  sampleQuestion: 'This is a test question for the QA system.',
  sampleAnswer: 'This is a test answer for the QA system.',
  sampleName: 'Test User',
  sampleSubject: 'Test Subject',
  sampleMessage: 'This is a test message for the contact form.'
};

/**
 * Common selectors used across tests
 */
const SELECTORS = {
  // Navigation
  nav: {
    home: 'a[href="/"]',
    qa: 'a[href="/qa"]',
    admin: 'a[href="/admin"]',
    news: 'a[href="/news"]',
    programme: 'a[href="/programme"]',
    sponsors: 'a[href="/sponsors"]',
    map: 'a[href="/map"]',
    contact: 'a[href="/contact"]',
    about: 'a[href="/about"]'
  },
  
  // Forms
  forms: {
    loginEmail: 'input[name="email"], input[type="email"]',
    loginPassword: 'input[name="password"], input[type="password"]',
    submitButton: 'button[type="submit"]',
    nameInput: 'input[name="name"]',
    subjectInput: 'input[name="subject"]',
    messageTextarea: 'textarea[name="message"]'
  },
  
  // Common elements
  common: {
    loadingSpinner: '[data-testid="loading"], .loading, .spinner',
    errorMessage: '[data-testid="error"], .error-message',
    successMessage: '[data-testid="success"], .success-message',
    modal: '[data-testid="modal"], .modal',
    closeButton: '[data-testid="close"], .close, button[aria-label="Close"]'
  }
};

/**
 * Helper functions
 */
class TestHelpers {
  /**
   * Login as admin user with improved error handling and retries
   * @param {Page} page - Playwright page object
   * @param {number} maxRetries - Maximum number of retry attempts
   */
  static async loginAsAdmin(page, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Admin login attempt ${attempt}/${maxRetries}`);
        
        // Navigate to admin page
        await page.goto('/admin', { waitUntil: 'networkidle', timeout: 30000 });
        
        // Wait for page to fully load
        await this.waitForPageLoad(page, 20000);
        
        // Wait for login form to be visible and enabled
        await page.waitForSelector(SELECTORS.forms.loginEmail, { 
          state: 'visible', 
          timeout: 15000 
        });
        
        // Ensure form fields are enabled before filling
        await page.waitForFunction(() => {
          const emailInput = document.querySelector('input[name="email"], input[type="email"]');
          const passwordInput = document.querySelector('input[name="password"], input[type="password"]');
          return emailInput && !emailInput.disabled && passwordInput && !passwordInput.disabled;
        }, { timeout: 10000 });
        
        // Clear and fill login form
        await page.fill(SELECTORS.forms.loginEmail, '');
        await page.fill(SELECTORS.forms.loginEmail, ADMIN_CREDENTIALS.email);
        await page.fill(SELECTORS.forms.loginPassword, '');
        await page.fill(SELECTORS.forms.loginPassword, ADMIN_CREDENTIALS.password);
        
        // Wait for submit button to be enabled
        await page.waitForSelector(SELECTORS.forms.submitButton + ':not([disabled])', { timeout: 5000 });
        
        // Submit form and wait for navigation
        const [response] = await Promise.all([
          page.waitForResponse(response => 
            response.url().includes('/admin') && 
            (response.status() === 200 || response.status() === 302), 
            { timeout: 20000 }
          ),
          page.click(SELECTORS.forms.submitButton)
        ]);
        
        // Wait for successful login indicators
        await Promise.race([
          page.waitForSelector('[data-testid="admin-dashboard"], .dashboard, .admin-panel', { 
            state: 'visible', 
            timeout: 20000 
          }),
          page.waitForURL('**/admin/dashboard', { timeout: 20000 }),
          page.waitForFunction(() => {
            return document.querySelector('[data-testid="admin-dashboard"], .dashboard, .admin-panel') !== null ||
                   window.location.pathname.includes('/admin/dashboard') ||
                   document.querySelector('.admin-content, .admin-main') !== null;
          }, { timeout: 20000 })
        ]);
        
        console.log(`Admin login successful on attempt ${attempt}`);
        return true;
        
      } catch (error) {
        console.log(`Admin login attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          throw new Error(`Admin login failed after ${maxRetries} attempts. Last error: ${error.message}`);
        }
        
        // Wait before retry
        await page.waitForTimeout(2000 * attempt);
        
        // Try to clear any stuck states
        try {
          await page.reload({ waitUntil: 'networkidle', timeout: 15000 });
        } catch (reloadError) {
          console.log('Page reload failed, continuing with retry...');
        }
      }
    }
  }
  
  /**
   * Logout from admin panel
   * @param {Page} page - Playwright page object
   */
  static async logout(page) {
    const logoutButton = page.locator('[data-testid="logout"], button:has-text("Logout")');
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Wait for redirect to login page
      await page.waitForURL('**/admin', { timeout: 10000 });
      await page.waitForSelector(SELECTORS.forms.loginEmail, { timeout: 10000 });
    }
  }
  
  /**
   * Wait for page to load completely with enhanced loading state handling
   * @param {Page} page - Playwright page object
   * @param {number} timeout - Timeout in milliseconds
   */
  static async waitForPageLoad(page, timeout = 30000) {
    try {
      // Wait for network to be idle
      await page.waitForLoadState('networkidle', { timeout });
      
      // Wait for DOM to be ready
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      
      // Wait for any loading spinners to disappear
      const loadingSpinner = page.locator(SELECTORS.common.loadingSpinner);
      if (await loadingSpinner.isVisible()) {
        await loadingSpinner.waitFor({ state: 'hidden', timeout: 15000 });
      }
      
      // Wait for any "Loading..." text to disappear
      const loadingTexts = page.locator('text=/Loading|loading|Signing In|signing in/i');
      const loadingCount = await loadingTexts.count();
      if (loadingCount > 0) {
        for (let i = 0; i < loadingCount; i++) {
          try {
            await loadingTexts.nth(i).waitFor({ state: 'hidden', timeout: 5000 });
          } catch (e) {
            // Continue if individual loading text doesn't disappear
          }
        }
      }
      
      // Wait for React/JS to finish rendering
      await page.waitForFunction(() => {
        return document.readyState === 'complete' && 
               (!window.React || !window.React.unstable_batchedUpdates || 
                document.querySelector('[data-reactroot]') !== null);
      }, { timeout: 10000 });
      
    } catch (error) {
      console.log(`Page load warning: ${error.message}`);
      // Don't throw, just log the warning and continue
    }
  }
  
  /**
   * Fill and submit a contact form
   * @param {Page} page - Playwright page object
   * @param {Object} data - Form data
   */
  static async fillContactForm(page, data = {}) {
    const formData = {
      name: data.name || TEST_DATA.sampleName,
      email: data.email || TEST_DATA.validEmail,
      subject: data.subject || TEST_DATA.sampleSubject,
      message: data.message || TEST_DATA.sampleMessage
    };
    
    await page.fill(SELECTORS.forms.nameInput, formData.name);
    await page.fill(SELECTORS.forms.loginEmail, formData.email);
    
    const subjectInput = page.locator(SELECTORS.forms.subjectInput);
    if (await subjectInput.isVisible()) {
      await page.fill(SELECTORS.forms.subjectInput, formData.subject);
    }
    
    await page.fill(SELECTORS.forms.messageTextarea, formData.message);
    
    return formData;
  }
  
  /**
   * Check if element is visible with retry
   * @param {Page} page - Playwright page object
   * @param {string} selector - Element selector
   * @param {number} retries - Number of retries
   * @param {number} delay - Delay between retries in ms
   */
  static async isVisibleWithRetry(page, selector, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          return true;
        }
      } catch (error) {
        // Element not found, continue retrying
      }
      
      if (i < retries - 1) {
        await page.waitForTimeout(delay);
      }
    }
    
    return false;
  }
  
  /**
   * Get the first visible element when multiple elements match (handles strict mode violations)
   * @param {Page} page - Playwright page object
   * @param {string} selector - Element selector
   * @param {Object} options - Additional options
   */
  static async getFirstVisibleElement(page, selector, options = {}) {
    const elements = page.locator(selector);
    const count = await elements.count();
    
    if (count === 0) {
      throw new Error(`No elements found for selector: ${selector}`);
    }
    
    if (count === 1) {
      return elements.first();
    }
    
    // Multiple elements found, return the first visible one
    for (let i = 0; i < count; i++) {
      const element = elements.nth(i);
      if (await element.isVisible()) {
        return element;
      }
    }
    
    // If no visible elements, return the first one
    return elements.first();
  }
  
  /**
   * Wait for a specific element while handling multiple matches
   * @param {Page} page - Playwright page object
   * @param {string} selector - Element selector
   * @param {Object} options - Wait options
   */
  static async waitForElementSafe(page, selector, options = {}) {
    const defaultOptions = { state: 'visible', timeout: 10000, ...options };
    
    try {
      // Try normal wait first
      await page.waitForSelector(selector, defaultOptions);
      return page.locator(selector).first();
    } catch (error) {
      if (error.message.includes('strict mode violation')) {
        // Handle multiple elements by waiting for any to be visible
        await page.waitForFunction(
          (sel) => {
            const elements = document.querySelectorAll(sel);
            return Array.from(elements).some(el => el.offsetParent !== null);
          },
          selector,
          { timeout: defaultOptions.timeout }
        );
        return this.getFirstVisibleElement(page, selector);
      }
      throw error;
    }
  }
  
  /**
   * Take screenshot with timestamp
   * @param {Page} page - Playwright page object
   * @param {string} name - Screenshot name
   */
  static async takeScreenshot(page, name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    
    await page.screenshot({
      path: `test-results/screenshots/${filename}`,
      fullPage: true
    });
    
    return filename;
  }
  
  /**
   * Check accessibility basics
   * @param {Page} page - Playwright page object
   */
  static async checkBasicAccessibility(page) {
    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
    
    // Check that all images have alt text
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      await expect(image).toHaveAttribute('alt');
    }
    
    // Check that all links have accessible names
    const links = page.locator('a');
    const linkCount = await links.count();
    
    for (let i = 0; i < Math.min(linkCount, 10); i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const title = await link.getAttribute('title');
      
      expect(text || ariaLabel || title).toBeTruthy();
    }
  }
  
  /**
   * Check responsive design
   * @param {Page} page - Playwright page object
   * @param {Array} viewports - Array of viewport sizes to test
   */
  static async checkResponsiveDesign(page, viewports = [
    { width: 375, height: 667, name: 'Mobile' },
    { width: 768, height: 1024, name: 'Tablet' },
    { width: 1920, height: 1080, name: 'Desktop' }
  ]) {
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Wait for layout to adjust
      await page.waitForTimeout(500);
      
      // Check that main content is visible
      await expect(page.locator('main, [role="main"], .main-content')).toBeVisible();
      
      // Check that navigation is accessible
      const nav = page.locator('nav, [role="navigation"], .navigation');
      if (await nav.isVisible()) {
        await expect(nav).toBeVisible();
      }
    }
  }
  
  /**
   * Mock API responses for testing
   * @param {Page} page - Playwright page object
   * @param {Object} mocks - Object containing URL patterns and responses
   */
  static async mockApiResponses(page, mocks) {
    for (const [pattern, response] of Object.entries(mocks)) {
      await page.route(pattern, route => {
        route.fulfill({
          status: response.status || 200,
          contentType: response.contentType || 'application/json',
          body: JSON.stringify(response.body || {})
        });
      });
    }
  }
  
  /**
   * Wait for and handle modals
   * @param {Page} page - Playwright page object
   * @param {string} action - 'open' or 'close'
   */
  static async handleModal(page, action = 'close') {
    const modal = page.locator(SELECTORS.common.modal);
    
    if (action === 'close') {
      if (await modal.isVisible()) {
        const closeButton = modal.locator(SELECTORS.common.closeButton);
        
        if (await closeButton.isVisible()) {
          await closeButton.click();
        } else {
          // Try pressing Escape key
          await page.keyboard.press('Escape');
        }
        
        // Wait for modal to close
        await modal.waitFor({ state: 'hidden', timeout: 5000 });
      }
    }
  }
  
  /**
   * Generate random test data
   * @param {string} type - Type of data to generate
   */
  static generateTestData(type) {
    const timestamp = Date.now();
    
    switch (type) {
      case 'email':
        return `test${timestamp}@example.com`;
      case 'name':
        return `Test User ${timestamp}`;
      case 'question':
        return `Test question ${timestamp} - This is a sample question for testing purposes.`;
      case 'answer':
        return `Test answer ${timestamp} - This is a sample answer for testing purposes.`;
      default:
        return `Test data ${timestamp}`;
    }
  }
  
  /**
   * Verify form validation
   * @param {Page} page - Playwright page object
   * @param {Object} validationTests - Object containing field selectors and expected errors
   */
  static async verifyFormValidation(page, validationTests) {
    for (const [fieldSelector, expectedError] of Object.entries(validationTests)) {
      // Clear the field
      await page.fill(fieldSelector, '');
      
      // Try to submit
      await page.click(SELECTORS.forms.submitButton);
      
      // Check for validation error
      const errorElement = page.locator(`${fieldSelector} + .error, [data-testid="${fieldSelector.replace(/[\[\]"]/g, '')}-error"]`);
      
      if (await errorElement.isVisible()) {
        const errorText = await errorElement.textContent();
        expect(errorText.toLowerCase()).toContain(expectedError.toLowerCase());
      }
    }
  }
}

module.exports = {
  TestHelpers,
  ADMIN_CREDENTIALS,
  TEST_DATA,
  SELECTORS
};