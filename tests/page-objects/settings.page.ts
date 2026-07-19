import type { Page } from "@playwright/test";

export class SettingsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/settings");
  }

  async gotoNotifications() {
    await this.page.goto("/settings/notifications");
  }

  async updateDisplayName(name: string) {
    await this.page.getByLabel(/display name|name/i).fill(name);
    await this.page.getByRole("button", { name: /save|update/i }).click();
  }

  async toggleNotification(type: string, enabled: boolean) {
    const toggle = this.page.getByLabel(new RegExp(type, "i"));
    const isChecked = await toggle.isChecked();
    if (isChecked !== enabled) {
      await toggle.click();
    }
  }

  get displayNameInput() {
    return this.page.getByLabel(/display name|name/i);
  }

  get emailInput() {
    return this.page.getByLabel(/email/i);
  }

  get saveButton() {
    return this.page.getByRole("button", { name: /save|update/i });
  }

  get successMessage() {
    return this.page.locator('text=/settings saved|updated|success/i');
  }
}