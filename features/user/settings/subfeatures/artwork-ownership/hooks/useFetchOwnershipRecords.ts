"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCurrentUserOwnershipRecords } from "../server/artwork-ownership";

export const ownershipRecordKeys = {
    all: () => ["ownership-records"] as const,
    currentUser: () => ["ownership-records", "current-user"] as const,
};

export function useCurrentUserOwnershipRecords() {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ownershipRecordKeys.currentUser(),
        queryFn: async () => {
            const result = await fetchCurrentUserOwnershipRecords();

            if (!result.success) {
                throw new Error(result.message);
            }

            return result.records;
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
        meta: { persist: false },
    });

    return {
        records: data ?? [],
        isLoading,
        error: error instanceof Error ? error.message : null,
        refetch,
    };
}