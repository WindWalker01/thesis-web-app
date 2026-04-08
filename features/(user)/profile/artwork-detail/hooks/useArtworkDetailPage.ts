"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchArtworkDetailById } from "../server/artwork-detail";
import type { ArtworkDetail } from "../../types";

export const artworkDetailKeys = {
    all: () => ["artwork-detail"] as const,
    byId: (id: string) => ["artwork-detail", id] as const,
};

const ARTWORK_DETAIL_QUERY_OPTIONS = {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    meta: { persist: false },
} as const;

type UseArtworkDetailPageReturn = {
    artwork: ArtworkDetail | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
};

export function useArtworkDetailPage(
    id: string | null | undefined
): UseArtworkDetailPageReturn {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: artworkDetailKeys.byId(id ?? ""),
        queryFn: async () => {
            const result = await fetchArtworkDetailById(id!);

            if (!result.success) {
                throw new Error(result.message);
            }

            return result.artwork;
        },
        enabled: !!id,
        ...ARTWORK_DETAIL_QUERY_OPTIONS,
    });

    return {
        artwork: data ?? null,
        isLoading: !!id && isLoading,
        error: error instanceof Error ? error.message : null,
        refetch,
    };
}