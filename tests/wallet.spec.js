const { test, expect } = require('@playwright/test');

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
  test('can access wallet and switch between NGN and USD wallets', async ({ page }) => {
    await page.goto('/');

    await assertAuthenticated(page);

    await expect(page.getByRole('link', { name: 'Wallet' })).toBeVisible();

    await page.getByRole('link', { name: 'Wallet' }).click();
    await expect(page).toHaveURL(/wallet/i);

    await expect(page.getByRole('button', { name: 'NGN Wallet' })).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('button', { name: 'USD Wallet' })).toBeVisible({ timeout: 30000 });

    await page.getByRole('button', { name: 'NGN Wallet' }).click();
    await expect(page.getByRole('button', { name: 'NGN Wallet' })).toBeVisible();

    await page.getByRole('button', { name: 'USD Wallet' }).click();
    await expect(page.getByRole('button', { name: 'USD Wallet' })).toBeVisible();
  });

  test('can toggle wallet balance show/hide', async ({ page }) => {
    await page.goto('/');

    await assertAuthenticated(page);

    await expect(page.getByRole('link', { name: 'Wallet' })).toBeVisible();
    await page.getByRole('link', { name: 'Wallet' }).click();
    await expect(page).toHaveURL(/wallet/i);

    const toggles = page.getByRole('generic', {
      name: 'Toggle visibility of your investment balance',
    });

    const usdToggle = toggles.filter({ hasText: /USD Balance/i }).first();
    await expect(usdToggle).toBeVisible({ timeout: 30000 });

    const before = (await usdToggle.innerText()).trim();
    await usdToggle.click();

    await expect.poll(async () => (await usdToggle.innerText()).trim()).not.toBe(before);
    const after = (await usdToggle.innerText()).trim();
    await usdToggle.click();
    await expect
      .poll(async () => (await usdToggle.innerText()).trim())
      .toBe(after);
  });
});
