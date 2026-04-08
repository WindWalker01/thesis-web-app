export type SimilarityReport = {
    similarityPercentage: number | null;
    source: string | null;
    link: string | null;
    url: string | null;
    minCombinedDistance: number | null;
    averageCombinedDistance: number | null;
    maxCombinedDistance: number | null;
    bestMatchPair: string | null;
};

type CheckPlagiarismWebResult = {
    success: boolean;
    filename?: string;
    original_hash?: string;
    hashes?: Record<string, unknown>;
    best_search?: {
        source?: string;
        link?: string;
        url?: string;
        min_combined_distance?: number;
        average_combined_distance?: number;
        max_combined_distance?: number;
        best_match_pair?: string;
        similarity_percentage?: number;
    };
};

function toNullableString(value: unknown): string | null {
    return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function toNullableNumber(value: unknown): number | null {
    return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function buildSimilarityReport(
    result: CheckPlagiarismWebResult,
): SimilarityReport | null {
    const best = result.best_search;

    if (!best) return null;

    return {
        similarityPercentage: toNullableNumber(best.similarity_percentage),
        source: toNullableString(best.source),
        link: toNullableString(best.link),
        url: toNullableString(best.url),
        minCombinedDistance: toNullableNumber(best.min_combined_distance),
        averageCombinedDistance: toNullableNumber(best.average_combined_distance),
        maxCombinedDistance: toNullableNumber(best.max_combined_distance),
        bestMatchPair: toNullableString(best.best_match_pair),
    };
}

export function buildSimilarityScanInsert(params: {
    artId: string;
    ownerId: string;
    result: CheckPlagiarismWebResult;
    status?: "pending" | "running" | "completed" | "failed" | "cancelled";
    errorMessage?: string | null;
}) {
    const { artId, ownerId, result, status = "completed", errorMessage = null } =
        params;

    const report = buildSimilarityReport(result);
    const best = result.best_search;

    return {
        art_id: artId,
        owner_id: ownerId,
        status,
        filename: typeof result.filename === "string" ? result.filename : null,
        original_hash:
            typeof result.original_hash === "string" ? result.original_hash : null,
        success: Boolean(result.success),
        total_matches: best ? 1 : 0,
        best_source: report?.source ?? null,
        best_link: report?.link ?? null,
        best_url: report?.url ?? null,
        best_match_pair: report?.bestMatchPair ?? null,
        best_similarity_percentage: report?.similarityPercentage ?? null,
        best_min_combined_distance: report?.minCombinedDistance ?? null,
        best_average_combined_distance: report?.averageCombinedDistance ?? null,
        best_max_combined_distance: report?.maxCombinedDistance ?? null,
        matches: best
            ? [
                {
                    rank: 1,
                    source: report?.source,
                    link: report?.link,
                    url: report?.url,
                    min_combined_distance: report?.minCombinedDistance,
                    average_combined_distance: report?.averageCombinedDistance,
                    max_combined_distance: report?.maxCombinedDistance,
                    best_match_pair: report?.bestMatchPair,
                    similarity_percentage: report?.similarityPercentage,
                    is_best: true,
                },
            ]
            : [],
        hashes: result.hashes ?? null,
        raw_response: result,
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
    };
}