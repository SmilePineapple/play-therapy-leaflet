const { test, expect } = require('@playwright/test');

test.describe('About Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about');
  });

  test('should load about page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Communication Matters/);
    await expect(page.locator('h1')).toContainText('About');
  });

  test('should display organization mission', async ({ page }) => {
    const missionSection = page.locator('[data-testid="mission-section"]');
    await expect(missionSection).toBeVisible();
    
    // Check for mission statement
    await expect(missionSection.locator('[data-testid="mission-statement"]')).toBeVisible();
    
    const missionText = await missionSection.locator('[data-testid="mission-statement"]').textContent();
    expect(missionText).toBeTruthy();
    expect(missionText.length).toBeGreaterThan(50);
  });

  test('should display organization vision', async ({ page }) => {
    const visionSection = page.locator('[data-testid="vision-section"]');
    
    if (await visionSection.isVisible()) {
      await expect(visionSection.locator('[data-testid="vision-statement"]')).toBeVisible();
      
      const visionText = await visionSection.locator('[data-testid="vision-statement"]').textContent();
      expect(visionText).toBeTruthy();
    }
  });

  test('should display organization values', async ({ page }) => {
    const valuesSection = page.locator('[data-testid="values-section"]');
    
    if (await valuesSection.isVisible()) {
      const valuesList = valuesSection.locator('[data-testid="values-list"]');
      await expect(valuesList).toBeVisible();
      
      // Check for individual values
      const values = valuesList.locator('[data-testid="value-item"]');
      const count = await values.count();
      
      if (count > 0) {
        // Check first value
        const firstValue = values.first();
        await expect(firstValue.locator('[data-testid="value-title"]')).toBeVisible();
        await expect(firstValue.locator('[data-testid="value-description"]')).toBeVisible();
      }
    }
  });

  test('should display organization history', async ({ page }) => {
    const historySection = page.locator('[data-testid="history-section"]');
    
    if (await historySection.isVisible()) {
      await expect(historySection).toBeVisible();
      
      // Check for timeline or history content
      const timeline = historySection.locator('[data-testid="timeline"]');
      const historyText = historySection.locator('[data-testid="history-text"]');
      
      const hasTimeline = await timeline.isVisible();
      const hasHistoryText = await historyText.isVisible();
      
      expect(hasTimeline || hasHistoryText).toBeTruthy();
      
      if (hasTimeline) {
        // Check timeline items
        const timelineItems = timeline.locator('[data-testid="timeline-item"]');
        const itemCount = await timelineItems.count();
        
        if (itemCount > 0) {
          const firstItem = timelineItems.first();
          await expect(firstItem.locator('[data-testid="timeline-year"]')).toBeVisible();
          await expect(firstItem.locator('[data-testid="timeline-event"]')).toBeVisible();
        }
      }
    }
  });

  test('should display team members', async ({ page }) => {
    const teamSection = page.locator('[data-testid="team-section"]');
    
    if (await teamSection.isVisible()) {
      const teamMembers = teamSection.locator('[data-testid="team-member"]');
      const count = await teamMembers.count();
      
      if (count > 0) {
        // Check first team member
        const firstMember = teamMembers.first();
        
        // Check for member photo
        const memberPhoto = firstMember.locator('[data-testid="member-photo"]');
        if (await memberPhoto.isVisible()) {
          await expect(memberPhoto).toHaveAttribute('src');
          await expect(memberPhoto).toHaveAttribute('alt');
        }
        
        // Check for member details
        await expect(firstMember.locator('[data-testid="member-name"]')).toBeVisible();
        await expect(firstMember.locator('[data-testid="member-role"]')).toBeVisible();
        
        // Check for member bio
        const memberBio = firstMember.locator('[data-testid="member-bio"]');
        if (await memberBio.isVisible()) {
          const bioText = await memberBio.textContent();
          expect(bioText).toBeTruthy();
        }
      }
    }
  });

  test('should display board members', async ({ page }) => {
    const boardSection = page.locator('[data-testid="board-section"]');
    
    if (await boardSection.isVisible()) {
      const boardMembers = boardSection.locator('[data-testid="board-member"]');
      const count = await boardMembers.count();
      
      if (count > 0) {
        // Check first board member
        const firstMember = boardMembers.first();
        await expect(firstMember.locator('[data-testid="board-member-name"]')).toBeVisible();
        await expect(firstMember.locator('[data-testid="board-member-position"]')).toBeVisible();
        
        // Check for member credentials
        const credentials = firstMember.locator('[data-testid="member-credentials"]');
        if (await credentials.isVisible()) {
          const credText = await credentials.textContent();
          expect(credText).toBeTruthy();
        }
      }
    }
  });

  test('should display organization achievements', async ({ page }) => {
    const achievementsSection = page.locator('[data-testid="achievements-section"]');
    
    if (await achievementsSection.isVisible()) {
      const achievements = achievementsSection.locator('[data-testid="achievement-item"]');
      const count = await achievements.count();
      
      if (count > 0) {
        // Check first achievement
        const firstAchievement = achievements.first();
        await expect(firstAchievement.locator('[data-testid="achievement-title"]')).toBeVisible();
        
        // Check for achievement description
        const description = firstAchievement.locator('[data-testid="achievement-description"]');
        if (await description.isVisible()) {
          const descText = await description.textContent();
          expect(descText).toBeTruthy();
        }
        
        // Check for achievement date
        const date = firstAchievement.locator('[data-testid="achievement-date"]');
        if (await date.isVisible()) {
          const dateText = await date.textContent();
          expect(dateText).toBeTruthy();
        }
      }
    }
  });

  test('should display organization statistics', async ({ page }) => {
    const statsSection = page.locator('[data-testid="statistics-section"]');
    
    if (await statsSection.isVisible()) {
      const statItems = statsSection.locator('[data-testid="stat-item"]');
      const count = await statItems.count();
      
      if (count > 0) {
        // Check first statistic
        const firstStat = statItems.first();
        await expect(firstStat.locator('[data-testid="stat-number"]')).toBeVisible();
        await expect(firstStat.locator('[data-testid="stat-label"]')).toBeVisible();
        
        // Verify stat number is numeric
        const statNumber = await firstStat.locator('[data-testid="stat-number"]').textContent();
        const numericValue = statNumber.replace(/[^0-9]/g, '');
        expect(numericValue).toBeTruthy();
      }
    }
  });

  test('should display partnerships and affiliations', async ({ page }) => {
    const partnershipsSection = page.locator('[data-testid="partnerships-section"]');
    
    if (await partnershipsSection.isVisible()) {
      const partners = partnershipsSection.locator('[data-testid="partner-item"]');
      const count = await partners.count();
      
      if (count > 0) {
        // Check first partner
        const firstPartner = partners.first();
        
        // Check for partner logo
        const partnerLogo = firstPartner.locator('[data-testid="partner-logo"]');
        if (await partnerLogo.isVisible()) {
          await expect(partnerLogo).toHaveAttribute('src');
          await expect(partnerLogo).toHaveAttribute('alt');
        }
        
        // Check for partner name
        await expect(firstPartner.locator('[data-testid="partner-name"]')).toBeVisible();
        
        // Check for partner description
        const partnerDesc = firstPartner.locator('[data-testid="partner-description"]');
        if (await partnerDesc.isVisible()) {
          const descText = await partnerDesc.textContent();
          expect(descText).toBeTruthy();
        }
      }
    }
  });

  test('should display annual reports', async ({ page }) => {
    const reportsSection = page.locator('[data-testid="reports-section"]');
    
    if (await reportsSection.isVisible()) {
      const reports = reportsSection.locator('[data-testid="report-item"]');
      const count = await reports.count();
      
      if (count > 0) {
        // Check first report
        const firstReport = reports.first();
        await expect(firstReport.locator('[data-testid="report-title"]')).toBeVisible();
        await expect(firstReport.locator('[data-testid="report-year"]')).toBeVisible();
        
        // Check for download link
        const downloadLink = firstReport.locator('[data-testid="report-download"]');
        if (await downloadLink.isVisible()) {
          await expect(downloadLink).toHaveAttribute('href');
          
          // Should open in new tab for PDF
          const href = await downloadLink.getAttribute('href');
          if (href && href.includes('.pdf')) {
            await expect(downloadLink).toHaveAttribute('target', '_blank');
          }
        }
      }
    }
  });

  test('should display contact information', async ({ page }) => {
    const contactSection = page.locator('[data-testid="about-contact-section"]');
    
    if (await contactSection.isVisible()) {
      // Check for basic contact info
      const email = contactSection.locator('[data-testid="contact-email"]');
      const phone = contactSection.locator('[data-testid="contact-phone"]');
      const address = contactSection.locator('[data-testid="contact-address"]');
      
      const hasEmail = await email.isVisible();
      const hasPhone = await phone.isVisible();
      const hasAddress = await address.isVisible();
      
      expect(hasEmail || hasPhone || hasAddress).toBeTruthy();
      
      if (hasEmail) {
        const emailText = await email.textContent();
        expect(emailText).toContain('@');
      }
    }
  });

  test('should handle expandable sections', async ({ page }) => {
    // Look for expandable content sections
    const expandableItems = page.locator('[data-testid="expandable-section"]');
    const count = await expandableItems.count();
    
    if (count > 0) {
      const firstExpandable = expandableItems.first();
      const toggleButton = firstExpandable.locator('[data-testid="expand-toggle"]');
      
      if (await toggleButton.isVisible()) {
        // Test expanding
        await toggleButton.click();
        
        const expandedContent = firstExpandable.locator('[data-testid="expanded-content"]');
        await expect(expandedContent).toBeVisible();
        
        // Test collapsing
        await toggleButton.click();
        await expect(expandedContent).toBeHidden();
      }
    }
  });

  test('should display social media links', async ({ page }) => {
    const socialSection = page.locator('[data-testid="social-media-section"]');
    
    if (await socialSection.isVisible()) {
      const socialLinks = socialSection.locator('[data-testid="social-link"]');
      const count = await socialLinks.count();
      
      if (count > 0) {
        // Check first social link
        const firstLink = socialLinks.first();
        await expect(firstLink).toHaveAttribute('href');
        await expect(firstLink).toHaveAttribute('target', '_blank');
        
        // Check for social media icon
        const icon = firstLink.locator('svg, img, i');
        if (await icon.isVisible()) {
          await expect(icon).toBeVisible();
        }
      }
    }
  });

  test('should display organization certifications', async ({ page }) => {
    const certificationsSection = page.locator('[data-testid="certifications-section"]');
    
    if (await certificationsSection.isVisible()) {
      const certifications = certificationsSection.locator('[data-testid="certification-item"]');
      const count = await certifications.count();
      
      if (count > 0) {
        // Check first certification
        const firstCert = certifications.first();
        await expect(firstCert.locator('[data-testid="certification-name"]')).toBeVisible();
        
        // Check for certification logo
        const certLogo = firstCert.locator('[data-testid="certification-logo"]');
        if (await certLogo.isVisible()) {
          await expect(certLogo).toHaveAttribute('src');
          await expect(certLogo).toHaveAttribute('alt');
        }
        
        // Check for certification date
        const certDate = firstCert.locator('[data-testid="certification-date"]');
        if (await certDate.isVisible()) {
          const dateText = await certDate.textContent();
          expect(dateText).toBeTruthy();
        }
      }
    }
  });

  test('should display testimonials', async ({ page }) => {
    const testimonialsSection = page.locator('[data-testid="testimonials-section"]');
    
    if (await testimonialsSection.isVisible()) {
      const testimonials = testimonialsSection.locator('[data-testid="testimonial-item"]');
      const count = await testimonials.count();
      
      if (count > 0) {
        // Check first testimonial
        const firstTestimonial = testimonials.first();
        await expect(firstTestimonial.locator('[data-testid="testimonial-quote"]')).toBeVisible();
        await expect(firstTestimonial.locator('[data-testid="testimonial-author"]')).toBeVisible();
        
        // Check for author title/organization
        const authorTitle = firstTestimonial.locator('[data-testid="testimonial-author-title"]');
        if (await authorTitle.isVisible()) {
          const titleText = await authorTitle.textContent();
          expect(titleText).toBeTruthy();
        }
      }
    }
  });

  test('should handle image loading', async ({ page }) => {
    // Check for images on the page
    const images = page.locator('img');
    const count = await images.count();
    
    if (count > 0) {
      // Check first few images
      for (let i = 0; i < Math.min(count, 3); i++) {
        const image = images.nth(i);
        
        // Check for required attributes
        await expect(image).toHaveAttribute('src');
        await expect(image).toHaveAttribute('alt');
        
        // Check if image loads successfully
        const src = await image.getAttribute('src');
        if (src && !src.startsWith('data:')) {
          // Wait for image to load
          await image.waitFor({ state: 'visible' });
        }
      }
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('h1')).toBeVisible();
    
    // Check that content sections are visible on mobile
    const missionSection = page.locator('[data-testid="mission-section"]');
    if (await missionSection.isVisible()) {
      const boundingBox = await missionSection.boundingBox();
      if (boundingBox) {
        expect(boundingBox.width).toBeLessThanOrEqual(375);
      }
    }
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
    
    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    if (headingCount > 1) {
      // Verify headings have text content
      for (let i = 0; i < Math.min(headingCount, 5); i++) {
        const heading = headings.nth(i);
        const headingText = await heading.textContent();
        expect(headingText).toBeTruthy();
      }
    }
    
    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      for (let i = 0; i < Math.min(imageCount, 3); i++) {
        const image = images.nth(i);
        await expect(image).toHaveAttribute('alt');
      }
    }
    
    // Check for proper link attributes
    const externalLinks = page.locator('a[href^="http"]');
    const linkCount = await externalLinks.count();
    
    if (linkCount > 0) {
      for (let i = 0; i < Math.min(linkCount, 3); i++) {
        const link = externalLinks.nth(i);
        await expect(link).toHaveAttribute('target', '_blank');
      }
    }
  });

  test('should handle content loading states', async ({ page }) => {
    // Check for loading indicators
    const loadingIndicator = page.locator('[data-testid="content-loading"]');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Verify main content is loaded
    await expect(page.locator('[data-testid="mission-section"]')).toBeVisible();
    
    // Loading indicator should be hidden
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).toBeHidden();
    }
  });

  test('should display organization logo', async ({ page }) => {
    const logo = page.locator('[data-testid="organization-logo"]');
    
    if (await logo.isVisible()) {
      await expect(logo).toHaveAttribute('src');
      await expect(logo).toHaveAttribute('alt');
      
      // Check logo dimensions are reasonable
      const boundingBox = await logo.boundingBox();
      if (boundingBox) {
        expect(boundingBox.width).toBeGreaterThan(50);
        expect(boundingBox.height).toBeGreaterThan(50);
      }
    }
  });

  test('should handle newsletter signup', async ({ page }) => {
    const newsletterSection = page.locator('[data-testid="newsletter-signup"]');
    
    if (await newsletterSection.isVisible()) {
      const emailInput = newsletterSection.locator('input[type="email"]');
      const submitButton = newsletterSection.locator('button[type="submit"]');
      
      if (await emailInput.isVisible() && await submitButton.isVisible()) {
        // Test newsletter signup
        await emailInput.fill('test@example.com');
        await submitButton.click();
        
        // Wait for response
        await page.waitForTimeout(2000);
        
        // Check for success or error message
        const successMessage = page.locator('[data-testid="newsletter-success"]');
        const errorMessage = page.locator('[data-testid="newsletter-error"]');
        
        const hasSuccess = await successMessage.isVisible();
        const hasError = await errorMessage.isVisible();
        
        expect(hasSuccess || hasError).toBeTruthy();
      }
    }
  });
});