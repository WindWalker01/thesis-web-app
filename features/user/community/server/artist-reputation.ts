import type { ArtistBadge, ArtistReputation } from "../types";

/**
 * Community Recognition thresholds, keyed on an artist's TOTAL net score
 * aggregated across their public, non-archived, active posts. Owned here so the
 * badge tier and the reputation score share a single source of truth for the
 * numeric cut-offs (the featured-worthy threshold reuses `Recognized`).
 */
export const RECOGNITION_THRESHOLDS = {
    Master: 9,
    Acclaimed: 7,
    Recognized: 5,
} as const;

export function getRecognitionTier(totalScore: number): ArtistBadge {
    if (totalScore >= RECOGNITION_THRESHOLDS.Master) return "Master";
    if (totalScore >= RECOGNITION_THRESHOLDS.Acclaimed) return "Acclaimed";
    if (totalScore >= RECOGNITION_THRESHOLDS.Recognized) return "Recognized";
    return "Emerging";
}

/**
 * A post is "featured-worthy" once its own net score clears this bar. Reuses the
 * first recognition tier so the concept stays in lockstep with the badge and is
 * independent of the client-side Top-5 featured band (which is a display cap,
 * not a quality bar).
 */
export const FEATURED_WORTHY_MIN_SCORE = RECOGNITION_THRESHOLDS.Recognized;

/** Weights for blending the three normalized aggregates. Sum to 1. */
export const REPUTATION_WEIGHTS = {
    netScore: 0.6,
    upvotes: 0.25,
    featured: 0.15,
} as const;

/**
 * Saturation caps: the aggregate value that maps to a full 100 for its
 * component. Values above the cap are clamped, so no single dimension can push
 * the blended score past 100. Tunable in one place.
 */
export const REPUTATION_CAPS = {
    netScore: 100,
    upvotes: 200,
    featured: 5,
} as const;

export type ArtistReputationInput = {
    totalNetScore: number;
    totalUpvotes: number;
    featuredWorthyCount: number;
};

function normalize(value: number, cap: number): number {
    return Math.min(100, Math.max(0, (value / cap) * 100));
}

function pluralize(count: number, noun: string): string {
    return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

/**
 * Blend the three per-artist aggregates into a 0–100 reputation score.
 *
 * Each aggregate is normalized against its saturation cap (linear, clamped to
 * 0–100), then combined with the fixed weights. Net score is the primary
 * signal; upvotes and featured-worthy works refine it. The result is rounded
 * and clamped to a whole number in [0, 100].
 */
export function computeArtistReputation({
    totalNetScore,
    totalUpvotes,
    featuredWorthyCount,
}: ArtistReputationInput): ArtistReputation {
    const blended =
        REPUTATION_WEIGHTS.netScore *
            normalize(totalNetScore, REPUTATION_CAPS.netScore) +
        REPUTATION_WEIGHTS.upvotes *
            normalize(totalUpvotes, REPUTATION_CAPS.upvotes) +
        REPUTATION_WEIGHTS.featured *
            normalize(featuredWorthyCount, REPUTATION_CAPS.featured);

    const score = Math.min(100, Math.max(0, Math.round(blended)));

    const summary =
        `Reputation reflects ${totalNetScore} net score, ` +
        `${pluralize(totalUpvotes, "community upvote")}, and ` +
        `${pluralize(featuredWorthyCount, "featured-worthy work")}.`;

    return { score, summary };
}
