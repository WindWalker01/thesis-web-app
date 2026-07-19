import type { Page } from "@playwright/test";
import { ReportInfringementPage } from "../page-objects/report-infringement.page";
import { waitForToast } from "./wait-for";

/**
 * Submit an infringement report for an artwork.
 */
export async function submitReport(
  page: Page,
  options: {
    artworkId?: string;
    reason: string;
    details: string;
  },
) {
  const reportPage = new ReportInfringementPage(page);
  await reportPage.goto(options.artworkId);
  await reportPage.submitReport(options.reason, options.details);
  await waitForToast(page, { timeout: 30_000 });
}

/**
 * Navigate to the user's my-reports page.
 */
export async function viewMyReports(page: Page) {
  await page.goto("/my-reports");
  await page.waitForLoadState("networkidle");
}

/**
 * View the details of a specific report.
 */
export async function viewReportDetail(page: Page, reportId: string) {
  await page.goto(`/my-reports/${reportId}`);
  await page.waitForLoadState("networkidle");
}