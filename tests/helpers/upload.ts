import type { Page } from "@playwright/test";
import { UploadArtworkPage } from "../page-objects/upload-artwork.page";
import { waitForPlagiarismScan, waitForBlockchainRegistration, waitForUploadComplete } from "./wait-for";

/**
 * Upload an artwork file with metadata.
 * Handles the full flow: file selection, form fill, submission, and waiting for results.
 */
export async function uploadArtwork(
  page: Page,
  filePath: string,
  metadata: { title: string; description?: string },
  options?: { waitForCompletion?: boolean },
) {
  const uploadPage = new UploadArtworkPage(page);
  await uploadPage.uploadArtwork(filePath, metadata);

  if (options?.waitForCompletion !== false) {
    // Wait for plagiarism scan to complete
    await waitForPlagiarismScan(page);
    // Wait for blockchain registration
    await waitForBlockchainRegistration(page);
    // Wait for final success state
    await waitForUploadComplete(page);
  }
}

/**
 * Fill the artwork registration form without submitting.
 */
export async function fillArtworkForm(
  page: Page,
  metadata: { title: string; description?: string },
) {
  const uploadPage = new UploadArtworkPage(page);
  if (metadata.title) await uploadPage.fillTitle(metadata.title);
  if (metadata.description) await uploadPage.fillDescription(metadata.description);
}

/**
 * Select a file in the artwork dropzone.
 */
export async function selectArtworkFile(page: Page, filePath: string) {
  const uploadPage = new UploadArtworkPage(page);
  await uploadPage.uploadFile(filePath);
}

/**
 * Submit the artwork upload form.
 */
export async function submitArtwork(page: Page) {
  const uploadPage = new UploadArtworkPage(page);
  await uploadPage.clickSubmit();
}