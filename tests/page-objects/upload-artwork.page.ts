import type { Page } from "@playwright/test";
import path from "path";

export class UploadArtworkPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/upload-artwork");
  }

  /**
   * Upload an artwork file via the dropzone.
   * Provide the filename relative to the project root, or an absolute path.
   */
  async uploadFile(filePath: string) {
    // Resolve relative to project root if not absolute
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    // Playwright's setInputFiles works on file inputs.
    // If the dropzone uses a hidden input, target it.
    const fileInput = this.page.locator(
      'input[type="file"], [data-testid="file-input"]',
    );
    await fileInput.setInputFiles(resolvedPath);
  }

  async fillTitle(title: string) {
    await this.page.getByLabel(/title/i).fill(title);
  }

  async fillDescription(description: string) {
    await this.page.getByLabel(/description/i).fill(description);
  }

  async clickSubmit() {
    await this.page.getByRole("button", { name: /submit|register|upload/i }).click();
  }

  async uploadArtwork(
    filePath: string,
    metadata: { title: string; description?: string },
  ) {
    await this.goto();
    await this.uploadFile(filePath);
    await this.fillTitle(metadata.title);
    if (metadata.description) {
      await this.fillDescription(metadata.description);
    }
    await this.clickSubmit();
  }

  get dropzone() {
    return this.page.locator('[data-testid="dropzone"], .dropzone');
  }

  get fileInput() {
    return this.page.locator(
      'input[type="file"], [data-testid="file-input"]',
    );
  }

  get titleInput() {
    return this.page.getByLabel(/title/i);
  }

  get descriptionInput() {
    return this.page.getByLabel(/description/i);
  }

  get submitButton() {
    return this.page.getByRole("button", { name: /submit|register|upload/i });
  }

  get similarityReport() {
    return this.page.locator('[data-testid="similarity-report"]');
  }

  get uploadProgress() {
    return this.page.locator('[data-testid="upload-progress"]');
  }

  get successMessage() {
    return this.page.locator(
      '[data-testid="upload-success"], text=/artwork registered successfully/i',
    );
  }
}