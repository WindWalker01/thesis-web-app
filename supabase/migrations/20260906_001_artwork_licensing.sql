-- ============================================
-- Artwork Licensing
-- ============================================
-- Adds license metadata to `registered_arts` (single source of truth for the
-- current license) and an audit table `artwork_license_history` recording
-- license changes.
--
-- The licensing system is a *selection and documentation* mechanism: it stores
-- the usage terms the artwork creator chose. It does not determine copyright
-- ownership, register copyright, or provide legal advice.
--
-- Defaults keep existing records safe: every artwork defaults to
-- "All Rights Reserved" so a permissive Creative Commons license is NEVER
-- applied implicitly. A CHECK constraint restricts identifiers to the exact
-- supported set.

-- ---------------------------------------------------------------------------
-- 1. Artwork license columns
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'registered_arts'
      AND column_name = 'license_identifier'
  ) THEN
    ALTER TABLE public.registered_arts
      ADD COLUMN license_identifier text NOT NULL DEFAULT 'all-rights-reserved',
      ADD COLUMN license_name text NOT NULL DEFAULT 'All Rights Reserved',
      ADD COLUMN license_url text,
      ADD COLUMN license_type text NOT NULL DEFAULT 'all_rights_reserved',
      ADD COLUMN license_selected_at timestamptz NOT NULL DEFAULT now(),
      ADD COLUMN license_updated_at timestamptz NOT NULL DEFAULT now();
  END IF;
END
$$;

-- Restrict identifiers to the supported set.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'registered_arts_license_identifier_check'
  ) THEN
    ALTER TABLE public.registered_arts
      ADD CONSTRAINT registered_arts_license_identifier_check
      CHECK (license_identifier IN (
        'all-rights-reserved',
        'cc-by', 'cc-by-sa', 'cc-by-nc',
        'cc-by-nc-sa', 'cc-by-nd', 'cc-by-nc-nd'
      ));
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- 2. Backfill existing artwork: any row without an explicit license receives
--    All Rights Reserved. New columns default this way automatically, so this
--    documents the intent and aligns selection/update timestamps with the
--    original creation date for pre-existing records.
-- ---------------------------------------------------------------------------
UPDATE public.registered_arts
SET license_identifier = 'all-rights-reserved',
    license_name = 'All Rights Reserved',
    license_url = NULL,
    license_type = 'all_rights_reserved'
WHERE license_identifier IS NULL
   OR license_identifier = '';

UPDATE public.registered_arts
SET license_selected_at = created_at,
    license_updated_at = created_at
WHERE license_selected_at > created_at + interval '1 second'
   OR license_updated_at > created_at + interval '1 second';

-- ---------------------------------------------------------------------------
-- 3. License history (audit) table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.artwork_license_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id uuid NOT NULL REFERENCES public.registered_arts(id) ON DELETE CASCADE,
  previous_license text NOT NULL,
  new_license text NOT NULL,
  changed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_artwork_license_history_artwork_changed
  ON public.artwork_license_history (artwork_id, changed_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_artwork_license_history_licenses'
  ) THEN
    ALTER TABLE public.artwork_license_history
      ADD CONSTRAINT chk_artwork_license_history_licenses
      CHECK (
        previous_license IN (
          'all-rights-reserved',
          'cc-by', 'cc-by-sa', 'cc-by-nc',
          'cc-by-nc-sa', 'cc-by-nd', 'cc-by-nc-nd'
        )
        AND
        new_license IN (
          'all-rights-reserved',
          'cc-by', 'cc-by-sa', 'cc-by-nc',
          'cc-by-nc-sa', 'cc-by-nd', 'cc-by-nc-nd'
        )
      );
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- 4. Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.artwork_license_history ENABLE ROW LEVEL SECURITY;

-- Owners may read and insert history rows for their own artwork.
CREATE POLICY artwork_license_history_select_own
  ON public.artwork_license_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.registered_arts ra
      WHERE ra.id = artwork_license_history.artwork_id
        AND ra.owner_id = auth.uid()
    )
  );

CREATE POLICY artwork_license_history_insert_own
  ON public.artwork_license_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.registered_arts ra
      WHERE ra.id = artwork_license_history.artwork_id
        AND ra.owner_id = auth.uid()
    )
  );

-- Service-role (admin) full access for internal tooling.
CREATE POLICY artwork_license_history_admin_all
  ON public.artwork_license_history
  TO service_role
  USING (true)
  WITH CHECK (true);

GRANT ALL ON TABLE public.artwork_license_history TO authenticated;
GRANT ALL ON TABLE public.artwork_license_history TO service_role;