"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
    ArtworkDetail,
    IssueSimilarityScan,
    SimilarityReport,
} from "../../../types";
import { formatUploadDate, mapHashStatus, mapOwnershipStatus } from "../../..";
import {
    buildSimilarityReport,
    enrichDatabaseMatchInReport,
} from "../../../server/similarity-report";

type FetchArtworkDetailResult =
    | { success: true; artwork: ArtworkDetail }
    | { success: false; message: string };

type RawArtworkDetailRow = {
    id: string;
    owner_id: string;
    title: string;
    description: string | null;
    c_secure_url: string | null;
    file_hash: string;
    perceptual_hash: string | null;
    author_id_hash: string | null;
    evidence_hash: string | null;
    evidence: unknown | null;
    chain: string | null;
    tx_hash: string | null;
    block_number: number | null;
    work_id: string | null;
    status: string;
    created_at: string;
    plagiarism_hashes: unknown | null;
};

type RawArtGenreRow = {
    art_id: string;
    genre_id: number;
};

type RawGenreRow = {
    id: number;
    name: string;
};

type RawUserRow = {
    id: string;
    full_name: string;
    username: string;
    c_profile_image: string | null;
};

type RawSimilarityScanRow = {
    id: string;
    status: string;
    success: boolean;
    filename: string | null;
    original_hash: string | null;
    total_matches: number;
    best_source: string | null;
    best_link: string | null;
    best_url: string | null;
    best_match_pair: string | null;
    best_similarity_percentage: number | null;
    best_min_combined_distance: number | null;
    best_average_combined_distance: number | null;
    best_max_combined_distance: number | null;
    matches: unknown[] | null;
    hashes: unknown | null;
    raw_response: unknown | null;
    error_message: string | null;
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
};

type RawMatchedArtworkPreview = {
    id: string;
    title: string;
    c_secure_url: string | null;
};

export async function fetchArtworkDetailById(
    artId: string
): Promise<FetchArtworkDetailResult> {
    try {
        const supabase = await createSupabaseServerClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, message: "Not authenticated." };
        }

        const { data, error } = await supabase
            .from("registered_arts")
            .select(`
                id,
                owner_id,
                title,
                description,
                c_secure_url,
                file_hash,
                perceptual_hash,
                author_id_hash,
                evidence_hash,
                evidence,
                chain,
                tx_hash,
                block_number,
                work_id,
                status,
                created_at,
                plagiarism_hashes
            `)
            .eq("id", artId)
            .eq("owner_id", user.id)
            .single();

        if (error || !data) {
            return { success: false, message: error?.message ?? "Artwork not found." };
        }

        const { data: artGenres, error: artGenresError } = await supabase
            .from("art_genres")
            .select("art_id, genre_id")
            .eq("art_id", artId)
            .order("genre_id", { ascending: true });

        if (artGenresError) {
            return { success: false, message: artGenresError.message };
        }

        let category = "Uncategorized";
        const firstGenreId = ((artGenres ?? []) as RawArtGenreRow[])[0]?.genre_id;

        if (firstGenreId !== undefined) {
            const { data: genre, error: genreError } = await supabase
                .from("genres")
                .select("id, name")
                .eq("id", firstGenreId)
                .maybeSingle();

            if (genreError) {
                return { success: false, message: genreError.message };
            }

            category = (genre as RawGenreRow | null)?.name ?? "Uncategorized";
        }

        const { data: creator, error: creatorError } = await supabase
            .from("users")
            .select("id, full_name, username, c_profile_image")
            .eq("id", data.owner_id)
            .maybeSingle();

        if (creatorError) {
            return { success: false, message: creatorError.message };
        }

        const { data: similarityScan, error: similarityError } = await supabase
            .from("art_similarity_scans")
            .select(`
                id,
                status,
                success,
                filename,
                original_hash,
                total_matches,
                best_source,
                best_link,
                best_url,
                best_match_pair,
                best_similarity_percentage,
                best_min_combined_distance,
                best_average_combined_distance,
                best_max_combined_distance,
                matches,
                hashes,
                raw_response,
                error_message,
                started_at,
                completed_at,
                created_at,
                updated_at
            `)
            .eq("art_id", artId)
            .maybeSingle();

        if (similarityError) {
            return { success: false, message: similarityError.message };
        }

        const mappedScan = similarityScan
            ? mapSimilarityScan(similarityScan as RawSimilarityScanRow)
            : null;

        let similarityReport = mappedScan
            ? buildSimilarityReport(mappedScan.rawResponse, {
                success: mappedScan.success,
                filename: mappedScan.filename,
                originalHash: mappedScan.originalHash,
            })
            : null;

        const dbArtworkId = similarityReport?.dbMatch?.url ?? null;

        if (dbArtworkId) {
            const adminSupabase = createSupabaseAdminClient();

            const { data: matchedArt, error: matchedArtError } = await adminSupabase
                .from("registered_arts")
                .select("id, title, c_secure_url")
                .eq("id", dbArtworkId)
                .maybeSingle();

            if (!matchedArtError && matchedArt) {
                similarityReport = enrichDatabaseMatchInReport(
                    similarityReport,
                    matchedArt as RawMatchedArtworkPreview
                );
            }
        }

        return {
            success: true,
            artwork: mapToArtworkDetail(
                data as RawArtworkDetailRow,
                category,
                (creator as RawUserRow | null) ?? null,
                mappedScan,
                similarityReport
            ),
        };
    } catch (err) {
        return {
            success: false,
            message: err instanceof Error ? err.message : "Failed to fetch artwork.",
        };
    }
}

function mapToArtworkDetail(
    raw: RawArtworkDetailRow,
    category: string,
    creator: RawUserRow | null,
    similarityScan: IssueSimilarityScan | null,
    similarityReport: SimilarityReport | null
): ArtworkDetail {
    return {
        id: raw.id,
        ownerId: raw.owner_id,
        title: raw.title,
        description: raw.description,
        img: raw.c_secure_url,
        category,
        uploadDate: formatUploadDate(raw.created_at),
        createdAt: raw.created_at,
        ownershipStatus: mapOwnershipStatus(raw.status, raw.tx_hash),
        hashStatus: mapHashStatus(raw.perceptual_hash),

        fileHash: raw.file_hash,
        perceptualHash: raw.perceptual_hash ?? "",
        authorIdHash: raw.author_id_hash,
        evidenceHash: raw.evidence_hash,
        evidence: raw.evidence,

        chain: raw.chain,
        txHash: raw.tx_hash,
        blockNumber: raw.block_number,
        workId: raw.work_id,
        status: raw.status,

        plagiarismHashes: raw.plagiarism_hashes,

        creator: creator
            ? {
                id: creator.id,
                fullName: creator.full_name,
                username: `@${creator.username}`,
                profileImage: creator.c_profile_image,
            }
            : null,

        similarityScan,
        similarityReport,
    };
}

function mapSimilarityScan(raw: RawSimilarityScanRow): IssueSimilarityScan {
    return {
        id: raw.id,
        status: raw.status,
        success: raw.success,
        filename: raw.filename,
        originalHash: raw.original_hash,
        totalMatches: raw.total_matches,
        bestSource: raw.best_source,
        bestLink: raw.best_link,
        bestUrl: raw.best_url,
        bestMatchPair: raw.best_match_pair,
        bestSimilarityPercentage: raw.best_similarity_percentage,
        bestMinCombinedDistance: raw.best_min_combined_distance,
        bestAverageCombinedDistance: raw.best_average_combined_distance,
        bestMaxCombinedDistance: raw.best_max_combined_distance,
        matches: Array.isArray(raw.matches) ? raw.matches : [],
        hashes: raw.hashes,
        rawResponse: raw.raw_response,
        errorMessage: raw.error_message,
        startedAt: raw.started_at,
        completedAt: raw.completed_at,
        createdAt: raw.created_at,
        updatedAt: raw.updated_at,
    };
}