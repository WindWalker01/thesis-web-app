"use client";

import { useState, useMemo } from "react";
import { useUserReports } from "@/features/reports/hooks/useUserReports";
import { useUnreadCount } from "@/features/reports/hooks/useUnreadCount";
import { ReportCard } from "@/features/reports/components/ReportCard";
import { ReportCardSkeleton } from "@/features/reports/components/ReportCardSkeleton";
import { ReportFilters, type FiltersState } from "@/features/reports/components/ReportFilters";
import { DashboardStatsCards } from "@/features/reports/components/DashboardStatsCards";
import { EmptyState } from "@/features/reports/components/EmptyState";
import { useAuth } from "@/features/(user)/auth/hooks/useAuth";
import { Flag, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEFAULT_FILTERS: FiltersState = {
  search: "",
  status: "all",
  reportType: "all",
  sort: "newest",
  unreadOnly: false,
};

export default function MyReportsPage() {
  const { user } = useAuth();
  const { reports, isLoading, isError, error, refetch } = useUserReports();
  const { getReportUnread, totalUnread } = useUnreadCount({
    userId: user?.id ?? "",
    enabled: !!user,
  });
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

    // Unread only filter
    if (filters.unreadOnly) {
      result = result.filter((r) => getReportUnread(r.id) > 0);
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
  }, [reports, filters, getReportUnread]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      {/* Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30">
            <Flag className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Reports</h1>
            <p className="text-sm text-muted-foreground">
              Monitor and manage your submitted infringement reports.
            </p>
          </div>
        </div>
        {!isLoading && !isError && reports.length > 0 && (
          <div className="mt-2 sm:mt-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>
        )}
      </div>

      {/* Dashboard Stats */}
      {!isLoading && !isError && reports.length > 0 && (
        <DashboardStatsCards reports={reports} />
      )}

      {/* Filters */}
      {!isLoading && !isError && reports.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <ReportFilters filters={filters} onFiltersChange={setFilters} />
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
          <div className="space-y-3 pt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <ReportCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Failed to load reports</h3>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            {error ?? "An unexpected error occurred. Please try again."}
          </p>
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      ) : filteredAndSorted.length === 0 ? (
        reports.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <AlertCircle className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No matching reports</h3>
            <p className="mb-2 text-sm text-muted-foreground">
              {filters.unreadOnly
                ? "You have no unread messages in any reports."
                : "Try adjusting your search or filter criteria."}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setFilters({
                  search: "",
                  status: "all",
                  reportType: "all",
                  sort: "newest",
                  unreadOnly: false,
                })
              }
            >
              Clear Filters
            </Button>
          </div>
        )
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {filteredAndSorted.length} of {reports.length} report
              {reports.length !== 1 ? "s" : ""}
              {totalUnread > 0 && (
                <span className="ml-2 text-blue-500">
                  · {totalUnread} unread
                </span>
              )}
            </p>
          </div>
          {filteredAndSorted.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              unreadCount={getReportUnread(report.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
