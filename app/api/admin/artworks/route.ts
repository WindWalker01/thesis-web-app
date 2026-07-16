import { NextRequest, NextResponse } from "next/server";
import { getArtworksList, getArtworkStats } from "@/features/admin/artwork-management/server/artworks";
import { exportArtworksCSV } from "@/features/admin/artwork-management/server/export";
import type { ArtworksQueryParams, ArtworkSortOption } from "@/features/admin/artwork-management/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Check if this is a stats request
    if (searchParams.get("stats") === "true") {
      const stats = await getArtworkStats();
      return NextResponse.json({ success: true, data: stats });
    }

    // Check if this is an export request
    if (searchParams.get("export") === "csv") {
      const csv = await exportArtworksCSV({
        status: searchParams.get("status") ?? undefined,
        date_from: searchParams.get("date_from") ?? undefined,
        date_to: searchParams.get("date_to") ?? undefined,
      });
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="artworks-export-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    // Parse query params
    const params: ArtworksQueryParams = {
      page: parseInt(searchParams.get("page") ?? "1"),
      limit: parseInt(searchParams.get("limit") ?? "20"),
      search: searchParams.get("search") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      blockchain_status: searchParams.get("blockchain_status") ?? undefined,
      similarity_status: searchParams.get("similarity_status") ?? undefined,
      visibility: searchParams.get("visibility") ?? undefined,
      archived: searchParams.get("archived") ?? undefined,
      has_reports: searchParams.get("has_reports") ?? undefined,
      has_similarity_scan: searchParams.get("has_similarity_scan") ?? undefined,
      high_similarity: searchParams.get("high_similarity") ?? undefined,
      has_blockchain: searchParams.get("has_blockchain") ?? undefined,
      has_evidence: searchParams.get("has_evidence") ?? undefined,
      genre: searchParams.get("genre") ?? undefined,
      owner: searchParams.get("owner") ?? undefined,
      date_from: searchParams.get("date_from") ?? undefined,
      date_to: searchParams.get("date_to") ?? undefined,
      sort_by: (searchParams.get("sort_by") as ArtworkSortOption) ?? "newest",
      sort_order: (searchParams.get("sort_order") as "asc" | "desc") ?? "desc",
    };

    const result = await getArtworksList(params);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: { message: error instanceof Error ? error.message : "Failed to fetch artworks" },
      },
      { status: 500 }
    );
  }
}