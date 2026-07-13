"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ReviewsQueryParams } from "../types";
import { getReviewQueue } from "./reviews";

export async function exportReviewsCSV(
  params: ReviewsQueryParams
): Promise<{ success: boolean; data?: string; message?: string }> {
  try {
    const supabase = createSupabaseAdminClient();

    const result = await getReviewQueue(params);
    const items = result.items;

    const headers = [
      "Artwork Title",
      "Artist",
      "Status",
      "Similarity %",
      "Risk Level",
      "Source",
      "Reviewer",
      "Created At",
      "Artwork ID",
    ];

    const rows = items.map((item) => {
      const sim: number | null = item.scan?.best_similarity_percentage ?? null;
      const riskLevel =
        sim === null
          ? "Low"
          : sim >= 95
            ? "Critical"
            : sim >= 85
              ? "High"
              : sim >= 75
                ? "Medium"
                : "Low";

      const artworkTitle = item.artwork?.title ?? "Unknown Artwork";
      const artistName = item.artwork?.owner
        ? `${item.artwork.owner.first_name} ${item.artwork.owner.last_name}`
        : "Unknown Artist";

      return [
        `"${artworkTitle}"`,
        `"${artistName}"`,
        item.status,
        sim !== null ? sim.toFixed(2) : "N/A",
        riskLevel,
        item.scan?.best_source ?? "N/A",
        item.reviewer
          ? `"${item.reviewer.first_name} ${item.reviewer.last_name}"`
          : "Unassigned",
        new Date(item.created_at).toISOString(),
        item.artwork_id,
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    return { success: true, data: csv };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Export failed",
    };
  }
}