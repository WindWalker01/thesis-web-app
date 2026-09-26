"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCurrentUserArtworks } from "../server/artworks";
import { Artwork, ProfileScope } from "../types";

export const artworkKeys = {
  all: () => ["artworks"] as const,
  currentUser: (scope: ProfileScope) => ["artworks", "current-user", scope] as const,
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

export function useCurrentUserArtworks(
  scope: ProfileScope = "gallery"
): UseArtworksReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: artworkKeys.currentUser(scope),
    queryFn: async () => {
      const result = await fetchCurrentUserArtworks(scope);

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