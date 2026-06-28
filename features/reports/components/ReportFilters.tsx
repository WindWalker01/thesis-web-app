"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReportStatus, ReportType } from "@/features/reports/types";
import { REPORT_TYPE_LABELS } from "@/features/reports/lib/report-utils";
import { STATUS_LABELS } from "@/features/reports/lib/report-utils";

export type FiltersState = {
  search: string;
  status: ReportStatus | "all";
  reportType: ReportType | "all";
  sort: "newest" | "oldest" | "recently_updated";
};

type ReportFiltersProps = {
  filters: FiltersState;
  onFiltersChange: (filters: FiltersState) => void;
};

export function ReportFilters({ filters, onFiltersChange }: ReportFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search);

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

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
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
          <SelectTrigger className="w-full sm:w-44" aria-label="Sort by">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="recently_updated">Recently Updated</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}