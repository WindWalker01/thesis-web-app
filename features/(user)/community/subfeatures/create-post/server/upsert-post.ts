"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { postFormSchema } from "../schema/post-form-schema";
import type { UpsertPostInput, UpsertPostResult } from "../types";

export async function upsertPost(input: UpsertPostInput): Promise<UpsertPostResult> {
    try {
        const parsed = postFormSchema.safeParse({
            artId: input.artId,
            visibility: input.visibility,
        });

        if (!parsed.success) {
            return {
                success: false,
                message: "Please fix the form errors.",
                fieldErrors: parsed.error.flatten().fieldErrors,
            };
        }

        const supabase = await createSupabaseServerClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                success: false,
                message: "You must be signed in to continue.",
            };
        }

        const { artId, visibility } = parsed.data;

        const { data: ownedArtwork, error: artworkError } = await supabase
            .from("registered_arts")
            .select("id, owner_id, status")
            .eq("id", artId)
            .eq("owner_id", user.id)
            .eq("status", "active")
            .maybeSingle();

        if (artworkError) {
            return {
                success: false,
                message: artworkError.message,
            };
        }

        if (!ownedArtwork) {
            return {
                success: false,
                message: "Selected artwork was not found, is not yours, or is not active.",
            };
        }

        if (input.postId) {
            const { data: updatedPost, error: updateError } = await supabase
                .from("art_posts")
                .update({
                    art_id: artId,
                    visibility,
                })
                .eq("id", input.postId)
                .eq("user_id", user.id)
                .select("id")
                .single();

            if (updateError) {
                return {
                    success: false,
                    message: updateError.message,
                };
            }

            return {
                success: true,
                postId: updatedPost.id,
                message: "Post updated successfully.",
            };
        }

        const { data: existingArtPost, error: existingArtPostError } = await supabase
            .from("art_posts")
            .select("id")
            .eq("art_id", artId)
            .maybeSingle();

        if (existingArtPostError) {
            return {
                success: false,
                message: existingArtPostError.message,
            };
        }

        if (existingArtPost) {
            return {
                success: false,
                message: "This artwork already has a community post.",
                fieldErrors: {
                    artId: ["This artwork already has a community post."],
                },
            };
        }

        const { data: createdPost, error: createError } = await supabase
            .from("art_posts")
            .insert({
                art_id: artId,
                user_id: user.id,
                visibility,
            })
            .select("id")
            .single();

        if (createError) {
            return {
                success: false,
                message: createError.message,
            };
        }

        return {
            success: true,
            postId: createdPost.id,
            message: "Post created successfully.",
        };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unexpected error while saving the post.",
        };
    }
}