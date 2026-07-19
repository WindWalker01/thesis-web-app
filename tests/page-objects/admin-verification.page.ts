import type { Page } from "@playwright/test";

export class AdminVerificationPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/admin/artwork-verification");
  }

  async gotoReview(id: string) {
    await this.page.goto(`/admin/artwork-verification/${id}`);
  }

  async clickReview(id: string) {
    await this.page.locator(`[data-testid="review-${id}"]`).click();
  }

  async approveArtwork() {
    await this.page.getByRole("button", { name: /approve|accept/i }).click();
  }

  async rejectArtwork() {
    await this.page.getByRole("button", { name: /reject|deny/i }).click();
  }

  async requestChanges() {
    await this.page.getByRole("button", { name: /request changes|revision/i }).click();
  }

  async addReviewNote(note: string) {
    await this.page.getByLabel(/notes|comment|review note/i).fill(note);
  }

  get reviewQueue() {
    return this.page.locator('[data-testid="review-queue"]');
  }

  get filters() {
    return this.page.locator('[data-testid="review-filters"]');
  }

  get statsCards() {
    return this.page.locator('[data-testid="review-stats"]');
  }

  get similarityPanel() {
    return this.page.locator('[data-testid="similarity-analysis"]');
  }

  get metadataPanel() {
    return this.page.locator('[data-testid="metadata-panel"]');
  }

  get comparisonViewer() {
    return this.page.locator('[data-testid="comparison-viewer"]');
  }
}