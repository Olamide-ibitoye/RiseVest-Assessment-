const { test, expect } = require('@playwright/test');

const authFile = 'playwright/.auth/state.json';

test('authenticate (manual OTP) and save storage state', async ({ page, browserName }, testInfo) => {
  test.setTimeout(10 * 60 * 1000);

  if (browserName !== 'chromium') {
    test.skip(true, 'Manual OTP auth setup is only supported in headed Chromium for this project.');
  }
  if (testInfo.project.use.headless) {
    test.skip(true, 'Manual OTP auth setup requires headed mode. Run `npm run auth` instead.');
  }

  await page.goto('/login');
  await expect(page).toHaveURL(/login/i);

  await page.pause();

  // Save state from the page you ended up on after manual login.
  // Avoid navigating again here, because it can trigger a new auth gate.
  await page.waitForLoadState('domcontentloaded');

  const accountDisabled = page.getByText('Account Disabled');
  if (await accountDisabled.isVisible().catch(() => false)) {
    throw new Error(
      'The login page shows an "Account Disabled" modal in this session. Close the modal (if possible) or retry later / use a different account, then run `npm run auth` again.'
    );
  }

  const loginHeading = page.getByText(/Welcome to Rise|Welcome back/i);
  await expect(loginHeading).toBeHidden({ timeout: 120000 });

  // Confirm authenticated app UI is visible before saving state.
  const walletLink = page.getByRole('link', { name: 'Wallet' });
  const investLink = page.getByRole('link', { name: 'Invest' });

  if (await walletLink.isVisible().catch(() => false)) {
    await expect(walletLink).toBeVisible({ timeout: 120000 });
  } else {
    await expect(investLink).toBeVisible({ timeout: 120000 });
  }

  await page.context().storageState({ path: authFile });
});
