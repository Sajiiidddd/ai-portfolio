import { test, expect } from '@playwright/test';

test('subscribe shows a confirmation state', async ({ page }) => {
  await page.goto('/blogs');
  const email = page.getByPlaceholder(/you@email/i);
  if (!(await email.count())) test.skip(true, 'subscribe form not present');
  await email.fill(`e2e+${Date.now()}@example.com`);
  await page.getByRole('button', { name: /subscribe/i }).click();
  await expect(page.getByText(/inbox|already subscribed|you’re in/i)).toBeVisible();
});
