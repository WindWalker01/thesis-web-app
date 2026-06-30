"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  Report,
  ReportEvidence,
  ReportComment,
  ReportDecision,
  ReportAction,
} from "@/features/reports/types";

export type ReportDetailData = {
  report: Report;
  evidence: ReportEvidence[];
  comments: ReportComment[];
  decision: ReportDecision | null;
  actions: ReportAction[];
};

export const reportDetailKeys = {
  byId: (id: string) => ["report-detail", id] as const,
};

async function fetchReportDetail(id: string): Promise<ReportDetailData> {
  const res = await fetch(`/api/reports/${id}`);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message ?? "Failed to fetch report detail");
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error(json?.error?.message ?? "Failed to fetch report detail");
  }

  return json.data as ReportDetailData;
}

export function useReportDetail(id: string) {
  const query = useQuery({
    queryKey: reportDetailKeys.byId(id),
    queryFn: () => fetchReportDetail(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    retry: 1,
    meta: { persist: false },
  });

  return {
    report: query.data?.report ?? null,
    evidence: query.data?.evidence ?? [],
    comments: query.data?.comments ?? [],
    decision: query.data?.decision ?? null,
    actions: query.data?.actions ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}