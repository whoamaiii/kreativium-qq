import { test, expect } from '@playwright/test';

test('navigation smoke', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Daily Streak')).toBeVisible();
  await page.getByRole('link', { name: 'Talk with Symbols' }).click();
  await expect(page).toHaveURL(/\/aac/);
  await expect(page.getByRole('button', { name: 'word I' })).toBeVisible();
});