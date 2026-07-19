# Playwright End-to-End Tests

This directory contains end-to-end (E2E) tests for the **Digital Art** thesis project, powered by [Playwright](https://playwright.dev/).

---

## Prerequisites

- Node.js 18+
- All project dependencies installed (`npm install`)

---

## Installation

Playwright and its Chromium browser are already installed as part of the project setup. If you need to reinstall or update:

```bash
# Install Playwright test runner (already in devDependencies)
npm install

# Install Chromium browser (already done, but re-run if needed)
npx playwright install chromium
```

To add Firefox or WebKit support later:

```bash
npx playwright install firefox webkit
```

---

## Running Tests

### Run all tests (headless)

```bash
npm run test:e2e
```

Playwright will automatically start the Next.js development server, run all tests in headless Chromium, then stop the server.

### Run tests in headed mode (visible browser)

```bash
npm run test:e2e:headed
```

Useful for watching tests execute in real time.

### Run a specific test file

```bash
npx playwright test tests/authentication/login.spec.ts
```

### Run tests with a specific project (browser)

```bash
npx playwright test --project=chromium
```

---

## Playwright UI Mode

UI Mode provides a visual interface for running, debugging, and exploring tests.

```bash
npm run test:e2e:ui
```

This opens a browser-based dashboard where you can:

- Run individual tests or all tests
- Step through each action
- View DOM snapshots at each step
- Inspect network requests
- View logs, errors, and traces

---

## Debugging Tests

### Debug mode

```bash
npm run test:e2e:debug
```

This launches Playwright Inspector, allowing you to step through each test action, see locators, and pause execution.

### Debug a specific test

```bash
npx playwright test --debug tests/authentication/login.spec.ts
```

### Using `page.pause()`

Insert `await page.pause();` in your test code to pause execution and open the Playwright Inspector at that point.

---

## Recording Tests with Codegen

Codegen is Playwright's test recorder. It opens a browser window and records your interactions as Playwright test code.

### Start recording

```bash
npm run test:record
```

This will:

1. Open Chromium with Playwright's recorder panel
2. Every click, type, and navigation is recorded as test code
3. The generated code appears in the recorder panel

### How to use Codegen effectively

1. **Start recording**: Run `npm run test:record`
2. **Perform actions**: Interact with your application naturally (click buttons, fill forms, navigate pages)
3. **Copy the generated code**: The recorder panel shows the generated test script
4. **Save the test**: Create a new `.spec.ts` file in the appropriate `tests/` subdirectory and paste the code
5. **Organize**: Move the file to the correct folder (e.g., `tests/authentication/`, `tests/artwork/`)

### Codegen tips

- Use the **Record** button in the inspector to toggle recording on/off
- Use the **Assert** buttons to add assertions (e.g., visibility, text content)
- Use the **Target** selector to pick specific elements
- After recording, you can edit the generated test to add assertions, organize steps, or add comments

---

## Saving Recorded Tests

After recording with Codegen:

1. Copy the generated code from the recorder panel
2. Create a new file in the appropriate subdirectory, e.g.:
   ```
   tests/authentication/login.spec.ts
   ```
3. Paste the code and save
4. Run the test to verify it works:
   ```bash
   npm run test:e2e -- tests/authentication/login.spec.ts
   ```

---

## Replaying Recorded Tests

To replay a recorded test:

```bash
# Headless (default)
npm run test:e2e

# Headed (watch it run)
npm run test:e2e:headed

# Specific file
npx playwright test tests/authentication/login.spec.ts --headed
```

---

## Viewing Traces

Traces provide a full step-by-step replay of a test run, including DOM snapshots, network logs, and console output.

### View the latest trace

```bash
npx playwright show-trace
```

### View a specific trace file

```bash
npx playwright show-trace test-results/.last-failed/trace.zip
```

Traces are automatically saved on test failure (configured in `playwright.config.ts`).

---

## Viewing HTML Reports

After running tests, an HTML report is generated in the `playwright-report/` directory.

```bash
# Open the HTML report
npx playwright show-report
```

Or open `playwright-report/index.html` in your browser manually.

The report shows:

- Test pass/fail summary
- Test duration
- Error messages and stack traces
- Screenshots and videos on failure
- Traces for failed tests

---

## Test Structure

```
tests/
├── authentication/   # Login, registration, password reset
├── artwork/          # Artwork upload, management, details
├── gallery/          # Gallery browsing, search, filtering
├── reports/          # Report submission, management
├── verification/     # Artwork verification, certificates
├── admin/            # Admin dashboard, user management
├── notifications/    # Notification display and interactions
├── settings/         # User settings, profile editing
├── assets/           # Test fixtures (images, files, etc.)
└── README.md         # This file
```

---

## Configuration

The main Playwright configuration is in `playwright.config.ts` at the project root. Key settings:

| Setting | Value | Description |
|---------|-------|-------------|
| `testDir` | `./tests` | Test file location |
| `timeout` | 180 seconds | Per-test timeout (3 min for plagiarism checks) |
| `expect.timeout` | 30 seconds | Per-assertion timeout |
| `retries` | 2 (CI only) | Test retry count |
| `fullyParallel` | `true` | Run test files in parallel |
| `screenshot` | `only-on-failure` | Capture on failure |
| `video` | `retain-on-failure` | Record video on failure |
| `trace` | `retain-on-failure` | Capture trace on failure |
| `reporter` | HTML + list | Test output format |
| `webServer` | `npm run dev` | Auto-start Next.js |

---

## CI Integration

When running in CI (detected via `process.env.CI`):

- Tests retry up to 2 times on failure
- Parallel workers are limited to 1
- The dev server is started fresh (no reuse)

---

## Adding New Tests

1. **Record** your test with `npm run test:record`
2. **Save** the generated code to the appropriate `tests/` subdirectory
3. **Run** the test to verify: `npm run test:e2e --headed`
4. **Refine** by adding assertions, comments, and organizing steps
5. **Commit** the test file to version control

---

## Testing Architecture

The test suite follows a layered architecture for maintainability and reusability:

```
tests/
├── fixtures/          # Custom Playwright test fixtures (authenticated pages)
├── helpers/           # Reusable helper functions (login, upload, admin actions)
├── page-objects/      # Page Object Model classes (one per page/feature)
├── authentication/    # Test files for auth flows
├── artwork/           # Test files for artwork management
├── gallery/           # Test files for gallery browsing
├── reports/           # Test files for report submission
├── verification/      # Test files for artwork verification
├── admin/             # Test files for admin features
├── notifications/     # Test files for notifications
├── settings/          # Test files for user settings
├── assets/            # Test fixtures (images, files, etc.)
└── README.md          # This file
```

### Page Objects (`tests/page-objects/`)

Each page object encapsulates selectors and actions for a specific page. Example:

```typescript
import { LoginPage } from "../page-objects/login.page";

test("user can log in", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login("user@example.com", "password123");
  await expect(page).toHaveURL(/dashboard/);
});
```

Available page objects:

| Page Object | File | Key Methods |
|-------------|------|-------------|
| `LoginPage` | `login.page.ts` | `login()`, `fillEmail()`, `fillPassword()`, `clickSignIn()` |
| `RegisterPage` | `register.page.ts` | `register()`, `fillName()`, `fillEmail()`, `fillPassword()` |
| `UploadArtworkPage` | `upload-artwork.page.ts` | `uploadArtwork()`, `uploadFile()`, `fillTitle()`, `fillDescription()` |
| `ReportInfringementPage` | `report-infringement.page.ts` | `submitReport()`, `selectReason()`, `fillDetails()` |
| `DashboardPage` | `dashboard.page.ts` | `goto()`, accessors for artworks, reports, profile |
| `AdminDashboardPage` | `admin-dashboard.page.ts` | `goto()`, navigation to sub-sections |
| `AdminVerificationPage` | `admin-verification.page.ts` | `approveArtwork()`, `rejectArtwork()`, `addReviewNote()` |
| `AdminReportsPage` | `admin-reports.page.ts` | `assignToAdmin()`, `approveReport()`, `warnUser()`, `banUser()` |
| `AdminUsersPage` | `admin-users.page.ts` | `searchUser()`, `banUser()`, `suspendUser()`, `warnUser()` |
| `ProfilePage` | `profile.page.ts` | `goto()`, `gotoArtwork()`, `gotoIssues()` |
| `SettingsPage` | `settings.page.ts` | `updateDisplayName()`, `toggleNotification()` |
| `NotificationsPage` | `notifications.page.ts` | `openPanel()`, `markAllAsRead()`, `clickNotification()` |

### Helpers (`tests/helpers/`)

Helpers are convenience functions that combine page objects and common patterns. They are the recommended way to write tests.

```typescript
import { login, uploadArtwork, submitReport } from "../helpers";
import { waitForUploadComplete } from "../helpers/wait-for";

test("full artwork upload flow", async ({ page }) => {
  await login(page, "user@example.com", "password123");
  await uploadArtwork(page, "tests/assets/test-image.png", {
    title: "My Artwork",
    description: "A test artwork",
  });
  await waitForUploadComplete(page);
});
```

Available helper modules:

| Module | File | Key Functions |
|--------|------|---------------|
| `auth` | `helpers/auth.ts` | `login()`, `logout()`, `registerUser()`, `adminLogin()` |
| `navigation` | `helpers/navigation.ts` | `navigateTo()`, `navigateToDashboard()`, `navigateToUpload()`, `navigateToAdmin()` |
| `upload` | `helpers/upload.ts` | `uploadArtwork()`, `fillArtworkForm()`, `selectArtworkFile()`, `submitArtwork()` |
| `reports` | `helpers/reports.ts` | `submitReport()`, `viewMyReports()`, `viewReportDetail()` |
| `admin` | `helpers/admin.ts` | `navigateToAdminDashboard()`, `approveArtwork()`, `rejectArtwork()`, `banUser()`, `suspendUser()`, `warnUser()` |
| `notifications` | `helpers/notifications.ts` | `openNotifications()`, `getUnreadCount()`, `markAllNotificationsAsRead()` |
| `wait-for` | `helpers/wait-for.ts` | `waitForPlagiarismScan()`, `waitForBlockchainRegistration()`, `waitForUploadComplete()`, `waitForToast()`, `waitForLoadingToFinish()` |

### Fixtures (`tests/fixtures/`)

Fixtures extend Playwright's `test` object to provide pre-configured pages:

```typescript
import { test, expect } from "../fixtures";

// authenticatedPage is already logged in as a regular user
test("user dashboard loads", async ({ authenticatedPage }) => {
  await authenticatedPage.goto("/dashboard");
  await expect(authenticatedPage.locator("h1")).toBeVisible();
});

// adminPage is already logged in as an admin
test("admin can see dashboard", async ({ adminPage }) => {
  await adminPage.goto("/admin/dashboard");
  await expect(adminPage.locator("h1")).toBeVisible();
});
```

To use fixtures, import `test` from `../fixtures` instead of `@playwright/test`:

```typescript
import { test, expect } from "../fixtures";
```

### How to Refactor Recorded Tests

When you record a test with Codegen, the raw output looks like:

```typescript
// Raw Codegen output
await page.getByLabel("Email address").fill("user@test.com");
await page.getByLabel("Password").fill("mypassword");
await page.getByRole("button", { name: "Sign In" }).click();
await page.waitForURL("**/dashboard");
```

Refactor it to use helpers:

```typescript
import { test, expect } from "../fixtures";
import { login } from "../helpers";

test("my recorded test", async ({ page }) => {
  await login(page, "user@test.com", "mypassword");
  // ... rest of recorded actions
});
```

For more complex flows, use page objects:

```typescript
import { test, expect } from "../fixtures";
import { UploadArtworkPage } from "../page-objects/upload-artwork.page";

test("upload artwork", async ({ page }) => {
  const uploadPage = new UploadArtworkPage(page);
  await uploadPage.uploadArtwork("tests/assets/test-image.png", {
    title: "My Artwork",
  });
});
```

### Environment Variables for Test Users

Set these in your `.env.local` or `.env` file for test fixtures:

```bash
TEST_USER_EMAIL=testuser@example.com
TEST_USER_PASSWORD=testpassword123
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=adminpassword123
```

---

## Best Practices

- Use `data-testid` attributes in your components for stable selectors
- Keep tests independent (don't rely on other tests' state)
- Use `test.describe.serial` for tests that must run in order
- Store test fixtures (images, files) in `tests/assets/`
- Use environment variables via `.env` for secrets (loaded automatically by Playwright)
- Prefer **helpers** over raw page objects for common operations
- Use **fixtures** for authenticated test scenarios
- Refactor recorded Codegen tests to use helpers/page objects for maintainability
