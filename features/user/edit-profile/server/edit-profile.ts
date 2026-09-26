"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireActiveAccount } from "@/lib/account-status";
import { editProfileSchema } from "../schemas/edit-profile-schema";
import { cloudinaryAssetMetadataSchema } from "@/lib/cloudinary/metadata-schema";

type UpdateProfileResult =
    | { success: true; message: string }
    | { success: false; message: string };

type UpdateAvatarResult =
    | { success: true; imageUrl: string }
    | { success: false; message: string };

export async function updateUserProfile(
    formData: FormData
): Promise<UpdateProfileResult> {
    try {
        const supabase = await createSupabaseServerClient();

        let userId: string;
        try {
            userId = await requireActiveAccount();
        } catch {
            return { success: false, message: "Your account is currently suspended or banned. You cannot edit your profile." };
        }

        const raw = {
            firstName: formData.get("firstName"),
            middleName: formData.get("middleName"),
            lastName: formData.get("lastName"),
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

        const { firstName, middleName, lastName, username, bio } = parsed.data;

        // Check username uniqueness (exclude current user)
        const { data: existing } = await supabase
            .from("users")
            .select("id")
            .eq("username", username)
            .neq("id", userId)
            .maybeSingle();

        if (existing) {
            return { success: false, message: "Username is already taken." };
        }

        const { error: updateError } = await supabase
            .from("users")
            .update({
                first_name: firstName,
                middle_name: middleName || null,
                last_name: lastName,
                username,
                bio: bio || null,
            })
            .eq("id", userId);

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

export async function updateUserAvatar(
    formData: FormData
): Promise<UpdateAvatarResult> {
    try {
        const supabase = await createSupabaseServerClient();

        let userId: string;
        try {
            userId = await requireActiveAccount();
        } catch {
            return { success: false, message: "Your account is currently suspended or banned. You cannot update your avatar." };
        }

        // Browser-direct transport: the image was already uploaded to
        // Cloudinary by the client (signed upload); this action only records
        // the metadata, so the file never passes through the serverless
        // request-body cap.
        const parsed = cloudinaryAssetMetadataSchema.safeParse({
            publicId: formData.get("publicId"),
            secureUrl: formData.get("secureUrl"),
            bytes: Number(formData.get("bytes")),
            mimeType: formData.get("mimeType"),
        });

        if (!parsed.success) {
            return {
                success: false,
                message:
                    parsed.error.issues[0]?.message ?? "Invalid image metadata.",
            };
        }

        // Preserve the previous avatar constraints server-side.
        const MAX_SIZE = 5 * 1024 * 1024;
        if (parsed.data.bytes > MAX_SIZE) {
            return { success: false, message: "Image must be 5 MB or smaller." };
        }

        const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
        if (!ALLOWED_TYPES.includes(parsed.data.mimeType ?? "")) {
            return { success: false, message: "Only JPG, PNG, and WebP are supported." };
        }

        const { error: updateError } = await supabase
            .from("users")
            .update({ c_profile_image: parsed.data.secureUrl })
            .eq("id", userId);

        if (updateError) {
            return { success: false, message: updateError.message };
        }

        return { success: true, imageUrl: parsed.data.secureUrl };
    } catch (err) {
        return {
            success: false,
            message: err instanceof Error ? err.message : "Failed to update avatar.",
        };
    }
}