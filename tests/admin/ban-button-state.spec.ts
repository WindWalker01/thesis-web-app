import { test, expect } from "../fixtures";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { AdminUsersPage } from "../page-objects/admin-users.page";
import { waitForTableData, waitForToast } from "../helpers/wait-for";

/**
 * Regression tests for the "Ban button remains available after a user is banned"
 * bug.
 *
 * Background:
 *   `users.account_status` is the authoritative source for whether a Ban action
 *   is available: active/suspended → Ban available, banned → Ban unavailable.
 *
 * Regression coverage here:
 *   1. After a user is banned, the row dropdown hides the Ban action and shows
 *      a disabled "Banned" informational item instead.
 *   2. Bulk "Ban Selected" / "Suspend Selected" are disabled when the selection
 *      contains an already-banned user.
 *
 * NOTE: These tests require DB access. They are skipped unless
 * `SUPABASE_SERVICE_ROLE_KEY` is available in the environment.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const admin: SupabaseClient =
  url && serviceRoleKey
    ? createClient(url, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : (null as unknown as SupabaseClient);

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

test.describe("ban button state after user is banned", () => {
  // Skip all tests in this file when the DB is unavailable.
  test.skip(!admin, "SUPABASE_SERVICE_ROLE_KEY not configured");

  let targetUserId: string;
  let targetUsername: string;

  test.beforeAll(async () => {
    // ── Create a non-admin test user to ban ──
    const targetEmail = uniqueEmail("banstate");

    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email: targetEmail,
        password: "testpassword123",
        email_confirm: true,
      });
    if (createError) throw createError;
    targetUserId = created.user!.id;

    // The `users` table mirrors `auth.users` via handle_new_user trigger.
    const { error: roleError } = await admin
      .from("users")
      .update({ role: "user", username: `banstate_${Date.now()}` })
      .eq("id", targetUserId);
    if (roleError) throw roleError;

    const { data: profile } = await admin
      .from("users")
      .select("username")
      .eq("id", targetUserId)
      .single();
    targetUsername = profile?.username ?? targetEmail;
  });

  test.afterAll(async () => {
    if (targetUserId) {
      await admin.auth.admin.deleteUser(targetUserId, true);
    }
  });

  test("row dropdown hides Ban and shows a disabled Banned item after the user is banned", async ({
    adminPage,
  }) => {
    const usersPage = new AdminUsersPage(adminPage);
    await usersPage.goto();
    await waitForTableData(adminPage);

    // Search for the target user to reduce table noise.
    await usersPage.searchUser(targetUsername);
    await waitForTableData(adminPage);

    // Ban the user via the row dropdown.
    await usersPage.banUser(targetUserId);

    // Wait for the success toast confirming the ban.
    await waitForToast(adminPage, {
      text: "banned",
    });

    // Re-query to guarantee up-to-date account_status.
    const { data: afterBan } = await admin
      .from("users")
      .select("account_status")
      .eq("id", targetUserId)
      .single();
    expect(afterBan?.account_status).toBe("banned");

    // The row dropdown must NOT show the Ban item after refetch.
    await usersPage.openUserMenu(targetUsername);
    await expect(
      adminPage.locator(`[data-testid="ban-${targetUserId}"]`),
    ).toHaveCount(0);
    await expect(
      adminPage.locator(`[data-testid="banned-${targetUserId}"]`),
    ).toBeVisible();
    await expect(
      adminPage.getByRole("menuitem", { name: /banned/i }),
    ).toBeVisible();
  });

  test("bulk Ban/Suspend buttons are disabled when a banned user is selected", async ({
    adminPage,
  }) => {
    const usersPage = new AdminUsersPage(adminPage);
    await usersPage.goto();
    await waitForTableData(adminPage);

    // Ensure the target user is banned for this test.
    const { data: current } = await admin
      .from("users")
      .select("account_status")
      .eq("id", targetUserId)
      .single();
    if (current?.account_status !== "banned") {
      await admin
        .from("users")
        .update({ account_status: "banned" })
        .eq("id", targetUserId);
    }

    await usersPage.searchUser(targetUsername);
    await waitForTableData(adminPage);

    // Select the banned user's row checkbox.
    await usersPage.selectRow(targetUsername);

    // The bulk action bar appears and the moderation buttons are disabled.
    await expect(usersPage.banButton).toBeDisabled();
    await expect(usersPage.suspendButton).toBeDisabled();
    await expect(
      adminPage.getByRole("button", { name: /verify selected/i }),
    ).toBeEnabled();
  });
});
