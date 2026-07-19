-- ============================================
-- Migration: Create user_warnings table
-- Tracks warnings issued to users by administrators
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_warnings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  admin_id uuid NOT NULL,
  report_id uuid NULL,
  reason text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_warnings_pkey PRIMARY KEY (id),
  CONSTRAINT user_warnings_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT user_warnings_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT user_warnings_report_id_fkey FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE SET NULL
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_user_warnings_user_id ON public.user_warnings USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_user_warnings_admin_id ON public.user_warnings USING btree (admin_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_user_warnings_created_at ON public.user_warnings USING btree (user_id, created_at DESC) TABLESPACE pg_default;

-- Enable RLS
ALTER TABLE public.user_warnings ENABLE ROW LEVEL SECURITY;

-- Users can read their own warnings
CREATE POLICY "Users can read own warnings"
  ON public.user_warnings FOR SELECT
  USING (user_id = auth.uid());

-- Admins can read all warnings
CREATE POLICY "Admins can read all warnings"
  ON public.user_warnings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admins can insert warnings
CREATE POLICY "Admins can insert warnings"
  ON public.user_warnings FOR INSERT
  WITH CHECK (
    admin_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );