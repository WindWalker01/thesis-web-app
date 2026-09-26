"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { showNsfwContentSchema } from "../schema/show-nsfw-content-schema";
import type { ShowNsfwContentResult } from "../types";

export async function updateShowNsfwContentAction(
    input: unknown
): Promise<ShowNsfwContentResult> {
    try {
        const parsed = showNsfwContentSchema.safeParse(input);

        if (!parsed.success) {
            return {
                success: false,
                message: "Invalid preference.",
            };
        }

        const supabase = await createSupabaseServerClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                message: "Unauthorized.",
            };
        }

        const { error } = await supabase
            .from("user_preferences")
            .upsert(
                {
                    user_id: user.id,
                    show_nsfw_content: parsed.data.showNsfwContent,
                    updated_at: new Date().toISOString(),
                },
                {
                    onConflict: "user_id",
                }
            );

        if (error) {
            console.error("Failed to update NSFW preference:", error);

            return {
                success: false,
                message: "Failed to update preference.",
            };
        }

        return {
            success: true,
            message: "Preference updated.",
            showNsfwContent: parsed.data.showNsfwContent,
        };
    } catch (error) {
        console.error("Unexpected error updating NSFW preference:", error);

        return {
            success: false,
            message: "Something went wrong. Please try again.",
        };
    }
}

export async function getShowNsfwContentAction(): Promise<boolean> {
    try {
        const supabase = await createSupabaseServerClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return false;
        }

        const { data, error } = await supabase
            .from("user_preferences")
            .select("show_nsfw_content")
            .eq("user_id", user.id)
            .maybeSingle();

        if (error) {
            console.error("Failed to fetch NSFW preference:", error);
            return false;
        }

        return data?.show_nsfw_content ?? false;
    } catch (error) {
        console.error("Unexpected error fetching NSFW preference:", error);
        return false;
    }
}