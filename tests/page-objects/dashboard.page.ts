import type { Page } from "@playwright/test";

export class DashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/dashboard");
  }

  get heading() {
    return this.page.locator("h1, h2").first();
  }

  get myArtworks() {
    return this.page.locator('[data-testid="my-artworks"], text=/my artworks/i');
  }

  get myReports() {
    return this.page.locator('[data-testid="my-reports"], a[href*="/my-reports"]');
  }

  get profileLink() {
    return this.page.locator('a[href*="/profile"]');
  }

  get settingsLink() {
    return this.page.locator('a[href*="/settings"]');
  }
}