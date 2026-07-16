"use client";

import { useQuery } from "@tanstack/react-query";
import type { AdminReportDetail } from "@/features/reports/types";

export function useReportDetail(reportId: string | null) {
  return useQuery<AdminReportDetail>({
    queryKey: ["admin-report-detail", reportId],
    queryFn: async () => {
      if (!reportId) throw new Error("No report ID provided");

      const response = await fetch(`/api/admin/reports/${reportId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message ?? "Failed to load report details");
      }

      return result.data as AdminReportDetail;
    },
    enabled: !!reportId,
  });
}