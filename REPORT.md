# Test Execution Report (Risevest Web App - Playwright)

## Overview
This repository contains Playwright end-to-end tests for the Risevest web app (https://app.risevest.com) covering:
- Login (invalid credentials validation)
- Wallet (navigation + show/hide balance toggle)
- Plans (navigation + start creating a plan)

Because Risevest uses OTP for login, the suite uses a one-time **manual authentication** flow to generate a reusable `storageState`.

## How authentication works
- Run `npm run auth` (headed Chromium) and complete OTP.
- The session is saved to `playwright/.auth/state.json`.
- All browser projects (Chromium/Firefox/WebKit) reuse that saved state.

> Note: `playwright/.auth/` is gitignored and must not be committed.

## How to run
- Install:

```powershell
npm install
npx playwright install
```

- Create auth state (OTP):

```powershell
npm run auth
```

- Run cross-browser:

```powershell
npm test
```

- Open HTML report (generated locally):

```powershell
npm run report
```

## Observed outcomes (latest run)
Cross-browser runs may show failures due to:
- Manual OTP setup test being interactive (now skipped outside headed Chromium)
- App route changes (e.g. create-plan route may be `/investments/new`)
- UI/selector differences or timing differences across browsers

### Known failures encountered during cross-browser run
- **Plans / create plan URL assertion**
  - The app navigated to `https://app.risevest.com/investments/new`.
  - A strict URL expectation caused a failure.
  - Fix applied: URL checks were relaxed to accept both `/investments/new` and `/investments/create`.

- **Wallet / toggle balance (Chromium)**
  - Locator based on the “Toggle visibility of your investment balance” container did not match the USD row in some runs.
  - This is likely due to differing DOM structure / accessible text rendering depending on account state and balances.

- **Firefox/WebKit navigation timeouts**
  - Some runs timed out during `page.goto('/login')` or `page.goto('/')`.
  - This is most commonly caused by network variability, anti-bot gating, or browser-specific timing differences.

## Notes / Constraints
- The Risevest application is a live production app; UI changes and gating can affect test stability.
- OTP-based login cannot be fully automated without a stable OTP retrieval mechanism (email API / test account bypass), so this project uses a manual setup step.

## Evidence
- A Playwright HTML report is generated locally after each run under `playwright-report/`.
- That folder is intentionally **gitignored** to keep the repository clean and avoid committing large artifacts.

If you need to share the full HTML report, zip `playwright-report/` locally and attach it to your submission or upload it as a release asset.
