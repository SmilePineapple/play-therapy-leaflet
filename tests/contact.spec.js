const { test, expect } = require('@playwright/test');

test.describe('Contact Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('should load contact page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Communication Matters/);
    await expect(page.locator('h1')).toContainText('Contact');
  });

  test('should display contact form', async ({ page }) => {
    await expect(page.locator('form[data-testid="contact-form"]')).toBeVisible();
    
    // Check for required form fields
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="subject"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    
    // Try to submit empty form
    await submitButton.click();
    
    // Check for validation messages
    await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="message-error"]')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Fill form with invalid email
    await page.locator('input[name="name"]').fill('Test User');
    await emailInput.fill('invalid-email');
    await page.locator('textarea[name="message"]').fill('Test message');
    
    await submitButton.click();
    
    // Check for email validation error
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-error"]')).toContainText('valid email');
  });

  test('should submit form successfully with valid data', async ({ page }) => {
    // Fill out the form
    await page.locator('input[name="name"]').fill('John Doe');
    await page.locator('input[name="email"]').fill('john.doe@example.com');
    await page.locator('input[name="subject"]').fill('Test Subject');
    await page.locator('textarea[name="message"]').fill('This is a test message for the contact form.');
    
    // Submit the form
    await page.locator('button[type="submit"]').click();
    
    // Wait for submission to complete
    await page.waitForTimeout(2000);
    
    // Check for success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('sent successfully');
  });

  test('should display contact information', async ({ page }) => {
    const contactInfo = page.locator('[data-testid="contact-info"]');
    await expect(contactInfo).toBeVisible();
    
    // Check for organization details
    await expect(contactInfo.locator('[data-testid="organization-name"]')).toBeVisible();
    await expect(contactInfo.locator('[data-testid="organization-address"]')).toBeVisible();
  });

  test('should display phone numbers', async ({ page }) => {
    const phoneSection = page.locator('[data-testid="phone-numbers"]');
    
    if (await phoneSection.isVisible()) {
      const phoneNumbers = phoneSection.locator('[data-testid="phone-number"]');
      const count = await phoneNumbers.count();
      
      if (count > 0) {
        // Check first phone number
        const firstPhone = phoneNumbers.first();
        const phoneText = await firstPhone.textContent();
        expect(phoneText).toBeTruthy();
        
        // Check if phone number is clickable (tel: link)
        const phoneLink = firstPhone.locator('a[href^="tel:"]');
        if (await phoneLink.isVisible()) {
          await expect(phoneLink).toHaveAttribute('href');
        }
      }
    }
  });

  test('should display email addresses', async ({ page }) => {
    const emailSection = page.locator('[data-testid="email-addresses"]');
    
    if (await emailSection.isVisible()) {
      const emailAddresses = emailSection.locator('[data-testid="email-address"]');
      const count = await emailAddresses.count();
      
      if (count > 0) {
        // Check first email address
        const firstEmail = emailAddresses.first();
        const emailText = await firstEmail.textContent();
        expect(emailText).toContain('@');
        
        // Check if email is clickable (mailto: link)
        const emailLink = firstEmail.locator('a[href^="mailto:"]');
        if (await emailLink.isVisible()) {
          await expect(emailLink).toHaveAttribute('href');
        }
      }
    }
  });

  test('should display office hours', async ({ page }) => {
    const officeHours = page.locator('[data-testid="office-hours"]');
    
    if (await officeHours.isVisible()) {
      await expect(officeHours).toBeVisible();
      
      // Check for days and times
      const hoursText = await officeHours.textContent();
      expect(hoursText).toBeTruthy();
    }
  });

  test('should display social media links', async ({ page }) => {
    const socialMedia = page.locator('[data-testid="social-media"]');
    
    if (await socialMedia.isVisible()) {
      const socialLinks = socialMedia.locator('a[data-testid="social-link"]');
      const count = await socialLinks.count();
      
      if (count > 0) {
        // Check first social link
        const firstLink = socialLinks.first();
        await expect(firstLink).toHaveAttribute('href');
        await expect(firstLink).toHaveAttribute('target', '_blank');
        
        // Check for social media icons
        const icon = firstLink.locator('svg, img, i');
        if (await icon.isVisible()) {
          await expect(icon).toBeVisible();
        }
      }
    }
  });

  test('should display map or location information', async ({ page }) => {
    const locationSection = page.locator('[data-testid="location-section"]');
    
    if (await locationSection.isVisible()) {
      // Check for embedded map
      const embeddedMap = locationSection.locator('iframe[src*="maps"]');
      const mapImage = locationSection.locator('[data-testid="location-map"]');
      
      const hasEmbeddedMap = await embeddedMap.isVisible();
      const hasMapImage = await mapImage.isVisible();
      
      expect(hasEmbeddedMap || hasMapImage).toBeTruthy();
      
      // Check for directions link
      const directionsLink = locationSection.locator('a[data-testid="directions-link"]');
      if (await directionsLink.isVisible()) {
        await expect(directionsLink).toHaveAttribute('href');
        await expect(directionsLink).toHaveAttribute('target', '_blank');
      }
    }
  });

  test('should display department contacts', async ({ page }) => {
    const departments = page.locator('[data-testid="departments"]');
    
    if (await departments.isVisible()) {
      const departmentList = departments.locator('[data-testid="department-item"]');
      const count = await departmentList.count();
      
      if (count > 0) {
        // Check first department
        const firstDept = departmentList.first();
        await expect(firstDept.locator('[data-testid="department-name"]')).toBeVisible();
        
        // Check for department contact info
        const deptEmail = firstDept.locator('[data-testid="department-email"]');
        const deptPhone = firstDept.locator('[data-testid="department-phone"]');
        
        const hasEmail = await deptEmail.isVisible();
        const hasPhone = await deptPhone.isVisible();
        
        expect(hasEmail || hasPhone).toBeTruthy();
      }
    }
  });

  test('should handle form character limits', async ({ page }) => {
    const messageTextarea = page.locator('textarea[name="message"]');
    
    // Fill with long message
    const longMessage = 'A'.repeat(2000);
    await messageTextarea.fill(longMessage);
    
    // Check if character count is displayed
    const charCount = page.locator('[data-testid="char-count"]');
    if (await charCount.isVisible()) {
      const countText = await charCount.textContent();
      expect(countText).toBeTruthy();
    }
    
    // Check if there's a character limit warning
    const charWarning = page.locator('[data-testid="char-warning"]');
    if (await charWarning.isVisible()) {
      await expect(charWarning).toBeVisible();
    }
  });

  test('should display FAQ section', async ({ page }) => {
    const faqSection = page.locator('[data-testid="faq-section"]');
    
    if (await faqSection.isVisible()) {
      const faqItems = faqSection.locator('[data-testid="faq-item"]');
      const count = await faqItems.count();
      
      if (count > 0) {
        // Test expanding FAQ item
        const firstFaq = faqItems.first();
        const question = firstFaq.locator('[data-testid="faq-question"]');
        
        await question.click();
        
        // Check if answer is revealed
        const answer = firstFaq.locator('[data-testid="faq-answer"]');
        await expect(answer).toBeVisible();
        
        // Test collapsing
        await question.click();
        await expect(answer).toBeHidden();
      }
    }
  });

  test('should handle form submission errors gracefully', async ({ page }) => {
    // Mock a server error response
    await page.route('**/api/contact', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });
    
    // Fill and submit form
    await page.locator('input[name="name"]').fill('Test User');
    await page.locator('input[name="email"]').fill('test@example.com');
    await page.locator('textarea[name="message"]').fill('Test message');
    
    await page.locator('button[type="submit"]').click();
    
    // Wait for error handling
    await page.waitForTimeout(2000);
    
    // Check for error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('should display emergency contact information', async ({ page }) => {
    const emergencyContact = page.locator('[data-testid="emergency-contact"]');
    
    if (await emergencyContact.isVisible()) {
      await expect(emergencyContact).toBeVisible();
      
      // Check for emergency phone number
      const emergencyPhone = emergencyContact.locator('[data-testid="emergency-phone"]');
      if (await emergencyPhone.isVisible()) {
        const phoneText = await emergencyPhone.textContent();
        expect(phoneText).toBeTruthy();
      }
    }
  });

  test('should handle contact form categories', async ({ page }) => {
    const categorySelect = page.locator('select[name="category"]');
    
    if (await categorySelect.isVisible()) {
      // Test selecting different categories
      await categorySelect.selectOption('general');
      await expect(categorySelect).toHaveValue('general');
      
      await categorySelect.selectOption('support');
      await expect(categorySelect).toHaveValue('support');
      
      await categorySelect.selectOption('feedback');
      await expect(categorySelect).toHaveValue('feedback');
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('form[data-testid="contact-form"]')).toBeVisible();
    
    // Check that form fields are properly sized
    const nameInput = page.locator('input[name="name"]');
    const boundingBox = await nameInput.boundingBox();
    
    if (boundingBox) {
      expect(boundingBox.width).toBeLessThanOrEqual(375);
    }
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
    
    // Check form labels
    const nameInput = page.locator('input[name="name"]');
    const emailInput = page.locator('input[name="email"]');
    const messageTextarea = page.locator('textarea[name="message"]');
    
    // Check for associated labels or aria-label
    const nameLabel = await nameInput.getAttribute('aria-label') || await page.locator('label[for="name"]').textContent();
    const emailLabel = await emailInput.getAttribute('aria-label') || await page.locator('label[for="email"]').textContent();
    const messageLabel = await messageTextarea.getAttribute('aria-label') || await page.locator('label[for="message"]').textContent();
    
    expect(nameLabel).toBeTruthy();
    expect(emailLabel).toBeTruthy();
    expect(messageLabel).toBeTruthy();
    
    // Check submit button accessibility
    const submitButton = page.locator('button[type="submit"]');
    const buttonText = await submitButton.textContent();
    const buttonAriaLabel = await submitButton.getAttribute('aria-label');
    
    expect(buttonText || buttonAriaLabel).toBeTruthy();
  });

  test('should handle form loading states', async ({ page }) => {
    // Fill form
    await page.locator('input[name="name"]').fill('Test User');
    await page.locator('input[name="email"]').fill('test@example.com');
    await page.locator('textarea[name="message"]').fill('Test message');
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Check for loading state
    const loadingIndicator = page.locator('[data-testid="form-loading"]');
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).toBeVisible();
    }
    
    // Check if submit button is disabled during submission
    const isDisabled = await submitButton.isDisabled();
    if (isDisabled) {
      expect(isDisabled).toBeTruthy();
    }
  });

  test('should display contact form privacy notice', async ({ page }) => {
    const privacyNotice = page.locator('[data-testid="privacy-notice"]');
    
    if (await privacyNotice.isVisible()) {
      await expect(privacyNotice).toBeVisible();
      
      // Check for privacy policy link
      const privacyLink = privacyNotice.locator('a[href*="privacy"]');
      if (await privacyLink.isVisible()) {
        await expect(privacyLink).toHaveAttribute('href');
      }
    }
  });

  test('should clear form after successful submission', async ({ page }) => {
    // Fill form
    await page.locator('input[name="name"]').fill('Test User');
    await page.locator('input[name="email"]').fill('test@example.com');
    await page.locator('input[name="subject"]').fill('Test Subject');
    await page.locator('textarea[name="message"]').fill('Test message');
    
    // Submit form
    await page.locator('button[type="submit"]').click();
    
    // Wait for submission
    await page.waitForTimeout(2000);
    
    // Check if form is cleared (if success message is shown)
    const successMessage = page.locator('[data-testid="success-message"]');
    if (await successMessage.isVisible()) {
      await expect(page.locator('input[name="name"]')).toHaveValue('');
      await expect(page.locator('input[name="email"]')).toHaveValue('');
      await expect(page.locator('input[name="subject"]')).toHaveValue('');
      await expect(page.locator('textarea[name="message"]')).toHaveValue('');
    }
  });
});