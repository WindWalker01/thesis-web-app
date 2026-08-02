-- ============================================
-- Allow Reporters to Log Evidence Uploads in report_actions
-- ============================================
-- Problem: A normal reporter uploading evidence to their own report
-- triggered a user-side INSERT into `report_actions` with
-- `admin_id = auth.uid()` (their own non-admin id). The existing
-- INSERT policy ("Admins can insert report actions") requires
-- `users.role = 'admin'`, so the insert was denied:
--   new row violates row-level security policy for table "report_actions"
--
-- Fix: Add a NARROW, self-attributed, ownership-scoped INSERT policy for
-- reporter-originated actions. PostgreSQL combines multiple permissive
-- policies with OR, so the existing admin-only policy is unchanged.
--
-- Security invariants enforced by this policy:
--   1. RLS remains enabled on report_actions.
--   2. `admin_id` MUST equal the current auth.uid() (self-attribution;
--      a user cannot impersonate an admin or another user).
--   3. Only user-originated action types are allowed
--      (evidence_uploaded, report_created). Admin-only actions such as
--      status_change / decision_recorded / comment_added / evidence_requested
--      remain admin-only.
--   4. The report must belong to the current user
--      (reports.reporter_id = auth.uid()).
--
-- RLS regression checklist (verify after applying):
--   - Reporter INSERT (admin_id = self, action = 'evidence_uploaded') on
--     own report            -> ALLOWED
--   - Reporter INSERT with action = 'status_change' on own report
--                           -> DENIED
--   - Reporter INSERT on another user's report
--                           -> DENIED
--   - Reporter INSERT with admin_id = <other user> on own report
--                           -> DENIED
--   - Admin INSERT on any report
--                           -> ALLOWED (existing admin policy)
--   - ALTER TABLE ... ENABLE ROW LEVEL SECURITY remains in place
--     (verify: SELECT relrowsecurity FROM pg_class
--      WHERE relname = 'report_actions'; -- should be true)

CREATE POLICY "Reporters can record evidence on own reports"
ON "public"."report_actions"
FOR INSERT
WITH CHECK (
  "admin_id" = "auth"."uid"()
  AND "action" IN ('evidence_uploaded', 'report_created')
  AND EXISTS (
    SELECT 1 FROM "public"."reports" "r"
    WHERE "r"."id" = "report_actions"."report_id"
      AND "r"."reporter_id" = "auth"."uid"()
  )
);