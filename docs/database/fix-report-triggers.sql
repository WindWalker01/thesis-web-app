-- ============================================
-- Fix: Report trigger functions use wrong column name
-- 
-- Problem: The notify_report_resolved() function references
-- NEW.report_art_id, but the actual column in the reports table
-- is called reported_art_post_id. This causes the error:
--   "record 'new' has no field 'report_art_id'"
-- whenever a report status is updated.
--
-- Additionally, the trigger functions can conflict with application-level
-- notification inserts (unique constraint uq_notifications_report_event).
-- ON CONFLICT DO NOTHING is added to prevent duplicate key errors.
-- ============================================

-- Drop the old trigger first
DROP TRIGGER IF EXISTS trg_notify_report_resolved ON public.reports;

-- Replace the broken function
CREATE OR REPLACE FUNCTION public.notify_report_resolved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_report_title text;
BEGIN
  -- Only proceed if the status changed to 'resolved' and wasn't already resolved
  IF NEW.status = 'resolved' AND (OLD.status IS DISTINCT FROM 'resolved') THEN
    
    -- Get the report title
    v_report_title := COALESCE(NEW.title, 'Report #' || NEW.id);
    
    -- Notify the reporter (skip if application code already inserted this)
    INSERT INTO public.notifications (
      user_id, type, title, message,
      related_report_id, action_url, metadata, is_read
    ) VALUES (
      NEW.reporter_id,
      'report_resolved',
      'Report Resolved',
      'Your report "' || v_report_title || '" has been resolved.',
      NEW.id,
      '/my-reports/' || NEW.id,
      '{}'::jsonb,
      false
    )
    ON CONFLICT (user_id, related_report_id, type) 
    WHERE related_report_id IS NOT NULL
    DO NOTHING;
    
    -- Notify all admins (except the reporter if they're an admin)
    INSERT INTO public.notifications (
      user_id, type, title, message,
      related_report_id, action_url, metadata, is_read
    )
    SELECT 
      u.id,
      'report_resolved',
      'Report Resolved',
      'Report "' || v_report_title || '" has been resolved.',
      NEW.id,
      '/admin/reports/' || NEW.id,
      '{}'::jsonb,
      false
    FROM public.users u
    WHERE u.role = 'admin' 
      AND u.id != NEW.reporter_id
    ON CONFLICT (user_id, related_report_id, type) 
    WHERE related_report_id IS NOT NULL
    DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER trg_notify_report_resolved
  AFTER UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_report_resolved();

-- ============================================
-- Also fix notify_report_submitted_to_admins
-- ============================================

CREATE OR REPLACE FUNCTION public.notify_report_submitted_to_admins()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_artwork_title text;
BEGIN
  -- Get the artwork title from the art post relationship
  BEGIN
    SELECT COALESCE(ra.title, 'Unknown Artwork') INTO v_artwork_title
    FROM public.art_posts ap
    JOIN public.registered_arts ra ON ra.id = ap.art_id
    WHERE ap.id = NEW.reported_art_post_id;
  EXCEPTION WHEN OTHERS THEN
    v_artwork_title := 'Unknown Artwork';
  END;
  
  -- Notify all admins (skip if application code already inserted)
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

-- Drop and recreate the admin trigger
DROP TRIGGER IF EXISTS trg_notify_report_submitted_to_admins ON public.reports;
CREATE TRIGGER trg_notify_report_submitted_to_admins
  AFTER INSERT ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_report_submitted_to_admins();

-- ============================================
-- Also fix notify_report_submitted_to_reporter
-- ============================================

CREATE OR REPLACE FUNCTION public.notify_report_submitted_to_reporter()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Notify the reporter that their report was submitted (skip if app already did)
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

-- Drop and recreate the reporter trigger
DROP TRIGGER IF EXISTS trg_notify_report_submitted_to_reporter ON public.reports;
CREATE TRIGGER trg_notify_report_submitted_to_reporter
  AFTER INSERT ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_report_submitted_to_reporter();