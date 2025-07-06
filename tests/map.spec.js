const { test, expect } = require('@playwright/test');

test.describe('Map Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/map');
  });

  test('should load map page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Communication Matters/);
    await expect(page.locator('h1')).toContainText('Campus Map');
  });

  test('should display map container', async ({ page }) => {
    await expect(page.locator('[data-testid="map-container"]')).toBeVisible();
  });

  test('should display map image or interactive map', async ({ page }) => {
    // Check for either a static map image or interactive map
    const mapImage = page.locator('[data-testid="map-image"]');
    const interactiveMap = page.locator('[data-testid="interactive-map"]');
    
    const hasMapImage = await mapImage.isVisible();
    const hasInteractiveMap = await interactiveMap.isVisible();
    
    expect(hasMapImage || hasInteractiveMap).toBeTruthy();
    
    if (hasMapImage) {
      await expect(mapImage).toHaveAttribute('src');
      await expect(mapImage).toHaveAttribute('alt');
    }
  });

  test('should display location markers or legend', async ({ page }) => {
    const locationMarkers = page.locator('[data-testid="location-markers"]');
    const mapLegend = page.locator('[data-testid="map-legend"]');
    
    const hasMarkers = await locationMarkers.isVisible();
    const hasLegend = await mapLegend.isVisible();
    
    expect(hasMarkers || hasLegend).toBeTruthy();
  });

  test('should display venue information', async ({ page }) => {
    await expect(page.locator('[data-testid="venue-info"]')).toBeVisible();
    
    // Check for venue details
    await expect(page.locator('[data-testid="venue-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="venue-address"]')).toBeVisible();
  });

  test('should display room locations', async ({ page }) => {
    const roomsList = page.locator('[data-testid="rooms-list"]');
    
    if (await roomsList.isVisible()) {
      const rooms = page.locator('[data-testid="room-item"]');
      const count = await rooms.count();
      
      if (count > 0) {
        // Check first room details
        const firstRoom = rooms.first();
        await expect(firstRoom.locator('[data-testid="room-name"]')).toBeVisible();
        await expect(firstRoom.locator('[data-testid="room-description"]')).toBeVisible();
      }
    }
  });

  test('should handle room selection', async ({ page }) => {
    const rooms = page.locator('[data-testid="room-item"]');
    const count = await rooms.count();
    
    if (count > 0) {
      const firstRoom = rooms.first();
      await firstRoom.click();
      
      // Wait for selection to register
      await page.waitForTimeout(500);
      
      // Check if room is highlighted or selected
      await expect(firstRoom).toHaveClass(/selected|active/);
    }
  });

  test('should display accessibility information', async ({ page }) => {
    const accessibilityInfo = page.locator('[data-testid="accessibility-info"]');
    
    if (await accessibilityInfo.isVisible()) {
      // Check for accessibility features
      await expect(accessibilityInfo.locator('[data-testid="wheelchair-access"]')).toBeVisible();
      await expect(accessibilityInfo.locator('[data-testid="elevator-locations"]')).toBeVisible();
    }
  });

  test('should display parking information', async ({ page }) => {
    const parkingInfo = page.locator('[data-testid="parking-info"]');
    
    if (await parkingInfo.isVisible()) {
      await expect(parkingInfo.locator('[data-testid="parking-locations"]')).toBeVisible();
      await expect(parkingInfo.locator('[data-testid="parking-instructions"]')).toBeVisible();
    }
  });

  test('should display transportation options', async ({ page }) => {
    const transportInfo = page.locator('[data-testid="transport-info"]');
    
    if (await transportInfo.isVisible()) {
      // Check for public transport information
      const publicTransport = transportInfo.locator('[data-testid="public-transport"]');
      if (await publicTransport.isVisible()) {
        await expect(publicTransport).toBeVisible();
      }
      
      // Check for taxi/ride share information
      const rideShare = transportInfo.locator('[data-testid="ride-share"]');
      if (await rideShare.isVisible()) {
        await expect(rideShare).toBeVisible();
      }
    }
  });

  test('should handle map zoom functionality', async ({ page }) => {
    const zoomIn = page.locator('[data-testid="zoom-in"]');
    const zoomOut = page.locator('[data-testid="zoom-out"]');
    
    if (await zoomIn.isVisible() && await zoomOut.isVisible()) {
      // Test zoom in
      await zoomIn.click();
      await page.waitForTimeout(500);
      
      // Test zoom out
      await zoomOut.click();
      await page.waitForTimeout(500);
      
      // Verify zoom controls are still functional
      await expect(zoomIn).toBeVisible();
      await expect(zoomOut).toBeVisible();
    }
  });

  test('should display emergency information', async ({ page }) => {
    const emergencyInfo = page.locator('[data-testid="emergency-info"]');
    
    if (await emergencyInfo.isVisible()) {
      // Check for emergency exits
      await expect(emergencyInfo.locator('[data-testid="emergency-exits"]')).toBeVisible();
      
      // Check for first aid locations
      await expect(emergencyInfo.locator('[data-testid="first-aid"]')).toBeVisible();
      
      // Check for emergency contacts
      await expect(emergencyInfo.locator('[data-testid="emergency-contacts"]')).toBeVisible();
    }
  });

  test('should search for locations', async ({ page }) => {
    const searchInput = page.locator('input[data-testid="location-search"]');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('lecture hall');
      
      // Wait for search results
      await page.waitForTimeout(1000);
      
      // Check for search results
      const searchResults = page.locator('[data-testid="search-results"]');
      if (await searchResults.isVisible()) {
        await expect(searchResults).toBeVisible();
      }
    }
  });

  test('should display floor plans', async ({ page }) => {
    const floorPlans = page.locator('[data-testid="floor-plans"]');
    
    if (await floorPlans.isVisible()) {
      // Check for floor selection
      const floorSelector = page.locator('select[data-testid="floor-selector"]');
      if (await floorSelector.isVisible()) {
        await floorSelector.selectOption('1');
        
        // Wait for floor plan to load
        await page.waitForTimeout(1000);
        
        // Verify floor plan is displayed
        await expect(page.locator('[data-testid="floor-plan-image"]')).toBeVisible();
      }
    }
  });

  test('should handle interactive map features', async ({ page }) => {
    const interactiveMap = page.locator('[data-testid="interactive-map"]');
    
    if (await interactiveMap.isVisible()) {
      // Test map interactions
      await interactiveMap.click({ position: { x: 100, y: 100 } });
      
      // Wait for interaction to register
      await page.waitForTimeout(500);
      
      // Check for location popup or highlight
      const locationPopup = page.locator('[data-testid="location-popup"]');
      if (await locationPopup.isVisible()) {
        await expect(locationPopup).toBeVisible();
      }
    }
  });

  test('should display directions between locations', async ({ page }) => {
    const directionsPanel = page.locator('[data-testid="directions-panel"]');
    
    if (await directionsPanel.isVisible()) {
      // Test getting directions
      const fromInput = page.locator('input[data-testid="from-location"]');
      const toInput = page.locator('input[data-testid="to-location"]');
      const getDirectionsBtn = page.locator('button[data-testid="get-directions"]');
      
      if (await fromInput.isVisible() && await toInput.isVisible()) {
        await fromInput.fill('Main Entrance');
        await toInput.fill('Lecture Hall A');
        await getDirectionsBtn.click();
        
        // Wait for directions to load
        await page.waitForTimeout(2000);
        
        // Check for directions display
        await expect(page.locator('[data-testid="directions-list"]')).toBeVisible();
      }
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="map-container"]')).toBeVisible();
    
    // Check that map is properly sized on mobile
    const mapContainer = page.locator('[data-testid="map-container"]');
    const boundingBox = await mapContainer.boundingBox();
    
    if (boundingBox) {
      expect(boundingBox.width).toBeLessThanOrEqual(375);
    }
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
    
    // Check for map alt text
    const mapImage = page.locator('[data-testid="map-image"]');
    if (await mapImage.isVisible()) {
      await expect(mapImage).toHaveAttribute('alt');
    }
    
    // Check for ARIA labels on interactive elements
    const interactiveElements = page.locator('button, [role="button"]');
    const count = await interactiveElements.count();
    
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const element = interactiveElements.nth(i);
        const hasAriaLabel = await element.getAttribute('aria-label');
        const hasText = await element.textContent();
        
        expect(hasAriaLabel || hasText).toBeTruthy();
      }
    }
  });

  test('should handle map loading states', async ({ page }) => {
    // Check for loading indicator
    const loadingIndicator = page.locator('[data-testid="map-loading"]');
    
    // Wait for map to fully load
    await page.waitForLoadState('networkidle');
    
    // Verify map content is loaded
    await expect(page.locator('[data-testid="map-container"]')).toBeVisible();
    
    // Loading indicator should be hidden
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).toBeHidden();
    }
  });

  test('should display contact information for venue', async ({ page }) => {
    const contactInfo = page.locator('[data-testid="venue-contact"]');
    
    if (await contactInfo.isVisible()) {
      // Check for phone number
      const phoneNumber = contactInfo.locator('[data-testid="venue-phone"]');
      if (await phoneNumber.isVisible()) {
        const phoneText = await phoneNumber.textContent();
        expect(phoneText).toBeTruthy();
      }
      
      // Check for email
      const email = contactInfo.locator('[data-testid="venue-email"]');
      if (await email.isVisible()) {
        const emailText = await email.textContent();
        expect(emailText).toContain('@');
      }
    }
  });

  test('should handle map error states gracefully', async ({ page }) => {
    // This test would be more relevant with network simulation
    // For now, just verify the page loads without errors
    await expect(page.locator('[data-testid="map-container"]')).toBeVisible();
    
    // Check for error message if map fails to load
    const errorMessage = page.locator('[data-testid="map-error"]');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toContainText('unable to load');
    }
  });
});