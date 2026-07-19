import type { Page } from "@playwright/test";

export class AdminReportsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/admin/reports");
  }

  async gotoReport(id: string) {
    await this.page.goto(`/admin/reports/${id}`);
  }

  async clickReport(id: string) {
    await this.page.locator(`[data-testid="report-${id}"]`).click();
  }

  async assignToAdmin(adminName: string) {
    await this.page.getByRole("button", { name: /assign/i }).click();
    await this.page.getByLabel(/admin|assignee/i).fill(adminName);
    await this.page.getByRole("option", { name: new RegExp(adminName, "i") }).click();
    await this.page.getByRole("button", { name: /confirm|assign/i }).click();
  }

  async approveReport() {
    await this.page.getByRole("button", { name: /approve|resolve/i }).click();
  }

  async rejectReport() {
    await this.page.getByRole("button", { name: /reject|dismiss/i }).click();
  }

  async addNote(note: string) {
    await this.page.getByLabel(/note|admin note|comment/i).fill(note);
    await this.page.getByRole("button", { name: /save|add|submit/i }).click();
  }

  async warnUser() {
    await this.page.getByRole("button", { name: /warn|send warning/i }).click();
  }

  async suspendUser() {
    await this.page.getByRole("button", { name: /suspend/i }).click();
  }

  async banUser() {
    await this.page.getByRole("button", { name: /ban/i }).click();
  }

  get reportsTable() {
    return this.page.locator("table");
  }

  get filters() {
    return this.page.locator('[data-testid="reports-filters"]');
  }

  get statsCards() {
    return this.page.locator('[data-testid="report-stats"]');
  }

  get evidenceViewer() {
    return this.page.locator('[data-testid="evidence-viewer"]');
  }

  get investigationTimeline() {
    return this.page.locator('[data-testid="investigation-timeline"]');
  }
}