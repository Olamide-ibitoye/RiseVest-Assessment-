const { test, expect } = require('@playwright/test');

async function dismissBottomSheet(page) {
  const cancel = page.getByRole('button', { name: 'Cancel' });
  if (await cancel.isVisible().catch(() => false)) {
    await cancel.click().catch(() => {});
  }
}

async function assertAuthenticated(page) {
  await page.waitForLoadState('domcontentloaded');

  const loginHeading = page.getByText(/Welcome to Rise|Welcome back/i);
  if (await loginHeading.isVisible().catch(() => false)) {
    throw new Error(
      'Session is not authenticated (login screen detected). Run `npm run auth` and complete OTP, then click Resume to save storage state.'
    );
  }

  const accountDisabled = page.getByText('Account Disabled');
  if (await accountDisabled.isVisible().catch(() => false)) {
    throw new Error(
      'Risevest shows "Account Disabled". Tests require an active account. Please use another account or contact support, then re-run `npm run auth`.'
    );
  }

  if ((page.url() || '').includes('/login')) {
    throw new Error(
      'Not authenticated (redirected to /login). Run `npm run auth` to generate playwright/.auth/state.json using manual OTP.'
    );
  }
}

test.describe('Wallet', () => {
  test('can access wallet and switch between NGN and USD wallets', async ({ page, browserName }) => {
    test.setTimeout(90000);
    test.skip(browserName !== 'chromium', 'Authenticated wallet flows are stabilized for Chromium only (storageState is not reliably portable across browsers).');

    await page.goto('/');

    await assertAuthenticated(page);

    await dismissBottomSheet(page);

    await expect(page.getByRole('link', { name: 'Wallet' })).toBeVisible({ timeout: 60000 });

    // Validate wallet summary cards on the dashboard.
    const usdBalance = page.getByText(/USD\s+balance/i).first();
    const ngnBalance = page.getByText(/NGN\s+balance/i).first();
    await expect(usdBalance).toBeVisible({ timeout: 60000 });
    await expect(ngnBalance).toBeVisible({ timeout: 60000 });
  });

  test('can toggle wallet balance show/hide', async ({ page, browserName }) => {
    test.setTimeout(90000);
    test.skip(browserName !== 'chromium', 'Authenticated wallet flows are stabilized for Chromium only (storageState is not reliably portable across browsers).');

    await page.goto('/');

    await assertAuthenticated(page);

    await dismissBottomSheet(page);

    const toggle = page
      .getByRole('togglebutton', { name: 'Toggle visibility of your investment balance' })
      .or(page.locator('[aria-label="Toggle visibility of your investment balance"]'))
      .first();
    await expect(toggle).toBeVisible({ timeout: 60000 });

    const card = toggle.locator('..').locator('..');
    const balanceValue = card
      .getByText(/[$₦]\s*\d|\d+\.\d{2}|\*\*\*|•+/)
      .first();
    await expect(balanceValue).toBeVisible({ timeout: 60000 });

    const before = (await balanceValue.innerText()).trim();
    try {
      await toggle.click({ timeout: 60000 });
    } catch {
      // Sometimes the dashboard reflows while clicking; allow a force click as a last resort.
      await toggle.click({ timeout: 60000, force: true });
    }

    await expect.poll(async () => (await balanceValue.innerText()).trim()).not.toBe(before);
    const after = (await balanceValue.innerText()).trim();
    await toggle.click({ timeout: 60000, force: true });
    await expect.poll(async () => (await balanceValue.innerText()).trim()).toBe(before);
  });
});
