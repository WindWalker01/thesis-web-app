import type { Page } from "@playwright/test";

export class AdminUsersPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/admin/users");
  }

  async searchUser(query: string) {
    await this.page.getByPlaceholder(/search|find user/i).fill(query);
  }

  async clickUser(id: string) {
    await this.page.locator(`[data-testid="user-${id}"]`).click();
  }

  async banUser(userId: string) {
    await this.page.locator(`[data-testid="ban-${userId}"]`).click();
    // The Ban dialog requires a reason and the confirmation checkbox before
    // the destructive submit button becomes enabled.
    await this.page
      .getByPlaceholder(/enter the reason/i)
      .fill("Banned by automated regression test.");
    await this.page
      .getByLabel(/I confirm that I want to permanently ban/i)
      .check();
    await this.page.getByRole("button", { name: /^ban user$/i }).click();
  }

  async suspendUser(userId: string) {
    await this.page.locator(`[data-testid="suspend-${userId}"]`).click();
    await this.page.getByRole("button", { name: /confirm|suspend/i }).click();
  }

  async unsuspendUser(userId: string) {
    await this.page.locator(`[data-testid="unsuspend-${userId}"]`).click();
    await this.page.getByRole("button", { name: /confirm|unsuspend/i }).click();
  }

  async openUserMenu(userId: string) {
    const row = this.page
      .locator("table tbody tr")
      .filter({ hasText: userId })
      .first();
    await row.getByRole("button").last().click();
  }

  get banButton() {
    return this.page.getByRole("button", { name: /ban selected/i });
  }

  get suspendButton() {
    return this.page.getByRole("button", { name: /suspend selected/i });
  }

  async selectRow(userId: string) {
    const row = this.page
      .locator("table tbody tr")
      .filter({ hasText: userId })
      .first();
    await row.locator('input[type="checkbox"]').check();
  }

  async warnUser(userId: string) {
    await this.page.locator(`[data-testid="warn-${userId}"]`).click();
    await this.page.getByRole("button", { name: /confirm|send/i }).click();
  }

  get usersTable() {
    return this.page.locator("table");
  }

  get searchInput() {
    return this.page.getByPlaceholder(/search|find user/i);
  }

  get filters() {
    return this.page.locator('[data-testid="user-filters"]');
  }
}
