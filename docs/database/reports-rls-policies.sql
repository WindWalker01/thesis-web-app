-- ============================================
-- REPORTS RLS POLICIES
-- Row Level Security for reports and related tables
-- ============================================

-- ============================================
-- 1. REPORTS table RLS policies
-- ============================================

alter table public.reports enable row level security;

-- Allow reporters to read their own reports
create policy "Reporters can read own reports"
  on public.reports for select
  using (reporter_id = auth.uid());

-- Allow admins to read all reports
create policy "Admins can read all reports"
  on public.reports for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- Allow authenticated users to create reports
create policy "Authenticated users can create reports"
  on public.reports for insert
  with check (reporter_id = auth.uid());

-- Allow admins to update reports
create policy "Admins can update reports"
  on public.reports for update
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- Allow admins to delete reports
create policy "Admins can delete reports"
  on public.reports for delete
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- ============================================
-- 2. REPORT COMMENTS table RLS policies
-- ============================================

alter table public.report_comments enable row level security;

-- Allow users to read comments on their own reports
create policy "Reporters can read comments on own reports"
  on public.report_comments for select
  using (
    exists (
      select 1 from public.reports
      where reports.id = report_comments.report_id
      and reports.reporter_id = auth.uid()
    )
  );

-- Allow admins to read all report comments
create policy "Admins can read all report comments"
  on public.report_comments for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- Allow authenticated users to create comments on their own reports
create policy "Authenticated users can create comments on own reports"
  on public.report_comments for insert
  with check (
    user_id = auth.uid()
    and (
      exists (
        select 1 from public.reports
        where reports.id = report_comments.report_id
        and reports.reporter_id = auth.uid()
      )
    )
  );

-- Allow admins to create comments on any report
create policy "Admins can create comments on any report"
  on public.report_comments for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- ============================================
-- 3. REPORT EVIDENCE table RLS policies
-- ============================================

alter table public.report_evidence enable row level security;

-- Allow users to read evidence on their own reports
create policy "Reporters can read evidence on own reports"
  on public.report_evidence for select
  using (
    exists (
      select 1 from public.reports
      where reports.id = report_evidence.report_id
      and reports.reporter_id = auth.uid()
    )
  );

-- Allow admins to read all report evidence
create policy "Admins can read all report evidence"
  on public.report_evidence for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- Allow authenticated users to upload evidence to their own reports
create policy "Authenticated users can upload evidence to own reports"
  on public.report_evidence for insert
  with check (
    uploaded_by = auth.uid()
    and (
      exists (
        select 1 from public.reports
        where reports.id = report_evidence.report_id
        and reports.reporter_id = auth.uid()
      )
    )
  );

-- Allow admins to upload evidence to any report
create policy "Admins can upload evidence to any report"
  on public.report_evidence for insert
  with check (
    uploaded_by = auth.uid()
    and exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- ============================================
-- 4. REPORT ACTIONS table RLS policies
-- ============================================

alter table public.report_actions enable row level security;

-- Allow users to read actions on their own reports
create policy "Reporters can read actions on own reports"
  on public.report_actions for select
  using (
    exists (
      select 1 from public.reports
      where reports.id = report_actions.report_id
      and reports.reporter_id = auth.uid()
    )
  );

-- Allow admins to read all report actions
create policy "Admins can read all report actions"
  on public.report_actions for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- Allow admins to insert report actions
create policy "Admins can insert report actions"
  on public.report_actions for insert
  with check (
    admin_id = auth.uid()
    and exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- ============================================
-- 5. REPORT DECISIONS table RLS policies
-- ============================================

alter table public.report_decisions enable row level security;

-- Allow users to read decisions on their own reports
create policy "Reporters can read decisions on own reports"
  on public.report_decisions for select
  using (
    exists (
      select 1 from public.reports
      where reports.id = report_decisions.report_id
      and reports.reporter_id = auth.uid()
    )
  );

-- Allow admins to read all report decisions
create policy "Admins can read all report decisions"
  on public.report_decisions for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- Allow admins to insert report decisions
create policy "Admins can insert report decisions"
  on public.report_decisions for insert
  with check (
    admin_id = auth.uid()
    and exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );