import { test, expect } from '@playwright/test';

test('admin shows a login gate or a not-configured notice', async ({ page }) => {
  await page.goto('/admin');
  // Either redirected to the password gate, or told it's not configured.
  await expect(page.locator('body')).toContainText(/password|not configured|sign in/i);
});
