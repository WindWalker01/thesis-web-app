"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { editArtworkSchema } from "../../../schemas/edit-artwork-schema";
import {
    canDeleteArtwork,
    canEditArtwork,
} from "@/features/(user)/profile/lib/artwork-permissions";

type ActionResult =
    | { success: true; message: string }
    | { success: false; message: string };

type RawArtworkOwnershipRow = {
    id: string;
    owner_id: string;
    title: string;
    status: string;
    tx_hash: string | null;
    chain: string | null;
    block_number: number | null;
    work_id: string | null;
};

async function getOwnedArtwork(artId: string) {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return {
            success: false as const,
            message: "Not authenticated.",
            supabase,
            user: null,
            artwork: null,
        };
    }

    const { data: artwork, error } = await supabase
        .from("registered_arts")
        .select(`
            id,
            owner_id,
            title,
            status,
            tx_hash,
            chain,
            block_number,
            work_id
        `)
        .eq("id", artId)
        .eq("owner_id", user.id)
        .maybeSingle();

    if (error || !artwork) {
        return {
            success: false as const,
            message: error?.message ?? "Artwork not found.",
            supabase,
            user,
            artwork: null,
        };
    }

    return {
        success: true as const,
        message: "",
        supabase,
        user,
        artwork: artwork as RawArtworkOwnershipRow,
    };
}

export async function updateArtworkMetadata(
    artId: string,
    values: {
        title: string;
        description?: string | null;
    }
): Promise<ActionResult> {
    try {
        const owned = await getOwnedArtwork(artId);

        if (!owned.success || !owned.artwork) {
            return { success: false, message: owned.message };
        }

        const parsed = editArtworkSchema.safeParse({
            title: values.title,
            description: values.description ?? "",
        });

        if (!parsed.success) {
            return {
                success: false,
                message: parsed.error.issues[0]?.message ?? "Invalid form data.",
            };
        }

        const artwork = owned.artwork;

        if (
            !canEditArtwork({
                status: artwork.status,
                txHash: artwork.tx_hash,
                chain: artwork.chain,
                blockNumber: artwork.block_number,
                workId: artwork.work_id,
            })
        ) {
            return {
                success: false,
                message:
                    "This artwork can no longer be edited because it already has a blockchain record or is not in an editable status.",
            };
        }

        const { error: updateError } = await owned.supabase
            .from("registered_arts")
            .update({
                title: parsed.data.title,
                description: parsed.data.description?.trim() || null,
            })
            .eq("id", artId)
            .eq("owner_id", owned.user!.id);

        if (updateError) {
            return { success: false, message: updateError.message };
        }

        return { success: true, message: "Artwork details updated successfully." };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error ? error.message : "Failed to update artwork.",
        };
    }
}

export async function deleteArtwork(artId: string): Promise<ActionResult> {
    try {
        const owned = await getOwnedArtwork(artId);

        if (!owned.success || !owned.artwork) {
            return { success: false, message: owned.message };
        }

        const artwork = owned.artwork;

        if (
            !canDeleteArtwork({
                status: artwork.status,
                txHash: artwork.tx_hash,
                chain: artwork.chain,
                blockNumber: artwork.block_number,
                workId: artwork.work_id,
            })
        ) {
            return {
                success: false,
                message:
                    "Only flagged, under_review, and pending_blockchain artworks without blockchain records can be deleted.",
            };
        }

        const { error: deleteError } = await owned.supabase
            .from("registered_arts")
            .delete()
            .eq("id", artId)
            .eq("owner_id", owned.user!.id);

        if (deleteError) {
            return { success: false, message: deleteError.message };
        }

        return { success: true, message: "Artwork deleted successfully." };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error ? error.message : "Failed to delete artwork.",
        };
    }
}