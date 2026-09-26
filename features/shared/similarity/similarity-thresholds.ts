/**
 * Shared similarity threshold defaults used across the application.
 *
 * These values are derived from the admin settings defaults
 * (`features/admin/settings/constants.ts`) so that there is a single source
 * of truth.  When an admin changes a value in the dashboard, the runtime
 * settings (`getRuntimeSettings()`) will reflect the new value, and server-side
 * code should pass those runtime values to the relevant functions.
 *
 * These exported constants serve as **fallback defaults** when runtime settings
 * are not available (e.g. during initial page load, tests, or client-side
 * display-only code).
 *
 * ── Usage guidance ─────────────────────────────────────────────────────────────
 *
 * - **Moderation decisions** (artwork blocking, flagging, review):
 *   Use `getArtworkStatusFromSimilarity()` from `moderation-policy.ts`, which
 *   accepts thresholds as parameters.  Always pass the runtime settings values
 *   from `getRuntimeSettings()` when available.
 *
 * - **Display-only thresholds** (what to show in similarity reports, PDF labels):
 *   Import these constants directly.  They are purely cosmetic and affect only
 *   what the user sees, not any moderation decisions.
 *
 * ── Threshold definitions ──────────────────────────────────────────────────────
 *
 * | Constant                           | Default | Purpose                                     |
 * |------------------------------------|---------|---------------------------------------------|
 * | SIMILARITY_THRESHOLD               | 80      | Above this → flagged for admin              |
 * | MANUAL_REVIEW_THRESHOLD            | 60      | Above this → held for manual review         |
 * | AUTOMATIC_APPROVAL_THRESHOLD       | 30      | Below this → auto-approved                  |
 * | DB_MATCH_DISPLAY_THRESHOLD         | 60      | DB match below this → replaced by web match |
 * | MIN_RENDER_THRESHOLD              | 60      | Below this → no similarity report shown     |
 * | DISPLAY_LABEL_VERY_SIMILAR         | 90      | Above this → label "Very Similar"           |
 * | DISPLAY_LABEL_SIMILAR              | 75      | Above this → label "Similar"                |
 * | PDF_REPORT_CRITICAL                | 90      | Above this → PDF label "CRITICAL"           |
 * | PDF_REPORT_HIGH                    | 60      | Above this → PDF label "HIGH"               |
 * | PDF_REPORT_MODERATE                | 50      | Above this → PDF label "MODERATE"           |
 */

import { DEFAULT_SETTINGS } from "@/features/admin/settings/constants";

/** Similarity % above which artworks are flagged for admin attention (maps to `similarity_threshold` setting). */
export const SIMILARITY_THRESHOLD = Number(DEFAULT_SETTINGS.similarity_threshold);

/** Similarity % above which artworks enter manual review (maps to `manual_review_threshold` setting). */
export const MANUAL_REVIEW_THRESHOLD = Number(DEFAULT_SETTINGS.manual_review_threshold);

/** Similarity % below which artworks are automatically approved without review. */
export const AUTOMATIC_APPROVAL_THRESHOLD = Number(DEFAULT_SETTINGS.automatic_approval_threshold);

/**
 * Similarity % below which a database match in the report is replaced by the
 * best internet match (when available).  This only affects display, not moderation.
 */
export const DB_MATCH_DISPLAY_THRESHOLD = Number(DEFAULT_SETTINGS.db_match_display_threshold);

/**
 * Minimum similarity % required to render any similarity report at all.
 * Matches below this threshold suppress the report card entirely.
 */
export const MIN_RENDER_THRESHOLD = Number(DEFAULT_SETTINGS.min_render_threshold);

/** Display labels used in the "Other matches" grid on the upload result page. */
export const DISPLAY_LABEL_VERY_SIMILAR = Number(DEFAULT_SETTINGS.display_label_very_similar);
export const DISPLAY_LABEL_SIMILAR = Number(DEFAULT_SETTINGS.display_label_similar);

/** Display thresholds used in the PDF plagiarism report. */
export const PDF_REPORT_CRITICAL = Number(DEFAULT_SETTINGS.pdf_report_critical);
export const PDF_REPORT_HIGH = Number(DEFAULT_SETTINGS.pdf_report_high);
export const PDF_REPORT_MODERATE = Number(DEFAULT_SETTINGS.pdf_report_moderate);