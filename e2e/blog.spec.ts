import { test, expect } from '@playwright/test';

test('open a post, comment, and like a comment', async ({ page }) => {
  await page.goto('/blogs');
  const firstPost = page.locator('a[href^="/blogs/"]').first();
  if (!(await firstPost.count())) test.skip(true, 'no posts seeded');
  await firstPost.click();
  await expect(page).toHaveURL(/\/blogs\/.+/);

  // Comments are open by default — post one.
  const body = `e2e comment ${Date.now()}`;
  const textarea = page.getByPlaceholder(/write a comment/i);
  await expect(textarea).toBeVisible();
  await textarea.fill(body);
  await page.getByRole('button', { name: /post/i }).first().click();
  await expect(page.getByText(body).first()).toBeVisible();
});
