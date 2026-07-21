-- ============================================================================
-- Fix Overly Broad RLS Policies
-- ============================================================================
-- Drops permissive "Enable insert/read for all users" policies that bypass
-- admin-only restrictions, then adds proper restrictive policies.
-- 
-- Run this against your Supabase project SQL editor.
-- All DROP POLICY statements are idempotent (use IF EXISTS).
-- ============================================================================

-- ── 1. DROP overly broad INSERT policies ───────────────────────────────────

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."admin_audit_logs";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."artwork_review_actions";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."artwork_reviews";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."notifications";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."report_actions";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."report_comments";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."report_decisions";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."settings_audit_logs";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."system_settings";

-- ── 2. DROP overly broad SELECT policies ───────────────────────────────────

DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."admin_audit_logs";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."artwork_review_actions";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."artwork_reviews";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."report_actions";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."report_comments";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."report_decisions";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."settings_audit_logs";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."system_settings";

-- ── 3. ADD proper restrictive policies ─────────────────────────────────────

-- 3a. admin_audit_logs — admin-only INSERT + SELECT
CREATE POLICY "admin_audit_logs_insert_admin" ON "public"."admin_audit_logs"
  FOR INSERT TO "authenticated"
  WITH CHECK (EXISTS (
    SELECT 1 FROM "public"."users"
    WHERE "users"."id" = auth.uid() AND "users"."role" = 'admin'
  ));

CREATE POLICY "admin_audit_logs_select_admin" ON "public"."admin_audit_logs"
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM "public"."users"
    WHERE "users"."id" = auth.uid() AND "users"."role" = 'admin'
  ));

-- 3b. artwork_review_actions — admin-only INSERT + SELECT
CREATE POLICY "artwork_review_actions_insert_admin" ON "public"."artwork_review_actions"
  FOR INSERT TO "authenticated"
  WITH CHECK (EXISTS (
    SELECT 1 FROM "public"."users"
    WHERE "users"."id" = auth.uid() AND "users"."role" = 'admin'
  ));

CREATE POLICY "artwork_review_actions_select_admin" ON "public"."artwork_review_actions"
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM "public"."users"
    WHERE "users"."id" = auth.uid() AND "users"."role" = 'admin'
  ));

-- 3c. artwork_reviews — admin-only INSERT + SELECT
CREATE POLICY "artwork_reviews_insert_admin" ON "public"."artwork_reviews"
  FOR INSERT TO "authenticated"
  WITH CHECK (EXISTS (
    SELECT 1 FROM "public"."users"
    WHERE "users"."id" = auth.uid() AND "users"."role" = 'admin'
  ));

CREATE POLICY "artwork_reviews_select_admin" ON "public"."artwork_reviews"
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM "public"."users"
    WHERE "users"."id" = auth.uid() AND "users"."role" = 'admin'
  ));

-- 3d. notifications — keep existing user-owned policies; add admin select
-- (INSERT for notifications is handled by trigger functions using SECURITY DEFINER)
CREATE POLICY "notifications_insert_admin" ON "public"."notifications"
  FOR INSERT TO "authenticated"
  WITH CHECK (EXISTS (
    SELECT 1 FROM "public"."users"
    WHERE "users"."id" = auth.uid() AND "users"."role" = 'admin'
  ));

CREATE POLICY "notifications_select_admin" ON "public"."notifications"
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM "public"."users"
    WHERE "users"."id" = auth.uid() AND "users"."role" = 'admin'
  ));

-- 3e. report_actions — reporter + admin SELECT (insert already has admin policy L1937)
DROP POLICY IF EXISTS "Admins can read all report actions" ON "public"."report_actions";

CREATE POLICY "report_actions_select_reporter_or_admin" ON "public"."report_actions"
  FOR SELECT USING (
    (EXISTS (SELECT 1 FROM "public"."reports"
      WHERE "reports"."id" = "report_actions"."report_id"
        AND "reports"."reporter_id" = auth.uid()))
    OR EXISTS (SELECT 1 FROM "public"."users"
      WHERE "users"."id" = auth.uid() AND "users"."role" = 'admin')
  );

-- 3f. report_comments — reporter + admin SELECT (insert already has policies L1919+L2043)
DROP POLICY IF EXISTS "Admins can read all report comments" ON "public"."report_comments";

CREATE POLICY "report_comments_select_reporter_or_admin" ON "public"."report_comments"
  FOR SELECT USING (
    (EXISTS (SELECT 1 FROM "public"."reports"
      WHERE "reports"."id" = "report_comments"."report_id"
        AND "reports"."reporter_id" = auth.uid()))
    OR EXISTS (SELECT 1 FROM "public"."users"
      WHERE "users"."id" = auth.uid() AND "users"."role" = 'admin')
  );

-- 3g. report_decisions — reporter + admin SELECT (insert already has policy L1943)
DROP POLICY IF EXISTS "Admins can read all report decisions" ON "public"."report_decisions";

CREATE POLICY "report_decisions_select_reporter_or_admin" ON "public"."report_decisions"
  FOR SELECT USING (
    (EXISTS (SELECT 1 FROM "public"."reports"
      WHERE "reports"."id" = "report_decisions"."report_id"
        AND "reports"."reporter_id" = auth.uid()))
    OR EXISTS (SELECT 1 FROM "public"."users"
      WHERE "users"."id" = auth.uid() AND "users"."role" = 'admin')
  );

-- 3h. report_evidence — reporter + admin SELECT (already has L1985 for admin, L2149 for reporter)
-- No changes needed — the existing policies are already properly scoped

-- 3i. settings_audit_logs — admin-only INSERT + SELECT
CREATE POLICY "settings_audit_logs_insert_admin" ON "public"."settings_audit_logs"
  FOR INSERT TO "authenticated"
  WITH CHECK (EXISTS (
    SELECT 1 FROM "public"."users"
    WHERE "users"."id" = auth.uid() AND "users"."role" = 'admin'
  ));

CREATE POLICY "settings_audit_logs_select_admin" ON "public"."settings_audit_logs"
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM "public"."users"
    WHERE "users"."id" = auth.uid() AND "users"."role" = 'admin'
  ));

-- 3j. system_settings — authenticated read (needed by middleware maintenance check),
--     admin-only INSERT/UPDATE/DELETE
DROP POLICY IF EXISTS "Admins can read system_settings" ON "public"."system_settings";

CREATE POLICY "system_settings_select_authenticated" ON "public"."system_settings"
  FOR SELECT TO "authenticated" USING (true);

-- (Keep existing admin INSERT/UPDATE/DELETE policies at L1955, L2021, L1931)

-- ── 4. FIX: mark_report_messages_read — add authorization check ─────────────

DROP FUNCTION IF EXISTS "public"."mark_report_messages_read"("p_report_id" "uuid", "p_user_id" "uuid");

CREATE OR REPLACE FUNCTION "public"."mark_report_messages_read"("p_report_id" "uuid", "p_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Authorization: only the report's reporter or an admin may mark messages as read
  IF NOT EXISTS (
    SELECT 1 FROM "public"."reports" r
    WHERE r.id = p_report_id
      AND (r.reporter_id = p_user_id OR r.reporter_id = auth.uid())
  ) THEN
    -- Check if caller is admin
    IF NOT EXISTS (
      SELECT 1 FROM "public"."users" u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Not authorized to mark messages as read on this report.';
    END IF;
  END IF;

  UPDATE public.report_comments
  SET read_at = now()
  WHERE report_id = p_report_id
    AND user_id != p_user_id
    AND read_at IS NULL;
END;
$$;

ALTER FUNCTION "public"."mark_report_messages_read"("p_report_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."mark_report_messages_read"("p_report_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."mark_report_messages_read"("p_report_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_report_messages_read"("p_report_id" "uuid", "p_user_id" "uuid") TO "service_role";