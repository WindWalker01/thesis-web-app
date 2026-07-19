import type { Page } from "@playwright/test";

export class NotificationsPage {
  constructor(private page: Page) {}

  async openPanel() {
    // Click the notification bell icon in the navbar
    await this.page.getByRole("button", { name: /notifications|bell/i }).click();
  }

  async clickNotification(index = 0) {
    const notifications = this.page.locator('[data-testid="notification-item"]');
    await notifications.nth(index).click();
  }

  async markAsRead(index = 0) {
    const notifications = this.page.locator('[data-testid="notification-item"]');
    await notifications.nth(index).hover();
    await this.page.getByRole("button", { name: /mark as read/i }).click();
  }

  async markAllAsRead() {
    await this.page.getByRole("button", { name: /mark all as read/i }).click();
  }

  get panel() {
    return this.page.locator('[data-testid="notification-panel"], [role="menu"]');
  }

  get notifications() {
    return this.page.locator('[data-testid="notification-item"]');
  }

  get unreadBadge() {
    return this.page.locator('[data-testid="unread-badge"]');
  }

  get emptyState() {
    return this.page.locator('text=/no notifications|nothing here/i');
  }
}