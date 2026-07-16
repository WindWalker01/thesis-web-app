"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchUsers, fetchUserManagementStats } from "../server/users";
import type { UserFilters, UserSortOption } from "../types";

export const userManagementKeys = {
  all: () => ["admin-users"] as const,
  list: (page: number, search: string, filters: UserFilters | undefined, sort: UserSortOption | undefined) =>
    ["admin-users", "list", page, search, filters, sort] as const,
  stats: () => ["admin-users", "stats"] as const,
};

export function useUserManagement({
  page = 1,
  perPage = 50,
  search = "",
  filters,
  sort,
}: {
  page?: number;
  perPage?: number;
  search?: string;
  filters?: UserFilters;
  sort?: UserSortOption;
}) {
  const query = useQuery({
    queryKey: userManagementKeys.list(page, search, filters, sort),
    queryFn: async () => {
      const result = await fetchUsers({ page, perPage, search, filters, sort });
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 2,
    retry: 1,
    meta: { persist: false },
  });

  return {
    users: query.data?.data ?? [],
    totalCount: query.data?.totalCount ?? 0,
    pageCount: query.data?.pageCount ?? 0,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

export function useUserManagementStats() {
  const query = useQuery({
    queryKey: userManagementKeys.stats(),
    queryFn: async () => {
      const result = await fetchUserManagementStats();
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
    stats: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}