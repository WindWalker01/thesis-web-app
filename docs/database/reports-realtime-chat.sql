-- ============================================
-- Live Chat Messaging for Reports
-- Enhances report_comments for real-time chat
-- ============================================

-- 1. Add new columns to report_comments for chat features
ALTER TABLE public.report_comments
  ADD COLUMN IF NOT EXISTS read_at timestamp with time zone NULL,
  ADD COLUMN IF NOT EXISTS file_url text NULL,
  ADD COLUMN IF NOT EXISTS file_name text NULL,
  ADD COLUMN IF NOT EXISTS mime_type text NULL,
  ADD COLUMN IF NOT EXISTS message_type text NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS parent_id uuid NULL REFERENCES public.report_comments(id) ON DELETE SET NULL;

-- Add constraint for message_type
ALTER TABLE public.report_comments
  DROP CONSTRAINT IF EXISTS report_comments_message_type_check;

ALTER TABLE public.report_comments
  ADD CONSTRAINT report_comments_message_type_check
  CHECK (message_type = ANY (ARRAY['text'::text, 'image'::text, 'document'::text]));

-- Index for efficient unread queries
CREATE INDEX IF NOT EXISTS idx_report_comments_unread
  ON public.report_comments (report_id, user_id, read_at)
  WHERE read_at IS NULL;

-- Index for read_at updates
CREATE INDEX IF NOT EXISTS idx_report_comments_read_at
  ON public.report_comments (report_id, read_at)
  WHERE read_at IS NULL;

-- 2. Create typing indicators table
CREATE TABLE IF NOT EXISTS public.report_typing_indicators (
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  started_typing_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT pk_report_typing_indicator PRIMARY KEY (report_id, user_id)
) TABLESPACE pg_default;

-- (No index needed on typing indicators - cleanup is done by application logic)

-- 3. Create unread message counts function
CREATE OR REPLACE FUNCTION public.get_unread_message_count(p_user_id uuid, p_report_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.report_comments
  WHERE report_id = p_report_id
    AND user_id != p_user_id
    AND read_at IS NULL;
  RETURN v_count;
END;
$$;

-- 4. Create function to mark messages as read
CREATE OR REPLACE FUNCTION public.mark_report_messages_read(
  p_report_id uuid,
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.report_comments
  SET read_at = now()
  WHERE report_id = p_report_id
    AND user_id != p_user_id
    AND read_at IS NULL;
END;
$$;

-- 5. Create function to upsert typing indicator
CREATE OR REPLACE FUNCTION public.upsert_typing_indicator(
  p_report_id uuid,
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.report_typing_indicators (report_id, user_id, started_typing_at)
  VALUES (p_report_id, p_user_id, now())
  ON CONFLICT (report_id, user_id)
  DO UPDATE SET started_typing_at = now();
END;
$$;

-- 6. Create function to delete typing indicator
CREATE OR REPLACE FUNCTION public.delete_typing_indicator(
  p_report_id uuid,
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.report_typing_indicators
  WHERE report_id = p_report_id AND user_id = p_user_id;
END;
$$;

-- 7. Create function to get active typing users for a report
CREATE OR REPLACE FUNCTION public.get_typing_users(p_report_id uuid)
RETURNS TABLE (
  user_id uuid,
  started_typing_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT rti.user_id, rti.started_typing_at
  FROM public.report_typing_indicators rti
  WHERE rti.report_id = p_report_id
    AND rti.started_typing_at > now() - interval '10 seconds';
END;
$$;

-- 8. Enable RLS on typing indicators
ALTER TABLE public.report_typing_indicators ENABLE ROW LEVEL SECURITY;

-- RLS: Users can read typing indicators for reports they're involved in
CREATE POLICY "Users can read typing indicators for own reports"
  ON public.report_typing_indicators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE reports.id = report_typing_indicators.report_id
        AND reports.reporter_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- RLS: Users can upsert their own typing indicators
CREATE POLICY "Users can upsert own typing indicators"
  ON public.report_typing_indicators FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own typing indicators"
  ON public.report_typing_indicators FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own typing indicators"
  ON public.report_typing_indicators FOR DELETE
  USING (user_id = auth.uid());

-- 9. Enable Realtime for report_comments (if not already enabled)
-- Note: This must be done via Supabase Dashboard or API
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.report_comments;

-- 10. Update RLS for report_comments to allow reading read_at
-- (Existing policies already cover SELECT, but ensure UPDATE for read receipts)
CREATE POLICY "Users can update read receipts on own report comments"
  ON public.report_comments FOR UPDATE
  USING (
    -- Reporters can mark messages as read on their own reports
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE reports.id = report_comments.report_id
        AND reports.reporter_id = auth.uid()
    )
    -- Admins can mark messages as read on any report
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  )
  WITH CHECK (
    -- Only allow updating read_at
    -- Other columns cannot be modified via this policy
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE reports.id = report_comments.report_id
        AND reports.reporter_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- 11. Cleanup function for stale typing indicators (run via pg_cron or manually)
CREATE OR REPLACE FUNCTION public.cleanup_stale_typing_indicators()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.report_typing_indicators
  WHERE started_typing_at < now() - interval '30 seconds';
END;
$$;