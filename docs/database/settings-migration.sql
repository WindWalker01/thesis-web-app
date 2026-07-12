-- ═══════════════════════════════════════════════════════════════
-- SETTINGS MIGRATION
-- System Settings & Settings Audit Logs
-- ═══════════════════════════════════════════════════════════════

-- ============================================================
-- 1. SYSTEM SETTINGS TABLE
-- Stores all configurable platform settings as key-value pairs
-- with JSONB values for flexible data types
-- ============================================================

create table public.system_settings (
  id uuid not null default gen_random_uuid(),
  key text not null,
  value jsonb not null default '{}'::jsonb,
  description text null,
  updated_by uuid null,
  updated_at timestamp with time zone not null default now(),
  constraint system_settings_pkey primary key (id),
  constraint system_settings_key_key unique (key),
  constraint system_settings_updated_by_fkey foreign key (updated_by) references users (id) on delete set null
) TABLESPACE pg_default;

create index IF not exists idx_system_settings_key on public.system_settings using btree (key) TABLESPACE pg_default;
create index IF not exists idx_system_settings_updated_by on public.system_settings using btree (updated_by) TABLESPACE pg_default;
create index IF not exists idx_system_settings_updated_at on public.system_settings using btree (updated_at desc) TABLESPACE pg_default;

create trigger trg_system_settings_updated_at BEFORE
update on system_settings for EACH row
execute FUNCTION set_updated_at ();

-- Enable RLS and create policies for system_settings
alter table public.system_settings enable row level security;

-- Allow admins to read all settings
create policy "Admins can read system_settings"
  on public.system_settings for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- Allow admins to insert/update settings
create policy "Admins can insert system_settings"
  on public.system_settings for insert
  with check (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

create policy "Admins can update system_settings"
  on public.system_settings for update
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- Allow admins to delete settings
create policy "Admins can delete system_settings"
  on public.system_settings for delete
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );


-- ============================================================
-- 2. SETTINGS AUDIT LOGS TABLE
-- Tracks all configuration changes for accountability
-- ============================================================

create table public.settings_audit_logs (
  id uuid not null default gen_random_uuid(),
  admin_id uuid not null,
  setting_key text not null,
  previous_value jsonb null,
  new_value jsonb null,
  reason text null,
  created_at timestamp with time zone not null default now(),
  constraint settings_audit_logs_pkey primary key (id),
  constraint settings_audit_logs_admin_id_fkey foreign key (admin_id) references users (id) on delete cascade
) TABLESPACE pg_default;

create index IF not exists idx_settings_audit_logs_admin_id on public.settings_audit_logs using btree (admin_id) TABLESPACE pg_default;
create index IF not exists idx_settings_audit_logs_setting_key on public.settings_audit_logs using btree (setting_key) TABLESPACE pg_default;
create index IF not exists idx_settings_audit_logs_created_at on public.settings_audit_logs using btree (created_at desc) TABLESPACE pg_default;

-- Enable RLS and create policies for settings_audit_logs
alter table public.settings_audit_logs enable row level security;

-- Allow admins to read audit logs
create policy "Admins can read settings_audit_logs"
  on public.settings_audit_logs for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

-- Allow admins to insert audit logs (server-side)
create policy "Admins can insert settings_audit_logs"
  on public.settings_audit_logs for insert
  with check (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );


-- ============================================================
-- 3. DEFAULT SETTINGS SEED
-- Inserts all default platform settings with sensible defaults
-- for the Intellectual Property Rights Management System
-- ============================================================

-- Helper function to upsert a setting (insert if not exists, skip if exists)
do $$
begin
  -- GENERAL
  if not exists (select 1 from public.system_settings where key = 'platform_name') then
    insert into public.system_settings (key, value, description) values
      ('platform_name', '"ArtForgeLab"', 'The display name of the platform');
  end if;
  if not exists (select 1 from public.system_settings where key = 'platform_description') then
    insert into public.system_settings (key, value, description) values
      ('platform_description', '"Intellectual Property Rights Management System for Digital Art"', 'A short description of the platform');
  end if;
  if not exists (select 1 from public.system_settings where key = 'support_email') then
    insert into public.system_settings (key, value, description) values
      ('support_email', '"support@artforgelab.com"', 'Support email address displayed to users');
  end if;
  if not exists (select 1 from public.system_settings where key = 'default_timezone') then
    insert into public.system_settings (key, value, description) values
      ('default_timezone', '"UTC"', 'Default timezone for the platform');
  end if;
  if not exists (select 1 from public.system_settings where key = 'default_language') then
    insert into public.system_settings (key, value, description) values
      ('default_language', '"en"', 'Default language locale for the platform');
  end if;
  if not exists (select 1 from public.system_settings where key = 'footer_copyright') then
    insert into public.system_settings (key, value, description) values
      ('footer_copyright', '"© 2026 ArtForgeLab. All rights reserved."', 'Copyright notice displayed in the footer');
  end if;

  -- ARTWORK
  if not exists (select 1 from public.system_settings where key = 'maximum_upload_size') then
    insert into public.system_settings (key, value, description) values
      ('maximum_upload_size', '50', 'Maximum file upload size in megabytes');
  end if;
  if not exists (select 1 from public.system_settings where key = 'allowed_file_types') then
    insert into public.system_settings (key, value, description) values
      ('allowed_file_types', '["jpg","jpeg","png","gif","webp","svg"]', 'Comma-separated list of allowed file extensions');
  end if;
  if not exists (select 1 from public.system_settings where key = 'maximum_artwork_dimensions') then
    insert into public.system_settings (key, value, description) values
      ('maximum_artwork_dimensions', '4096', 'Maximum width/height of artwork images in pixels');
  end if;
  if not exists (select 1 from public.system_settings where key = 'maximum_number_of_genres') then
    insert into public.system_settings (key, value, description) values
      ('maximum_number_of_genres', '5', 'Maximum number of genres an artwork can be tagged with');
  end if;
  if not exists (select 1 from public.system_settings where key = 'require_description') then
    insert into public.system_settings (key, value, description) values
      ('require_description', 'true', 'Whether artwork description is required during upload');
  end if;
  if not exists (select 1 from public.system_settings where key = 'require_evidence') then
    insert into public.system_settings (key, value, description) values
      ('require_evidence', 'false', 'Whether evidence files are required during artwork registration');
  end if;
  if not exists (select 1 from public.system_settings where key = 'automatic_registration') then
    insert into public.system_settings (key, value, description) values
      ('automatic_registration', 'true', 'Whether artworks are automatically registered upon upload');
  end if;
  if not exists (select 1 from public.system_settings where key = 'enable_artwork_visibility') then
    insert into public.system_settings (key, value, description) values
      ('enable_artwork_visibility', 'true', 'Whether artists can control artwork visibility settings');
  end if;
  if not exists (select 1 from public.system_settings where key = 'default_visibility') then
    insert into public.system_settings (key, value, description) values
      ('default_visibility', '"public"', 'Default visibility for new artworks (public, private, unlisted)');
  end if;
  if not exists (select 1 from public.system_settings where key = 'enable_nsfw_detection') then
    insert into public.system_settings (key, value, description) values
      ('enable_nsfw_detection', 'true', 'Whether NSFW content detection is enabled for uploads');
  end if;
  if not exists (select 1 from public.system_settings where key = 'nsfw_default') then
    insert into public.system_settings (key, value, description) values
      ('nsfw_default', 'false', 'Default NSFW flag for artworks when detection is inconclusive');
  end if;

  -- SIMILARITY DETECTION
  if not exists (select 1 from public.system_settings where key = 'similarity_threshold') then
    insert into public.system_settings (key, value, description) values
      ('similarity_threshold', '80', 'Percentage threshold above which artworks are considered similar (0-100)');
  end if;
  if not exists (select 1 from public.system_settings where key = 'manual_review_threshold') then
    insert into public.system_settings (key, value, description) values
      ('manual_review_threshold', '60', 'Similarity percentage above which artworks require manual review');
  end if;
  if not exists (select 1 from public.system_settings where key = 'automatic_approval_threshold') then
    insert into public.system_settings (key, value, description) values
      ('automatic_approval_threshold', '30', 'Similarity percentage below which artworks are automatically approved');
  end if;
  if not exists (select 1 from public.system_settings where key = 'maximum_similarity_matches') then
    insert into public.system_settings (key, value, description) values
      ('maximum_similarity_matches', '20', 'Maximum number of similarity matches to return per scan');
  end if;
  if not exists (select 1 from public.system_settings where key = 'minimum_confidence_score') then
    insert into public.system_settings (key, value, description) values
      ('minimum_confidence_score', '50', 'Minimum confidence score for similarity matches to be considered valid (0-100)');
  end if;
  if not exists (select 1 from public.system_settings where key = 'enable_automatic_scanning') then
    insert into public.system_settings (key, value, description) values
      ('enable_automatic_scanning', 'true', 'Whether similarity scanning runs automatically on upload');
  end if;
  if not exists (select 1 from public.system_settings where key = 'enable_external_search') then
    insert into public.system_settings (key, value, description) values
      ('enable_external_search', 'true', 'Whether to search external sources for similar artworks');
  end if;
  if not exists (select 1 from public.system_settings where key = 'similarity_scan_timeout') then
    insert into public.system_settings (key, value, description) values
      ('similarity_scan_timeout', '60', 'Maximum time in seconds for a similarity scan to complete');
  end if;
  if not exists (select 1 from public.system_settings where key = 'retry_attempts') then
    insert into public.system_settings (key, value, description) values
      ('retry_attempts', '3', 'Number of retry attempts for failed similarity scans');
  end if;
  if not exists (select 1 from public.system_settings where key = 'enable_duplicate_file_detection') then
    insert into public.system_settings (key, value, description) values
      ('enable_duplicate_file_detection', 'true', 'Whether to check for exact file hash duplicates during upload');
  end if;

  -- MANUAL REVIEW
  if not exists (select 1 from public.system_settings where key = 'enable_manual_review') then
    insert into public.system_settings (key, value, description) values
      ('enable_manual_review', 'true', 'Whether manual review queue is enabled for flagged artworks');
  end if;
  if not exists (select 1 from public.system_settings where key = 'require_review_above') then
    insert into public.system_settings (key, value, description) values
      ('require_review_above', '60', 'Similarity percentage above which manual review is required');
  end if;
  if not exists (select 1 from public.system_settings where key = 'automatically_hide_above') then
    insert into public.system_settings (key, value, description) values
      ('automatically_hide_above', '90', 'Similarity percentage above which artworks are automatically hidden');
  end if;
  if not exists (select 1 from public.system_settings where key = 'require_admin_approval') then
    insert into public.system_settings (key, value, description) values
      ('require_admin_approval', 'true', 'Whether admin approval is required for review decisions');
  end if;
  if not exists (select 1 from public.system_settings where key = 'auto_notify_artist') then
    insert into public.system_settings (key, value, description) values
      ('auto_notify_artist', 'true', 'Whether artists are automatically notified about review results');
  end if;
  if not exists (select 1 from public.system_settings where key = 'auto_notify_admin') then
    insert into public.system_settings (key, value, description) values
      ('auto_notify_admin', 'true', 'Whether admins are notified when new reviews are needed');
  end if;
  if not exists (select 1 from public.system_settings where key = 'allow_false_positive_override') then
    insert into public.system_settings (key, value, description) values
      ('allow_false_positive_override', 'true', 'Whether admins can override similarity flags as false positives');
  end if;
  if not exists (select 1 from public.system_settings where key = 'maximum_review_days') then
    insert into public.system_settings (key, value, description) values
      ('maximum_review_days', '14', 'Maximum number of days an artwork can remain in review');
  end if;

  -- BLOCKCHAIN
  if not exists (select 1 from public.system_settings where key = 'default_chain') then
    insert into public.system_settings (key, value, description) values
      ('default_chain', '"polygon-amoy"', 'Default blockchain network for artwork registration');
  end if;
  if not exists (select 1 from public.system_settings where key = 'enable_blockchain_registration') then
    insert into public.system_settings (key, value, description) values
      ('enable_blockchain_registration', 'true', 'Whether blockchain registration is enabled for new artworks');
  end if;
  if not exists (select 1 from public.system_settings where key = 'retry_failed_transactions') then
    insert into public.system_settings (key, value, description) values
      ('retry_failed_transactions', 'true', 'Whether to automatically retry failed blockchain transactions');
  end if;
  if not exists (select 1 from public.system_settings where key = 'maximum_retry_count') then
    insert into public.system_settings (key, value, description) values
      ('maximum_retry_count', '3', 'Maximum number of retries for failed blockchain transactions');
  end if;
  if not exists (select 1 from public.system_settings where key = 'auto_register_after_upload') then
    insert into public.system_settings (key, value, description) values
      ('auto_register_after_upload', 'true', 'Whether artworks are automatically registered on the blockchain after upload');
  end if;
  if not exists (select 1 from public.system_settings where key = 'display_blockchain_badge') then
    insert into public.system_settings (key, value, description) values
      ('display_blockchain_badge', 'true', 'Whether to display blockchain verification badges on artwork pages');
  end if;
  if not exists (select 1 from public.system_settings where key = 'verification_timeout') then
    insert into public.system_settings (key, value, description) values
      ('verification_timeout', '120', 'Maximum time in seconds to wait for blockchain verification');
  end if;
  if not exists (select 1 from public.system_settings where key = 'explorer_base_url') then
    insert into public.system_settings (key, value, description) values
      ('explorer_base_url', '"https://amoy.polygonscan.com"', 'Base URL for the blockchain explorer');
  end if;

  -- COMMUNITY
  if not exists (select 1 from public.system_settings where key = 'enable_community_feed') then
    insert into public.system_settings (key, value, description) values
      ('enable_community_feed', 'true', 'Whether the community feed feature is enabled');
  end if;
  if not exists (select 1 from public.system_settings where key = 'enable_upvotes') then
    insert into public.system_settings (key, value, description) values
      ('enable_upvotes', 'true', 'Whether upvoting artworks is enabled');
  end if;
  if not exists (select 1 from public.system_settings where key = 'enable_downvotes') then
    insert into public.system_settings (key, value, description) values
      ('enable_downvotes', 'true', 'Whether downvoting artworks is enabled');
  end if;
  if not exists (select 1 from public.system_settings where key = 'enable_comments') then
    insert into public.system_settings (key, value, description) values
      ('enable_comments', 'true', 'Whether commenting on artworks is enabled');
  end if;
  if not exists (select 1 from public.system_settings where key = 'enable_artwork_sharing') then
    insert into public.system_settings (key, value, description) values
      ('enable_artwork_sharing', 'true', 'Whether sharing artworks externally is enabled');
  end if;
  if not exists (select 1 from public.system_settings where key = 'enable_artist_verification_badge') then
    insert into public.system_settings (key, value, description) values
      ('enable_artist_verification_badge', 'true', 'Whether verified artist badges are displayed');
  end if;
  if not exists (select 1 from public.system_settings where key = 'allow_anonymous_viewing') then
    insert into public.system_settings (key, value, description) values
      ('allow_anonymous_viewing', 'true', 'Whether unauthenticated users can view community content');
  end if;
  if not exists (select 1 from public.system_settings where key = 'enable_nsfw_content') then
    insert into public.system_settings (key, value, description) values
      ('enable_nsfw_content', 'true', 'Whether NSFW content is allowed on the platform');
  end if;
  if not exists (select 1 from public.system_settings where key = 'minimum_reputation_required') then
    insert into public.system_settings (key, value, description) values
      ('minimum_reputation_required', '0', 'Minimum reputation score required to participate in community features');
  end if;

  -- REPORTS
  if not exists (select 1 from public.system_settings where key = 'enable_reporting') then
    insert into public.system_settings (key, value, description) values
      ('enable_reporting', 'true', 'Whether the reporting system is enabled');
  end if;
  if not exists (select 1 from public.system_settings where key = 'maximum_reports_per_day') then
    insert into public.system_settings (key, value, description) values
      ('maximum_reports_per_day', '10', 'Maximum number of reports a user can submit per day');
  end if;
  if not exists (select 1 from public.system_settings where key = 'auto_assign_reports') then
    insert into public.system_settings (key, value, description) values
      ('auto_assign_reports', 'true', 'Whether reports are automatically assigned to available admins');
  end if;
  if not exists (select 1 from public.system_settings where key = 'auto_escalate') then
    insert into public.system_settings (key, value, description) values
      ('auto_escalate', 'true', 'Whether reports are automatically escalated after multiple flags');
  end if;
  if not exists (select 1 from public.system_settings where key = 'escalation_threshold') then
    insert into public.system_settings (key, value, description) values
      ('escalation_threshold', '3', 'Number of reports on the same artwork before automatic escalation');
  end if;
  if not exists (select 1 from public.system_settings where key = 'default_report_status') then
    insert into public.system_settings (key, value, description) values
      ('default_report_status', '"open"', 'Default status for newly submitted reports');
  end if;
  if not exists (select 1 from public.system_settings where key = 'maximum_evidence_files') then
    insert into public.system_settings (key, value, description) values
      ('maximum_evidence_files', '5', 'Maximum number of evidence files per report');
  end if;
  if not exists (select 1 from public.system_settings where key = 'maximum_evidence_size') then
    insert into public.system_settings (key, value, description) values
      ('maximum_evidence_size', '20', 'Maximum total size of evidence files in megabytes');
  end if;
  if not exists (select 1 from public.system_settings where key = 'require_explanation') then
    insert into public.system_settings (key, value, description) values
      ('require_explanation', 'true', 'Whether reporters must provide an explanation when submitting a report');
  end if;

  -- NOTIFICATIONS
  if not exists (select 1 from public.system_settings where key = 'enable_email_notifications') then
    insert into public.system_settings (key, value, description) values
      ('enable_email_notifications', 'true', 'Whether email notifications are enabled');
  end if;
  if not exists (select 1 from public.system_settings where key = 'enable_in_app_notifications') then
    insert into public.system_settings (key, value, description) values
      ('enable_in_app_notifications', 'true', 'Whether in-app notifications are enabled');
  end if;
  if not exists (select 1 from public.system_settings where key = 'notify_on_reports') then
    insert into public.system_settings (key, value, description) values
      ('notify_on_reports', 'true', 'Whether to send notifications when reports are submitted');
  end if;
  if not exists (select 1 from public.system_settings where key = 'notify_on_blockchain_success') then
    insert into public.system_settings (key, value, description) values
      ('notify_on_blockchain_success', 'true', 'Whether to notify users when blockchain registration succeeds');
  end if;
  if not exists (select 1 from public.system_settings where key = 'notify_on_similarity_detection') then
    insert into public.system_settings (key, value, description) values
      ('notify_on_similarity_detection', 'true', 'Whether to notify users when similarity matches are found');
  end if;
  if not exists (select 1 from public.system_settings where key = 'notify_on_manual_review') then
    insert into public.system_settings (key, value, description) values
      ('notify_on_manual_review', 'true', 'Whether to notify users when their artwork enters manual review');
  end if;
  if not exists (select 1 from public.system_settings where key = 'notify_on_report_resolution') then
    insert into public.system_settings (key, value, description) values
      ('notify_on_report_resolution', 'true', 'Whether to notify users when a report they filed is resolved');
  end if;
  if not exists (select 1 from public.system_settings where key = 'notification_retention_days') then
    insert into public.system_settings (key, value, description) values
      ('notification_retention_days', '90', 'Number of days to retain notifications before automatic cleanup');
  end if;

  -- SECURITY
  if not exists (select 1 from public.system_settings where key = 'maximum_login_attempts') then
    insert into public.system_settings (key, value, description) values
      ('maximum_login_attempts', '5', 'Maximum failed login attempts before account lockout');
  end if;
  if not exists (select 1 from public.system_settings where key = 'session_timeout') then
    insert into public.system_settings (key, value, description) values
      ('session_timeout', '3600', 'User session timeout in seconds');
  end if;
  if not exists (select 1 from public.system_settings where key = 'password_reset_expiration') then
    insert into public.system_settings (key, value, description) values
      ('password_reset_expiration', '3600', 'Password reset link expiration time in seconds');
  end if;
  if not exists (select 1 from public.system_settings where key = 'require_verified_email') then
    insert into public.system_settings (key, value, description) values
      ('require_verified_email', 'true', 'Whether users must verify their email address');
  end if;
  if not exists (select 1 from public.system_settings where key = 'allowed_origins') then
    insert into public.system_settings (key, value, description) values
      ('allowed_origins', '[]', 'List of allowed CORS origins for API access');
  end if;
  if not exists (select 1 from public.system_settings where key = 'enable_audit_logs') then
    insert into public.system_settings (key, value, description) values
      ('enable_audit_logs', 'true', 'Whether admin audit logging is enabled');
  end if;
  if not exists (select 1 from public.system_settings where key = 'admin_session_timeout') then
    insert into public.system_settings (key, value, description) values
      ('admin_session_timeout', '1800', 'Admin session timeout in seconds');
  end if;

  -- MAINTENANCE
  if not exists (select 1 from public.system_settings where key = 'maintenance_mode') then
    insert into public.system_settings (key, value, description) values
      ('maintenance_mode', 'false', 'Whether the platform is in maintenance mode');
  end if;
  if not exists (select 1 from public.system_settings where key = 'maintenance_message') then
    insert into public.system_settings (key, value, description) values
      ('maintenance_message', '"We are currently performing scheduled maintenance. Please check back shortly."', 'Message displayed to users during maintenance mode');
  end if;
  if not exists (select 1 from public.system_settings where key = 'scheduled_maintenance') then
    insert into public.system_settings (key, value, description) values
      ('scheduled_maintenance', 'false', 'Whether scheduled maintenance is active');
  end if;
  if not exists (select 1 from public.system_settings where key = 'allow_admin_login_during_maintenance') then
    insert into public.system_settings (key, value, description) values
      ('allow_admin_login_during_maintenance', 'true', 'Whether admins can log in during maintenance mode');
  end if;
  if not exists (select 1 from public.system_settings where key = 'display_countdown') then
    insert into public.system_settings (key, value, description) values
      ('display_countdown', 'false', 'Whether to display a countdown timer for scheduled maintenance');
  end if;
end $$;