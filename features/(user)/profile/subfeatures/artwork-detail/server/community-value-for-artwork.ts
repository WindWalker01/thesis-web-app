"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildRecognitionProfile } from "@/features/(user)/community/server/artwork-recognition";
import type { RecognitionProfileData } from "@/features/(user)/community/types";

/**
 * Fetch the Artwork Recognition Profile for an artwork by art_id.
 *
 * Queries the associated art_post to get the basic engagement data, then
 * delegates to buildRecognitionProfile to construct the full profile from
 * observable database facts.
 *
 * Returns null if the artwork has no community post or on error.
 */
export async function fetchRecognitionProfileForArtwork(
    artId: string,
): Promise<RecognitionProfileData | null> {
    try {
        const supabase = await createSupabaseServerClient();

        // 1. Fetch the art_post for this artwork
        const { data: postRow, error: postError } = await supabase
            .from("art_posts")
            .select("id, upvote_count, downvote_count, score, user_id, created_at")
            .eq("art_id", artId)
            .maybeSingle();

        if (postError || !postRow) {
            return null;
        }

        // 2. Build the full recognition profile from observable facts
        const profile = await buildRecognitionProfile({
            postId: postRow.id,
            artId,
            ownerId: postRow.user_id,
            netScore: postRow.score ?? 0,
            upvoteCount: postRow.upvote_count ?? 0,
            downvoteCount: postRow.downvote_count ?? 0,
            createdAt: postRow.created_at,
        });

        return profile;
    } catch {
        return null;
    }
}