import { z } from "zod";

// ============================================
// Setting Value Types
// ============================================

export type SettingValue = string | number | boolean | string[];

export type SystemSetting = {
  id: string;
  key: string;
  value: SettingValue;
  description: string | null;
  updated_by: string | null;
  updated_at: string;
};

export type SettingsMap = Record<string, SettingValue>;

// ============================================
// Setting Definition (for UI rendering)
// ============================================

export type SettingFieldType =
  | "text"
  | "number"
  | "email"
  | "textarea"
  | "toggle"
  | "slider"
  | "select"
  | "tags"
  | "readonly";

export type SettingBadgeType = "recommended" | "advanced" | "experimental" | "critical";

export type SettingOption = {
  label: string;
  value: string;
};

/**
 * Group identifier for sub-section organisation within a category.
 * Used to visually cluster related settings (e.g. detection-rules, scan-behavior).
 */
export type SettingGroupId =
  | "detection-rules"
  | "scan-behavior"
  | "duplicate-prevention"
  | "report-display"
  | "pdf-report"
  | "general";

export type SettingGroup = {
  id: SettingGroupId;
  label: string;
  description?: string;
  icon?: string;
  /** If true the group is collapsed by default (useful for advanced settings). */
  isAdvanced?: boolean;
};

export type SettingDefinition = {
  key: string;
  label: string;
  description: string;
  type: SettingFieldType;
  defaultValue: SettingValue;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: SettingOption[];
  badge?: SettingBadgeType;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  isReadonly?: boolean;

  // ── New UX fields ──────────────────────────────────────────────
  /** Sub-section group ID for visual clustering. */
  group?: SettingGroupId;
  /**
   * Concise helper text that explains the effect of the setting.
   * Shown below the description in a muted, smaller font.
   */
  helpText?: string;
  /**
   * Short string displayed as an ⓘ tooltip next to the label.
   * Use this for the most distilled "what does this do" explanation.
   */
  tooltip?: string;
  /**
   * A subtle recommendation shown below the input, e.g.
   * "Recommended: 80% for most digital artwork collections"
   */
  recommendedValue?: string;
};

export type SettingsCategory = {
  id: string;
  label: string;
  icon: string;
  description: string;
  settings: SettingDefinition[];
};

// Sub-section groups that categories can reference
export const SETTING_GROUPS: SettingGroup[] = [
  {
    id: "detection-rules",
    label: "Detection Rules",
    description: "Thresholds that control how the system identifies and handles similar artworks",
    icon: "🔍",
  },
  {
    id: "scan-behavior",
    label: "Scan Behavior",
    description: "How similarity scans are performed, including retries and timeouts",
    icon: "⚡",
  },
  {
    id: "duplicate-prevention",
    label: "Duplicate Prevention",
    description: "Block exact-file duplicates before similarity analysis begins",
    icon: "🛡️",
  },
  {
    id: "report-display",
    label: "Report Display",
    description: "Controls which matches are visible in similarity reports (cosmetic only)",
    icon: "📊",
    isAdvanced: true,
  },
  {
    id: "pdf-report",
    label: "PDF Report",
    description: "Severity badges shown in exported PDF reports (cosmetic only)",
    icon: "📄",
    isAdvanced: true,
  },
];

// ============================================
// Zod Validation Schemas
// ============================================

export const percentageSchema = z
  .number()
  .min(0, "Must be at least 0")
  .max(100, "Must be at most 100");

export const positiveNumberSchema = z
  .number()
  .positive("Must be a positive number");

export const positiveIntSchema = z
  .number()
  .int("Must be a whole number")
  .positive("Must be a positive number");

export const emailSchema = z
  .string()
  .email("Invalid email address")
  .or(z.literal(""));

export const timezoneSchema = z.string().min(1, "Timezone is required");

export const languageSchema = z.string().min(1, "Language is required");

export const visibilitySchema = z.enum(["public", "private", "unlisted"]);

export const allowedFileTypesSchema = z
  .array(z.string().min(1))
  .min(1, "At least one file type is required");

export const allowedOriginsSchema = z.array(z.string());

// ============================================
// Server Action Types
// ============================================

export type SettingsActionResult = {
  success: boolean;
  message: string;
};

export type UpdateSettingsPayload = {
  changes: Record<string, SettingValue>;
  reason?: string;
};

export type SettingsAuditLog = {
  id: string;
  admin_id: string;
  setting_key: string;
  previous_value: SettingValue | null;
  new_value: SettingValue | null;
  reason: string | null;
  created_at: string;
  admin?: {
    first_name: string;
    last_name: string;
    email: string;
  };
};