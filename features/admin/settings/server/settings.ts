"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SettingValue, SettingsActionResult } from "../types";
import { DEFAULT_SETTINGS } from "../constants";

// ============================================
// Helper: Verify admin access
// ============================================

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    throw new Error("Unauthorized.");
  }

  return user;
}

// ============================================
// Get all settings
// ============================================

export async function getSettings(): Promise<Record<string, SettingValue>> {
  const supabase = await createSupabaseServerClient();
  await verifyAdmin(supabase);

  const { data, error } = await supabase
    .from("system_settings")
    .select("key, value")
    .order("key");

  if (error) {
    console.error("Failed to fetch settings:", error);
    throw new Error(`Failed to fetch settings: ${error.message}`);
  }

  const settings: Record<string, SettingValue> = {};
  for (const row of data) {
    settings[row.key] = row.value as SettingValue;
  }

  // Merge with defaults for any missing keys
  for (const [key, defaultValue] of Object.entries(DEFAULT_SETTINGS)) {
    if (!(key in settings)) {
      settings[key] = defaultValue;
    }
  }

  return settings;
}

// ============================================
// Update settings (batch)
// ============================================

export async function updateSettings(
  changes: Record<string, SettingValue>,
  reason?: string
): Promise<SettingsActionResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const admin = await verifyAdmin(supabase);

    // Get current values for audit logging
    const { data: currentData } = await supabase
      .from("system_settings")
      .select("key, value")
      .in("key", Object.keys(changes));

    const currentMap = new Map<string, SettingValue>();
    for (const row of currentData ?? []) {
      currentMap.set(row.key, row.value as SettingValue);
    }

    // Upsert each changed setting
    const now = new Date().toISOString();
    for (const [key, newValue] of Object.entries(changes)) {
      const previousValue = currentMap.get(key) ?? null;

      // Upsert the setting
      const { error: upsertError } = await supabase.from("system_settings").upsert(
        {
          key,
          value: JSON.parse(JSON.stringify(newValue)),
          updated_by: admin.id,
          updated_at: now,
        },
        { onConflict: "key", ignoreDuplicates: false }
      );

      if (upsertError) throw upsertError;

      // Create audit log entry
      const { error: auditError } = await supabase.from("settings_audit_logs").insert({
        admin_id: admin.id,
        setting_key: key,
        previous_value: previousValue ? JSON.parse(JSON.stringify(previousValue)) : null,
        new_value: JSON.parse(JSON.stringify(newValue)),
        reason: reason ?? null,
      });

      if (auditError) {
        console.error("Failed to create settings audit log:", auditError);
      }
    }

    return {
      success: true,
      message: `Successfully updated ${Object.keys(changes).length} setting(s).`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update settings.",
    };
  }
}

// ============================================
// Reset category settings to defaults
// ============================================

export async function resetCategoryDefaults(
  categoryKeys: string[]
): Promise<SettingsActionResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const admin = await verifyAdmin(supabase);

    // Get current values for audit logging
    const { data: currentData } = await supabase
      .from("system_settings")
      .select("key, value")
      .in("key", categoryKeys);

    const currentMap = new Map<string, SettingValue>();
    for (const row of currentData ?? []) {
      currentMap.set(row.key, row.value as SettingValue);
    }

    const now = new Date().toISOString();
    let updatedCount = 0;

    for (const key of categoryKeys) {
      const defaultValue = DEFAULT_SETTINGS[key];
      if (defaultValue === undefined) continue;

      const previousValue = currentMap.get(key) ?? null;

      // Skip if already at default
      if (previousValue !== null && JSON.stringify(previousValue) === JSON.stringify(defaultValue)) {
        continue;
      }

      // Upsert the default value
      const { error: upsertError } = await supabase.from("system_settings").upsert(
        {
          key,
          value: JSON.parse(JSON.stringify(defaultValue)),
          updated_by: admin.id,
          updated_at: now,
        },
        { onConflict: "key", ignoreDuplicates: false }
      );

      if (upsertError) throw upsertError;

      // Create audit log
      await supabase.from("settings_audit_logs").insert({
        admin_id: admin.id,
        setting_key: key,
        previous_value: previousValue ? JSON.parse(JSON.stringify(previousValue)) : null,
        new_value: JSON.parse(JSON.stringify(defaultValue)),
        reason: "Reset to default value",
      });

      updatedCount++;
    }

    return {
      success: true,
      message: `Reset ${updatedCount} setting(s) to default values.`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to reset settings.",
    };
  }
}

// ============================================
// Get settings audit logs
// ============================================

export async function getSettingsAuditLogs(
  limit = 50
): Promise<{ success: boolean; data?: Array<Record<string, unknown>>; message?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    await verifyAdmin(supabase);

    const { data, error } = await supabase
      .from("settings_audit_logs")
      .select(`
        *,
        admin:admin_id (
          first_name,
          last_name,
          email
        )
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch audit logs.",
    };
  }
}
