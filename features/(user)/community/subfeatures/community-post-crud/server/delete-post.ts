"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type DeletePostInput = {
    postId: string;
};

type DeletePostResult =
    | {
        success: true;
        message: string;
    }
    | {
        success: false;
        message: string;
    };

export async function deletePost({
    postId,
}: DeletePostInput): Promise<DeletePostResult> {
    try {
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

        const { data: existingPost, error: existingPostError } = await supabase
            .from("art_posts")
            .select("id, user_id")
            .eq("id", postId)
            .eq("user_id", user.id)
            .maybeSingle();

        if (existingPostError) {
            return {
                success: false,
                message: existingPostError.message,
            };
        }

        if (!existingPost) {
            return {
                success: false,
                message: "Post not found or you do not have permission to delete it.",
            };
        }

        const { error: deleteError } = await supabase
            .from("art_posts")
            .delete()
            .eq("id", postId)
            .eq("user_id", user.id);

        if (deleteError) {
            return {
                success: false,
                message: deleteError.message,
            };
        }

        revalidatePath("/community");

        return {
            success: true,
            message: "Post deleted successfully.",
        };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unexpected error while deleting the post.",
        };
    }
}