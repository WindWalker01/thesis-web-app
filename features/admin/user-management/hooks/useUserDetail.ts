"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchUserDetail,
  fetchUserArtworks,
  fetchUserReports,
  fetchUserBlockchainActivity,
  fetchUserTimeline,
} from "../server/user-detail";

export const userDetailKeys = {
  detail: (userId: string) => ["admin-user-detail", userId] as const,
  artworks: (userId: string) => ["admin-user-artworks", userId] as const,
  reports: (userId: string) => ["admin-user-reports", userId] as const,
  blockchain: (userId: string) => ["admin-user-blockchain", userId] as const,
  timeline: (userId: string) => ["admin-user-timeline", userId] as const,
};

export function useUserDetail(userId: string | null) {
  const query = useQuery({
    queryKey: userDetailKeys.detail(userId ?? ""),
    queryFn: async () => {
      if (!userId) throw new Error("No user ID");
      const result = await fetchUserDetail(userId);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 3,
    retry: 1,
    meta: { persist: false },
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

export function useUserArtworks(userId: string | null) {
  const query = useQuery({
    queryKey: userDetailKeys.artworks(userId ?? ""),
    queryFn: async () => {
      if (!userId) throw new Error("No user ID");
      const result = await fetchUserArtworks(userId);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    retry: 1,
    meta: { persist: false },
  });

  return {
    artworks: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
  };
}

export function useUserReports(userId: string | null) {
  const query = useQuery({
    queryKey: userDetailKeys.reports(userId ?? ""),
    queryFn: async () => {
      if (!userId) throw new Error("No user ID");
      const result = await fetchUserReports(userId);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    retry: 1,
    meta: { persist: false },
  });

  return {
    reports: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
  };
}

export function useUserBlockchainActivity(userId: string | null) {
  const query = useQuery({
    queryKey: userDetailKeys.blockchain(userId ?? ""),
    queryFn: async () => {
      if (!userId) throw new Error("No user ID");
      const result = await fetchUserBlockchainActivity(userId);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    retry: 1,
    meta: { persist: false },
  });

  return {
    activities: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
  };
}

export function useUserTimeline(userId: string | null) {
  const query = useQuery({
    queryKey: userDetailKeys.timeline(userId ?? ""),
    queryFn: async () => {
      if (!userId) throw new Error("No user ID");
      const result = await fetchUserTimeline(userId);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    retry: 1,
    meta: { persist: false },
  });

  return {
    events: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
  };
}