import type { SearchMatch, OtherSearchMatch } from "../types";

/**
 * Classification of a plagiarism match by where it originated.
 *
 * The plagiarism checker already encodes this in `match.type`:
 *   - `"database"`  -> a match against a registered artwork (internal)
 *   - `"internet"`  -> a match returned by the external plagiarism/search API
 *
 * These helpers centralise that mapping so the UI/action layer never hardcodes
 * the strings again, and so the action shown to the user is driven by the
 * match's *source*, never by its similarity score.
 */
export type PlagiarismMatchOrigin = "internal" | "external";

function resolveOrigin(type: string | null | undefined): PlagiarismMatchOrigin {
  return type === "database" ? "internal" : "external";
}

/** True when the match is against an artwork already registered in ArtForgeLab. */
export function isInternalMatch(
  match: Pick<SearchMatch, "type"> | Pick<OtherSearchMatch, "artwork_id"> | null | undefined,
): boolean {
  if (!match) return false;
  return resolveOrigin((match as Pick<SearchMatch, "type">).type ?? null) === "internal";
}

/** True when the match comes from the external plagiarism/search API. */
export function isExternalMatch(
  match: Pick<SearchMatch, "type"> | Pick<OtherSearchMatch, "artwork_id"> | null | undefined,
): boolean {
  if (!match) return false;
  return !isInternalMatch(match);
}

/**
 * A minimal, serialisable description of a match, used to preserve the selected
 * match/action across the authentication round-trip (sessionStorage) and as the
 * payload for the report/manual-review server actions.
 */
export type PlagiarismMatchContext = {
  /** Origin: "internal" (registered artwork) or "external" (web/API). */
  origin: PlagiarismMatchOrigin;
  /** Registered artwork UUID for internal matches. */
  matchedArtworkId: string | null;
  /** Matched artwork title (internal only). */
  matchedArtworkTitle: string | null;
  /** Matched artwork URL (community post or image URL; internal only). */
  matchedArtworkUrl: string | null;
  /** Matched artwork image (Cloudinary URL) — used to render a visual preview. */
  matchedArtworkImageUrl: string | null;
  /** Public community post URL of the matched artwork, when it has one. */
  matchedArtworkCommunityUrl: string | null;
  /** Matched artwork owner display name (internal only). */
  matchedArtworkAuthor: string | null;
  /** External result URL (external only). */
  externalUrl: string | null;
  /** External source, e.g. "Google Images" / "SerpAPI" (external only). */
  externalSource: string | null;
  /** Similarity percentage (0-100). */
  similarity: number | null;
  /** Perceptual hash of the artwork being checked. */
  originalHash: string | null;
  /** Persisted similarity scan id, when available (upload flow). */
  scanId: string | null;
};

/**
 * Builds a serialisable match context from a `SearchMatch`. For internal
 * matches the artwork UUID is `match.url`; for external matches the result URL
 * is `match.link ?? match.url` and the source is `match.source`.
 */
export function buildMatchContext(
  match: SearchMatch | null | undefined,
  options: { originalHash?: string | null; scanId?: string | null } = {},
): PlagiarismMatchContext | null {
  if (!match) return null;

  const internal = isInternalMatch(match);

  return {
    origin: internal ? "internal" : "external",
    matchedArtworkId: internal ? match.url || null : null,
    matchedArtworkTitle: internal ? match.title ?? null : null,
    matchedArtworkUrl: internal
      ? match.communityUrl ?? match.imageUrl ?? null
      : null,
    // Kept separate from `matchedArtworkUrl` so the report UI can render the
    // artwork as an image instead of showing a raw URL string.
    matchedArtworkImageUrl: internal ? match.imageUrl ?? null : null,
    matchedArtworkCommunityUrl: internal ? match.communityUrl ?? null : null,
    matchedArtworkAuthor: internal ? match.authorName ?? null : null,
    externalUrl: internal ? null : match.link ?? match.url ?? null,
    externalSource: internal ? null : match.source ?? null,
    similarity: typeof match.similarity === "number" ? match.similarity : null,
    originalHash: options.originalHash ?? null,
    scanId: options.scanId ?? null,
  };
}
