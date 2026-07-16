"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAdminDashboardData } from "../server/dashboard";

export const adminDashboardKeys = {
  all: () => ["admin-dashboard"] as const,
};

export function useAdminDashboard() {
  const query = useQuery({
    queryKey: adminDashboardKeys.all(),
    queryFn: async () => {
      const result = await fetchAdminDashboardData();
      if (!result.success) {
        throw new Error(result.message);
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    retry: 1,
    meta: { persist: false },
  });

  return {
    dashboard: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}