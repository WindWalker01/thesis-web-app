"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useReviews, useReviewStatistics } from "../hooks/useReviews";
import { useReviewDetail } from "../hooks/useReviewDetail";
import { ReviewStatsCards } from "./ReviewStatsCards";
import { ReviewToolbar } from "./ReviewToolbar";
import { ReviewFilters } from "./ReviewFilters";
import { ReviewQueueTable } from "./ReviewQueueTable";
import { ArtworkVerificationSkeleton } from "./page-skeleton";
import { ArtworkVerificationInfoBanner } from "./InfoBanner";
import { ReviewStatusDescription } from "./StatusDescription";
import { ReviewQuickViewDialog } from "./ReviewQuickViewDialog";
import { exportReviewsCSV } from "../server/export";
import { assignReviewer, unassignReviewer } from "../server/reviews";
import type { ReviewFilters as FilterState } from "../types";
import { DEFAULT_REVIEW_FILTERS } from "../types";

export default function ArtworkVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pagination
  const [page, setPage] = useState(() => parseInt(searchParams.get("page") ?? "1"));
  const [perPage, setPerPage] = useState(20);

  // Search and filters
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_REVIEW_FILTERS,
    status: searchParams.get("status") ?? "all",
    sortBy: searchParams.get("sortBy") ?? "highest_similarity",
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Get sort params
  const getSortParams = () => {
    switch (filters.sortBy) {
      case "oldest":
        return { sortBy: "oldest" as const, sortOrder: "asc" as const };
      case "newest":
        return { sortBy: "newest" as const, sortOrder: "desc" as const };
      case "most_matches":
        return { sortBy: "most_matches" as const, sortOrder: "desc" as const };
      default:
        return { sortBy: "highest_similarity" as const, sortOrder: "desc" as const };
    }
  };

  const sortParams = getSortParams();

  // Queries
  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    error: reviewsError,
    refetch: refetchReviews,
  } = useReviews({
    page,
    limit: perPage,
    search: debouncedSearch,
    status: filters.status !== "all" ? filters.status : undefined,
    similarity: filters.similarity !== "all" ? filters.similarity : undefined,
    date: filters.date !== "all" ? filters.date : undefined,
    artist: filters.artist || undefined,
    reviewer: filters.reviewer || undefined,
    source: filters.source !== "all" ? filters.source : undefined,
    sortBy: sortParams.sortBy,
  });

  const { data: stats, isLoading: statsLoading } = useReviewStatistics();

  // Quick view dialog
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    data: reviewDetail,
    isLoading: detailLoading,
    error: detailError,
    refetch: refetchDetail,
  } = useReviewDetail(dialogOpen ? selectedReviewId : null);

  const queryClient = useQueryClient();

  // Helper to invalidate all review-related queries
  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["admin-artwork-reviews"] });
    queryClient.invalidateQueries({ queryKey: ["admin-artwork-review-stats"] });
    queryClient.invalidateQueries({ queryKey: ["admin-artwork-review-pending-count"] });
  }, [queryClient]);

  // Handlers
  const handleViewReview = useCallback((reviewId: string) => {
    setSelectedReviewId(reviewId);
    setDialogOpen(true);
  }, []);

  const handleAssign = useCallback(async (reviewId: string) => {
    try {
      const result = await assignReviewer(reviewId, "__self__");
      if (result.success) {
        toast.success(result.message);
        invalidateAll();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to assign review");
    }
  }, [invalidateAll]);

  const handleUnassign = useCallback(async (reviewId: string) => {
    try {
      const result = await unassignReviewer(reviewId);
      if (result.success) {
        toast.success(result.message);
        invalidateAll();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to unassign review");
    }
  }, [invalidateAll]);

  const handleExport = useCallback(async () => {
    try {
      const result = await exportReviewsCSV({
        page: 1,
        limit: 10000,
        status: filters.status !== "all" ? filters.status : undefined,
        similarity: filters.similarity !== "all" ? filters.similarity : undefined,
        date: filters.date !== "all" ? filters.date : undefined,
        artist: filters.artist || undefined,
        reviewer: filters.reviewer || undefined,
        source: filters.source !== "all" ? filters.source : undefined,
        search: debouncedSearch || undefined,
        sortBy: sortParams.sortBy,
        sortOrder: "desc",
      });

      if (!result.success || !result.data) {
        toast.error(result.message ?? "Export failed");
        return;
      }

      const blob = new Blob([result.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `artwork-reviews-export-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Export completed");
    } catch {
      toast.error("Export failed");
    }
  }, [filters, debouncedSearch, sortParams]);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_REVIEW_FILTERS);
    setSearch("");
    setPage(1);
  }, []);

  // Loading state
  if (reviewsLoading && page === 1) {
    return <ArtworkVerificationSkeleton />;
  }

  // Error state
  if (reviewsError && !reviewsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="max-w-md text-center space-y-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="text-xl font-bold">Failed to Load Reviews</h2>
          <p className="text-muted-foreground text-sm">
            {reviewsError instanceof Error ? reviewsError.message : "An error occurred"}
          </p>
          <Button onClick={() => refetchReviews()} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  const reviews = reviewsData?.items ?? [];
  const total = reviewsData?.total ?? 0;
  const totalPages = reviewsData?.totalPages ?? 0;

  return (
    <>
      {/* Top Bar */}
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold tracking-tight sm:text-xl">
            Artwork Verification
          </h1>
          {total > 0 && (
            <Badge variant="secondary" className="text-xs">
              {total} total
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4 lg:p-6 space-y-6">
        {/* Informational Banner */}
        <ArtworkVerificationInfoBanner />

        {/* Status Description */}
        {filters.status !== "all" && (
          <ReviewStatusDescription status={filters.status} />
        )}

        {/* Statistics Cards */}
        <ReviewStatsCards stats={stats} isLoading={statsLoading} />

        {/* Toolbar */}
        <ReviewToolbar
          search={search}
          onSearchChange={setSearch}
          onRefresh={() => refetchReviews()}
          onExport={handleExport}
          onToggleFilters={() => setFiltersOpen(!filtersOpen)}
          filtersOpen={filtersOpen}
          isLoading={reviewsLoading}
          totalCount={total}
        />

        {/* Filters Panel */}
        {filtersOpen && (
          <ReviewFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClear={clearFilters}
          />
        )}

        {/* Queue Table */}
        <ReviewQueueTable
          reviews={reviews}
          total={total}
          totalPages={totalPages}
          page={page}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
          onViewReview={handleViewReview}
          isLoading={reviewsLoading}
          onClearFilters={clearFilters}
        />
      </div>

      {/* Review Quick View Dialog */}
      <ReviewQuickViewDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedReviewId(null);
        }}
        detail={reviewDetail}
        isLoading={detailLoading}
        error={detailError instanceof Error ? detailError.message : null}
        onRefresh={() => refetchDetail()}
      />
    </>
  );
}