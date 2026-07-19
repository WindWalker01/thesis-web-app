import type { Page } from "@playwright/test";
import { LoginPage } from "../page-objects/login.page";
import { RegisterPage } from "../page-objects/register.page";

/**
 * Log in as an existing user.
 * Uses the LoginPage object to fill credentials and submit.
 */
export async function login(page: Page, email: string, password: string) {
  const loginPage = new LoginPage(page);
  await loginPage.login(email, password);
  // Wait for navigation away from login page
  await page.waitForURL(/dashboard|\/profile|\//, { timeout: 30_000 });
}

/**
 * Log out the current user.
 * Clicks the logout button/trigger in the navbar or settings.
 */
export async function logout(page: Page) {
  // Try clicking the user menu / avatar first, then logout
  const userMenu = page.locator(
    '[data-testid="user-menu"], [data-testid="avatar"], button[aria-label*="user" i]',
  );
  if (await userMenu.isVisible()) {
    await userMenu.click();
  }
  await page.getByRole("button", { name: /log out|sign out|logout/i }).click();
  // Wait for redirect to home/login
  await page.waitForURL(/login|\//, { timeout: 15_000 });
}

/**
 * Register a new user account.
 * Uses the RegisterPage object to fill the form and submit.
 */
export async function registerUser(
  page: Page,
  user: { name: string; email: string; password: string },
) {
  const registerPage = new RegisterPage(page);
  await registerPage.register(user.name, user.email, user.password);
  // Wait for post-registration redirect (confirmation page or dashboard)
  await page.waitForURL(/dashboard|confirm|verify|login/, { timeout: 30_000 });
}

/**
 * Log in as an admin user.
 * Same as login but with admin credentials.
 */
export async function adminLogin(page: Page, email: string, password: string) {
  await login(page, email, password);
  // Verify admin access by checking for admin navigation elements
  await page.waitForSelector(
    '[data-testid="sidebar"], a[href*="/admin"], text=/admin/i',
    { timeout: 15_000 },
  );
}