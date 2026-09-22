"use server";

import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const updateArtworkGenresSchema = z.object({
    artworkId: z.string().min(1, "artworkId is required."),
    genreIds: z
        .array(z.number().int().positive())
        .min(1, "At least one genre tag is required.")
        .max(20, "Too many genre tags selected."),
});

export type UpdateArtworkGenresInput = z.infer<
    typeof updateArtworkGenresSchema
>;

type UpdateArtworkGenresResult =
    | { success: true }
    | { success: false; message: string };

/**
 * Replaces an artwork's genre tags. The owner is verified through the RLS
 * server client, then the delete + insert runs through the service-role admin
 * client because `art_genres` has no user-facing DELETE policy.
 */
export async function updateArtworkGenres(
    input: UpdateArtworkGenresInput
): Promise<UpdateArtworkGenresResult> {
    const parsed = updateArtworkGenresSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: parsed.error.issues[0]?.message ?? "Invalid input.",
        };
    }

    const { artworkId, genreIds } = parsed.data;

    try {
        const supabase = await createSupabaseServerClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, message: "You must be logged in." };
        }

        const { data: artwork, error: fetchError } = await supabase
            .from("registered_arts")
            .select("id")
            .eq("id", artworkId)
            .eq("owner_id", user.id)
            .maybeSingle();

        if (fetchError) {
            return { success: false, message: fetchError.message };
        }

        if (!artwork) {
            return {
                success: false,
                message:
                    "Artwork not found or you do not have permission to edit its genres.",
            };
        }

        const adminSupabase = createSupabaseAdminClient();

        const { error: deleteError } = await adminSupabase
            .from("art_genres")
            .delete()
            .eq("art_id", artworkId);

        if (deleteError) {
            return { success: false, message: deleteError.message };
        }

        const rows = genreIds.map((genreId) => ({
            art_id: artworkId,
            genre_id: genreId,
        }));

        const { error: insertError } = await adminSupabase
            .from("art_genres")
            .insert(rows);

        if (insertError) {
            return { success: false, message: insertError.message };
        }

        return { success: true };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error ? error.message : "Failed to update genres.",
        };
    }
}
