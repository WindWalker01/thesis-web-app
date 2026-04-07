"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCurrentUserArtworks } from "../server/artworks";
import { Artwork } from "../types";

export const artworkKeys = {
    all: () => ["artworks"] as const,
    currentUser: () => ["artworks", "current-user"] as const,
};

const ARTWORK_QUERY_OPTIONS = {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    meta: { persist: false },
} as const;

type UseArtworksReturn = {
    artworks: Artwork[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
};

export function useCurrentUserArtworks(): UseArtworksReturn {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: artworkKeys.currentUser(),
        queryFn: async () => {
            const result = await fetchCurrentUserArtworks();

            if (!result.success) {
                throw new Error(result.message);
            }

            return result.artworks;
        },
        ...ARTWORK_QUERY_OPTIONS,
    });

    return {
        artworks: data ?? [],
        isLoading,
        error: error instanceof Error ? error.message : null,
        refetch,
    };
}