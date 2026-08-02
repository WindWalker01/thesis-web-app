import { test, expect } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Regression tests for the report notification ownership bug.
 *
 * Background:
 *   When a community user submits a report, two notifications must be created
 *   by the database triggers:
 *     1. Reporter notification  -> user_id = reporter,  title "Report Submitted"
 *     2. Admin notification     -> user_id = admin,     title "New Report Submitted"
 *
 * Bug observed:
 *   The admin dashboard showed the reporter's "Your report ..." message.
 *   Root cause: a notifications row addressed to the admin's user_id but
 *   carrying the reporter-only content (trigger drift / duplicate-insert
 *   race on the unique index `uq_notifications_report_event`).
 *
 * These tests assert the notification rows directly in the database after a
 * report insert (the triggers fire on INSERT), verifying the recipient split.
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

const REPORTER_MESSAGE_PREFIX = "Your report ";
const ADMIN_MESSAGE_PREFIX = "A new report ";

function uuid() {
  return crypto.randomUUID();
}

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

test.describe("report notification ownership", () => {
  // Skip all tests in this file when the DB is unavailable.
  test.skip(!admin, "SUPABASE_SERVICE_ROLE_KEY not configured");

  let reporterId: string;
  let adminId: string;
  let artworkId: string;
  let postId: string;

  test.beforeAll(async () => {
    // ── Create a reporter and an admin test user ──
    const reporterEmail = uniqueEmail("reporter");
    const adminEmail = uniqueEmail("admin");

    const { data: reporter, error: reporterError } =
      await admin.auth.admin.createUser({
        email: reporterEmail,
        password: "testpassword123",
        email_confirm: true,
      });
    if (reporterError) throw reporterError;
    reporterId = reporter.user!.id;

    const { data: adminUser, error: adminError } =
      await admin.auth.admin.createUser({
        email: adminEmail,
        password: "testpassword123",
        email_confirm: true,
      });
    if (adminError) throw adminError;
    adminId = adminUser.user!.id;

    // The `users` table mirrors `auth.users` via handle_new_user trigger.
    // Set roles explicitly.
    const { error: setReporterRole } = await admin
      .from("users")
      .update({ role: "user" })
      .eq("id", reporterId);
    if (setReporterRole) throw setReporterRole;

    const { error: setAdminRole } = await admin
      .from("users")
      .update({ role: "admin" })
      .eq("id", adminId);
    if (setAdminRole) throw setAdminRole;

    // ── Create a registered artwork + art post to report ──
    const { data: art, error: artError } = await admin
      .from("registered_arts")
      .insert({
        owner_id: reporterId,
        title: `Regression Artwork ${Date.now()}`,
        file_hash: `hash-${uuid()}`,
        perceptual_hash: `phash-${uuid()}`,
        status: "active",
      })
      .select()
      .single();
    if (artError) throw artError;
    artworkId = art.id;

    const { data: post, error: postError } = await admin
      .from("art_posts")
      .insert({
        art_id: artworkId,
        user_id: reporterId,
        visibility: "public",
      })
      .select()
      .single();
    if (postError) throw postError;
    postId = post.id;
  });

  test.afterAll(async () => {
    // Clean up test users (cascades to users, reports, notifications, etc.)
    if (reporterId) {
      await admin.auth.admin.deleteUser(reporterId, true);
    }
    if (adminId) {
      await admin.auth.admin.deleteUser(adminId, true);
    }
  });

  test("submitting a report splits notifications correctly between reporter and admin", async () => {
    // ── Insert a report (the AFTER INSERT triggers fire here) ──
    const reportTitle = `Spam regression report ${Date.now()}`;

    const { data: report, error: reportError } = await admin
      .from("reports")
      .insert({
        reporter_id: reporterId,
        reported_art_post_id: postId,
        report_type: "spam",
        title: reportTitle,
        description: "Spam or misleading report",
      })
      .select()
      .single();
    if (reportError) throw reportError;

    // ── Fetch all notifications generated for this report ──
    const { data: notifications, error: notifError } = await admin
      .from("notifications")
      .select(
        "id, user_id, type, title, message, related_report_id, action_url, is_read",
      )
      .eq("related_report_id", report.id)
      .eq("type", "report_submitted");

    if (notifError) throw notifError;
    expect(notifications, "notifications for report should exist").toBeTruthy();

    const rows = (notifications ?? []) as Array<{
      user_id: string;
      title: string;
      message: string;
      action_url: string;
      is_read: boolean;
    }>;

    const reporterRows = rows.filter((n) => n.user_id === reporterId);
    const adminRows = rows.filter((n) => n.user_id === adminId);

    // 1. Reporter receives the reporter notification.
    expect(
      reporterRows.length,
      "reporter should receive exactly one notification",
    ).toBe(1);
    expect(reporterRows[0].title).toBe("Report Submitted");
    expect(reporterRows[0].message).toContain(REPORTER_MESSAGE_PREFIX);
    expect(reporterRows[0].action_url).toBe(`/my-reports/${report.id}`);
    expect(reporterRows[0].is_read).toBe(false);

    // 2. Admin receives the admin notification.
    expect(
      adminRows.length,
      "admin should receive exactly one notification",
    ).toBe(1);
    expect(adminRows[0].title).toBe("New Report Submitted");
    expect(adminRows[0].message).toContain(ADMIN_MESSAGE_PREFIX);
    expect(adminRows[0].action_url).toBe(`/admin/reports/${report.id}`);
    expect(adminRows[0].is_read).toBe(false);

    // 3. Admin must NEVER receive the reporter notification.
    const adminReporterMessages = adminRows.filter((n) =>
      n.message.startsWith(REPORTER_MESSAGE_PREFIX),
    );
    expect(
      adminReporterMessages,
      "admin must not receive the reporter 'Your report ...' message",
    ).toHaveLength(0);

    // 4. Reporter must NEVER receive the admin notification.
    const reporterAdminMessages = reporterRows.filter((n) =>
      n.message.startsWith(ADMIN_MESSAGE_PREFIX),
    );
    expect(
      reporterAdminMessages,
      "reporter must not receive the admin 'A new report ...' message",
    ).toHaveLength(0);
  });
});
