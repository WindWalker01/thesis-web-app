-- ============================================================================
-- Fix: reports.reported_art_post_id FK → ON DELETE SET NULL
-- ============================================================================
-- The FK currently has NO ON DELETE clause (which defaults to NO ACTION),
-- meaning deleting an art_post that has reports is blocked.
-- 
-- Changing to ON DELETE SET NULL preserves report history while allowing
-- art_post deletion. Reports keep their audit trail with a null reference.
-- ============================================================================

-- 1. Drop the existing FK
ALTER TABLE "public"."reports"
  DROP CONSTRAINT IF EXISTS "reports_reported_art_post_id_fkey";

-- 2. Re-create with ON DELETE SET NULL
ALTER TABLE "public"."reports"
  ADD CONSTRAINT "reports_reported_art_post_id_fkey"
  FOREIGN KEY ("reported_art_post_id")
  REFERENCES "public"."art_posts"("id")
  ON DELETE SET NULL;