import type { Page } from "@playwright/test";

export class ReportInfringementPage {
  constructor(private page: Page) {}

  async goto(artworkId?: string) {
    if (artworkId) {
      await this.page.goto(`/report/${artworkId}`);
    } else {
      await this.page.goto("/report-infringement");
    }
  }

  async selectReason(reason: string) {
    // Look for radio/checkbox/select with the reason
    await this.page.getByLabel(new RegExp(reason, "i")).check();
  }

  async fillDetails(details: string) {
    await this.page.getByLabel(/details|description|explanation/i).fill(details);
  }

  async clickSubmit() {
    await this.page.getByRole("button", { name: /submit|send report|file report/i }).click();
  }

  async submitReport(reason: string, details: string) {
    await this.selectReason(reason);
    await this.fillDetails(details);
    await this.clickSubmit();
  }

  get form() {
    return this.page.locator('form');
  }

  get successMessage() {
    return this.page.locator(
      'text=/report submitted|thank you|report received/i',
    );
  }
}