"use client";

import { useQuery } from "@tanstack/react-query";
import type { Report } from "@/features/reports/types";

export const userReportsKeys = {
  all: () => ["user-reports"] as const,
};

async function fetchUserReports(): Promise<Report[]> {
  const res = await fetch("/api/reports");

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message ?? "Failed to fetch reports");
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error(json?.error?.message ?? "Failed to fetch reports");
  }

  return json.data as Report[];
}

export function useUserReports() {
  const query = useQuery({
    queryKey: userReportsKeys.all(),
    queryFn: fetchUserReports,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    retry: 1,
    meta: { persist: false },
  });

  return {
    reports: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}