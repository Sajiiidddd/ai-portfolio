import { test, expect } from '@playwright/test';

const PW = process.env.ADMIN_PASSWORD;

test.describe('admin publishing', () => {
  test.skip(!PW, 'ADMIN_PASSWORD not set');

  test('login → create → publish → edit → delete', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByPlaceholder(/password/i).fill(PW as string);
    await page.getByRole('button', { name: /enter/i }).click();
    await expect(page).toHaveURL(/\/admin$/);

    const title = `E2E Post ${Date.now()}`;
    await page.getByRole('button', { name: /^posts$/i }).click();
    await page.getByRole('button', { name: /new post/i }).click();
    await page.getByPlaceholder(/post title/i).fill(title);
    await page.getByPlaceholder(/write in markdown/i).fill('# Hello\n\n## Section\n\nBody text for the e2e post.');
    await page.getByText(/^Published$/).click(); // toggle the publish checkbox label
    await page.getByRole('button', { name: /create/i }).click();
    await expect(page.getByText(title)).toBeVisible();

    // edit
    const row = page.locator('div', { hasText: title }).first();
    await row.getByRole('button', { name: /^edit$/i }).first().click();
    const edited = `${title} (edited)`;
    await page.getByPlaceholder(/post title/i).fill(edited);
    await page.getByRole('button', { name: /update/i }).click();
    await expect(page.getByText(edited)).toBeVisible();

    // delete (custom confirm modal: click the row's Delete, then confirm "Delete post")
    const row2 = page.locator('div', { hasText: edited }).first();
    await row2.getByRole('button', { name: /^delete$/i }).first().click();
    await page.getByRole('button', { name: /delete post/i }).click();
    await expect(page.getByText(edited)).toHaveCount(0);
  });
});
