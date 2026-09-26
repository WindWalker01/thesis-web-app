"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateArtworkGenres } from "../server/update-artwork-genres";
import { artworkKeys } from "@/features/(user)/profile/hooks/useFetchProfileArtworks";
import { artworkDetailKeys } from "./useArtworkDetailPage";

type UseUpdateArtworkGenresReturn = {
    isSaving: boolean;
    save: (genreIds: number[]) => Promise<boolean>;
};

export function useUpdateArtworkGenres(
    artId: string
): UseUpdateArtworkGenresReturn {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [isSaving, setIsSaving] = useState(false);

    async function save(genreIds: number[]): Promise<boolean> {
        if (isSaving) return false;

        setIsSaving(true);
        const toastId = toast.loading("Saving genre tags...");

        try {
            const result = await updateArtworkGenres({
                artworkId: artId,
                genreIds,
            });

            if (!result.success) {
                toast.error("Failed to update genres", {
                    id: toastId,
                    description: result.message,
                });
                return false;
            }

            await queryClient.invalidateQueries({ queryKey: artworkKeys.all() });
            await queryClient.invalidateQueries({
                queryKey: artworkDetailKeys.byId(artId),
            });
            router.refresh();

            toast.success("Genres updated", {
                id: toastId,
                description: "The artwork's genre tags were saved.",
            });
            return true;
        } finally {
            setIsSaving(false);
        }
    }

    return { isSaving, save };
}
