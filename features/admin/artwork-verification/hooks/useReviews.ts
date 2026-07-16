"use client";

import { useQuery } from "@tanstack/react-query";
import type { ReviewQueueItem, ReviewStatistics, ReviewActivityItem, ReviewsQueryParams } from "../types";

interface UseReviewsParams {
  page: number;
  limit: number;
  status?: string;
  similarity?: string;
  date?: string;
  artist?: string;
  reviewer?: string;
  source?: string;
  search?: string;
  sortBy: string;
}

interface ReviewsResponse {
  items: ReviewQueueItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useReviews(params: UseReviewsParams) {
  return useQuery<ReviewsResponse>({
    queryKey: ["admin-artwork-reviews", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set("page", String(params.page));
      searchParams.set("limit", String(params.limit));
      if (params.search) searchParams.set("search", params.search);
      if (params.status && params.status !== "all") searchParams.set("status", params.status);
      if (params.similarity && params.similarity !== "all") searchParams.set("similarity", params.similarity);
      if (params.date && params.date !== "all") searchParams.set("date", params.date);
      if (params.artist) searchParams.set("artist", params.artist);
      if (params.reviewer) searchParams.set("reviewer", params.reviewer);
      if (params.source && params.source !== "all") searchParams.set("source", params.source);
      searchParams.set("sortBy", params.sortBy);

      const response = await fetch(`/api/admin/artwork-verification?${searchParams.toString()}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message ?? "Failed to fetch reviews");
      }

      return result.data as ReviewsResponse;
    },
    placeholderData: (prev) => prev,
  });
}

export function useReviewStatistics() {
  return useQuery<ReviewStatistics>({
    queryKey: ["admin-artwork-review-stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/artwork-verification/stats");
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message ?? "Failed to fetch statistics");
      }

      return result.data as ReviewStatistics;
    },
    refetchInterval: 60_000,
  });
}

export function usePendingReviewCount() {
  return useQuery<number>({
    queryKey: ["admin-artwork-review-pending-count"],
    queryFn: async () => {
      const response = await fetch("/api/admin/artwork-verification/count");
      const result = await response.json();

      if (!result.success) {
        return 0;
      }

      return result.data as number;
    },
    refetchInterval: 30_000,
  });
}

export function useReviewActivity() {
  return useQuery<ReviewActivityItem[]>({
    queryKey: ["admin-artwork-review-activity"],
    queryFn: async () => {
      const response = await fetch("/api/admin/artwork-verification/activity");
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message ?? "Failed to fetch activity");
      }

      return result.data as ReviewActivityItem[];
    },
    refetchInterval: 30_000,
  });
}