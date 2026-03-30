"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { editProfileSchema } from "../schemas/edit-profile-schema";
import { uploadArtworkImageToCloudinary } from "@/features/(user)/upload-artwork/server/upload-image";

type UpdateProfileResult =
    | { success: true; message: string }
    | { success: false; message: string };

type UpdateAvatarResult =
    | { success: true; imageUrl: string }
    | { success: false; message: string };

/**
 * Updates the authenticated user's profile fields (fullName, username, bio).
 * Called by the edit profile form on submit.
 */
export async function updateUserProfile(
    formData: FormData
): Promise<UpdateProfileResult> {
    try {
        const supabase = await createSupabaseServerClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, message: "Not authenticated." };
        }

        const raw = {
            fullName: formData.get("fullName"),
            username: formData.get("username"),
            bio: formData.get("bio"),
        };

        const parsed = editProfileSchema.safeParse(raw);

        if (!parsed.success) {
            const firstIssue = parsed.error.issues[0];
            return {
                success: false,
                message: firstIssue?.message ?? "Invalid form data.",
            };
        }

        const { fullName, username, bio } = parsed.data;

        // Check username uniqueness (exclude current user)
        const { data: existing } = await supabase
            .from("users")
            .select("id")
            .eq("username", username)
            .neq("id", user.id)
            .maybeSingle();

        if (existing) {
            return { success: false, message: "Username is already taken." };
        }

        const { error: updateError } = await supabase
            .from("users")
            .update({
                full_name: fullName,
                username: username,
                bio: bio || null,
            })
            .eq("id", user.id);

        if (updateError) {
            return { success: false, message: updateError.message };
        }

        return { success: true, message: "Profile updated successfully." };
    } catch (err) {
        return {
            success: false,
            message: err instanceof Error ? err.message : "Failed to update profile.",
        };
    }
}

/**
 * Uploads a new avatar to Cloudinary and updates c_profile_image in the DB.
 * Called separately from the profile text update.
 */
export async function updateUserAvatar(
    formData: FormData
): Promise<UpdateAvatarResult> {
    try {
        const supabase = await createSupabaseServerClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, message: "Not authenticated." };
        }

        const file = formData.get("avatar");

        if (!(file instanceof File) || file.size === 0) {
            return { success: false, message: "No image file provided." };
        }

        const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
        if (file.size > MAX_SIZE) {
            return { success: false, message: "Image must be 5 MB or smaller." };
        }

        const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
        if (!ALLOWED_TYPES.includes(file.type)) {
            return { success: false, message: "Only JPG, PNG, and WebP are supported." };
        }

        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);

        const uploaded = await uploadArtworkImageToCloudinary({
            fileBuffer,
            fileName: file.name,
            folder: "profile-images",
        });

        if (!uploaded.secureUrl) {
            return { success: false, message: "Image upload failed." };
        }

        const { error: updateError } = await supabase
            .from("users")
            .update({ c_profile_image: uploaded.secureUrl })
            .eq("id", user.id);

        if (updateError) {
            return { success: false, message: updateError.message };
        }

        return { success: true, imageUrl: uploaded.secureUrl };
    } catch (err) {
        return {
            success: false,
            message: err instanceof Error ? err.message : "Failed to update avatar.",
        };
    }
}