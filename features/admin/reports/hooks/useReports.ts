"use client";

import { useQuery } from "@tanstack/react-query";
import type { AdminReportListItem, ReportStatistics } from "@/features/reports/types";

interface UseReportsParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  reportType?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface ReportsResponse {
  items: AdminReportListItem[];
  total: number;
  totalPages: number;
}

export function useReports(params: UseReportsParams) {
  return useQuery<ReportsResponse>({
    queryKey: ["admin-reports", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set("page", String(params.page));
      searchParams.set("limit", String(params.limit));
      if (params.search) searchParams.set("search", params.search);
      if (params.status) searchParams.set("status", params.status);
      if (params.reportType) searchParams.set("reportType", params.reportType);
      searchParams.set("sortBy", params.sortBy);
      searchParams.set("sortOrder", params.sortOrder);

      const response = await fetch(`/api/admin/reports?${searchParams.toString()}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message ?? "Failed to fetch reports");
      }

      return result.data as ReportsResponse;
    },
    placeholderData: (prev) => prev,
  });
}

export function useReportStatistics() {
  return useQuery<ReportStatistics>({
    queryKey: ["admin-reports-stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/reports/stats");
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message ?? "Failed to fetch statistics");
      }

      return result.data as ReportStatistics;
    },
    refetchInterval: 60_000,
  });
}