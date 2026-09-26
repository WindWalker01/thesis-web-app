"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchIssueDetailByArtworkId } from "../server/issue-detail";
import type { IssueDetail } from "../../../types";

export const issueDetailKeys = {
    all: () => ["issue-detail"] as const,
    byId: (id: string) => ["issue-detail", id] as const,
};

const ISSUE_DETAIL_QUERY_OPTIONS = {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    meta: { persist: false },
} as const;

type UseIssueDetailPageReturn = {
    issue: IssueDetail | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
};

export function useIssueDetailPage(
    id: string | null | undefined
): UseIssueDetailPageReturn {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: issueDetailKeys.byId(id ?? ""),
        queryFn: async () => {
            const result = await fetchIssueDetailByArtworkId(id!);

            if (!result.success) {
                throw new Error(result.message);
            }

            return result.issue;
        },
        enabled: !!id,
        ...ISSUE_DETAIL_QUERY_OPTIONS,
    });

    return {
        issue: data ?? null,
        isLoading: !!id && isLoading,
        error: error instanceof Error ? error.message : null,
        refetch,
    };
}