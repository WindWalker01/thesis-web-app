-- ============================================
-- Reporting & Complaint Management Migration
-- Additional tables for case management
-- ============================================

-- REPORTS CUSTOM ENUM TYPES
-- These enums are already defined in the database:
-- report_type: 'plagiarism' | 'repost' | 'tracing' | 'commercial_use' | 'counterfeit' | 'ownership_dispute' | 'other'
-- report_status: 'pending_review' | 'under_review' | 'resolved'

-- ============================================
-- 1. REPORT COMMENTS
-- Conversation between reporter and administrators
-- ============================================

create table public.report_comments (
  id uuid not null default gen_random_uuid(),
  report_id uuid not null,
  user_id uuid not null,
  message text not null,
  is_admin boolean not null default false,
  created_at timestamp with time zone not null default now(),
  constraint report_comments_pkey primary key (id),
  constraint report_comments_report_id_fkey foreign key (report_id) references reports (id) on delete cascade,
  constraint report_comments_user_id_fkey foreign key (user_id) references users (id) on delete cascade
) tablespace pg_default;

create index if not exists idx_report_comments_report_id on public.report_comments using btree (report_id) tablespace pg_default;
create index if not exists idx_report_comments_created_at on public.report_comments using btree (report_id, created_at desc) tablespace pg_default;
create index if not exists idx_report_comments_user_id on public.report_comments using btree (user_id) tablespace pg_default;

-- ============================================
-- 2. REPORT EVIDENCE
-- Uploaded evidence files and links
-- ============================================

create table public.report_evidence (
  id uuid not null default gen_random_uuid(),
  report_id uuid not null,
  uploaded_by uuid not null,
  file_url text not null,
  file_name text not null,
  mime_type text null,
  description text null,
  created_at timestamp with time zone not null default now(),
  constraint report_evidence_pkey primary key (id),
  constraint report_evidence_report_id_fkey foreign key (report_id) references reports (id) on delete cascade,
  constraint report_evidence_uploaded_by_fkey foreign key (uploaded_by) references users (id) on delete cascade
) tablespace pg_default;

create index if not exists idx_report_evidence_report_id on public.report_evidence using btree (report_id) tablespace pg_default;
create index if not exists idx_report_evidence_uploaded_by on public.report_evidence using btree (uploaded_by) tablespace pg_default;

-- ============================================
-- 3. REPORT ACTIONS (Audit Trail)
-- Every admin action automatically creates a record
-- ============================================

create table public.report_actions (
  id uuid not null default gen_random_uuid(),
  report_id uuid not null,
  admin_id uuid not null,
  action text not null,
  previous_status public.report_status null,
  new_status public.report_status null,
  notes text null,
  created_at timestamp with time zone not null default now(),
  constraint report_actions_pkey primary key (id),
  constraint report_actions_report_id_fkey foreign key (report_id) references reports (id) on delete cascade,
  constraint report_actions_admin_id_fkey foreign key (admin_id) references users (id) on delete cascade,
  constraint report_actions_action_check check (
    action = any (array[
      'status_change'::text,
      'evidence_requested'::text,
      'evidence_uploaded'::text,
      'comment_added'::text,
      'decision_recorded'::text,
      'report_created'::text
    ])
  )
) tablespace pg_default;

create index if not exists idx_report_actions_report_id on public.report_actions using btree (report_id) tablespace pg_default;
create index if not exists idx_report_actions_admin_id on public.report_actions using btree (admin_id) tablespace pg_default;
create index if not exists idx_report_actions_created_at on public.report_actions using btree (report_id, created_at desc) tablespace pg_default;

-- ============================================
-- 4. REPORT DECISIONS
-- Final resolution for a report
-- ============================================

create table public.report_decisions (
  id uuid not null default gen_random_uuid(),
  report_id uuid not null,
  admin_id uuid not null,
  decision text not null,
  summary text not null,
  created_at timestamp with time zone not null default now(),
  constraint report_decisions_pkey primary key (id),
  constraint report_decisions_report_id_key unique (report_id),
  constraint report_decisions_report_id_fkey foreign key (report_id) references reports (id) on delete cascade,
  constraint report_decisions_admin_id_fkey foreign key (admin_id) references users (id) on delete cascade,
  constraint report_decisions_decision_check check (
    decision = any (array[
      'infringement_confirmed'::text,
      'no_violation'::text,
      'insufficient_evidence'::text,
      'duplicate_report'::text,
      'other'::text
    ])
  )
) tablespace pg_default;

create index if not exists idx_report_decisions_report_id on public.report_decisions using btree (report_id) tablespace pg_default;
create index if not exists idx_report_decisions_admin_id on public.report_decisions using btree (admin_id) tablespace pg_default;

-- ============================================
-- Update notifications type check to include new notification types
-- ============================================

-- Note: The notifications table already has the report_submitted, report_resolved types
-- We need to add report_updated for admin actions on reports
-- Since altering enum check constraints requires dropping and recreating, we handle this
-- via application-level notification creation

-- ============================================
-- Additional indexes for better query performance
-- ============================================

create index if not exists idx_reports_status_created on public.reports using btree (status, created_at desc) tablespace pg_default;
create index if not exists idx_reports_reporter_status on public.reports using btree (reporter_id, status) tablespace pg_default;
create index if not exists idx_reports_report_type on public.reports using btree (report_type) tablespace pg_default;

-- ============================================
-- Storage bucket for report evidence uploads
-- Run this in the Supabase SQL Editor (not in a migration)
-- or create via Supabase Dashboard > Storage > New Bucket
-- ============================================

-- Create the bucket if it doesn't exist
-- NOTE: This must be run as a Supabase admin (e.g., via Dashboard SQL Editor)
-- because Supabase storage buckets are managed differently from regular tables

-- Method 1: Via SQL (run in Supabase Dashboard SQL Editor)
-- insert into storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
-- values (
--   'report-evidence',
--   'report-evidence',
--   true,
--   false,
--   10485760,
--   array[
--     'image/png'::text, 'image/jpeg'::text, 'image/jpg'::text, 'image/webp'::text, 'image/gif'::text,
--     'application/pdf'::text, 'application/zip'::text, 'application/x-rar-compressed'::text,
--     'text/plain'::text, 'text/html'::text,
--     'application/octet-stream'::text
--   ]
-- )
-- on conflict (id) do nothing;

-- Method 2: RLS policy for the bucket (run after bucket creation)
-- create policy "Give users authenticated access to folder 1s3s5q_1"
--   on storage.objects for select
--   using ( bucket_id = 'report-evidence' );
-- 
-- create policy "Give users authenticated access to folder 1s3s5q_1"
--   on storage.objects for insert
--   with check ( bucket_id = 'report-evidence' );
