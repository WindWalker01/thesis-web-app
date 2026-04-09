"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/client-utils";

export type PlagiarismHistoryItem = {
    id: string;
    artId: string;
    artwork: string;
    artworkStatus: string;
    date: string;
    matches: number;
    similarity: number | null;
    status: "clean" | "warning" | "running" | "failed";
};

type FetchPlagiarismHistoryResult =
    | {
        success: true;
        history: PlagiarismHistoryItem[];
    }
    | {
        success: false;
        message: string;
    };

type RawScanRow = {
    id: string;
    art_id: string;
    status: "pending" | "running" | "completed" | "failed" | "cancelled";
    total_matches: number;
    best_similarity_percentage: number | null;
    created_at: string;
    completed_at: string | null;
};

type RawArtworkRow = {
    id: string;
    title: string;
    status: string;
};

function mapScanStatus(
    status: RawScanRow["status"],
    totalMatches: number
): PlagiarismHistoryItem["status"] {
    if (status === "failed" || status === "cancelled") return "failed";
    if (status === "pending" || status === "running") return "running";
    return totalMatches > 0 ? "warning" : "clean";
}

export async function fetchCurrentUserPlagiarismHistory(): Promise<FetchPlagiarismHistoryResult> {
    try {
        const supabase = await createSupabaseServerClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                success: false,
                message: "You must be logged in to view plagiarism history.",
            };
        }

        const { data: scans, error: scansError } = await supabase
            .from("art_similarity_scans")
            .select(`
                id,
                art_id,
                status,
                total_matches,
                best_similarity_percentage,
                created_at,
                completed_at
            `)
            .eq("owner_id", user.id)
            .order("created_at", { ascending: false });

        if (scansError) {
            return {
                success: false,
                message: scansError.message,
            };
        }

        const typedScans = (scans ?? []) as RawScanRow[];

        if (typedScans.length === 0) {
            return {
                success: true,
                history: [],
            };
        }

        const artIds = [...new Set(typedScans.map((scan) => scan.art_id))];

        const { data: artworks, error: artworksError } = await supabase
            .from("registered_arts")
            .select("id, title, status")
            .in("id", artIds);

        if (artworksError) {
            return {
                success: false,
                message: artworksError.message,
            };
        }

        const typedArtworks = (artworks ?? []) as RawArtworkRow[];

        const artworkTitleMap = new Map(
            typedArtworks.map((art) => [art.id, art.title])
        );

        const artworkStatusMap = new Map(
            typedArtworks.map((art) => [art.id, art.status])
        );

        const history: PlagiarismHistoryItem[] = typedScans.map((scan) => ({
            id: scan.id,
            artId: scan.art_id,
            artwork: artworkTitleMap.get(scan.art_id) ?? "Untitled Artwork",
            artworkStatus: artworkStatusMap.get(scan.art_id) ?? "unknown",
            date: formatDate(scan.completed_at ?? scan.created_at),
            matches: scan.total_matches,
            similarity: scan.best_similarity_percentage,
            status: mapScanStatus(scan.status, scan.total_matches),
        }));

        return {
            success: true,
            history,
        };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch plagiarism history.",
        };
    }
}