-- =============================================================================
-- Plagiarism match reporting & external manual-review support
--
-- Purpose:
--   Allow users to take action on plagiarism matches:
--   * INTERNAL match (registered_arts)  -> reuse the existing `reports` system
--     with report_type = 'copyright', linked to the matched artwork and the
--     similarity scan that produced it.
--   * EXTERNAL match (web/API)          -> reuse the existing `artwork_reviews`
--     manual-artwork-verification system, now able to represent a review
--     request that has no registered_arts row (the original artwork lives only
--     as a plagiarism-check result).
--
-- No destructive changes: existing columns/constraints are preserved, and the
-- new columns are all nullable (or defaulted) so legacy rows are unaffected.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) `reports` — preserve similarity/scan context on a copyright report.
--
--    `reported_art_post_id` was already marked DEPRECATED in the schema docs in
--    favour of `target_type` + `target_id`; the FK is `ON DELETE SET NULL`, so
--    we make the nullable intent explicit. Internal plagiarism reports link the
--    matched registered artwork via target_type='artwork' + target_id, and may
--    leave reported_art_post_id NULL when the matched artwork has no public
--    community post.
-- -----------------------------------------------------------------------------
ALTER TABLE public.reports
  ALTER COLUMN reported_art_post_id DROP NOT NULL;

-- The similarity scan that produced the match (nullable: public-page checks are
-- ephemeral and have no persisted scan).
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS related_scan_id uuid;

-- Similarity context snapshot (match_type, similarity_percentage, source,
-- matched_url, original_hash, detected_at, ...). Evidence for the report.
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

-- -----------------------------------------------------------------------------
-- 2) `artwork_reviews` — support external plagiarism manual-review requests.
--
--    `artwork_id` is NOT NULL today (FK to registered_arts, UNIQUE). External
--    matches from the public plagiarism checker have no registered_arts row, so
--    we relax it to nullable and add explicit columns for the external evidence.
--    Postgres UNIQUE constraints still permit multiple NULL artwork_id values.
-- -----------------------------------------------------------------------------
ALTER TABLE public.artwork_reviews
  ALTER COLUMN artwork_id DROP NOT NULL;

-- Distinguishes the two review origins sharing the same queue.
--   'registration' = existing flow (artwork uploaded, blocked/under review)
--   'external'     = plagiarism-check external-match request
ALTER TABLE public.artwork_reviews
  ADD COLUMN IF NOT EXISTS review_source text NOT NULL DEFAULT 'registration';

-- Who requested the review (nullable for legacy/admin-created rows).
ALTER TABLE public.artwork_reviews
  ADD COLUMN IF NOT EXISTS requested_by uuid;

-- External match evidence (populated only for review_source = 'external').
ALTER TABLE public.artwork_reviews
  ADD COLUMN IF NOT EXISTS external_url text,
  ADD COLUMN IF NOT EXISTS external_source text,
  ADD COLUMN IF NOT EXISTS similarity_percentage numeric(5,2);

-- The similarity scan that produced the external match (nullable: public-page
-- checks are ephemeral and have no persisted scan).
ALTER TABLE public.artwork_reviews
  ADD COLUMN IF NOT EXISTS related_scan_id uuid;

-- Raw external match payload snapshot (source, url, link, similarity, hashes,
-- evidence signals, submitted timestamp, ...).
ALTER TABLE public.artwork_reviews
  ADD COLUMN IF NOT EXISTS match_metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Original artwork context for the reviewer, when the reviewed subject is not a
-- registered_arts row (e.g. a public-page plagiarism check). The image is
-- uploaded to Cloudinary (folder "plagiarism-review") by the client.
ALTER TABLE public.artwork_reviews
  ADD COLUMN IF NOT EXISTS original_artwork_url text,
  ADD COLUMN IF NOT EXISTS original_artwork_title text,
  ADD COLUMN IF NOT EXISTS original_hash text;

-- -----------------------------------------------------------------------------
-- 3) Constraints
-- -----------------------------------------------------------------------------
ALTER TABLE public.artwork_reviews
  ADD CONSTRAINT artwork_reviews_review_source_check
  CHECK (review_source IN ('registration', 'external'));

ALTER TABLE public.artwork_reviews
  ADD CONSTRAINT artwork_reviews_similarity_percentage_check
  CHECK (
    similarity_percentage IS NULL
    OR (similarity_percentage >= 0 AND similarity_percentage <= 100)
  );

-- External requests must carry the requester and the external URL.
ALTER TABLE public.artwork_reviews
  ADD CONSTRAINT artwork_reviews_external_requires_evidence_check
  CHECK (
    review_source <> 'external'
    OR (requested_by IS NOT NULL AND external_url IS NOT NULL)
  );

-- -----------------------------------------------------------------------------
-- 4) Duplicate-prevention index for external review requests.
--
--    Server actions also perform a check-then-insert guard; this index is
--    defense-in-depth against racing duplicate requests. COALESCE maps a null
--    scan id to the zero UUID so (requested_by, external_url) stays unique for
--    ephemeral public-page requests.
-- -----------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uq_artwork_reviews_external_request
  ON public.artwork_reviews (
    requested_by,
    external_url,
    COALESCE(related_scan_id, '00000000-0000-0000-0000-000000000000'::uuid)
  )
  WHERE review_source = 'external';
