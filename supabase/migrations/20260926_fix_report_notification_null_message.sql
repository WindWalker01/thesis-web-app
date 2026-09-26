-- =============================================================================
-- Fix report notification NULL message on plagiarism reports
-- =============================================================================
-- When a copyright report is created from the plagiarism checker for an
-- INTERNAL match whose artwork has no public community post, `reports`
-- is inserted with `reported_art_post_id = NULL` (the match is linked via
-- target_type='artwork' + target_id instead).
--
-- The old `notify_report_submitted_to_admins()` trigger resolved the artwork
-- title via `ap.id = NEW.reported_art_post_id`; with a NULL id the SELECT
-- returned no rows, leaving `v_artwork_title` NULL. SQL string concatenation
-- then made the whole notification `message` NULL, violating
-- `notifications.message NOT NULL`.
--
-- Fix: default the title to 'Unknown Artwork' and, for artwork-targeted
-- reports without an art_post, resolve the matched artwork title directly from
-- `registered_arts` via target_id.
CREATE OR REPLACE FUNCTION public.notify_report_submitted_to_admins()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_artwork_title text := 'Unknown Artwork';
BEGIN
  IF NEW.reported_art_post_id IS NOT NULL THEN
    BEGIN
      SELECT COALESCE(ra.title, 'Unknown Artwork') INTO v_artwork_title
      FROM public.art_posts ap
      JOIN public.registered_arts ra ON ra.id = ap.art_id
      WHERE ap.id = NEW.reported_art_post_id;
    EXCEPTION WHEN OTHERS THEN
      v_artwork_title := 'Unknown Artwork';
    END;
  ELSIF NEW.target_type = 'artwork' AND NEW.target_id IS NOT NULL THEN
    BEGIN
      SELECT COALESCE(ra.title, 'Unknown Artwork') INTO v_artwork_title
      FROM public.registered_arts ra
      WHERE ra.id = NEW.target_id;
    EXCEPTION WHEN OTHERS THEN
      v_artwork_title := 'Unknown Artwork';
    END;
  END IF;

  INSERT INTO public.notifications (
    user_id, type, title, message,
    related_report_id, action_url, metadata, is_read
  )
  SELECT
    u.id,
    'report_submitted',
    'New Report Submitted',
    'A new report "' || COALESCE(NEW.title, 'Untitled') || '" has been submitted for artwork "' || v_artwork_title || '".',
    NEW.id,
    '/admin/reports/' || NEW.id,
    '{}'::jsonb,
    false
  FROM public.users u
  WHERE u.role = 'admin'
  ON CONFLICT (user_id, related_report_id, type)
  WHERE related_report_id IS NOT NULL
  DO NOTHING;

  RETURN NEW;
END;
$$;
