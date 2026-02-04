import { test, expect } from '@playwright/test';

test.describe('Purchase Flow', () => {
  // Note: Full purchase flow is flaky due to cart modal interactions
  // This scenario is better covered by Integration tests (MSW-based)
  test.skip('complete purchase from product page', async ({ page }) => {
    // Navigate directly to a known product
    await page.goto('/products/1');
    await page.waitForLoadState('networkidle');
    
    // Add to cart
    const addToCartButton = page.getByRole('button', { name: /agregar/i }).first();
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();
    
    // Wait for cart to open (it auto-opens after adding)
    await page.waitForTimeout(2000);
    
    // Look for checkout link/button in the cart modal
    const checkoutButton = page.getByRole('link', { name: /proceder al pago/i })
      .or(page.getByRole('button', { name: /proceder al pago/i }));
    
    // If modal appears, proceed with checkout
    if (await checkoutButton.isVisible({ timeout: 3000 })) {
      await checkoutButton.click();
    } else {
      // Otherwise navigate to checkout manually
      await page.goto('/checkout');
    }
    
    // Should be on checkout page
    await expect(page).toHaveURL(/\/checkout/);
    
    // Fill checkout form
    await page.getByLabel(/email/i).fill('test@example.com');
    
    // Select shipping method (delivery)
    const deliveryRadio = page.getByLabel(/envío a domicilio/i);
    if (await deliveryRadio.isVisible()) {
      await deliveryRadio.click();
    }
    
    // Fill in postal code if visible
    const postalCodeInput = page.getByLabel(/código postal/i);
    if (await postalCodeInput.isVisible()) {
      await postalCodeInput.fill('1001');
      
      // Try to calculate shipping if button exists
      const calculateButton = page.getByRole('button', { name: /calcular/i });
      if (await calculateButton.isVisible()) {
        await calculateButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Fill customer details
    await page.getByLabel(/nombre/i).first().fill('John');
    await page.getByLabel(/apellido/i).fill('Doe');
    await page.getByLabel(/teléfono/i).fill('+5491112345678');
    await page.getByLabel(/dirección/i).fill('Test Address 123');
    await page.getByLabel(/ciudad/i).fill('Buenos Aires');
    await page.getByLabel(/provincia/i).fill('CABA');
    
    // Submit order
    const submitButton = page.getByRole('button', { name: /finalizar compra|confirmar/i });
    await submitButton.click();
    
    // Verify success page
    await expect(page).toHaveURL(/\/success/, { timeout: 15000 });
    
    // Verify success message
    await expect(page.getByText(/pedido confirmado|orden confirmada|éxito|gracias/i)).toBeVisible();
  });

  test('prevents checkout with empty cart', async ({ page }) => {
    // Navigate directly to checkout
    await page.goto('/checkout');
    
    // Should redirect to homepage if cart is empty
    await expect(page).toHaveURL('/');
  });
});
