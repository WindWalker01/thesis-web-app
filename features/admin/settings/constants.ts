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
  db_match_display_threshold: 60,
  min_render_threshold: 60,
  display_label_very_similar: 90,
  display_label_similar: 75,
  pdf_report_critical: 90,
  pdf_report_high: 60,
  pdf_report_moderate: 50,

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
      // ── Detection Rules ─────────────────────────────────────────────
      {
        key: "similarity_threshold",
        label: "Similarity Threshold",
        description:
          "Defines the score at which two artworks are considered highly similar. The system compares uploaded artwork against registered works and calculates a similarity percentage.",
        type: "slider",
        defaultValue: 80,
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
        badge: "critical",
        group: "detection-rules",
        helpText:
          "Higher values (e.g., 95%) detect only near-identical copies. Lower values (e.g., 60%) identify more possible matches but may increase false positives. This setting directly affects plagiarism detection accuracy.",
        tooltip: "Determines when the system considers two artworks highly similar",
        recommendedValue: "80% for most digital artwork collections",
        requiresConfirmation: true,
        confirmationMessage: "Changing this value affects all future plagiarism scans. Continue?",
      },
      {
        key: "manual_review_threshold",
        label: "Manual Review Threshold",
        description:
          "If the highest similarity score reaches this percentage, the artwork is sent to an administrator for manual verification instead of being processed automatically.",
        type: "slider",
        defaultValue: 60,
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
        group: "detection-rules",
        helpText:
          "Lower values result in more artworks requiring admin review, increasing moderation workload. Higher values allow more artworks to pass through automatically but may let questionable content through. This affects the moderation workflow, not detection accuracy.",
        tooltip: "Controls which artworks require manual admin review",
        recommendedValue: "60% for balanced moderation. Increase to 80% to reduce review workload.",
      },
      {
        key: "automatic_approval_threshold",
        label: "Automatic Approval Threshold",
        description:
          "Artworks with a similarity score below this percentage are automatically approved without any manual review. Scores between this threshold and the Manual Review Threshold proceed with a warning displayed to the uploader.",
        type: "slider",
        defaultValue: 30,
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
        group: "detection-rules",
        helpText:
          "Raising this value approves more artworks automatically, reducing admin workload. Lowering it increases the number of artworks that require review, which may catch more potential issues. This affects the approval workflow, not detection.",
        tooltip: "Artworks below this score bypass manual review entirely",
        recommendedValue: "20–30% for most setups. Lower for stricter approval, higher for faster throughput.",
        requiresConfirmation: true,
        confirmationMessage: "This will bypass manual reviews for artworks below the threshold. Continue?",
      },
      {
        key: "minimum_confidence_score",
        label: "Minimum Confidence Score",
        description:
          "Filters out similarity matches where the detection algorithm has low confidence. Matches below this score are discarded entirely and never shown in reports or used in moderation decisions.",
        type: "slider",
        defaultValue: 50,
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
        group: "detection-rules",
        helpText:
          "Higher values (e.g., 70%) show only high-confidence matches, reducing false positives. Lower values (e.g., 30%) include more matches but some may be unreliable. This affects report quality, not security.",
        tooltip: "Filters out unreliable or low-confidence similarity matches",
        recommendedValue: "50% for balanced reliability. Raise to 70% for stricter confidence requirements.",
      },

      // ── Scan Behavior ──────────────────────────────────────────────
      {
        key: "enable_automatic_scanning",
        label: "Enable Automatic Scanning",
        description:
          "When enabled, every newly uploaded artwork is automatically scanned for similarity against existing works in the database. When disabled, scans must be triggered manually.",
        type: "toggle",
        defaultValue: true,
        group: "scan-behavior",
        helpText:
          "Disabling this means no similarity checks run on upload unless an admin manually initiates them. This may reduce server load but increases the risk of undetected duplicates.",
        tooltip: "Controls whether uploads are scanned immediately after submission",
        recommendedValue: "Keep enabled unless performing batch uploads or maintenance.",
      },
      {
        key: "enable_external_search",
        label: "Enable External Search",
        description:
          "When enabled, the system also searches external sources and public artwork databases for potential matches, not just the internal artwork registry.",
        type: "toggle",
        defaultValue: true,
        badge: "advanced",
        group: "scan-behavior",
        helpText:
          "Disabling external search limits scanning to internal artworks only. External search significantly expands detection reach but may increase scan time. This affects detection coverage, not accuracy.",
        tooltip: "Searches outside the internal artwork database for matches",
        recommendedValue: "Keep enabled for comprehensive plagiarism detection.",
      },
      {
        key: "similarity_scan_timeout",
        label: "Scan Timeout",
        description:
          "The maximum time (in seconds) a similarity scan is allowed to run before being cancelled. Scans that exceed this duration are abandoned and marked as incomplete.",
        type: "number",
        defaultValue: 60,
        min: 10,
        max: 300,
        unit: "seconds",
        group: "scan-behavior",
        helpText:
          "Increase this value for large artworks or when external search is enabled, as those scans take longer. Decrease it to free up server resources faster. This affects performance only, not detection accuracy.",
        tooltip: "Maximum duration before a scan is cancelled",
        recommendedValue: "60 seconds for internal scans. 120 seconds when external search is active.",
      },
      {
        key: "retry_attempts",
        label: "Retry Attempts",
        description:
          "The number of times the system will automatically retry a similarity scan if it fails due to a temporary error (e.g., timeout, network issue).",
        type: "number",
        defaultValue: 3,
        min: 0,
        max: 10,
        group: "scan-behavior",
        helpText:
          "Set to 0 to disable automatic retries (scans will fail on first error). Higher values increase reliability but may delay reporting of persistent failures. This affects reliability, not detection accuracy.",
        tooltip: "Failed scans are retried automatically before being marked as failed",
        recommendedValue: "3 attempts for most setups. Increase to 5 for unreliable network connections.",
      },
      {
        key: "maximum_similarity_matches",
        label: "Maximum Similarity Matches",
        description:
          "The maximum number of similar artwork matches returned per scan. This limits the size of similarity reports and prevents performance degradation from excessive results.",
        type: "number",
        defaultValue: 20,
        min: 1,
        max: 100,
        group: "scan-behavior",
        helpText:
          "Higher values provide a more comprehensive list but increase report generation time. Lower values improve performance but may miss some potential matches. This affects performance and report size only, not detection accuracy.",
        tooltip: "Limits the number of matches shown in similarity reports",
        recommendedValue: "20 for balanced performance. Increase to 50 for thorough investigations.",
      },

      // ── Duplicate Prevention ───────────────────────────────────────
      {
        key: "enable_duplicate_file_detection",
        label: "Enable Duplicate File Detection",
        description:
          "When enabled, the system checks the file hash of every uploaded artwork against previously registered works. If an exact file match is found, the upload is blocked immediately — before any similarity analysis runs.",
        type: "toggle",
        defaultValue: true,
        group: "duplicate-prevention",
        helpText:
          "This uses file hashing to detect exact byte-for-byte duplicates. It catches re-uploads of the same file regardless of metadata changes. This is a security measure, not a similarity check.",
        tooltip: "Blocks exact file duplicates using file hashes before similarity analysis",
        recommendedValue: "Keep enabled to prevent duplicate registrations.",
      },

      // ── Report Display (cosmetic) ──────────────────────────────────
      {
        key: "db_match_display_threshold",
        label: "Database Match Display Threshold",
        description:
          "If the best internal database match falls below this percentage, the report replaces it with the best internet match instead. This affects only which match is highlighted in the report display, not the detection result itself.",
        type: "slider",
        defaultValue: 60,
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
        badge: "advanced",
        group: "report-display",
        helpText:
          "A purely cosmetic setting. It prevents low-scoring database matches from appearing as the primary result when a better internet match exists. Does not affect detection, moderation, or approval decisions.",
        tooltip: "Controls which match is displayed as primary in the report (cosmetic only)",
        recommendedValue: "60% — matches below this are replaced by the best internet match.",
      },
      {
        key: "min_render_threshold",
        label: "Minimum Render Threshold",
        description:
          "Similarity cards below this percentage are hidden from view to reduce visual clutter in reports. The matches still exist in the data but are not rendered on screen.",
        type: "slider",
        defaultValue: 60,
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
        badge: "advanced",
        group: "report-display",
        helpText:
          "A purely cosmetic setting. Lower values show more matches (including weak ones), which can overwhelm the report view. Higher values filter out weak matches for a cleaner display. Does not affect detection.",
        tooltip: "Hides low-scoring similarity cards to reduce visual noise (cosmetic)",
        recommendedValue: "60% — hides weak matches for a cleaner report view.",
      },
      {
        key: "display_label_very_similar",
        label: "Very Similar Label Threshold",
        description:
          "Matches at or above this percentage receive the 'Very Similar' badge in the user interface. This is a visual label only and does not affect moderation or detection logic.",
        type: "slider",
        defaultValue: 90,
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
        badge: "advanced",
        group: "report-display",
        helpText:
          "A purely cosmetic setting. Lower values cause more matches to be labelled 'Very Similar'. This does not change which matches are flagged or reviewed — only how they appear.",
        tooltip: "Matches above this value receive the 'Very Similar' label (cosmetic)",
        recommendedValue: "90% — only near-identical works receive the 'Very Similar' badge.",
      },
      {
        key: "display_label_similar",
        label: "Similar Label Threshold",
        description:
          "Matches at or above this percentage receive the 'Similar' badge in the user interface. This is a visual label only and does not affect moderation or detection logic.",
        type: "slider",
        defaultValue: 75,
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
        badge: "advanced",
        group: "report-display",
        helpText:
          "A purely cosmetic setting. Matches between this threshold and the 'Very Similar' threshold are labelled 'Similar'. Does not affect which matches are flagged for review.",
        tooltip: "Matches above this value receive the 'Similar' label (cosmetic)",
        recommendedValue: "75% — reasonable matches receive the 'Similar' badge.",
      },

      // ── PDF Report (cosmetic) ──────────────────────────────────────
      {
        key: "pdf_report_critical",
        label: "PDF Report — Critical Badge Threshold",
        description:
          "In exported PDF similarity reports, matches at or above this percentage are marked with a 'CRITICAL' severity badge. This does not influence plagiarism detection or moderation decisions.",
        type: "slider",
        defaultValue: 90,
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
        badge: "advanced",
        group: "pdf-report",
        helpText:
          "A purely cosmetic PDF-only setting. It controls the severity badge colour shown in printed/exported reports. Has no effect on the web interface or detection logic.",
        tooltip: "Severity badge shown in exported PDF reports (cosmetic only)",
        recommendedValue: "90% — only extreme matches get the critical severity badge.",
      },
      {
        key: "pdf_report_high",
        label: "PDF Report — High Badge Threshold",
        description:
          "In exported PDF similarity reports, matches at or above this percentage are marked with a 'HIGH' severity badge. This does not influence plagiarism detection or moderation decisions.",
        type: "slider",
        defaultValue: 60,
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
        badge: "advanced",
        group: "pdf-report",
        helpText:
          "A purely cosmetic PDF-only setting. Matches between this threshold and the 'Critical' threshold are labelled 'HIGH'. Does not affect detection or moderation.",
        tooltip: "Severity badge shown in exported PDF reports (cosmetic only)",
        recommendedValue: "60% — moderate matches receive the high severity badge.",
      },
      {
        key: "pdf_report_moderate",
        label: "PDF Report — Moderate Badge Threshold",
        description:
          "In exported PDF similarity reports, matches at or above this percentage are marked with a 'MODERATE' severity badge. This does not influence plagiarism detection or moderation decisions.",
        type: "slider",
        defaultValue: 50,
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
        badge: "advanced",
        group: "pdf-report",
        helpText:
          "A purely cosmetic PDF-only setting. Matches below this threshold receive no severity badge in exported reports. Does not affect detection or moderation.",
        tooltip: "Severity badge shown in exported PDF reports (cosmetic only)",
        recommendedValue: "50% — matches below this get no severity badge in PDFs.",
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
// Helper: Get all unique groups used by settings in a category
// ============================================

export function getGroupsForCategory(categoryId: string): string[] {
  const category = getCategoryById(categoryId);
  if (!category) return [];
  const groups = new Set<string>();
  for (const s of category.settings) {
    if (s.group) groups.add(s.group);
  }
  return Array.from(groups);
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