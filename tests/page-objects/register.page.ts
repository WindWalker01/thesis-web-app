import type { Page } from "@playwright/test";

export class RegisterPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/register");
  }

  async fillName(name: string) {
    await this.page.getByLabel(/name|full name/i).fill(name);
  }

  async fillEmail(email: string) {
    await this.page.getByLabel("Email address").fill(email);
  }

  async fillPassword(password: string) {
    await this.page.getByLabel("Password").fill(password);
  }

  async clickSignUp() {
    await this.page.getByRole("button", { name: /sign up|create account|register/i }).click();
  }

  async register(name: string, email: string, password: string) {
    await this.goto();
    await this.fillName(name);
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSignUp();
  }

  get errorAlert() {
    return this.page.locator('[role="alert"]');
  }
}