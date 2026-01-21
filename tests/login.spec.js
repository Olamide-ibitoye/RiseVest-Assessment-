
const { test, expect } = require('@playwright/test');

test.describe('Login', () => {
  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('textbox', { name: 'Email input field' }).fill('invalid@example.com');
    await page.getByRole('textbox', { name: 'Password input field' }).fill('wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/\/login/i);
    await expect(page.getByText(/invalid|incorrect|wrong|error/i)).toBeVisible();
  });
});

