import type { Page } from "@playwright/test";
import { AdminDashboardPage } from "../page-objects/admin-dashboard.page";
import { AdminVerificationPage } from "../page-objects/admin-verification.page";
import { AdminReportsPage } from "../page-objects/admin-reports.page";
import { AdminUsersPage } from "../page-objects/admin-users.page";
import {
  waitForTableData,
  waitForDialog,
  waitForDialogToClose,
  waitForToast,
} from "./wait-for";

/**
 * Navigate to the admin dashboard.
 */
export async function navigateToAdminDashboard(page: Page) {
  const adminPage = new AdminDashboardPage(page);
  await adminPage.goto();
}

/**
 * Navigate to the artwork verification queue.
 */
export async function navigateToVerificationQueue(page: Page) {
  const adminPage = new AdminDashboardPage(page);
  await adminPage.goto();
  await adminPage.navigateToVerification();
}

/**
 * Navigate to the admin reports section.
 */
export async function navigateToAdminReports(page: Page) {
  const adminPage = new AdminDashboardPage(page);
  await adminPage.goto();
  await adminPage.navigateToReports();
}

/**
 * Navigate to the user management section.
 */
export async function navigateToUserManagement(page: Page) {
  const adminPage = new AdminDashboardPage(page);
  await adminPage.goto();
  await adminPage.navigateToUsers();
}

/**
 * Approve an artwork in the verification queue.
 */
export async function approveArtwork(page: Page, reviewId: string) {
  const verificationPage = new AdminVerificationPage(page);
  await verificationPage.gotoReview(reviewId);
  await verificationPage.approveArtwork();
  await waitForDialogToClose(page);
}

/**
 * Reject an artwork in the verification queue.
 */
export async function rejectArtwork(page: Page, reviewId: string) {
  const verificationPage = new AdminVerificationPage(page);
  await verificationPage.gotoReview(reviewId);
  await verificationPage.rejectArtwork();
  await waitForDialogToClose(page);
}

/**
 * Assign a report to an admin.
 */
export async function assignReportToAdmin(
  page: Page,
  reportId: string,
  adminName: string,
) {
  const reportsPage = new AdminReportsPage(page);
  await reportsPage.gotoReport(reportId);
  await reportsPage.assignToAdmin(adminName);
  await waitForToast(page, { timeout: 15_000 });
}

/**
 * Ban a user from the admin panel.
 */
export async function banUser(page: Page, userId: string) {
  const usersPage = new AdminUsersPage(page);
  await usersPage.goto();
  await usersPage.banUser(userId);
  await waitForDialogToClose(page);
}

/**
 * Suspend a user from the admin panel.
 */
export async function suspendUser(page: Page, userId: string) {
  const usersPage = new AdminUsersPage(page);
  await usersPage.goto();
  await usersPage.suspendUser(userId);
  await waitForDialogToClose(page);
}

/**
 * Warn a user from the admin panel.
 */
export async function warnUser(page: Page, userId: string) {
  const usersPage = new AdminUsersPage(page);
  await usersPage.goto();
  await usersPage.warnUser(userId);
  await waitForDialogToClose(page);
}