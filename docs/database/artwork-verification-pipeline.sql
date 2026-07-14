-- ============================================
-- Manual Artwork Verification Pipeline
-- Migration: Extend notifications, add evidence table, add resubmission tracking
-- ============================================

-- 1. Extend notifications type constraint to include verification events
alter table public.notifications drop constraint if exists notifications_type_check;

alter table public.notifications add constraint notifications_type_check check (
  type = any (array[
    'artwork_registered'::text,
    'scan_completed'::text,
    'scan_flagged'::text,
    'scan_failed'::text,
    'report_submitted'::text,
    'report_resolved'::text,
    'blockchain_recorded'::text,
    'system_announcement'::text,
    'artwork_verified'::text,
    'artwork_verification_rejected'::text,
    'artwork_verification_info_requested'::text,
    'artwork_verification_resubmitted'::text
  ])
);

-- 2. Add resubmission_count column to artwork_reviews
alter table public.artwork_reviews add column if not exists resubmission_count integer not null default 0;

-- 3. Create artwork_review_evidence table for artist submissions
create table if not exists public.artwork_review_evidence (
  id uuid not null default gen_random_uuid(),
  review_id uuid not null,
  user_id uuid not null,
  message text null,
  files jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone not null default now(),
  constraint artwork_review_evidence_pkey primary key (id),
  constraint artwork_review_evidence_review_id_fkey foreign key (review_id) references artwork_reviews (id) on delete cascade,
  constraint artwork_review_evidence_user_id_fkey foreign key (user_id) references users (id) on delete cascade
);

-- 4. Create indexes for artwork_review_evidence
create index if not exists idx_artwork_review_evidence_review_id on public.artwork_review_evidence using btree (review_id) TABLESPACE pg_default;
create index if not exists idx_artwork_review_evidence_user_id on public.artwork_review_evidence using btree (user_id) TABLESPACE pg_default;
create index if not exists idx_artwork_review_evidence_created_at on public.artwork_review_evidence using btree (review_id, created_at desc) TABLESPACE pg_default;

-- 5. Enable RLS on artwork_review_evidence
alter table public.artwork_review_evidence enable row level security;

-- 6. RLS Policies for artwork_review_evidence
-- Artists can view their own evidence
create policy "Users can view own evidence"
  on public.artwork_review_evidence for select
  using (user_id = auth.uid());

-- Admins can view all evidence
create policy "Admins can view all evidence"
  on public.artwork_review_evidence for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- Artists can insert evidence (ownership validated in application logic)
create policy "Artists can insert evidence"
  on public.artwork_review_evidence for insert
  with check (user_id = auth.uid());

-- 7. Extend artwork_review_actions action check to include resubmission
alter table public.artwork_review_actions drop constraint if exists artwork_review_actions_action_check;

alter table public.artwork_review_actions add constraint artwork_review_actions_action_check check (
  action = any (array[
    'viewed'::text,
    'assigned'::text,
    'unassigned'::text,
    'approved'::text,
    'rejected'::text,
    'comment_added'::text,
    'information_requested'::text,
    'decision_changed'::text,
    'blockchain_triggered'::text,
    'evidence_submitted'::text
  ])
);