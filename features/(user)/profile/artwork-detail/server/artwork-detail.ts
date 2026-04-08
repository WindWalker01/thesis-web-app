"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ArtworkDetail } from "../../types";
import { formatUploadDate, mapHashStatus, mapOwnershipStatus } from "../..";

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

        return {
            success: true,
            artwork: mapToArtworkDetail(
                data as RawArtworkDetailRow,
                category,
                (creator as RawUserRow | null) ?? null
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
    creator: RawUserRow | null
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
    };
}