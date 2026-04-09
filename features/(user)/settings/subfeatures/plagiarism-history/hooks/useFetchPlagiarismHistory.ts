"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCurrentUserPlagiarismHistory } from "../server/plagiarism-history";

export const plagiarismHistoryKeys = {
    all: () => ["plagiarism-history"] as const,
    currentUser: () => ["plagiarism-history", "current-user"] as const,
};

export function useCurrentUserPlagiarismHistory() {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: plagiarismHistoryKeys.currentUser(),
        queryFn: async () => {
            const result = await fetchCurrentUserPlagiarismHistory();

            if (!result.success) {
                throw new Error(result.message);
            }

            return result.history;
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
        meta: { persist: false },
    });

    return {
        history: data ?? [],
        isLoading,
        error: error instanceof Error ? error.message : null,
        refetch,
    };
}