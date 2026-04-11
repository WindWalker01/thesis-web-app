import type {
    SimilarityHashes,
    SimilarityMatch,
    SimilarityReport,
    SimilaritySourceType,
} from "../types";

type RawSimilarityApiMatch = {
    type?: string;
    source?: string;
    url?: string;
    link?: string;
    similarity?: number;
};

type RawSimilarityApiResponse = {
    success?: boolean;
    filename?: string;
    original_hash?: string;
    db?: RawSimilarityApiMatch | null;
    web?: RawSimilarityApiMatch | null;
    best_match?: RawSimilarityApiMatch | null;
    hashes?: SimilarityHashes | null;
};

type RegisteredArtworkLookup = {
    id: string;
    title: string;
    c_secure_url: string | null;
};

function normalizeType(value: string | undefined): SimilaritySourceType | null {
    if (value === "database" || value === "internet") {
        return value;
    }

    return null;
}

export function mapSimilarityMatch(
    raw: RawSimilarityApiMatch | null | undefined
): SimilarityMatch | null {
    if (!raw) return null;

    const type = normalizeType(raw.type);
    if (!type) return null;

    return {
        type,
        source: raw.source ?? null,
        url: raw.url ?? null,
        link: raw.link ?? null,
        similarity: typeof raw.similarity === "number" ? raw.similarity : null,
    };
}

export function buildSimilarityReport(
    rawResponse: unknown,
    fallback: {
        success: boolean;
        filename: string | null;
        originalHash: string | null;
    }
): SimilarityReport | null {
    if (!rawResponse || typeof rawResponse !== "object") {
        return {
            filename: fallback.filename,
            originalHash: fallback.originalHash,
            success: fallback.success,
            dbMatch: null,
            webMatch: null,
            bestMatch: null,
            hashes: null,
            rawResponse,
        };
    }

    const raw = rawResponse as RawSimilarityApiResponse;

    return {
        filename: raw.filename ?? fallback.filename,
        originalHash: raw.original_hash ?? fallback.originalHash,
        success: raw.success ?? fallback.success,
        dbMatch: mapSimilarityMatch(raw.db),
        webMatch: mapSimilarityMatch(raw.web),
        bestMatch: mapSimilarityMatch(raw.best_match),
        hashes: raw.hashes ?? null,
        rawResponse,
    };
}

export function formatSimilarityPercentage(value: number | null): string {
    return value === null ? "N/A" : `${Number(value).toFixed(2)}%`;
}

export function getSimilarityLevel(value: number | null): string {
    if (value === null) return "No similarity recorded";
    if (value >= 100) return "Exact match candidate";
    if (value >= 80) return "Very high similarity";
    if (value >= 50) return "High similarity";
    if (value >= 25) return "Moderate similarity";
    if (value > 0) return "Low similarity";
    return "No similarity recorded";
}

export function enrichDatabaseMatchInReport(
    report: SimilarityReport | null,
    matchedArtwork: RegisteredArtworkLookup | null
): SimilarityReport | null {
    if (!report?.dbMatch || !matchedArtwork) {
        return report;
    }

    return {
        ...report,
        dbMatch: {
            ...report.dbMatch,
            imageUrl: matchedArtwork.c_secure_url,
            title: matchedArtwork.title,
        },
        bestMatch:
            report.bestMatch?.type === "database"
                ? {
                    ...report.bestMatch,
                    imageUrl: matchedArtwork.c_secure_url,
                    title: matchedArtwork.title,
                }
                : report.bestMatch,
    };
}

export function getSimilaritySummary(report: SimilarityReport | null): string {
    if (!report) {
        return "No stored similarity report is available for this artwork yet.";
    }

    const best = report.bestMatch;
    const db = report.dbMatch;
    const web = report.webMatch;

    if (best?.type === "internet") {
        return `The strongest saved similarity signal currently comes from an internet source${best.source ? ` (${best.source})` : ""
            } at ${formatSimilarityPercentage(best.similarity)}.`;
    }

    if (best?.type === "database") {
        return `The strongest saved similarity signal currently comes from a registered artwork match at ${formatSimilarityPercentage(
            best.similarity
        )}.`;
    }

    if (db || web) {
        return "Saved scan data includes structured similarity matches, but a single best-match summary was not recorded.";
    }

    return "A scan record exists, but it does not yet include structured database or internet match entries.";
}