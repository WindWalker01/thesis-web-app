"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
    editProfileSchema,
    type EditProfileFormValues,
} from "../schemas/edit-profile-schema";
import {
    updateUserProfile,
    updateUserAvatar,
} from "../server/edit-profile";
import { uploadFileToCloudinary } from "@/lib/cloudinary/direct-upload";
import { describeAnalysisError } from "@/lib/analysis-errors";
import { profileKeys } from "@/features/(user)/profile/hooks/useFetchProfile";
import type { UserProfile } from "@/features/(user)/profile/server/profile";

type UseEditProfileFormProps = {
    profile: UserProfile;
};

export function useEditProfileForm({ profile }: UseEditProfileFormProps) {
    const queryClient = useQueryClient();
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.profileImage);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [avatarError, setAvatarError] = useState<string | null>(null);

    const form = useForm<EditProfileFormValues>({
        resolver: zodResolver(editProfileSchema),
        defaultValues: {
            firstName: profile.firstName ?? "",
            middleName: profile.middleName ?? "",
            lastName: profile.lastName ?? "",
            username: profile.username.startsWith("@")
                ? profile.username.slice(1)
                : profile.username,
            bio: profile.bio ?? "",
        },
    });

    // ── Avatar handling ────────────────────────────────────────────────────────

    function handleAvatarClick() {
        avatarInputRef.current?.click();
    }

    async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preserve the previous avatar constraints, now enforced client-side
        // since the image uploads browser-direct to Cloudinary.
        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            const message = "Image must be 5 MB or smaller.";
            setAvatarError(message);
            toast.error("Profile Image upload failed", { description: message });
            return;
        }

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            const message = "Only JPG, PNG, and WebP are supported.";
            setAvatarError(message);
            toast.error("Profile Image upload failed", { description: message });
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
        reader.readAsDataURL(file);

        setAvatarError(null);
        setIsUploadingAvatar(true);

        try {
            // Browser-direct storage upload (signed) — the raw file never
            // passes through the Next.js server.
            const uploaded = await uploadFileToCloudinary(file, "profile-images");

            const fd = new FormData();
            fd.append("publicId", uploaded.publicId);
            fd.append("secureUrl", uploaded.secureUrl);
            fd.append("bytes", String(uploaded.bytes));
            fd.append("mimeType", file.type);

            const result = await updateUserAvatar(fd);

            if (!result.success) {
                setAvatarError(result.message);
                toast.error("Profile Image upload failed", {
                    description: result.message,
                });
                setAvatarPreview(profile.profileImage);
                return;
            }

            toast.success("Profile Image updated!");
            await queryClient.invalidateQueries({ queryKey: profileKeys.current() });
        } catch (err) {
            const message = describeAnalysisError(err);
            setAvatarError(message);
            toast.error("Profile Image upload failed", { description: message });
            setAvatarPreview(profile.profileImage);
        } finally {
            setIsUploadingAvatar(false);
        }
    }

    // ── Form submit ────────────────────────────────────────────────────────────

    async function onSubmit(values: EditProfileFormValues) {
        form.clearErrors("root");

        const fd = new FormData();
        fd.append("firstName", values.firstName);
        fd.append("middleName", values.middleName ?? "");
        fd.append("lastName", values.lastName);
        fd.append("username", values.username);
        fd.append("bio", values.bio ?? "");

        const result = await updateUserProfile(fd);

        if (!result.success) {
            form.setError("root", { message: result.message });
            toast.error("Update failed", {
                description: result.message,
            });
            return;
        }

        toast.success("Profile Updated!", {
            description: "Your changes have been saved successfully.",
        });

        await queryClient.invalidateQueries({ queryKey: profileKeys.current() });
    }

    return {
        form,
        avatarInputRef,
        avatarPreview,
        isUploadingAvatar,
        avatarError,
        handleAvatarClick,
        handleAvatarChange,
        onSubmit,
    };
}