"use client";

import { useQuery } from "@tanstack/react-query";
import type { ReviewDetail } from "../types";

export function useReviewDetail(reviewId: string | null) {
  return useQuery<ReviewDetail>({
    queryKey: ["admin-artwork-review-detail", reviewId],
    queryFn: async () => {
      if (!reviewId) throw new Error("No review ID provided");

      const response = await fetch(`/api/admin/artwork-verification/${reviewId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message ?? "Failed to load review details");
      }

      return result.data as ReviewDetail;
    },
    enabled: !!reviewId,
  });
}