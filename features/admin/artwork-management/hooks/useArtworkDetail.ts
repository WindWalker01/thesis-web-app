"use client";

import { useQuery } from "@tanstack/react-query";
import type { ArtworkDetail } from "../types";

export function useArtworkDetail(artworkId: string | null) {
  return useQuery<ArtworkDetail>({
    queryKey: ["admin-artwork-detail", artworkId],
    queryFn: async () => {
      if (!artworkId) throw new Error("No artwork ID provided");
      const response = await fetch(`/api/admin/artworks/${artworkId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message ?? "Failed to fetch artwork detail");
      }

      return result.data as ArtworkDetail;
    },
    enabled: !!artworkId,
  });
}