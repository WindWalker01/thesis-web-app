"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { VoteType } from "../types";

type VoteInput = {
    postId: string;
    voteType: Exclude<VoteType, null>;
};

export async function voteOnPost({ postId, voteType }: VoteInput) {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: "You must be logged in to vote." };
    }

    const { data: existing, error: existingError } = await supabase
        .from("art_reactions")
        .select("id, reaction_type")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle();

    if (existingError) {
        return { success: false, message: existingError.message };
    }

    if (!existing) {
        const { error } = await supabase.from("art_reactions").insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: voteType,
        });

        if (error) {
            return { success: false, message: error.message };
        }

        return { success: true, action: "inserted" as const };
    }

    if (existing.reaction_type === voteType) {
        const { error } = await supabase
            .from("art_reactions")
            .delete()
            .eq("id", existing.id);

        if (error) {
            return { success: false, message: error.message };
        }

        return { success: true, action: "removed" as const };
    }

    const { error } = await supabase
        .from("art_reactions")
        .update({ reaction_type: voteType })
        .eq("id", existing.id);

    if (error) {
        return { success: false, message: error.message };
    }

    return { success: true, action: "updated" as const };
}