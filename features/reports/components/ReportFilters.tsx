"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/client-utils";
import type { ReportStatus, ReportType } from "@/features/reports/types";
import { REPORT_TYPE_LABELS } from "@/features/reports/lib/report-utils";
import { STATUS_LABELS } from "@/features/reports/lib/report-utils";

export type FiltersState = {
  search: string;
  status: ReportStatus | "all";
  reportType: ReportType | "all";
  sort: "newest" | "oldest" | "recently_updated";
  unreadOnly: boolean;
};

type ReportFiltersProps = {
  filters: FiltersState;
  onFiltersChange: (filters: FiltersState) => void;
};

export function ReportFilters({ filters, onFiltersChange }: ReportFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchInput(e.target.value);
    },
    []
  );

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onFiltersChange({ ...filters, search: searchInput });
    },
    [filters, searchInput, onFiltersChange]
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      onFiltersChange({
        ...filters,
        status: value as ReportStatus | "all",
      });
    },
    [filters, onFiltersChange]
  );

  const handleTypeChange = useCallback(
    (value: string) => {
      onFiltersChange({
        ...filters,
        reportType: value as ReportType | "all",
      });
    },
    [filters, onFiltersChange]
  );

  const handleSortChange = useCallback(
    (value: string) => {
      onFiltersChange({
        ...filters,
        sort: value as FiltersState["sort"],
      });
    },
    [filters, onFiltersChange]
  );

  const hasActiveFilters = filters.search || filters.status !== "all" || filters.reportType !== "all" || filters.sort !== "newest" || filters.unreadOnly;

  const handleClearFilters = useCallback(() => {
    setSearchInput("");
    onFiltersChange({
      search: "",
      status: "all",
      reportType: "all",
      sort: "newest",
      unreadOnly: false,
    });
  }, [onFiltersChange]);

  const handleUnreadToggle = useCallback(() => {
    onFiltersChange({ ...filters, unreadOnly: !filters.unreadOnly });
  }, [filters, onFiltersChange]);

  return (
    <div className="space-y-3">
      {/* Desktop: horizontal layout */}
      <div className="hidden flex-col gap-3 sm:flex sm:flex-row sm:items-end sm:flex-wrap">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 sm:max-w-xs">
          <label htmlFor="report-search" className="sr-only">
            Search reports
          </label>
          <Input
            id="report-search"
            placeholder="Search reports..."
            value={searchInput}
            onChange={handleSearchChange}
          />
        </form>

        {/* Status Filter */}
        <div className="w-full sm:w-auto">
          <Select value={filters.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-40" aria-label="Filter by status">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Report Type Filter */}
        <div className="w-full sm:w-auto">
          <Select value={filters.reportType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-full sm:w-44" aria-label="Filter by report type">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(REPORT_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="w-full sm:w-auto">
          <Select value={filters.sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-40" aria-label="Sort by">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="recently_updated">Recently Updated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Unread Only Toggle */}
        <button
          type="button"
          onClick={handleUnreadToggle}
          className={cn(
            "flex h-10 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition-colors",
            filters.unreadOnly
              ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
              : "border-border text-muted-foreground hover:bg-muted"
          )}
          aria-pressed={filters.unreadOnly}
          aria-label="Show only reports with unread messages"
        >
          <span className={cn("h-2 w-2 rounded-full", filters.unreadOnly ? "bg-blue-500" : "bg-muted-foreground/40")} />
          Unread only
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="flex h-10 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Clear all filters"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        )}
      </div>

      {/* Mobile: collapsible */}
      <div className="sm:hidden">
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <label htmlFor="report-search-mobile" className="sr-only">
              Search reports
            </label>
            <Input
              id="report-search-mobile"
              placeholder="Search reports..."
              value={searchInput}
              onChange={handleSearchChange}
            />
          </form>
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className={cn(
              "flex h-10 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors",
              hasActiveFilters
                ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                : "border-border text-muted-foreground"
            )}
            aria-label="Toggle filters"
            aria-expanded={mobileFiltersOpen}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[9px] font-bold text-white">
                {[filters.status !== "all", filters.reportType !== "all", filters.sort !== "newest", filters.unreadOnly].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {mobileFiltersOpen && (
          <div className="mt-3 space-y-2 rounded-lg border bg-card p-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
              <Select value={filters.status} onValueChange={handleStatusChange}>
                <SelectTrigger aria-label="Filter by status">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Type</label>
              <Select value={filters.reportType} onValueChange={handleTypeChange}>
                <SelectTrigger aria-label="Filter by report type">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(REPORT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Sort</label>
              <Select value={filters.sort} onValueChange={handleSortChange}>
                <SelectTrigger aria-label="Sort by">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="recently_updated">Recently Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleUnreadToggle}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition-colors",
                  filters.unreadOnly
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                    : "border-border text-muted-foreground"
                )}
                aria-pressed={filters.unreadOnly}
              >
                <span className={cn("h-2 w-2 rounded-full", filters.unreadOnly ? "bg-blue-500" : "bg-muted-foreground/40")} />
                Unread only
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}