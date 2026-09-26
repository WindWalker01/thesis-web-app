"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Genre } from "../../../types";

type FetchGenreCatalogResult =
    | { success: true; genres: Genre[] }
    | { success: false; message: string };

/**
 * Returns the full genre catalog so an owner can assign/edit tags on the
 * artwork detail page. Reads are allowed for authenticated users via RLS.
 */
export async function fetchGenreCatalog(): Promise<FetchGenreCatalogResult> {
    try {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from("genres")
            .select("id, name")
            .order("name", { ascending: true });

        if (error) {
            return { success: false, message: error.message };
        }

        const genres: Genre[] = ((data ?? []) as { id: number; name: string }[]).map(
            (genre) => ({ id: genre.id, name: genre.name })
        );

        return { success: true, genres };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error ? error.message : "Failed to load genres.",
        };
    }
}
