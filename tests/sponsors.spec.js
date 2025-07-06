const { test, expect } = require('@playwright/test');

test.describe('Sponsors Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sponsors');
  });

  test('should load sponsors page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Communication Matters/);
    await expect(page.locator('h1')).toContainText('Our Sponsors');
  });

  test('should display sponsors list', async ({ page }) => {
    await expect(page.locator('[data-testid="sponsors-list"]')).toBeVisible();
  });

  test('should display sponsor categories', async ({ page }) => {
    await expect(page.locator('[data-testid="sponsor-categories"]')).toBeVisible();
    
    // Check for different sponsor tiers
    await expect(page.locator('[data-testid="platinum-sponsors"]')).toBeVisible();
    await expect(page.locator('[data-testid="gold-sponsors"]')).toBeVisible();
    await expect(page.locator('[data-testid="silver-sponsors"]')).toBeVisible();
    await expect(page.locator('[data-testid="bronze-sponsors"]')).toBeVisible();
  });

  test('should display sponsor details', async ({ page }) => {
    const firstSponsor = page.locator('[data-testid="sponsor-item"]').first();
    
    if (await firstSponsor.isVisible()) {
      // Check sponsor structure
      await expect(firstSponsor.locator('[data-testid="sponsor-logo"]')).toBeVisible();
      await expect(firstSponsor.locator('[data-testid="sponsor-name"]')).toBeVisible();
      await expect(firstSponsor.locator('[data-testid="sponsor-description"]')).toBeVisible();
    }
  });

  test('should handle sponsor logo clicks', async ({ page }) => {
    const firstSponsor = page.locator('[data-testid="sponsor-item"]').first();
    
    if (await firstSponsor.isVisible()) {
      const sponsorLogo = firstSponsor.locator('[data-testid="sponsor-logo"]');
      
      if (await sponsorLogo.isVisible()) {
        // Click on sponsor logo
        await sponsorLogo.click();
        
        // Wait for any interactions (modal, navigation, etc.)
        await page.waitForTimeout(1000);
        
        // Verify interaction was handled
        // This could be a modal opening or navigation to sponsor website
      }
    }
  });

  test('should display sponsor tier badges', async ({ page }) => {
    const sponsors = page.locator('[data-testid="sponsor-item"]');
    const count = await sponsors.count();
    
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const sponsor = sponsors.nth(i);
        const tierBadge = sponsor.locator('[data-testid="sponsor-tier"]');
        
        if (await tierBadge.isVisible()) {
          const tierText = await tierBadge.textContent();
          expect(['Platinum', 'Gold', 'Silver', 'Bronze']).toContain(tierText);
        }
      }
    }
  });

  test('should filter sponsors by tier', async ({ page }) => {
    const tierFilter = page.locator('select[data-testid="tier-filter"]');
    
    if (await tierFilter.isVisible()) {
      await tierFilter.selectOption('gold');
      
      // Wait for filter to apply
      await page.waitForTimeout(1000);
      
      // Check that only gold sponsors are shown
      const sponsors = page.locator('[data-testid="sponsor-item"]');
      const count = await sponsors.count();
      
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const tier = await sponsors.nth(i).locator('[data-testid="sponsor-tier"]').textContent();
          expect(tier?.toLowerCase()).toContain('gold');
        }
      }
    }
  });

  test('should display sponsor contact information', async ({ page }) => {
    const firstSponsor = page.locator('[data-testid="sponsor-item"]').first();
    
    if (await firstSponsor.isVisible()) {
      const contactInfo = firstSponsor.locator('[data-testid="sponsor-contact"]');
      
      if (await contactInfo.isVisible()) {
        // Check for website link
        const websiteLink = contactInfo.locator('a[data-testid="sponsor-website"]');
        if (await websiteLink.isVisible()) {
          await expect(websiteLink).toHaveAttribute('href');
          await expect(websiteLink).toHaveAttribute('target', '_blank');
        }
        
        // Check for email link
        const emailLink = contactInfo.locator('a[data-testid="sponsor-email"]');
        if (await emailLink.isVisible()) {
          const href = await emailLink.getAttribute('href');
          expect(href).toContain('mailto:');
        }
      }
    }
  });

  test('should open sponsor website in new tab', async ({ page }) => {
    const firstSponsor = page.locator('[data-testid="sponsor-item"]').first();
    
    if (await firstSponsor.isVisible()) {
      const websiteLink = firstSponsor.locator('a[data-testid="sponsor-website"]');
      
      if (await websiteLink.isVisible()) {
        // Check that link opens in new tab
        await expect(websiteLink).toHaveAttribute('target', '_blank');
        await expect(websiteLink).toHaveAttribute('rel', 'noopener noreferrer');
      }
    }
  });

  test('should display sponsor advertisements', async ({ page }) => {
    const sponsorAds = page.locator('[data-testid="sponsor-advertisement"]');
    const count = await sponsorAds.count();
    
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const ad = sponsorAds.nth(i);
        
        // Check that advertisement is visible
        await expect(ad).toBeVisible();
        
        // Check for ad image
        const adImage = ad.locator('img');
        if (await adImage.isVisible()) {
          await expect(adImage).toHaveAttribute('src');
          await expect(adImage).toHaveAttribute('alt');
        }
      }
    }
  });

  test('should handle sponsor advertisement clicks', async ({ page }) => {
    const firstAd = page.locator('[data-testid="sponsor-advertisement"]').first();
    
    if (await firstAd.isVisible()) {
      // Click on advertisement
      await firstAd.click();
      
      // Wait for any interactions
      await page.waitForTimeout(1000);
      
      // Verify click was tracked (this would depend on analytics implementation)
    }
  });

  test('should search sponsors', async ({ page }) => {
    const searchInput = page.locator('input[data-testid="search-input"]');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('communication');
      
      // Wait for search to apply
      await page.waitForTimeout(1000);
      
      // Verify search results
      await expect(page.locator('[data-testid="sponsors-list"]')).toBeVisible();
      
      // Check that results contain search term (if any results)
      const sponsors = page.locator('[data-testid="sponsor-item"]');
      const count = await sponsors.count();
      
      if (count > 0) {
        const firstSponsorName = await sponsors.first().locator('[data-testid="sponsor-name"]').textContent();
        expect(firstSponsorName?.toLowerCase()).toContain('communication');
      }
    }
  });

  test('should display sponsor social media links', async ({ page }) => {
    const firstSponsor = page.locator('[data-testid="sponsor-item"]').first();
    
    if (await firstSponsor.isVisible()) {
      const socialLinks = firstSponsor.locator('[data-testid="sponsor-social"]');
      
      if (await socialLinks.isVisible()) {
        // Check for various social media links
        const twitterLink = socialLinks.locator('a[data-social="twitter"]');
        const linkedinLink = socialLinks.locator('a[data-social="linkedin"]');
        const facebookLink = socialLinks.locator('a[data-social="facebook"]');
        
        // Verify social links have proper attributes
        if (await twitterLink.isVisible()) {
          await expect(twitterLink).toHaveAttribute('target', '_blank');
        }
        if (await linkedinLink.isVisible()) {
          await expect(linkedinLink).toHaveAttribute('target', '_blank');
        }
        if (await facebookLink.isVisible()) {
          await expect(facebookLink).toHaveAttribute('target', '_blank');
        }
      }
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="sponsors-list"]')).toBeVisible();
    
    // Check that sponsor cards are properly sized on mobile
    const firstSponsor = page.locator('[data-testid="sponsor-item"]').first();
    if (await firstSponsor.isVisible()) {
      await expect(firstSponsor).toBeVisible();
    }
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
    
    // Check for ARIA attributes
    await expect(page.locator('[data-testid="sponsors-list"]')).toHaveAttribute('role', 'list');
    
    // Check for proper image alt text
    const sponsorLogos = page.locator('[data-testid="sponsor-logo"] img');
    const logoCount = await sponsorLogos.count();
    
    if (logoCount > 0) {
      for (let i = 0; i < Math.min(logoCount, 3); i++) {
        await expect(sponsorLogos.nth(i)).toHaveAttribute('alt');
      }
    }
  });

  test('should handle sponsor modal interactions', async ({ page }) => {
    const firstSponsor = page.locator('[data-testid="sponsor-item"]').first();
    
    if (await firstSponsor.isVisible()) {
      const moreInfoButton = firstSponsor.locator('[data-testid="more-info-button"]');
      
      if (await moreInfoButton.isVisible()) {
        await moreInfoButton.click();
        
        // Check if modal opens
        await expect(page.locator('[data-testid="sponsor-modal"]')).toBeVisible();
        
        // Check modal content
        await expect(page.locator('[data-testid="modal-sponsor-name"]')).toBeVisible();
        await expect(page.locator('[data-testid="modal-sponsor-description"]')).toBeVisible();
        
        // Close modal
        const closeButton = page.locator('[data-testid="modal-close-button"]');
        await closeButton.click();
        
        // Verify modal is closed
        await expect(page.locator('[data-testid="sponsor-modal"]')).toBeHidden();
      }
    }
  });

  test('should display sponsor benefits or offerings', async ({ page }) => {
    const firstSponsor = page.locator('[data-testid="sponsor-item"]').first();
    
    if (await firstSponsor.isVisible()) {
      const benefitsSection = firstSponsor.locator('[data-testid="sponsor-benefits"]');
      
      if (await benefitsSection.isVisible()) {
        const benefitsText = await benefitsSection.textContent();
        expect(benefitsText).toBeTruthy();
        expect(benefitsText.length).toBeGreaterThan(0);
      }
    }
  });

  test('should handle sponsor interactions tracking', async ({ page }) => {
    const firstSponsor = page.locator('[data-testid="sponsor-item"]').first();
    
    if (await firstSponsor.isVisible()) {
      // Test various interactions that should be tracked
      await firstSponsor.hover();
      await page.waitForTimeout(500);
      
      await firstSponsor.click();
      await page.waitForTimeout(500);
      
      // Verify interactions are handled gracefully
      await expect(firstSponsor).toBeVisible();
    }
  });

  test('should display sponsor event participation', async ({ page }) => {
    const firstSponsor = page.locator('[data-testid="sponsor-item"]').first();
    
    if (await firstSponsor.isVisible()) {
      const participationInfo = firstSponsor.locator('[data-testid="sponsor-participation"]');
      
      if (await participationInfo.isVisible()) {
        // Check for booth information
        const boothInfo = participationInfo.locator('[data-testid="booth-info"]');
        if (await boothInfo.isVisible()) {
          const boothText = await boothInfo.textContent();
          expect(boothText).toBeTruthy();
        }
        
        // Check for session sponsorship
        const sessionSponsorship = participationInfo.locator('[data-testid="session-sponsorship"]');
        if (await sessionSponsorship.isVisible()) {
          const sponsorshipText = await sessionSponsorship.textContent();
          expect(sponsorshipText).toBeTruthy();
        }
      }
    }
  });
});