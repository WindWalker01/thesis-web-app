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
 *
 * Now supports JSON object settings via the isJSON flag in SettingDefinition.
 */

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_SETTINGS } from "@/features/admin/settings/constants";
import {
  communityRecognitionBadgeThresholdsSchema,
  type CommunityRecognitionBadgeThresholds,
} from "@/features/admin/settings/types";

// ── Typed interface matching every key in DEFAULT_SETTINGS ──────────────
// (only the non-JSON keys for backward compatibility)

export type RuntimeSettings = {
  // General
  platform_name: string;
  platform_description: string;
  platform_logo_url: string;
  support_email: string;
  default_timezone: string;
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
  scheduled_maintenance_start: string;
  scheduled_maintenance_end: string;
  allow_admin_login_during_maintenance: boolean;
  display_countdown: boolean;

  // Community Recognition (JSON object)
  community_recognition_badge_thresholds: CommunityRecognitionBadgeThresholds;
};

// ── Coerce helper (mirrors what the settings page already does) ─────────

function coerceValue(key: string, raw: unknown): unknown {
  const defaultValue = DEFAULT_SETTINGS[key as keyof typeof DEFAULT_SETTINGS];
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

  if (
    targetType === "object" &&
    defaultValue !== null &&
    !Array.isArray(defaultValue)
  ) {
    // JSON object setting — validate and return
    return coerceJSONValue(key, raw);
  }

  // string | string[]
  return raw;
}

/**
 * Coerce a JSON object value from the database.
 * Parses the JSON string if needed, otherwise returns the default.
 */
function coerceJSONValue(key: string, raw: unknown): unknown {
  const defaultValue = DEFAULT_SETTINGS[key as keyof typeof DEFAULT_SETTINGS];
  if (raw === null || raw === undefined) return defaultValue;

  // If it's already a JavaScript object, validate and return
  if (typeof raw === "object" && !Array.isArray(raw)) {
    const result = communityRecognitionBadgeThresholdsSchema.safeParse(raw);
    if (result.success) {
      return result.data;
    }
    console.warn(
      `[RuntimeSettings] Invalid JSON for ${key}: ${result.error.message}`,
    );
    return defaultValue;
  }

  // Try to parse as JSON string
  try {
    const parsed = JSON.parse(String(raw));
    const result = communityRecognitionBadgeThresholdsSchema.safeParse(parsed);
    if (result.success) {
      return result.data;
    }
    console.warn(
      `[RuntimeSettings] Invalid JSON for ${key}: ${result.error.message}`,
    );
    return defaultValue;
  } catch (e) {
    console.warn(`[RuntimeSettings] Failed to parse JSON for ${key}:`, e);
    return defaultValue;
  }
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
    // Return defaults if DB fetch fails
    return getDefaultRuntimeSettings();
  }

  const dbMap = new Map<string, unknown>();
  for (const row of data) {
    dbMap.set(row.key, row.value);
  }

  const merged: Record<string, unknown> = {};

  // Load all default keys (including JSON object settings)
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    merged[key] = coerceValue(key, dbMap.get(key));
  }

  cachedSettings = merged as RuntimeSettings;
  return cachedSettings!;
}

/**
 * Get default runtime settings when DB fetch fails.
 */
function getDefaultRuntimeSettings(): RuntimeSettings {
  return {
    platform_name: "ArtForgeLab",
    platform_description:
      "Intellectual Property Rights Management System for Digital Art",
    platform_logo_url: "/landing-page-elements/AFL_logoWeb.png",
    support_email: "support@artforgelab.com",
    default_timezone: "UTC",
    footer_copyright: "© 2026 ArtForgeLab. All rights reserved",

    similarity_threshold: 80,
    manual_review_threshold: 60,
    automatic_approval_threshold: 30,
    maximum_similarity_matches: 20,
    minimum_confidence_score: 50,
    enable_automatic_scanning: true,
    enable_external_search: true,
    similarity_scan_timeout: 60,
    retry_attempts: 3,
    enable_duplicate_file_detection: true,
    db_match_display_threshold: 60,
    min_render_threshold: 60,
    display_label_very_similar: 90,
    display_label_similar: 75,
    pdf_report_critical: 90,
    pdf_report_high: 60,
    pdf_report_moderate: 50,

    maximum_login_attempts: 5,
    session_timeout: 3600,
    password_reset_expiration: 3600,
    require_verified_email: true,
    allowed_origins: [],
    enable_audit_logs: true,
    admin_session_timeout: 1800,

    maintenance_mode: false,
    maintenance_message:
      "We are currently performing scheduled maintenance. Please check back shortly.",
    scheduled_maintenance: false,
    scheduled_maintenance_start: "",
    scheduled_maintenance_end: "",
    allow_admin_login_during_maintenance: true,
    display_countdown: false,

    // Community Recognition default thresholds
    community_recognition_badge_thresholds: {
      Recognized: 5,
      Acclaimed: 8,
      Master: 11,
    },
  };
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
