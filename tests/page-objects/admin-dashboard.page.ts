import type { Page } from "@playwright/test";

export class AdminDashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/admin/dashboard");
  }

  get heading() {
    return this.page.locator("h1, h2").first();
  }

  get statsCards() {
    return this.page.locator('[data-testid="stats-card"]');
  }

  get activityFeed() {
    return this.page.locator('[data-testid="activity-feed"]');
  }

  get recentReports() {
    return this.page.locator('[data-testid="recent-reports"]');
  }

  get latestArtworks() {
    return this.page.locator('[data-testid="latest-artworks"]');
  }

  get systemHealth() {
    return this.page.locator('[data-testid="system-health"]');
  }

  get sidebar() {
    return this.page.locator('[data-testid="sidebar"]');
  }

  async navigateToArtworks() {
    await this.page.getByRole("link", { name: /artworks|artwork management/i }).click();
  }

  async navigateToVerification() {
    await this.page.getByRole("link", { name: /verification|review/i }).click();
  }

  async navigateToReports() {
    await this.page.getByRole("link", { name: /reports/i }).click();
  }

  async navigateToUsers() {
    await this.page.getByRole("link", { name: /users|user management/i }).click();
  }

  async navigateToSettings() {
    await this.page.getByRole("link", { name: /settings/i }).click();
  }
}