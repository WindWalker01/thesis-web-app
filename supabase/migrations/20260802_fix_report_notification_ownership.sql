-- ============================================
-- Fix Report Notification Ownership
-- ============================================
-- Problem: admin dashboard can display the reporter-only
-- "Your report ..." notification if a notifications row was
-- inserted with an admin's user_id but reporter content
-- (old/drifted trigger) OR if duplicate inserts raced.
--
-- 1. Re-assert the two trigger functions with correct recipients.
-- 2. Repair any misdirected reporter notifications.

-- 1a. Reporter trigger -> user_id = NEW.reporter_id
CREATE OR REPLACE FUNCTION public.notify_report_submitted_to_reporter()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id, type, title, message,
    related_report_id, action_url, metadata, is_read
  ) VALUES (
    NEW.reporter_id,
    'report_submitted',
    'Report Submitted',
    'Your report "' || COALESCE(NEW.title, 'Untitled') || '" has been submitted successfully. An administrator will review it shortly.',
    NEW.id,
    '/my-reports/' || NEW.id,
    '{}'::jsonb,
    false
  )
  ON CONFLICT (user_id, related_report_id, type)
  WHERE related_report_id IS NOT NULL
  DO NOTHING;

  RETURN NEW;
END;
$$;

-- 1b. Admin trigger -> user_id IN (all users with role='admin')
CREATE OR REPLACE FUNCTION public.notify_report_submitted_to_admins()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_artwork_title text;
BEGIN
  BEGIN
    SELECT COALESCE(ra.title, 'Unknown Artwork') INTO v_artwork_title
    FROM public.art_posts ap
    JOIN public.registered_arts ra ON ra.id = ap.art_id
    WHERE ap.id = NEW.reported_art_post_id;
  EXCEPTION WHEN OTHERS THEN
    v_artwork_title := 'Unknown Artwork';
  END;

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

-- 2. Repair misdirected reporter notifications (Case A data fix):
-- any report_submitted row with the reporter-only "Your report ..."
-- message must belong to the actual report's reporter.
UPDATE public.notifications n
SET user_id = r.reporter_id
FROM public.reports r
WHERE n.related_report_id = r.id
  AND n.type = 'report_submitted'
  AND n.message LIKE 'Your report % has been submitted successfully%'
  AND n.user_id <> r.reporter_id;