import { test, expect } from '@playwright/test';

test.describe('Smoke Test', () => {
  test('home page loads successfully', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Verify page title or main heading exists
    await expect(page).toHaveTitle(/NexoShop/i);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/home-page.png', fullPage: true });
    
    console.log('✅ Home page loaded successfully');
  });

  test('can see products on home page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for products to render
    await page.waitForTimeout(2000);
    
    // Check if there are any product cards
    const productCards = page.locator('[data-testid="product-card"]');
    const count = await productCards.count();
    
    console.log(`Found ${count} product-like elements`);
    
    // Take screenshot showing products
    await page.screenshot({ path: 'test-results/products-visible.png', fullPage: true });
    
    // Verify we found at least one product
    expect(count).toBeGreaterThan(0);
  });
});
