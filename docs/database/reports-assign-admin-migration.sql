-- ============================================
-- Migration: Add assigned_admin_id to reports table
-- Allows tracking which admin is currently assigned to each report
-- ============================================

-- Add the assigned_admin_id column
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS assigned_admin_id uuid NULL;

-- Add foreign key constraint
ALTER TABLE public.reports
  ADD CONSTRAINT reports_assigned_admin_id_fkey
  FOREIGN KEY (assigned_admin_id) REFERENCES users(id)
  ON DELETE SET NULL;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_reports_assigned_admin
  ON public.reports USING btree (assigned_admin_id);

-- Update RLS policy so admins can update the assigned_admin_id field
-- (existing "Admins can update reports" policy already covers this)