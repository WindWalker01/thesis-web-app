"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchRecognitionProfileForArtwork } from "../server/community-value-for-artwork";
import type { RecognitionProfileData } from "@/features/(user)/community/types";

type UseArtworkRecognitionProfileReturn = {
    profile: RecognitionProfileData | null;
    isLoading: boolean;
};

export function useArtworkRecognitionProfile(
    artId: string | null | undefined,
): UseArtworkRecognitionProfileReturn {
    const { data, isLoading } = useQuery({
        queryKey: ["artwork-recognition-profile", artId],
        queryFn: async () => {
            if (!artId) return null;
            return fetchRecognitionProfileForArtwork(artId);
        },
        enabled: !!artId,
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 1,
        meta: { persist: false },
    });

    return {
        profile: data ?? null,
        isLoading: !!artId && isLoading,
    };
}