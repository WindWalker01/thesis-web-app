/**
 * Community Recognition Badge Thresholds Module
 *
 * Provides centralized badge tier mapping, validation, and runtime loading
 * for the community recognition system. Replaces hardcoded threshold logic
 * in community feed server files with configurable helpers.
 *
 * Thresholds are stored in the database table `community_recognition_badge_thresholds`
 * and can be managed via the admin settings UI.
 *
 * Default thresholds (matching the hardcoded values in artist-reputation.ts):
 *   - Recognized: 5-7 net score
 *   - Acclaimed: 8-10 net score
 *   - Master: 11+ net score
 */

import { z } from "zod";

/**
 * Badge tier type - must match the ArtistBadge type in community/types.ts
 */
export type CommunityRecognitionBadge =
  "Emerging" | "Recognized" | "Acclaimed" | "Master";

/**
 * Threshold configuration for each badge tier.
 * Keys must match ArtistBadge values: "Emerging", "Recognized", "Acclaimed", "Master"
 */
export type BadgeThresholds = {
  /** Minimum net score required for "Recognized" badge (5-7) */
  Recognized: number;
  /** Minimum net score required for "Acclaimed" badge (8-10) */
  Acclaimed: number;
  /** Minimum net score required for "Master" badge (11+) */
  Master: number;
};

/**
 * Default threshold values.
 * These match the hardcoded values in features/(user)/community/server/artist-reputation.ts
 */
export const DEFAULT_BADGE_THRESHOLDS: BadgeThresholds = {
  Recognized: 5,
  Acclaimed: 8,
  Master: 11,
};

/**
 * Zod validation schema for badge thresholds.
 * Ensures thresholds are valid numbers in ascending order.
 */
export const badgeThresholdsSchema = z
  .object({
    Recognized: z.number().int().min(0).max(100),
    Acclaimed: z.number().int().min(1).max(100),
    Master: z.number().int().min(1).max(100),
  })
  .refine(
    (data) => data.Recognized < data.Acclaimed && data.Acclaimed < data.Master,
    {
      message:
        "Thresholds must be in ascending order: Recognized < Acclaimed < Master",
      path: ["Acclaimed"],
    },
  );

/**
 * Get the badge tier for a given total net score.
 * Uses the thresholds from the database or falls back to defaults.
 *
 * @param totalScore The artist's total net score across public, non-archived, active posts
 * @param thresholds Optional custom thresholds. If not provided, loads from database or uses defaults.
 * @returns The badge tier ("Emerging", "Recognized", "Acclaimed", or "Master")
 */
export function getCommunityRecognitionBadge(
  totalScore: number,
  thresholds?: BadgeThresholds,
): CommunityRecognitionBadge {
  const thresholdsToUse = thresholds ?? DEFAULT_BADGE_THRESHOLDS;

  if (totalScore >= thresholdsToUse.Master) return "Master";
  if (totalScore >= thresholdsToUse.Acclaimed) return "Acclaimed";
  if (totalScore >= thresholdsToUse.Recognized) return "Recognized";
  return "Emerging";
}

/**
 * Validate that the provided thresholds are valid.
 *
 * @param thresholds The thresholds to validate
 * @returns True if valid, false otherwise
 */
export function validateBadgeThresholds(
  thresholds: Record<string, unknown>,
): thresholds is BadgeThresholds {
  return badgeThresholdsSchema.safeParse(thresholds).success;
}

/**
 * Get the minimum score required for a specific badge tier.
 *
 * @param tier The badge tier ("Recognized", "Acclaimed", "Master")
 * @param thresholds Optional custom thresholds
 * @returns The minimum score required, or undefined if the tier is not configured
 */
export function getBadgeThreshold(
  tier: keyof BadgeThresholds,
  thresholds?: BadgeThresholds,
): number | undefined {
  const thresholdsToUse = thresholds ?? DEFAULT_BADGE_THRESHOLDS;
  return thresholdsToUse[tier];
}

/**
 * Get human-readable label for a badge tier.
 *
 * @param tier The badge tier
 * @returns The label string
 */
export function getBadgeLabel(tier: CommunityRecognitionBadge): string {
  const labels: Record<CommunityRecognitionBadge, string> = {
    Emerging: "Emerging",
    Recognized: "Recognized",
    Acclaimed: "Acclaimed",
    Master: "Master",
  };
  return labels[tier];
}

/**
 * Badge icon names keyed by tier (simple string values).
 * "Emerging" has no icon (badge is hidden for low-recognition artists).
 * These map to lucide-react component names via dynamic import.
 * Note: Emerging is included with a dummy value to satisfy the Record type.
 */
export const badgeIconNames: Record<CommunityRecognitionBadge, string> = {
  Emerging: "",
  Recognized: "Star",
  Acclaimed: "Award",
  Master: "Crown",
};

/**
 * Get the icon component name for a badge tier.
 *
 * @param tier The badge tier
 * @returns The lucide-react icon component name, or null if no icon (Emerging)
 */
export function getBadgeIconName(
  tier: CommunityRecognitionBadge,
): string | null {
  if (tier === "Emerging") return null;
  return badgeIconNames[tier] ?? null;
}
