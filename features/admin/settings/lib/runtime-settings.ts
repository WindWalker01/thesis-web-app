/**
 * Runtime settings utility — provides typed access to system_settings from
 * server components, server actions, and API routes.
 *
 * Usage:
 *   const settings = await getRuntimeSettings();
 *   const threshold = settings.similarity_threshold;
 *
 * If a setting has not been saved to the database yet, the DEFAULT_SETTINGS
 * value is returned as fallback.  This guarantees the application always has
 * sensible behaviour even before an admin visits the settings page.
 */

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_SETTINGS } from "@/features/admin/settings/constants";
import type { SettingValue } from "@/features/admin/settings/types";

// ── Typed interface matching every key in DEFAULT_SETTINGS ──────────────

export type RuntimeSettings = {
  // General
  platform_name: string;
  platform_description: string;
  support_email: string;
  default_timezone: string;
  default_language: string;
  footer_copyright: string;

  // Similarity Detection
  similarity_threshold: number;
  manual_review_threshold: number;
  automatic_approval_threshold: number;
  maximum_similarity_matches: number;
  minimum_confidence_score: number;
  enable_automatic_scanning: boolean;
  enable_external_search: boolean;
  similarity_scan_timeout: number;
  retry_attempts: number;
  enable_duplicate_file_detection: boolean;
  db_match_display_threshold: number;
  min_render_threshold: number;
  display_label_very_similar: number;
  display_label_similar: number;
  pdf_report_critical: number;
  pdf_report_high: number;
  pdf_report_moderate: number;

  // Security
  maximum_login_attempts: number;
  session_timeout: number;
  password_reset_expiration: number;
  require_verified_email: boolean;
  allowed_origins: string[];
  enable_audit_logs: boolean;
  admin_session_timeout: number;

  // Maintenance
  maintenance_mode: boolean;
  maintenance_message: string;
  scheduled_maintenance: boolean;
  allow_admin_login_during_maintenance: boolean;
  display_countdown: boolean;
};

// ── Coerce helper (mirrors what the settings page already does) ─────────

function coerceValue(key: string, raw: unknown): unknown {
  const defaultValue = DEFAULT_SETTINGS[key];
  if (raw === null || raw === undefined) return defaultValue;

  const targetType = typeof defaultValue;

  if (targetType === "number") {
    const n = Number(raw);
    return Number.isFinite(n) ? n : defaultValue;
  }

  if (targetType === "boolean") {
    if (typeof raw === "boolean") return raw;
    if (raw === "true" || raw === true) return true;
    if (raw === "false" || raw === false) return false;
    return defaultValue;
  }

  // string | string[]
  return raw;
}

// ── Simple in-memory cache (only within a single server request) ───────

let cachedSettings: RuntimeSettings | null = null;

/**
 * Read all system settings from the database, merge with defaults, and
 * return a fully typed RuntimeSettings object.
 *
 * Safe to call multiple times per request — results are cached.
 */
export async function getRuntimeSettings(): Promise<RuntimeSettings> {
  if (cachedSettings) return cachedSettings;

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("system_settings")
    .select("key, value");

  if (error) {
    console.error("[RuntimeSettings] Failed to fetch settings:", error);
    return DEFAULT_SETTINGS as unknown as RuntimeSettings;
  }

  const dbMap = new Map<string, unknown>();
  for (const row of data) {
    dbMap.set(row.key, row.value);
  }

  const merged: Record<string, unknown> = {};

  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    merged[key] = coerceValue(key, dbMap.get(key));
  }

  cachedSettings = merged as RuntimeSettings;
  return cachedSettings!;
}

/**
 * Read a single setting by key.  Useful when you only need one value.
 */
export async function getRuntimeSetting<K extends keyof RuntimeSettings>(
  key: K,
): Promise<RuntimeSettings[K]> {
  const all = await getRuntimeSettings();
  return all[key];
}

/**
 * Clear the cached settings (useful in tests or after a mutation).
 */
export function clearRuntimeSettingsCache(): void {
  cachedSettings = null;
}