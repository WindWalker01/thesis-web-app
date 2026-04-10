"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDashboardData } from "../server/dashboard";

export const dashboardKeys = {
    all: () => ["dashboard"] as const,
};

export function useDashboard() {
    const query = useQuery({
        queryKey: dashboardKeys.all(),
        queryFn: async () => {
            const result = await fetchDashboardData();

            if (!result.success) {
                throw new Error(result.message);
            }

            return result.data;
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
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