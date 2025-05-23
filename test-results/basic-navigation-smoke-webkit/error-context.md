# Test info

- Name: navigation smoke
- Location: /Users/quentinthiessen/Documents/kreativium-qq/tests/e2e/basic.spec.ts:3:5

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: getByText('Daily Streak')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for getByText('Daily Streak')

    at /Users/quentinthiessen/Documents/kreativium-qq/tests/e2e/basic.spec.ts:5:48
```

# Page snapshot

```yaml
- heading "Index of /" [level=1]
- table:
  - rowgroup:
    - row "Name Size Date Modified":
      - cell "Name"
      - cell "Size"
      - cell "Date Modified"
    - row "xblackhole.html 50.0 kB 5/23/25, 13:46:28":
      - cell "xblackhole.html":
        - link "xblackhole.html":
          - /url: /xblackhole.html
      - cell "50.0 kB"
      - cell "5/23/25, 13:46:28"
```

# Test source

```ts
  1 | import { test, expect } from '@playwright/test';
  2 |
  3 | test('navigation smoke', async ({ page }) => {
  4 |   await page.goto('http://localhost:3000');
> 5 |   await expect(page.getByText('Daily Streak')).toBeVisible();
    |                                                ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
  6 |   await page.getByRole('link', { name: 'Talk with Symbols' }).click();
  7 |   await expect(page).toHaveURL(/\/aac/);
  8 |   await expect(page.getByRole('button', { name: /^I$/ })).toBeVisible();
  9 | });
```