import { test, expect } from '@playwright/test';

const pages: [string, RegExp][] = [
  ['/', /Sajid/i],
  ['/blogs', /writing/i],
  ['/projects', /.+/],
  ['/toolkit', /.+/],
  ['/contact', /.+/],
];

for (const [path, re] of pages) {
  test(`page ${path} loads`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status(), `status for ${path}`).toBeLessThan(400);
    await expect(page.locator('body')).toContainText(re);
  });
}

test('SEO surfaces respond', async ({ request }) => {
  for (const url of ['/sitemap.xml', '/robots.txt', '/feed.xml']) {
    const r = await request.get(url);
    expect(r.status(), url).toBe(200);
  }
});
