type SearchMatch = {
  type?: string;
  source?: string;
  link?: string;
  url?: string;
  similarity?: number;
};

type HashSet = {
  phash?: string;
  dhash?: string;
  whash?: string;
};

type CheckPlagiarismWebResult = {
  success: boolean;
  filename?: string;
  original_hash?: string;
  hashes?:
  | {
    transforms?: Record<string, HashSet>;
    blocks?: Record<string, HashSet>;
  }
  | Record<string, unknown>
  | null;
  db?: SearchMatch | null;
  web?: SearchMatch | null;
  best_match?: SearchMatch | null;
};

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
 * Rule:
 * - If the strongest overall match is from the database but is below 75%,
 *   do not render that database match in the report.
 * - Fallback to the best internet match instead, when available.
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

  if (
    primary.type === "database" &&
    primarySimilarity < REPORT_DATABASE_RENDER_THRESHOLD
  ) {
    const internetFallback =
      matches.find((match) => match.type === "internet") ?? null;

    if (internetFallback) {
      return internetFallback;
    }
  }

  return primary;
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

export function buildSimilarityScanInsert(params: {
  artId: string;
  ownerId: string;
  result: CheckPlagiarismWebResult;
  status?: "pending" | "running" | "completed" | "failed" | "cancelled";
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

  return {
    art_id: artId,
    owner_id: ownerId,
    status,
    filename: typeof result.filename === "string" ? result.filename : null,
    original_hash:
      typeof result.original_hash === "string" ? result.original_hash : null,
    success: Boolean(result.success),
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
    completed_at: new Date().toISOString(),
  };
}