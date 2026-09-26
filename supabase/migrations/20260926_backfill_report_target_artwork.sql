-- -----------------------------------------------------------------------------
-- Backfill `reports.target_id` for artwork-targeted reports created before the
-- `target_type` / `target_id` link was written by the reporting flows.
--
-- Why: the community "Report artwork" flow used to insert only
-- `reported_art_post_id`, so `target_id` stayed NULL. `target_id` is the
-- canonical report -> artwork link (it is the only link for plagiarism matches
-- whose artwork has no public community post), and admin tooling falls back to
-- it when resolving the reported artwork.
--
-- What: for every artwork-targeted report without a `target_id` but with a
-- `reported_art_post_id`, set `target_id` to the artwork that post belongs to
-- (`art_posts.art_id`).
--
-- Note: idempotent and safe to re-run. Reports with neither `target_id` nor a
-- `reported_art_post_id` (unresolvable links) are intentionally left untouched.
-- -----------------------------------------------------------------------------
UPDATE public.reports r
SET target_id = ap.art_id
FROM public.art_posts ap
WHERE r.target_type = 'artwork'
  AND r.target_id IS NULL
  AND r.reported_art_post_id IS NOT NULL
  AND ap.id = r.reported_art_post_id
  AND ap.art_id IS NOT NULL;
