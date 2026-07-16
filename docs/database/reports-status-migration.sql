-- ============================================
-- Migration: Update report_status enum
-- 
-- Old: 'open' | 'under_review' | 'waiting_for_reporter' | 'resolved' | 'rejected' | 'closed'
-- New: 'pending_review' | 'under_review' | 'resolved'
-- 
-- Mapping:
--   'open'                  -> 'pending_review'
--   'under_review'          -> 'under_review'
--   'waiting_for_reporter'  -> 'under_review'
--   'resolved'              -> 'resolved'
--   'rejected'              -> 'resolved'
--   'closed'                -> 'resolved'
-- ============================================

-- 1. Create the new enum type
create type public.report_status_v2 as enum (
  'pending_review',
  'under_review',
  'resolved'
);

-- 2. Drop the old default before altering column type
alter table public.reports 
  alter column status drop default;

-- 3. Update the reports table status column
alter table public.reports 
  alter column status type public.report_status_v2 
  using (
    case status::text
      when 'open' then 'pending_review'::public.report_status_v2
      when 'under_review' then 'under_review'::public.report_status_v2
      when 'waiting_for_reporter' then 'under_review'::public.report_status_v2
      when 'resolved' then 'resolved'::public.report_status_v2
      when 'rejected' then 'resolved'::public.report_status_v2
      when 'closed' then 'resolved'::public.report_status_v2
      else 'pending_review'::public.report_status_v2
    end
  );

-- 4. Set new default value
alter table public.reports 
  alter column status set default 'pending_review'::public.report_status_v2;

-- 5. Update the report_actions table status columns
alter table public.report_actions 
  alter column previous_status type public.report_status_v2 
  using (
    case previous_status::text
      when 'open' then 'pending_review'::public.report_status_v2
      when 'under_review' then 'under_review'::public.report_status_v2
      when 'waiting_for_reporter' then 'under_review'::public.report_status_v2
      when 'resolved' then 'resolved'::public.report_status_v2
      when 'rejected' then 'resolved'::public.report_status_v2
      when 'closed' then 'resolved'::public.report_status_v2
      else null
    end
  );

alter table public.report_actions 
  alter column new_status type public.report_status_v2 
  using (
    case new_status::text
      when 'open' then 'pending_review'::public.report_status_v2
      when 'under_review' then 'under_review'::public.report_status_v2
      when 'waiting_for_reporter' then 'under_review'::public.report_status_v2
      when 'resolved' then 'resolved'::public.report_status_v2
      when 'rejected' then 'resolved'::public.report_status_v2
      when 'closed' then 'resolved'::public.report_status_v2
      else null
    end
  );

-- 6. Drop the old enum type
drop type public.report_status;

-- 7. Rename the new enum to the original name
alter type public.report_status_v2 rename to report_status;