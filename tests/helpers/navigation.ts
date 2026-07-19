import type { Page } from "@playwright/test";

/**
 * Navigate to a specific route in the application.
 * Uses the baseURL configured in playwright.config.ts.
 */
export async function navigateTo(page: Page, route: string) {
  await page.goto(route);
  await page.waitForLoadState("networkidle");
}

/**
 * Navigate to the user dashboard.
 */
export async function navigateToDashboard(page: Page) {
  await navigateTo(page, "/dashboard");
}

/**
 * Navigate to the artwork upload page.
 */
export async function navigateToUpload(page: Page) {
  await navigateTo(page, "/upload-artwork");
}

/**
 * Navigate to the user's profile page.
 */
export async function navigateToProfile(page: Page) {
  await navigateTo(page, "/profile");
}

/**
 * Navigate to the settings page.
 */
export async function navigateToSettings(page: Page) {
  await navigateTo(page, "/settings");
}

/**
 * Navigate to the report infringement page for a specific artwork.
 */
export async function navigateToReport(page: Page, artworkId?: string) {
  if (artworkId) {
    await navigateTo(page, `/report/${artworkId}`);
  } else {
    await navigateTo(page, "/report-infringement");
  }
}

/**
 * Navigate to an admin section.
 * @param section - The admin subsection (e.g., 'dashboard', 'artworks', 'artwork-verification', 'reports', 'users', 'settings')
 */
export async function navigateToAdmin(
  page: Page,
  section: string = "dashboard",
) {
  await navigateTo(page, `/admin/${section}`);
}

/**
 * Navigate to the artwork verification review page for a specific artwork.
 */
export async function navigateToReview(page: Page, reviewId: string) {
  await navigateTo(page, `/admin/artwork-verification/${reviewId}`);
}

/**
 * Navigate to a specific report detail page.
 */
export async function navigateToReportDetail(page: Page, reportId: string) {
  await navigateTo(page, `/admin/reports/${reportId}`);
}

/**
 * Navigate to the user's my-reports page.
 */
export async function navigateToMyReports(page: Page) {
  await navigateTo(page, "/my-reports");
}

/**
 * Navigate to the gallery/home page.
 */
export async function navigateToGallery(page: Page) {
  await navigateTo(page, "/");
}

/**
 * Navigate to the verify artwork page.
 */
export async function navigateToVerify(page: Page) {
  await navigateTo(page, "/verify-artwork");
}