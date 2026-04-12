"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface ResolvedDbArtwork {
    id: string;
    title: string;
    imageUrl: string | null;
}

/**
 * Given a UUID returned by the plagiarism API as `db.url`,
 * look up the registered artwork in Supabase and return its
 * Cloudinary image URL and title.
 */
export async function resolveDbArtworkById(
    artworkId: string
): Promise<ResolvedDbArtwork | null> {
    try {
        const supabase = createSupabaseAdminClient();

        const { data, error } = await supabase
            .from("registered_arts")
            .select("id, title, c_secure_url")
            .eq("id", artworkId)
            .maybeSingle();

        if (error || !data) return null;

        return {
            id: data.id,
            title: data.title,
            imageUrl: data.c_secure_url ?? null,
        };
    } catch {
        return null;
    }
}