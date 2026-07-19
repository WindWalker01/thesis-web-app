import type { Page } from "@playwright/test";
import { NotificationsPage } from "../page-objects/notifications.page";

/**
 * Open the notifications panel from the navbar.
 */
export async function openNotifications(page: Page) {
  const notificationsPage = new NotificationsPage(page);
  await notificationsPage.openPanel();
}

/**
 * Get the unread notification count.
 * Returns the text content of the unread badge, or "0" if not visible.
 */
export async function getUnreadCount(page: Page) {
  const notificationsPage = new NotificationsPage(page);
  if (await notificationsPage.unreadBadge.isVisible()) {
    return await notificationsPage.unreadBadge.textContent();
  }
  return "0";
}

/**
 * Click on a specific notification by index.
 */
export async function clickNotification(page: Page, index = 0) {
  const notificationsPage = new NotificationsPage(page);
  await notificationsPage.clickNotification(index);
}

/**
 * Mark all notifications as read.
 */
export async function markAllNotificationsAsRead(page: Page) {
  const notificationsPage = new NotificationsPage(page);
  await notificationsPage.openPanel();
  await notificationsPage.markAllAsRead();
}