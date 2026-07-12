"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireActiveAccount } from "@/lib/account-status";
import type { VoteType } from "../types";

type VoteInput = {
    postId: string;
    voteType: Exclude<VoteType, null>;
};

export async function voteOnPost({ postId, voteType }: VoteInput) {
    const supabase = await createSupabaseServerClient();

    let userId: string;
    try {
        userId = await requireActiveAccount();
    } catch {
        return { success: false, message: "Your account is currently suspended or banned. You cannot vote." };
    }

    const { data: existing, error: existingError } = await supabase
        .from("art_reactions")
        .select("id, reaction_type")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .maybeSingle();

    if (existingError) {
        return { success: false, message: existingError.message };
    }

    if (!existing) {
        const { error } = await supabase.from("art_reactions").insert({
            post_id: postId,
            user_id: userId,
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