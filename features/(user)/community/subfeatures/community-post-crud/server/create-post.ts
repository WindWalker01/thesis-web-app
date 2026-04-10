"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PostEditorInitialData } from "../types";

type GetPostEditorDataParams = {
    postId?: string;
};

export async function getPostEditorData({
    postId,
}: GetPostEditorDataParams = {}): Promise<PostEditorInitialData> {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("You must be signed in to manage posts.");
    }

    const { data: artworks, error: artworksError } = await supabase
        .from("registered_arts")
        .select(`
      id,
      title,
      description,
      c_secure_url,
      status,
      created_at,
      art_posts!left (
        id
      )
    `)
        .eq("owner_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

    if (artworksError) {
        throw new Error(artworksError.message);
    }

    const mappedArtworks =
        artworks?.map((art) => ({
            id: art.id,
            title: art.title,
            description: art.description,
            imageUrl: art.c_secure_url,
            createdAt: art.created_at,
            status: art.status,
            alreadyPosted: Array.isArray(art.art_posts) && art.art_posts.length > 0,
        })) ?? [];

    let existingPost = null;

    if (postId) {
        const { data: post, error: postError } = await supabase
            .from("art_posts")
            .select(`
        id,
        art_id,
        user_id,
        visibility,
        is_archived,
        created_at,
        updated_at
      `)
            .eq("id", postId)
            .eq("user_id", user.id)
            .maybeSingle();

        if (postError) {
            throw new Error(postError.message);
        }

        if (post) {
            existingPost = {
                id: post.id,
                artId: post.art_id,
                userId: post.user_id,
                visibility: post.visibility,
                isArchived: post.is_archived,
                createdAt: post.created_at,
                updatedAt: post.updated_at,
            };
        }
    }

    return {
        artworks: mappedArtworks,
        existingPost,
    };
}