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

test.describe('Plans', () => {
  test('can navigate to investment plans area', async ({ page }) => {
    await page.goto('/');

    await assertAuthenticated(page);

    await expect(page.getByRole('link', { name: 'Invest' })).toBeVisible();

    await page.getByRole('link', { name: 'Invest' }).click();
    await expect(page).toHaveURL(/invest/i);

    const createPlanLink = page.getByRole('link', { name: /Create\s+investment\s+plan/i });
    const createPlanButton = page.getByRole('button', { name: /Create\s+an\s+investment\s+plan|Create\s+investment\s+plan/i });
    await expect(createPlanLink.or(createPlanButton)).toBeVisible({ timeout: 30000 });
  });

  test('can start creating a real estate plan (no funding)', async ({ page }) => {
    await page.goto('/');

    await assertAuthenticated(page);

    await expect(page.getByRole('link', { name: 'Invest' })).toBeVisible();
    await page.getByRole('link', { name: 'Invest' }).click();
    await expect(page).toHaveURL(/invest/i);

    const createPlanLink = page.getByRole('link', { name: /Create\s+investment\s+plan/i });
    const createPlanButton = page.getByRole('button', { name: /Create\s+an\s+investment\s+plan|Create\s+investment\s+plan/i });
    await createPlanLink.or(createPlanButton).click({ timeout: 30000 });
    await expect(page).toHaveURL(/\/investments\/(new|create)|\/(create|plan)/i, { timeout: 30000 });

    await page.getByRole('link', { name: /Real\s+Estate/i }).first().click();
    await page.getByRole('link', { name: /Start\s+investing/i }).first().click();

    const planName = `plan-${Date.now()}`;
    await page.getByRole('textbox', { name: 'Plan name input field' }).fill(planName);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    await expect(page).toHaveURL(/\/investments\/(new|create)/i, { timeout: 30000 });

    await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeVisible({ timeout: 30000 });
  });
});
