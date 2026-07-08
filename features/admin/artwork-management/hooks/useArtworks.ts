"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  ArtworkListItem,
  ArtworkStats,
  ArtworksQueryParams,
  PaginatedArtworksResponse,
} from "../types";

export function useArtworks(params: ArtworksQueryParams) {
  return useQuery<PaginatedArtworksResponse>({
    queryKey: ["admin-artworks", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set("page", String(params.page));
      searchParams.set("limit", String(params.limit));
      searchParams.set("sort_by", params.sort_by);
      searchParams.set("sort_order", params.sort_order);
      if (params.search) searchParams.set("search", params.search);
      if (params.status) searchParams.set("status", params.status);
      if (params.blockchain_status) searchParams.set("blockchain_status", params.blockchain_status);
      if (params.similarity_status) searchParams.set("similarity_status", params.similarity_status);
      if (params.visibility) searchParams.set("visibility", params.visibility);
      if (params.archived) searchParams.set("archived", params.archived);
      if (params.has_reports) searchParams.set("has_reports", params.has_reports);
      if (params.has_similarity_scan) searchParams.set("has_similarity_scan", params.has_similarity_scan);
      if (params.high_similarity) searchParams.set("high_similarity", params.high_similarity);
      if (params.has_blockchain) searchParams.set("has_blockchain", params.has_blockchain);
      if (params.has_evidence) searchParams.set("has_evidence", params.has_evidence);
      if (params.genre) searchParams.set("genre", params.genre);
      if (params.owner) searchParams.set("owner", params.owner);
      if (params.date_from) searchParams.set("date_from", params.date_from);
      if (params.date_to) searchParams.set("date_to", params.date_to);

      const response = await fetch(`/api/admin/artworks?${searchParams.toString()}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message ?? "Failed to fetch artworks");
      }

      return result.data as PaginatedArtworksResponse;
    },
    placeholderData: (prev) => prev,
  });
}

export function useArtworkStats() {
  return useQuery<ArtworkStats>({
    queryKey: ["admin-artworks-stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/artworks?stats=true");
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message ?? "Failed to fetch statistics");
      }

      return result.data as ArtworkStats;
    },
    refetchInterval: 60_000,
  });
}