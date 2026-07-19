import type { Page } from "@playwright/test";

export class ProfilePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/profile");
  }

  async gotoArtwork(artworkId: string) {
    await this.page.goto(`/profile/artworks/${artworkId}`);
  }

  async gotoIssues() {
    await this.page.goto("/profile/issues");
  }

  async gotoIssue(issueId: string) {
    await this.page.goto(`/profile/issues/${issueId}`);
  }

  get userName() {
    return this.page.locator('[data-testid="user-name"]');
  }

  get userEmail() {
    return this.page.locator('[data-testid="user-email"]');
  }

  get artworksList() {
    return this.page.locator('[data-testid="artworks-list"]');
  }

  get issuesList() {
    return this.page.locator('[data-testid="issues-list"]');
  }

  get editProfileButton() {
    return this.page.getByRole("link", { name: /edit profile/i });
  }
}