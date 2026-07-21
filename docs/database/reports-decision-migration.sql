-- ============================================
-- Migration: Clean report_decisions vocabulary
-- ============================================
-- Migrates old decision values to the new canonical vocabulary
-- and updates the CHECK constraint.
--
-- Old values:
--   infringement_confirmed → copyright_confirmed
--   duplicate_report       → false_report
--   other                  → guideline_violation
--
-- New canonical values:
--   no_violation
--   copyright_confirmed
--   guideline_violation
--   insufficient_evidence
--   false_report
-- ============================================
-- IMPORTANT: Drop the constraint BEFORE updating rows,
-- otherwise the UPDATE will be rejected by the old constraint.
-- ============================================

-- Step 1: Drop the old CHECK constraint
ALTER TABLE public.report_decisions
DROP CONSTRAINT IF EXISTS report_decisions_decision_check;

-- Step 2: Migrate existing rows to new vocabulary
UPDATE public.report_decisions
SET decision = 'copyright_confirmed'
WHERE decision = 'infringement_confirmed';

UPDATE public.report_decisions
SET decision = 'false_report'
WHERE decision = 'duplicate_report';

UPDATE public.report_decisions
SET decision = 'guideline_violation'
WHERE decision = 'other';

-- Step 3: Add the new CHECK constraint with canonical values only
ALTER TABLE public.report_decisions
ADD CONSTRAINT report_decisions_decision_check
CHECK (
  decision = ANY (ARRAY[
    'no_violation'::text,
    'copyright_confirmed'::text,
    'guideline_violation'::text,
    'insufficient_evidence'::text,
    'false_report'::text
  ])
);