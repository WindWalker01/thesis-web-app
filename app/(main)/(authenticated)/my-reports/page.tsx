"use client";

import { useState, useMemo } from "react";
import { useUserReports } from "@/features/reports/hooks/useUserReports";
import { ReportCard } from "@/features/reports/components/ReportCard";
import { ReportCardSkeleton } from "@/features/reports/components/ReportCardSkeleton";
import { ReportFilters, type FiltersState } from "@/features/reports/components/ReportFilters";
import { EmptyState } from "@/features/reports/components/EmptyState";
import { Separator } from "@/components/ui/separator";

const DEFAULT_FILTERS: FiltersState = {
  search: "",
  status: "all",
  reportType: "all",
  sort: "newest",
};

export default function MyReportsPage() {
  const { reports, isLoading, isError, error, refetch } = useUserReports();
  const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS);

  const filteredAndSorted = useMemo(() => {
    let result = [...reports];

    // Search filter
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.report_type.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (filters.status !== "all") {
      result = result.filter((r) => r.status === filters.status);
    }

    // Report type filter
    if (filters.reportType !== "all") {
      result = result.filter((r) => r.report_type === filters.reportType);
    }

    // Sort
    switch (filters.sort) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case "recently_updated":
        result.sort((a, b) => {
          const aDate = a.resolved_at ?? a.created_at;
          const bDate = b.resolved_at ?? b.created_at;
          return new Date(bDate).getTime() - new Date(aDate).getTime();
        });
        break;
    }

    return result;
  }, [reports, filters]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor and manage your submitted infringement reports.
        </p>
      </div>

      <Separator />

      {/* Filters */}
      <ReportFilters filters={filters} onFiltersChange={setFilters} />

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <ReportCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <svg
              className="h-6 w-6 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold">Failed to load reports</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {error ?? "An unexpected error occurred. Please try again."}
          </p>
          <button
            onClick={() => refetch()}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Try again
          </button>
        </div>
      ) : filteredAndSorted.length === 0 ? (
        reports.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <svg
                className="h-6 w-6 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold">No matching reports</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Showing {filteredAndSorted.length} of {reports.length} report
            {reports.length !== 1 ? "s" : ""}
          </p>
          {filteredAndSorted.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
            />
          ))}
        </div>
      )}
    </div>
  );
}