import { expect, test } from "../fixtures";

/**
 * Artwork Licensing System — E2E coverage.
 *
 * Flow: select license -> store license -> display license -> owner can
 * change the license later. The licensing feature documents the usage terms
 * the creator selected; it is not a legal service.
 */

const ARR = "All Rights Reserved";
const CC_BY_NC = /Attribution-NonCommercial 4\.0 International/;

test.describe("artwork licensing", () => {
  test("defaults to All Rights Reserved when the artist does not pick a license", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/upload-artwork");

    // The licensing section is present and ARR is preselected by default.
    const licenseGroup = page.getByRole("radiogroup");
    await expect(licenseGroup).toBeVisible();

    const arrRadio = licenseGroup
      .locator("label", { hasText: ARR })
      .getByRole("radio");
    await expect(arrRadio).toBeChecked();

    // CC options are offered but not preselected.
    const ccRadio = licenseGroup
      .locator("label", { hasText: "CC BY-NC-SA 4.0" })
      .getByRole("radio");
    await expect(ccRadio).not.toBeChecked();
  });

  test("lets the artist select a Creative Commons license at upload", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/upload-artwork");

    const licenseGroup = page.getByRole("radiogroup");
    await licenseGroup
      .locator("label", { hasText: "CC BY-NC-SA 4.0" })
      .getByRole("radio")
      .check();

    // The selected-license summary updates with permissions and official terms.
    await expect(
      page.getByText(/NonCommercial-ShareAlike 4.0 International/),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "View Full License Terms" }),
    ).toBeVisible();
  });

  test("shows the license on the artwork page and persists a change", async ({
    authenticatedPage: page,
  }) => {
    // Navigate to the first artwork the artist owns.
    await page.goto("/profile");
    await page.getByRole("link", { name: /artwork/i }).first().click();

    await expect(page.getByText("License & Usage Permissions")).toBeVisible();

    // Open the license editor from the artwork page.
    await page.getByRole("button", { name: "Change License" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Pick a different license and continue to the confirmation step.
    await dialog
      .locator("label", { hasText: "CC BY-NC 4.0" })
      .getByRole("radio")
      .check();
    await dialog.getByRole("button", { name: "Continue" }).click();

    // Confirmation shows current vs new license before saving.
    await expect(page.getByText("Change Artwork License?")).toBeVisible();
    await expect(page.getByText("Current license")).toBeVisible();
    await expect(page.getByText("New license")).toBeVisible();

    await dialog.getByRole("button", { name: "Confirm Change" }).click();

    // The updated license is reflected on the page.
    await expect(page.getByText(CC_BY_NC).first()).toBeVisible();

    // Persisted: a reload still shows the new license.
    await page.reload();
    await expect(page.getByText(CC_BY_NC).first()).toBeVisible();

    // Restore the default license so repeat runs stay deterministic.
    await page.getByRole("button", { name: "Change License" }).click();
    await dialog
      .locator("label", { hasText: ARR })
      .getByRole("radio")
      .check();
    await dialog.getByRole("button", { name: "Continue" }).click();
    await dialog.getByRole("button", { name: "Confirm Change" }).click();
    await expect(page.getByText(ARR).first()).toBeVisible();
  });

  test("displays the license on the public community post page", async ({
    page,
  }) => {
    await page.goto("/community");
    await page.getByRole("link").first().click();

    // Public display uses the full descriptive name, not a bare identifier.
    await expect(
      page.getByText(new RegExp(`${ARR}|Creative Commons`)).first(),
    ).toBeVisible();
    await expect(
      page.getByText(
        /usage terms selected by the artwork creator/i,
      ),
    ).toBeVisible();
  });

  test("does not allow another artist to change someone else's license", async ({
    authenticatedPage: page,
  }) => {
    // Capture an artwork URL owned by the primary test user.
    await page.goto("/profile");
    const artworkHref = await page
      .getByRole("link", { name: /artwork/i })
      .first()
      .getAttribute("href");

    // Second account (unauthorized viewer).
    const second = await page.context().newPage();
    const email = process.env.TEST_USER_2_EMAIL ?? "seconduser@example.com";
    const password = process.env.TEST_USER_2_PASSWORD ?? "secondpassword123";
    await second.goto("/login");
    await second.getByLabel(/email/i).fill(email);
    await second.getByLabel(/password/i).fill(password);
    await second.getByRole("button", { name: /log in|sign in/i }).click();
    await second.waitForURL(/dashboard|profile|\//);

    // The owner-scoped detail page is not accessible, and no change control
    // is rendered for a non-owner.
    await second.goto(artworkHref ?? "/profile");
    await expect(
      second.getByRole("button", { name: "Change License" }),
    ).toHaveCount(0);

    await second.close();
  });
});
