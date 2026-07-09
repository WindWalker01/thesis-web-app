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
};

export type SettingsCategory = {
  id: string;
  label: string;
  icon: string;
  description: string;
  settings: SettingDefinition[];
};

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

export type ImportSettingsPayload = {
  settings: Record<string, SettingValue>;
};

export type StorageMetrics = {
  cloudinaryUsage: string;
  storageUsed: string;
  remainingStorage: string;
  averageArtworkSize: string;
  totalRegisteredFiles: number;
  databaseSize: string | null;
};

export type SystemInfo = {
  nextJsVersion: string;
  reactVersion: string;
  supabaseProject: string;
  databaseVersion: string;
  blockchainNetwork: string;
  environment: string;
  buildDate: string;
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