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
            fullName: profile.fullName,
            // Strip leading @ stored by mapToUserProfile
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

        // Optimistic preview
        const reader = new FileReader();
        reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
        reader.readAsDataURL(file);

        setAvatarError(null);
        setIsUploadingAvatar(true);

        const fd = new FormData();
        fd.append("avatar", file);

        const result = await updateUserAvatar(fd);

        setIsUploadingAvatar(false);

        if (!result.success) {
            setAvatarError(result.message);

            toast.error("Profile Image upload failed", {
                description: result.message,
            });

            setAvatarPreview(profile.profileImage);
            return;
        }

        toast.success("Profile Image updated!");

        // Invalidate profile cache so the banner reflects the new image
        await queryClient.invalidateQueries({ queryKey: profileKeys.current() });
    }

    // ── Form submit ────────────────────────────────────────────────────────────

    async function onSubmit(values: EditProfileFormValues) {
        form.clearErrors("root");

        const fd = new FormData();
        fd.append("fullName", values.fullName);
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

        // Invalidate profile cache so navbar / banner update immediately
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