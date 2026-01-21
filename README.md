# Risevest Web App QA Automation (Playwright)

This repository contains automated end-to-end tests for the Risevest Web App (https://app.risevest.com) implemented with Playwright.

## Scope (per assignment)

Covered user flows:
- Login (invalid credentials validation)
- Wallet
  - Navigate to Wallet
  - Validate wallet UI is accessible
  - Toggle show/hide wallet balance
- Plans
  - Navigate to Invest/Plans area
  - Start creating a Real Estate plan (stops before any funding actions)

## Prerequisites

- Node.js 18+
- A Risevest account
- OTP is supported via a one-time manual authentication step (recommended for OTP-enabled accounts)

## Install

```powershell
npm install
npx playwright install
```

## Authentication (OTP-enabled accounts)

Because OTP changes each time, the suite reuses a saved authenticated session (`storageState`).

1. Run the auth setup (headed):

```powershell
npm run auth
```

2. A browser will open and Playwright will pause.

- Log in with your Risevest email + password
- Retrieve OTP from your email
- Submit OTP
- Ensure you land on the authenticated app/dashboard

3. Click **Resume** in Playwright Inspector.

This saves the session to:

- `playwright/.auth/state.json`

> Note: `playwright/.auth/` is gitignored and should not be committed.

## Run tests

### Run all tests (Chromium/Firefox/WebKit)

```powershell
npm test
```

### Run tests (headed)

```powershell
npm run test:headed
```

### Run only wallet tests (Chromium)

```powershell
npm run test:wallet
```

### Run only wallet toggle test (Chromium)

```powershell
npm run test:wallet:toggle
```

## Reports

Playwright generates an HTML report.

```powershell
npm run report
```

## Notes / Best Practices

- Do not hardcode credentials in tests.
- For OTP-enabled accounts, use the `storageState` approach.
- Locators prefer role-based selectors (`getByRole`) and accessible names.

## Submission

1. Initialize a git repo (if not already):

```powershell
git init
```

2. Commit code (do NOT commit `playwright/.auth/` or credentials):

```powershell
git add .
git commit -m "Add Risevest Playwright E2E tests"
```

3. Push to GitHub and share the repository link:

```powershell
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

4. Reports:

- The HTML report is generated locally in `playwright-report/` (gitignored).
- A concise run summary is included in `REPORT.md`.
