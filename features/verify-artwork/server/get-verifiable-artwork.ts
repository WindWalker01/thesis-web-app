"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { VerifiableArtworkItem } from "../types";

type GetVerifiableArtworksResult =
    | { success: true; items: VerifiableArtworkItem[] }
    | { success: false; message: string };

type RawArtworkRow = {
    id: string;
    title: string;
    description: string | null;
    c_secure_url: string | null;
    created_at: string;
    status: string;
    chain: string | null;
    tx_hash: string | null;
    block_number: number | null;
    work_id: string | null;
    file_hash: string;
    perceptual_hash: string | null;
    author_id_hash: string | null;
    evidence_hash: string | null;
};

export async function getVerifiableArtworks(): Promise<GetVerifiableArtworksResult> {
    try {
        const supabase = await createSupabaseServerClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, message: "You must be signed in to verify artworks." };
        }

        const { data, error } = await supabase
            .from("registered_arts")
            .select(`
                id,
                title,
                description,
                c_secure_url,
                created_at,
                status,
                chain,
                tx_hash,
                block_number,
                work_id,
                file_hash,
                perceptual_hash,
                author_id_hash,
                evidence_hash
            `)
            .eq("owner_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            return { success: false, message: error.message };
        }

        const items: VerifiableArtworkItem[] = ((data ?? []) as RawArtworkRow[]).map(
            (artwork) => ({
                id: artwork.id,
                title: artwork.title,
                description: artwork.description,
                imageUrl: artwork.c_secure_url,
                createdAt: artwork.created_at,
                status: artwork.status,
                chain: artwork.chain,
                txHash: artwork.tx_hash,
                blockNumber: artwork.block_number,
                workId: artwork.work_id,
                fileHash: artwork.file_hash,
                perceptualHash: artwork.perceptual_hash,
                authorIdHash: artwork.author_id_hash,
                evidenceHash: artwork.evidence_hash,
            })
        );

        return { success: true, items };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to load your artworks.",
        };
    }
}