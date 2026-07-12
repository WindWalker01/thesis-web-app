"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SettingValue, SettingsActionResult, StorageMetrics, SystemInfo } from "../types";
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
// Export all settings as JSON
// ============================================

export async function exportSettings(): Promise<{
  success: boolean;
  data?: Record<string, SettingValue>;
  message?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();
    await verifyAdmin(supabase);

    const settings = await getSettings();
    return { success: true, data: settings };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to export settings.",
    };
  }
}

// ============================================
// Import settings from JSON
// ============================================

export async function importSettings(
  settings: Record<string, SettingValue>
): Promise<SettingsActionResult> {
  try {
    // Validate that all keys are known settings
    const unknownKeys = Object.keys(settings).filter(
      (key) => !(key in DEFAULT_SETTINGS)
    );

    if (unknownKeys.length > 0) {
      return {
        success: false,
        message: `Unknown setting keys: ${unknownKeys.join(", ")}`,
      };
    }

    return await updateSettings(settings, "Imported from JSON file");
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to import settings.",
    };
  }
}

// ============================================
// Get storage metrics (read-only)
// ============================================

export async function getStorageMetrics(): Promise<StorageMetrics> {
  try {
    const supabase = await createSupabaseServerClient();
    await verifyAdmin(supabase);

    // Count registered artworks
    const { count: totalFiles, error: countError } = await supabase
      .from("registered_arts")
      .select("*", { count: "exact", head: true });

    if (countError) throw countError;

    // Get total artwork count for display
    const { count: totalArtworks } = await supabase
      .from("art_posts")
      .select("*", { count: "exact", head: true });

    // Estimate storage based on registered art count
    const estimatedArtworkSizeMB = 2.5; // Average artwork size estimate
    const totalStorageMB = (totalFiles ?? 0) * estimatedArtworkSizeMB;
    const cloudinaryLimit = 1024 * 10; // 10GB assumed Cloudinary limit

    return {
      cloudinaryUsage: `${totalStorageMB.toFixed(1)} MB`,
      storageUsed: `${totalStorageMB.toFixed(1)} MB`,
      remainingStorage: `${Math.max(0, cloudinaryLimit - totalStorageMB).toFixed(1)} MB`,
      averageArtworkSize: `${estimatedArtworkSizeMB} MB`,
      totalRegisteredFiles: totalFiles ?? 0,
      databaseSize: null, // Requires superuser access to pg_database_size
    };
  } catch (error) {
    console.error("Failed to fetch storage metrics:", error);
    return {
      cloudinaryUsage: "Unavailable",
      storageUsed: "Unavailable",
      remainingStorage: "Unavailable",
      averageArtworkSize: "Unavailable",
      totalRegisteredFiles: 0,
      databaseSize: null,
    };
  }
}

// ============================================
// Get system information (read-only)
// ============================================

export async function getSystemInfo(): Promise<SystemInfo> {
  try {
    const supabase = await createSupabaseServerClient();
    await verifyAdmin(supabase);

    // Get package.json version info
    const pkg = await import("@/package.json").catch(() => null);
    const nextJsVersion = pkg?.dependencies?.next ?? "Unknown";
    const reactVersion = pkg?.dependencies?.react ?? "Unknown";

    // Get Supabase project from env
    const supabaseProject = process.env.NEXT_PUBLIC_SUPABASE_URL
      ?.replace("https://", "")
      ?.split(".")[0] ?? "Unknown";

    // Get blockchain network from env
    const blockchainNetwork = process.env.NEXT_PUBLIC_ARTWORK_REGISTRY_CONTRACT_ADDRESS
      ? "Polygon Amoy (Testnet)"
      : "Not configured";

    // Get environment
    const environment = process.env.NODE_ENV ?? "development";

    return {
      nextJsVersion,
      reactVersion,
      supabaseProject,
      databaseVersion: "PostgreSQL 15+",
      blockchainNetwork,
      environment,
      buildDate: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to fetch system info:", error);
    return {
      nextJsVersion: "Unknown",
      reactVersion: "Unknown",
      supabaseProject: "Unknown",
      databaseVersion: "Unknown",
      blockchainNetwork: "Unknown",
      environment: "Unknown",
      buildDate: "Unknown",
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