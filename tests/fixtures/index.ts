import { test as base, type Page } from "@playwright/test";
import { login, adminLogin } from "../helpers/auth";

// Extend the base test with custom fixtures
export const test = base.extend<{
  /** A page that is already logged in as a regular user. */
  authenticatedPage: Page;
  /** A page that is already logged in as an admin user. */
  adminPage: Page;
}>({
  authenticatedPage: async ({ page }, use) => {
    const email = process.env.TEST_USER_EMAIL ?? "testuser@example.com";
    const password = process.env.TEST_USER_PASSWORD ?? "testpassword123";
    await login(page, email, password);
    await use(page);
  },

  adminPage: async ({ page }, use) => {
    const email = process.env.TEST_ADMIN_EMAIL ?? "admin@example.com";
    const password = process.env.TEST_ADMIN_PASSWORD ?? "adminpassword123";
    await adminLogin(page, email, password);
    await use(page);
  },
});

// Re-export everything from @playwright/test so tests can use `test` instead of `@playwright/test`
export { expect, type Page, type Locator } from "@playwright/test";