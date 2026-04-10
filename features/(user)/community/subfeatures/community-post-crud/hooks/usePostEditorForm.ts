"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { postFormSchema, type PostFormValues } from "../schema/post-form-schema";
import { upsertPost } from "../server/upsert-post";
import type {
    PostEditorInitialData,
    PostEditorMode,
    UserArtworkOption,
} from "../types";

type UsePostEditorFormParams = {
    mode: PostEditorMode;
    postId?: string;
    initialData: PostEditorInitialData;
};

export function usePostEditorForm({
    mode,
    postId,
    initialData,
}: UsePostEditorFormParams) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [serverMessage, setServerMessage] = useState<string | null>(null);

    const existingPost = initialData.existingPost;

    const form = useForm<PostFormValues>({
        resolver: zodResolver(postFormSchema),
        defaultValues: {
            artId: existingPost?.artId ?? "",
            visibility: existingPost?.visibility ?? "public",
        },
    });

    const selectedArtworkId = form.watch("artId");

    const selectedArtwork = useMemo<UserArtworkOption | null>(() => {
        return (
            initialData.artworks.find((artwork) => artwork.id === selectedArtworkId) ??
            null
        );
    }, [initialData.artworks, selectedArtworkId]);

    const selectableArtworks = useMemo(() => {
        if (mode === "edit" && existingPost?.artId) {
            return initialData.artworks.map((artwork) => ({
                ...artwork,
                disabled: artwork.alreadyPosted && artwork.id !== existingPost.artId,
            }));
        }

        return initialData.artworks.map((artwork) => ({
            ...artwork,
            disabled: artwork.alreadyPosted,
        }));
    }, [existingPost?.artId, initialData.artworks, mode]);

    async function handleValidSubmit(values: PostFormValues) {
        setServerMessage(null);
        form.clearErrors();
        setIsPending(true);

        try {
            const result = await upsertPost({
                postId,
                artId: values.artId,
                visibility: values.visibility,
            });

            if (!result.success) {
                setServerMessage(result.message);

                if (result.fieldErrors) {
                    for (const [field, messages] of Object.entries(result.fieldErrors)) {
                        const message = messages?.[0];
                        if (!message) continue;

                        form.setError(field as keyof PostFormValues, {
                            type: "server",
                            message,
                        });
                    }
                }

                toast.error(result.message);
                return;
            }

            toast.success(result.message);

            router.refresh();
            router.push("/community");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Something went wrong while saving your post.";

            setServerMessage(message);
            toast.error(message);
        } finally {
            setIsPending(false);
        }
    }

    return {
        form,
        isPending,
        mode,
        serverMessage,
        selectedArtwork,
        selectableArtworks,
        onSubmit: form.handleSubmit(handleValidSubmit),
    };
}