import { test, expect } from '@playwright/test';

test.describe('Onboarding Rules', () => {
  test('user should see the public rules on the first visit to the wall after 600ms', async ({ page }) => {
    // Navigate to the wall page
    await page.goto('/wall');

    // Initially, the modal should not be visible
    const modalHeading = page.locator('text=Before you post');
    await expect(modalHeading).toBeHidden();

    // After 600ms, the modal should appear (Playwright's default timeout will wait up to 5s)
    await expect(modalHeading).toBeVisible();

    // Verify some rules are displayed
    await expect(page.locator('text=No violence, threats')).toBeVisible();

    // Accept the rules
    const acceptButton = page.locator('button', { hasText: "I understand — let's create" });
    await expect(acceptButton).toBeVisible();
    await acceptButton.click();

    // The modal should disappear
    await expect(modalHeading).toBeHidden();

    // Check localStorage to ensure the acceptance is saved
    const isAccepted = await page.evaluate(() => localStorage.getItem('public_wall_guidelines'));
    expect(isAccepted).toBe('accepted');
  });

  test('user should NOT see the public rules on subsequent visits', async ({ page }) => {
    // Navigate to the page and set the localStorage item first
    await page.goto('/');
    
    await page.evaluate(() => {
      localStorage.setItem('public_wall_guidelines', 'accepted');
    });

    // Navigate to the wall
    await page.goto('/wall');

    // Wait for a bit more than 600ms to ensure the modal doesn't appear
    await page.waitForTimeout(1000);

    const modalHeading = page.locator('text=Before you post');
    await expect(modalHeading).toBeHidden();
  });
});
