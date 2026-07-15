import type { SettingDefinition, SettingsCategory, SettingValue } from "./types";

// ============================================
// Default Values & Category Definitions
// ============================================

export const DEFAULT_SETTINGS: Record<string, SettingValue> = {
  // General
  platform_name: "ArtForgeLab",
  platform_description: "Intellectual Property Rights Management System for Digital Art",
  support_email: "support@artforgelab.com",
  default_timezone: "UTC",
  default_language: "en",
  footer_copyright: "© 2026 ArtForgeLab. All rights reserved.",

  // Similarity Detection
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

  // Security
  maximum_login_attempts: 5,
  session_timeout: 3600,
  password_reset_expiration: 3600,
  require_verified_email: true,
  allowed_origins: [],
  enable_audit_logs: true,
  admin_session_timeout: 1800,

  // Maintenance
  maintenance_mode: false,
  maintenance_message: "We are currently performing scheduled maintenance. Please check back shortly.",
  scheduled_maintenance: false,
  allow_admin_login_during_maintenance: true,
  display_countdown: false,
};

// ============================================
// Setting Definitions by Category
// ============================================

export const SETTINGS_CATEGORIES: SettingsCategory[] = [
  {
    id: "general",
    label: "General",
    icon: "Settings2",
    description: "Platform information and branding configuration",
    settings: [
      {
        key: "platform_name",
        label: "Platform Name",
        description: "The display name of the platform shown to all users",
        type: "text",
        defaultValue: "ArtForgeLab",
      },
      {
        key: "platform_description",
        label: "Platform Description",
        description: "A short description of the platform used in meta tags and headers",
        type: "textarea",
        defaultValue: "Intellectual Property Rights Management System for Digital Art",
      },
      {
        key: "support_email",
        label: "Support Email",
        description: "Email address displayed to users for support inquiries",
        type: "email",
        defaultValue: "support@artforgelab.com",
        placeholder: "support@example.com",
      },
      {
        key: "default_timezone",
        label: "Default Time Zone",
        description: "Default timezone for date and time displays across the platform",
        type: "select",
        defaultValue: "UTC",
        options: [
          { label: "UTC (Coordinated Universal Time)", value: "UTC" },
          { label: "America/New_York (Eastern)", value: "America/New_York" },
          { label: "America/Chicago (Central)", value: "America/Chicago" },
          { label: "America/Denver (Mountain)", value: "America/Denver" },
          { label: "America/Los_Angeles (Pacific)", value: "America/Los_Angeles" },
          { label: "Europe/London (GMT)", value: "Europe/London" },
          { label: "Europe/Paris (CET)", value: "Europe/Paris" },
          { label: "Asia/Tokyo (JST)", value: "Asia/Tokyo" },
          { label: "Asia/Shanghai (CST)", value: "Asia/Shanghai" },
          { label: "Asia/Manila (PST)", value: "Asia/Manila" },
          { label: "Australia/Sydney (AEST)", value: "Australia/Sydney" },
        ],
      },
      {
        key: "default_language",
        label: "Default Language",
        description: "Default language locale for the platform interface",
        type: "select",
        defaultValue: "en",
        options: [
          { label: "English", value: "en" },
          { label: "Spanish", value: "es" },
          { label: "French", value: "fr" },
          { label: "German", value: "de" },
          { label: "Japanese", value: "ja" },
          { label: "Chinese", value: "zh" },
          { label: "Filipino", value: "fil" },
        ],
      },
      {
        key: "footer_copyright",
        label: "Footer Copyright",
        description: "Copyright notice displayed in the footer of all pages",
        type: "text",
        defaultValue: "© 2026 ArtForgeLab. All rights reserved.",
      },
    ],
  },
  {
    id: "similarity",
    label: "Similarity Detection",
    icon: "SearchIcon",
    description: "Plagiarism and similarity detection configuration",
    settings: [
      {
        key: "similarity_threshold",
        label: "Similarity Threshold",
        description: "Percentage threshold above which artworks are considered similar. Higher values are stricter",
        type: "slider",
        defaultValue: 80,
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
        badge: "critical",
        requiresConfirmation: true,
        confirmationMessage: "Changing this value affects all future plagiarism scans. Continue?",
      },
      {
        key: "manual_review_threshold",
        label: "Manual Review Threshold",
        description: "Similarity percentage above which artworks are flagged for manual review by an admin",
        type: "slider",
        defaultValue: 60,
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
      },
      {
        key: "automatic_approval_threshold",
        label: "Automatic Approval Threshold",
        description: "Similarity percentage below which artworks are automatically approved without review",
        type: "slider",
        defaultValue: 30,
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
        requiresConfirmation: true,
        confirmationMessage: "This will bypass manual reviews for artworks below the threshold. Continue?",
      },
      {
        key: "maximum_similarity_matches",
        label: "Maximum Similarity Matches",
        description: "Maximum number of similar artwork matches to return per scan",
        type: "number",
        defaultValue: 20,
        min: 1,
        max: 100,
      },
      {
        key: "minimum_confidence_score",
        label: "Minimum Confidence Score",
        description: "Minimum confidence score for similarity matches to be considered valid",
        type: "slider",
        defaultValue: 50,
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
      },
      {
        key: "enable_automatic_scanning",
        label: "Enable Automatic Scanning",
        description: "Whether similarity scanning runs automatically when artworks are uploaded",
        type: "toggle",
        defaultValue: true,
      },
      {
        key: "enable_external_search",
        label: "Enable External Search",
        description: "Whether to search external sources and databases for similar artworks",
        type: "toggle",
        defaultValue: true,
        badge: "advanced",
      },
      {
        key: "similarity_scan_timeout",
        label: "Similarity Scan Timeout",
        description: "Maximum time in seconds for a similarity scan to complete before timing out",
        type: "number",
        defaultValue: 60,
        min: 10,
        max: 300,
        unit: "seconds",
      },
      {
        key: "retry_attempts",
        label: "Retry Attempts",
        description: "Number of retry attempts for failed similarity scans",
        type: "number",
        defaultValue: 3,
        min: 0,
        max: 10,
      },
      {
        key: "enable_duplicate_file_detection",
        label: "Enable Duplicate File Detection",
        description: "Whether to check for exact file hash duplicates during upload to prevent re-registration",
        type: "toggle",
        defaultValue: true,
      },
    ],
  },
  {
    id: "security",
    label: "Security",
    icon: "LockIcon",
    description: "Platform security and access control settings",
    settings: [
      {
        key: "maximum_login_attempts",
        label: "Maximum Login Attempts",
        description: "Maximum failed login attempts before account lockout",
        type: "number",
        defaultValue: 5,
        min: 1,
        max: 20,
      },
      {
        key: "session_timeout",
        label: "Session Timeout",
        description: "User session timeout in seconds before automatic logout",
        type: "number",
        defaultValue: 3600,
        min: 300,
        max: 86400,
        unit: "seconds",
      },
      {
        key: "password_reset_expiration",
        label: "Password Reset Expiration",
        description: "Password reset link expiration time in seconds",
        type: "number",
        defaultValue: 3600,
        min: 300,
        max: 86400,
        unit: "seconds",
      },
      {
        key: "require_verified_email",
        label: "Require Verified Email",
        description: "Whether users must verify their email address before accessing the platform",
        type: "toggle",
        defaultValue: true,
      },
      {
        key: "allowed_origins",
        label: "Allowed Origins",
        description: "List of allowed CORS origins for API access (one per line)",
        type: "tags",
        defaultValue: [],
        badge: "advanced",
      },
      {
        key: "enable_audit_logs",
        label: "Enable Audit Logs",
        description: "Whether administrative audit logging is enabled for tracking all admin actions",
        type: "toggle",
        defaultValue: true,
        badge: "recommended",
      },
      {
        key: "admin_session_timeout",
        label: "Admin Session Timeout",
        description: "Admin session timeout in seconds for enhanced security",
        type: "number",
        defaultValue: 1800,
        min: 300,
        max: 43200,
        unit: "seconds",
        badge: "recommended",
      },
    ],
  },
  {
    id: "maintenance",
    label: "Maintenance",
    icon: "WrenchIcon",
    description: "Platform maintenance mode and scheduled downtime settings",
    settings: [
      {
        key: "maintenance_mode",
        label: "Maintenance Mode",
        description: "When enabled, the platform will display a maintenance message to all non-admin users",
        type: "toggle",
        defaultValue: false,
        requiresConfirmation: true,
        confirmationMessage: "Enabling maintenance mode will prevent all users from accessing the platform. Only admins will be able to log in. Continue?",
      },
      {
        key: "maintenance_message",
        label: "Maintenance Message",
        description: "Message displayed to users when maintenance mode is active",
        type: "textarea",
        defaultValue: "We are currently performing scheduled maintenance. Please check back shortly.",
        placeholder: "Enter maintenance message...",
      },
      {
        key: "scheduled_maintenance",
        label: "Scheduled Maintenance",
        description: "Whether scheduled maintenance is planned",
        type: "toggle",
        defaultValue: false,
      },
      {
        key: "allow_admin_login_during_maintenance",
        label: "Allow Admin Login During Maintenance",
        description: "Whether administrators can log in to the platform during maintenance mode",
        type: "toggle",
        defaultValue: true,
      },
      {
        key: "display_countdown",
        label: "Display Countdown",
        description: "Whether to display a countdown timer to users for scheduled maintenance",
        type: "toggle",
        defaultValue: false,
      },
    ],
  },
];

// ============================================
// Helper: Get category by ID
// ============================================

export function getCategoryById(id: string): SettingsCategory | undefined {
  return SETTINGS_CATEGORIES.find((cat) => cat.id === id);
}

// ============================================
// Helper: Get setting definition by key
// ============================================

export function getSettingByKey(key: string): SettingDefinition | undefined {
  for (const category of SETTINGS_CATEGORIES) {
    const setting = category.settings.find((s) => s.key === key);
    if (setting) return setting;
  }
  return undefined;
}

// ============================================
// Category IDs that require confirmation on reset
// ============================================

export const CATEGORIES_REQUIRING_CONFIRMATION: string[] = [
  "similarity",
  "maintenance",
  "security",
];

// ============================================
// Critical setting keys that require confirmation
// ============================================

export const CRITICAL_SETTING_KEYS: string[] = [
  "similarity_threshold",
  "automatic_approval_threshold",
  "maintenance_mode",
];

