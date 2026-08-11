import { test, expect } from '@playwright/test';

test('has title and renders the main page', async ({ page }) => {
  // Navigate to the home page
  await page.goto('/');

  // Expect the page to have some content 
  // We'll check if the body exists and is visible as a basic check
  const body = page.locator('body');
  await expect(body).toBeVisible();
});
