import type { Page, Locator } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Wait for the plagiarism scan to complete.
 * Looks for a success/completion indicator after artwork upload.
 * Adjust the selector based on your actual UI implementation.
 */
export async function waitForPlagiarismScan(page: Page, timeout = 180_000) {
  // The plagiarism scan may show a progress bar, then a success message.
  // Wait for the similarity report or "Scan complete" indicator to appear.
  await page.waitForSelector(
    '[data-testid="similarity-report"], [data-testid="scan-complete"], text=/scan complete|similarity analysis|plagiarism check/i',
    { timeout },
  );
}

/**
 * Wait for blockchain registration to complete.
 * Looks for a success indicator after the blockchain transaction.
 */
export async function waitForBlockchainRegistration(
  page: Page,
  timeout = 180_000,
) {
  // Blockchain registration may show a transaction hash or "Registered on blockchain" message.
  await page.waitForSelector(
    '[data-testid="blockchain-success"], [data-testid="tx-hash"], text=/registered on blockchain|blockchain confirmation|transaction complete/i',
    { timeout },
  );
}

/**
 * Wait for the artwork upload flow to fully complete.
 * This includes plagiarism scan + blockchain registration.
 */
export async function waitForUploadComplete(page: Page, timeout = 300_000) {
  // The final success state after upload, scan, and blockchain.
  await page.waitForSelector(
    '[data-testid="upload-success"], text=/artwork registered successfully|upload complete|artwork submitted/i',
    { timeout },
  );
}

/**
 * Wait for a toast/sonner notification to appear and disappear.
 */
export async function waitForToast(
  page: Page,
  options?: { text?: string; timeout?: number },
) {
  const { text, timeout = 30_000 } = options ?? {};
  if (text) {
    await page.waitForSelector(`text=${text}`, { timeout });
  } else {
    // Wait for any sonner toast
    await page.waitForSelector('[data-sonner-toast]', { timeout });
  }
}

/**
 * Wait for a loading spinner to disappear.
 */
export async function waitForLoadingToFinish(page: Page, timeout = 30_000) {
  // Wait for common loading indicators to disappear
  await page.waitForFunction(
    () => {
      const spinners = document.querySelectorAll(
        '[role="status"], .animate-spin, [data-testid="loading"]',
      );
      return spinners.length === 0;
    },
    { timeout },
  );
}

/**
 * Wait for a specific element to have a particular text content.
 */
export async function waitForText(
  page: Page,
  selector: string,
  text: string,
  timeout = 30_000,
) {
  const element = page.locator(selector);
  await expect(element).toHaveText(text, { timeout });
}

/**
 * Wait for navigation to a specific URL pattern.
 */
export async function waitForNavigation(
  page: Page,
  urlPattern: string | RegExp,
  timeout = 30_000,
) {
  await page.waitForURL(urlPattern, { timeout });
}

/**
 * Wait for a table or list to have rows (data loaded).
 */
export async function waitForTableData(
  page: Page,
  tableSelector = "table",
  timeout = 30_000,
) {
  const table = page.locator(tableSelector);
  await expect(table.locator("tbody tr").first()).toBeVisible({ timeout });
}

/**
 * Wait for a dialog/modal to be visible.
 */
export async function waitForDialog(
  page: Page,
  dialogSelector = '[role="dialog"]',
  timeout = 15_000,
) {
  await page.waitForSelector(dialogSelector, { timeout });
}

/**
 * Wait for a dialog/modal to close.
 */
export async function waitForDialogToClose(
  page: Page,
  dialogSelector = '[role="dialog"]',
  timeout = 15_000,
) {
  await page.waitForSelector(dialogSelector, {
    state: "detached",
    timeout,
  });
}