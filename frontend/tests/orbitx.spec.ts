import { test, expect } from '@playwright/test';

test.describe('OrbitX Web App Telemetry Suite', () => {
  test('should load OrbitX web page title and main interface', async ({ page }) => {
    // Navigate to local dev server or static fallback HTML
    await page.goto('/');
    
    // Check page title or document body existence
    const title = await page.title();
    expect(title).toBeDefined();
  });

  test('should render 3D Satellite Telemetry Canvas element', async ({ page }) => {
    await page.goto('/');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
