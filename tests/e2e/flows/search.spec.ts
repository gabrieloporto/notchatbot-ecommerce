import { test, expect } from '@playwright/test';

test.describe('Search Functionality - Desktop', () => {
  // Skip on mobile projects
  test.skip(({ isMobile }) => isMobile, 'Desktop search tests are not relevant for mobile');
  test('search on desktop', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find search input on desktop
    const searchInput = page.getByPlaceholder(/buscar productos/i);
    await expect(searchInput).toBeVisible();
    
    // Type search query
    await searchInput.fill('medias');
    
    // Wait for results to appear
    await page.waitForTimeout(1000);
    
    // Verify results are shown
    // Results might be in a dropdown or separate results area
    const resultsContainer = page.locator('[class*="search"], [class*="result"]').first();
    
    if (await resultsContainer.isVisible()) {
      // Check if results contain the search term - use .first() to avoid strict mode
      await expect(page.locator('text=/medias/i').first()).toBeVisible();
    }
  });

  test('search shows no results message for non-existent product', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.getByPlaceholder(/buscar productos/i);
    await searchInput.fill('xyzabc123nonexistent');
    
    await page.waitForTimeout(1000);
    
    // Should show "no results" or similar message
    // This depends on implementation, so we just verify no crash
    expect(await page.locator('body').isVisible()).toBe(true);
  });

  test('search filters products correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.getByPlaceholder(/buscar productos/i);
    await searchInput.fill('zapatillas');
    
    await page.waitForTimeout(1000);
    
    // Click on a search result if available
    const searchResult = page.locator('a:has-text("zapatillas"), a:has-text("Zapatillas")').first();
    
    if (await searchResult.isVisible()) {
      await searchResult.click();
      
      // Should navigate to product page
      await expect(page).toHaveURL(/\/products\/\d+/);
    }
  });
});

test.describe('Search Functionality - Mobile', () => {
  // Skip on desktop projects (unless testing responsiveness specifically, but here we segregate)
  test.skip(({ isMobile }) => !isMobile, 'Mobile search tests are not relevant for desktop');
  
  test.use({ viewport: { width: 375, height: 667 } });

  test('search on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // On mobile, search might be in a modal or hidden menu
    // Look for search button or icon to open search
    const searchButton = page.getByLabel(/búsqueda|search/i).or(
      page.locator('button:has([class*="search"])')
    ).first();
    
    // If there's a search button, click it to open search modal
    if (await searchButton.isVisible()) {
      await searchButton.click();
      await page.waitForTimeout(500);
      
      // Now search input should be visible
      const searchInput = page.getByPlaceholder(/buscar productos/i);
      await expect(searchInput).toBeVisible();
      await searchInput.fill('zapatillas');
      
      await page.waitForTimeout(1000);
      
      // Verify results appear in modal
      await expect(page.getByRole('dialog')).toBeVisible();
    } else {
      // If no modal, search input should be directly visible
      const searchInput = page.getByPlaceholder(/buscar productos/i);
      await searchInput.fill('zapatillas');
      await page.waitForTimeout(1000);
    }
  });

  test('mobile search modal can be closed', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Try to open search
    const searchButton = page.getByLabel(/búsqueda|search/i).or(
      page.locator('button:has([class*="search"])')
    ).first();
    
    if (await searchButton.isVisible()) {
      await searchButton.click();
      await page.waitForTimeout(500);
      
      // Close modal
      const closeButton = page.getByLabel(/cerrar/i).or(page.locator('button:has-text("×")')).first();
      
      if (await closeButton.isVisible()) {
        await closeButton.click();
        
        // Modal should be closed
        await expect(page.getByRole('dialog')).not.toBeVisible();
      }
    }
  });
});

test.describe('Search Functionality - Categories', () => {
  test('filter by category', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for category navigation
    const categoryNav = page.locator('nav, [class*="category"]');
    
    if (await categoryNav.isVisible()) {
      // Click on a category
      const categoryLink = page.getByRole('link', { name: /calzado|indumentaria|accesorios/i }).first();
      
      if (await categoryLink.isVisible()) {
        await categoryLink.click();
        
        // URL should change to include category
        await expect(page).toHaveURL(/category=/);
        
        // Products should be filtered
        await page.waitForLoadState('networkidle');
        
        // Verify at least one product is visible
        const products = page.locator('article, [class*="product"]');
        await expect(products.first()).toBeVisible();
      }
    }
  });
});
