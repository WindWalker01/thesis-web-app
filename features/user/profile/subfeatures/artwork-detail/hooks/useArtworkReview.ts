"use client";

import { useQuery } from "@tanstack/react-query";
import { getArtworkReviewData } from "@/features/(user)/upload-artwork/server/get-artwork-review";
import type { ArtworkReviewData } from "@/features/(user)/upload-artwork/server/get-artwork-review";

export const artworkReviewKeys = {
  all: () => ["artwork-review"] as const,
  byArtwork: (artworkId: string) => ["artwork-review", artworkId] as const,
};

export function useArtworkReview(artworkId: string | null) {
  return useQuery<ArtworkReviewData>({
    queryKey: artworkReviewKeys.byArtwork(artworkId ?? ""),
    queryFn: async () => {
      if (!artworkId) throw new Error("No artwork ID provided");

      const result = await getArtworkReviewData(artworkId);

      if (!result.success || !result.data) {
        throw new Error(result.message ?? "Failed to load review data");
      }

      return result.data;
    },
    enabled: !!artworkId,
    staleTime: 1000 * 60 * 2,
    retry: 1,
    meta: { persist: false },
  });
}