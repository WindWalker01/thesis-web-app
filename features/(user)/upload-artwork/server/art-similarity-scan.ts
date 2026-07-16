import type {
  SearchMatch,
  CheckPlagiarismWebResult,
} from "@/features/plagiarise-checker/types";

export type SimilarityReport = {
  similarityPercentage: number | null;
  source: string | null;
  link: string | null;
  url: string | null;
  type: string | null;
  previewImageUrl: string | null;
  matchedArtworkId: string | null;
  matchedArtworkTitle: string | null;
  matchedArtworkImageUrl: string | null;
  minCombinedDistance: number | null;
  averageCombinedDistance: number | null;
  maxCombinedDistance: number | null;
  bestMatchPair: number | null;
};

export type NormalizedSimilarityMatch = {
  type: string | null;
  source: string | null;
  link: string | null;
  url: string | null;
  similarity: number | null;
};

const REPORT_DATABASE_RENDER_THRESHOLD = 70;

/**
 * Minimum similarity (percentage) any match must reach before it is shown in the
 * report card. If the best match to display is below this, no report is rendered
 * at all — regardless of whether it came from the database or the internet.
 */
const REPORT_MIN_RENDER_THRESHOLD = 70;

function toNullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function toNullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeMatch(
  match?: SearchMatch | null,
): NormalizedSimilarityMatch | null {
  if (!match) return null;

  const similarity = toNullableNumber(match.similarity);
  const type = toNullableString(match.type);
  const source = toNullableString(match.source);
  const link = toNullableString(match.link);
  const url = toNullableString(match.url);

  if (!type && !source && !link && !url && similarity === null) {
    return null;
  }

  return {
    type,
    source,
    link,
    url,
    similarity,
  };
}

function getMatchKey(match: NormalizedSimilarityMatch): string {
  return [
    match.type ?? "",
    match.source ?? "",
    match.link ?? "",
    match.url ?? "",
    match.similarity ?? "",
  ].join("|");
}

function compareMatches(
  a: NormalizedSimilarityMatch,
  b: NormalizedSimilarityMatch,
): number {
  const similarityA = a.similarity ?? -1;
  const similarityB = b.similarity ?? -1;

  if (similarityA !== similarityB) {
    return similarityB - similarityA;
  }

  const databaseWeightA = a.type === "database" ? 1 : 0;
  const databaseWeightB = b.type === "database" ? 1 : 0;

  return databaseWeightB - databaseWeightA;
}

export function getSimilarityMatches(
  result: CheckPlagiarismWebResult,
): NormalizedSimilarityMatch[] {
  const rawMatches = [result.db, result.web, result.best_match]
    .map(normalizeMatch)
    .filter((match): match is NormalizedSimilarityMatch => Boolean(match));

  const uniqueMatches = new Map<string, NormalizedSimilarityMatch>();

  for (const match of rawMatches) {
    uniqueMatches.set(getMatchKey(match), match);
  }

  return Array.from(uniqueMatches.values()).sort(compareMatches);
}

export function getPrimarySimilarityMatch(
  result: CheckPlagiarismWebResult,
): NormalizedSimilarityMatch | null {
  return getSimilarityMatches(result)[0] ?? null;
}

/**
 * Display-only selector for the similarity report shown to the user.
 *
 * Rules (in order):
 * - If the strongest overall match is from the database but is below 70%,
 *   prefer the best internet match instead, when available.
 * - If the match that would be displayed is still below 70% — whether it came
 *   from the database or the internet — do not render any report at all.
 *
 * This does NOT affect moderation/blocking logic. It only affects what
 * the similarity report card displays after upload.
 */
export function getSimilarityReportMatch(
  result: CheckPlagiarismWebResult,
): NormalizedSimilarityMatch | null {
  const matches = getSimilarityMatches(result);
  const primary = matches[0] ?? null;

  if (!primary) return null;

  const primarySimilarity = primary.similarity ?? 0;

  let selected = primary;

  if (
    primary.type === "database" &&
    primarySimilarity < REPORT_DATABASE_RENDER_THRESHOLD
  ) {
    const internetFallback =
      matches.find((match) => match.type === "internet") ?? null;

    if (internetFallback) {
      selected = internetFallback;
    }
  }

  // Suppress the report entirely when the match to display is below the minimum
  // render threshold, regardless of its source.
  if ((selected.similarity ?? 0) < REPORT_MIN_RENDER_THRESHOLD) {
    return null;
  }

  return selected;
}

export function buildSimilarityReport(
  result: CheckPlagiarismWebResult,
): SimilarityReport | null {
  const best = getSimilarityReportMatch(result);

  if (!best) return null;

  return {
    similarityPercentage: best.similarity,
    source: best.source,
    link: best.link,
    url: best.url,
    type: best.type,
    previewImageUrl: best.type === "internet" ? best.url : null,
    matchedArtworkId: best.type === "database" ? best.url : null,
    matchedArtworkTitle: null,
    matchedArtworkImageUrl: null,
    minCombinedDistance: null,
    averageCombinedDistance: null,
    maxCombinedDistance: null,
    bestMatchPair: null,
  };
}

/**
 * Builds the insert payload for a new art_similarity_scans record.
 *
 * Since the plagiarism scan runs synchronously before the artwork is created,
 * the scan result is already available when we insert. This function builds
 * a complete payload with all fields populated at once.
 */
export function buildSimilarityScanInsert(params: {
  artId: string;
  ownerId: string;
  result: CheckPlagiarismWebResult;
  status?: "completed" | "failed";
  errorMessage?: string | null;
}) {
  const {
    artId,
    ownerId,
    result,
    status = "completed",
    errorMessage = null,
  } = params;

  const matches = getSimilarityMatches(result);
  const primary = matches[0] ?? null;

  console.log(
    `[Similarity Scan] Building scan insert for art ${artId} — status: ${status}, matches: ${matches.length}`,
  );

  const now = new Date().toISOString();

  return {
    art_id: artId,
    owner_id: ownerId,
    status,
    started_at: now,
    completed_at: now,
    filename: typeof result.filename === "string" ? result.filename : null,
    original_hash:
      typeof result.original_hash === "string" ? result.original_hash : null,
    success: status === "completed" ? Boolean(result.success) : false,
    total_matches: matches.length,
    best_source: primary?.source ?? null,
    best_link: primary?.link ?? null,
    best_url: primary?.url ?? null,
    best_match_pair: null,
    best_similarity_percentage: primary?.similarity ?? null,
    best_min_combined_distance: null,
    best_average_combined_distance: null,
    best_max_combined_distance: null,
    matches: matches.map((match, index) => ({
      rank: index + 1,
      type: match.type,
      source: match.source,
      link: match.link,
      url: match.url,
      min_combined_distance: null,
      average_combined_distance: null,
      max_combined_distance: null,
      best_match_pair: null,
      similarity_percentage: match.similarity,
      is_best: index === 0,
    })),
    hashes: result.hashes ?? null,
    raw_response: result,
    error_message: errorMessage,
  };
}