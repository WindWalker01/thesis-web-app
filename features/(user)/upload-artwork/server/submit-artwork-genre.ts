"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type SubmitArtworkGenresInput = {
  artworkId: string;
  genreIds: number[];
};

type SubmitArtworkGenresResult =
  | { success: true }
  | { success: false; message: string };

export async function submitArtworkGenres(
  input: SubmitArtworkGenresInput,
): Promise<SubmitArtworkGenresResult> {
  try {
    const { artworkId, genreIds } = input;

    if (!artworkId) {
      return { success: false, message: "artworkId is required." };
    }

    if (!Array.isArray(genreIds) || genreIds.length === 0) {
      return {
        success: false,
        message: "At least one genre tag is required.",
      };
    }

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "You must be logged in." };
    }

    // Verify the artwork belongs to the current user before inserting genres.
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
        message: "Artwork not found or you do not have permission to tag it.",
      };
    }

    const rows = genreIds.map((genreId) => ({
      art_id: artworkId,
      genre_id: genreId,
    }));

    const { error: insertError } = await supabase
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
        error instanceof Error ? error.message : "Failed to save genre tags.",
    };
  }
}
