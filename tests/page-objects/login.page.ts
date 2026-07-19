import type { Page } from "@playwright/test";

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/login");
  }

  async fillEmail(email: string) {
    await this.page.getByLabel("Email address").fill(email);
  }

  async fillPassword(password: string) {
    await this.page.getByLabel("Password").fill(password);
  }

  async clickSignIn() {
    await this.page.getByRole("button", { name: /sign in/i }).click();
  }

  async login(email: string, password: string) {
    await this.goto();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSignIn();
  }

  async clickForgotPassword() {
    await this.page.getByRole("link", { name: /forgot password/i }).click();
  }

  async clickSignUp() {
    await this.page.getByRole("link", { name: /sign up/i }).click();
  }

  async clickGoogleLogin() {
    await this.page.getByRole("button", { name: /continue with google/i }).click();
  }

  get emailInput() {
    return this.page.getByLabel("Email address");
  }

  get passwordInput() {
    return this.page.getByLabel("Password");
  }

  get signInButton() {
    return this.page.getByRole("button", { name: /sign in/i });
  }

  get errorAlert() {
    return this.page.locator('[role="alert"]');
  }

  get serverError() {
    return this.page.locator('[data-testid="server-error"], text=/invalid credentials|error/i');
  }
}