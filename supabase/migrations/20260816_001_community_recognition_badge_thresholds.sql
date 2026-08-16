-- ============================================
-- Community Recognition Badge Thresholds
-- ============================================
-- Stores configurable badge thresholds for community recognition.
-- These thresholds determine when an artist earns "Recognized", "Acclaimed", or "Master" badges
-- based on their total net score across public, non-archived, active posts.
--
-- The thresholds are stored as JSON in a single row for simplicity,
-- but can also be managed via the admin settings UI.
-- ============================================

CREATE TABLE IF NOT EXISTS public.community_recognition_badge_thresholds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Badge thresholds (total net score required)
  -- Emerging: 0-4 (no badge displayed)
  -- Recognized: 5-7 (blue star badge)
  -- Acclaimed: 8-10 (award badge)
  -- Master: 11+ (crown badge)
  thresholds JSONB NOT NULL DEFAULT '{"Recognized": 5, "Acclaimed": 8, "Master": 11}'::jsonb,

  -- Whether the feature is enabled
  is_enabled BOOLEAN NOT NULL DEFAULT true,

  -- Optional: per-artist override settings
  artist_override_settings JSONB DEFAULT '{}'::jsonb,

  -- Index for quick lookups by enabled status
  CONSTRAINT community_recognition_badge_thresholds_enabled_check CHECK (is_enabled IN (true))
);

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_community_recognition_badge_thresholds_enabled
ON public.community_recognition_badge_thresholds (is_enabled);

-- Insert default thresholds seed row
-- These defaults match the hardcoded values in features/(user)/community/server/artist-reputation.ts
INSERT INTO public.community_recognition_badge_thresholds (id, thresholds, is_enabled)
VALUES (
  gen_random_uuid(),
  '{"Recognized": 5, "Acclaimed": 8, "Master": 11}'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;