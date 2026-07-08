"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, RefreshCw, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useArtworks, useArtworkStats } from "../hooks/useArtworks";
import { useArtworkDetail } from "../hooks/useArtworkDetail";
import { ArtworkStats } from "./ArtworkStats";
import { ArtworkToolbar } from "./ArtworkToolbar";
import { ArtworkFilters } from "./ArtworkFilters";
import { ArtworkTable } from "./ArtworkTable";
import { ArtworkDrawer } from "./ArtworkDrawer";
import { ArtworksPageSkeleton } from "./page-skeleton";
import { EmptyArtwork } from "./EmptyArtwork";
import type { ArtworkFilters as FilterState, ArtworkSortOption } from "../types";
import { DEFAULT_FILTERS } from "../types";

export default function ArtworkManagementPage() {
  const searchParams = useSearchParams();

  // Pagination
  const [page, setPage] = useState(() => parseInt(searchParams.get("page") ?? "1"));
  const [perPage, setPerPage] = useState(20);

  // Search
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Filters
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    status: searchParams.get("status") ?? "all",
    sort_by: (searchParams.get("sort_by") as ArtworkSortOption) ?? "newest",
  });

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Drawer
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Determine sort params
  const getSortParams = () => {
    const sortOrder = filters.sort_by === "oldest" || filters.sort_by === "alphabetical" ? "asc" as const : "desc" as const;
    return { sort_by: filters.sort_by, sort_order: sortOrder };
  };

  const sortParams = getSortParams();

  // Queries
  const {
    data: artworksData,
    isLoading: artworksLoading,
    error: artworksError,
    refetch: refetchArtworks,
  } = useArtworks({
    page,
    limit: perPage,
    search: debouncedSearch || undefined,
    status: filters.status !== "all" ? filters.status : undefined,
    visibility: filters.visibility !== "all" ? filters.visibility : undefined,
    archived: filters.archived !== "all" ? filters.archived : undefined,
    has_reports: filters.has_reports !== "all" ? filters.has_reports : undefined,
    has_similarity_scan: filters.has_similarity_scan !== "all" ? filters.has_similarity_scan : undefined,
    high_similarity: filters.high_similarity !== "all" ? filters.high_similarity : undefined,
    has_blockchain: filters.has_blockchain !== "all" ? filters.has_blockchain : undefined,
    has_evidence: filters.has_evidence !== "all" ? filters.has_evidence : undefined,
    similarity_status: filters.similarity_status !== "all" ? filters.similarity_status : undefined,
    blockchain_status: filters.blockchain_status !== "all" ? filters.blockchain_status : undefined,
    genre: filters.genre || undefined,
    owner: filters.owner || undefined,
    date_from: filters.date_from || undefined,
    date_to: filters.date_to || undefined,
    ...sortParams,
  });

  const { data: stats, isLoading: statsLoading } = useArtworkStats();

  const {
    data: artworkDetail,
    isLoading: detailLoading,
    error: detailError,
    refetch: refetchDetail,
  } = useArtworkDetail(drawerOpen ? selectedArtworkId : null);

  // Handlers
  const openDrawer = useCallback((artworkId: string) => {
    setSelectedArtworkId(artworkId);
    setDrawerOpen(true);
  }, []);

  const handleAction = useCallback(async (action: string, reason?: string) => {
    if (!selectedArtworkId) return;
    try {
      const response = await fetch(`/api/admin/artworks/${selectedArtworkId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason, notes: reason }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
        await refetchDetail();
        await refetchArtworks();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to perform action");
    }
  }, [selectedArtworkId, refetchDetail, refetchArtworks]);

  const handleBulkAction = useCallback(async (action: string) => {
    if (selectedIds.length === 0) return;
    try {
      const response = await fetch(`/api/admin/artworks/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, artworkIds: selectedIds }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
        setSelectedIds([]);
        await refetchArtworks();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to perform bulk action");
    }
  }, [selectedIds, refetchArtworks]);

  const handleExport = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/artworks?export=csv");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `artworks-export-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to export artworks");
    }
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearch("");
    setPage(1);
  }, []);

  // Loading state
  if (artworksLoading && page === 1) {
    return <ArtworksPageSkeleton />;
  }

  // Error state
  if (artworksError && !artworksLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="max-w-md text-center space-y-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="text-xl font-bold">Failed to Load Artworks</h2>
          <p className="text-muted-foreground text-sm">
            {artworksError instanceof Error ? artworksError.message : "An error occurred"}
          </p>
          <Button onClick={() => refetchArtworks()} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  const artworks = artworksData?.items ?? [];
  const total = artworksData?.total ?? 0;
  const totalPages = artworksData?.totalPages ?? 0;

  return (
    <>
      {/* Top Bar */}
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <ImageIcon className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold tracking-tight sm:text-xl">
            Artwork Management
          </h1>
          {total > 0 && (
            <Badge variant="secondary" className="text-xs">
              {total} total
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4 lg:p-6 space-y-6">
        {/* Statistics Cards */}
        <ArtworkStats stats={stats} isLoading={statsLoading} />

        {/* Toolbar */}
        <ArtworkToolbar
          search={search}
          onSearchChange={setSearch}
          onRefresh={() => refetchArtworks()}
          onExport={handleExport}
          onToggleFilters={() => setFiltersOpen(!filtersOpen)}
          filtersOpen={filtersOpen}
          isLoading={artworksLoading}
          totalCount={total}
          selectedCount={selectedIds.length}
          onBulkAction={handleBulkAction}
        />

        {/* Filters Panel */}
        {filtersOpen && (
          <ArtworkFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClear={clearFilters}
          />
        )}

        {/* Artwork Table */}
        {artworks.length === 0 && !artworksLoading ? (
          <EmptyArtwork
            type={debouncedSearch || Object.values(filters).some(v => v !== "" && v !== "all") ? "no_results" : "no_artworks"}
            onReset={clearFilters}
          />
        ) : (
          <ArtworkTable
            artworks={artworks}
            total={total}
            totalPages={totalPages}
            page={page}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
            onViewArtwork={openDrawer}
            onSelectionChange={setSelectedIds}
            isLoading={artworksLoading}
          />
        )}
      </div>

      {/* Artwork Detail Drawer */}
      <ArtworkDrawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) setSelectedArtworkId(null);
        }}
        detail={artworkDetail}
        isLoading={detailLoading}
        error={detailError instanceof Error ? detailError.message : null}
        onAction={handleAction}
        onRefresh={() => refetchDetail()}
      />
    </>
  );
}