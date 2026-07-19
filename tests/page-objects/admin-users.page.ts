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
    await this.page.getByRole("button", { name: /confirm|ban/i }).click();
  }

  async suspendUser(userId: string) {
    await this.page.locator(`[data-testid="suspend-${userId}"]`).click();
    await this.page.getByRole("button", { name: /confirm|suspend/i }).click();
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