"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReportUnreadCounts } from "@/features/reports/types";

type UseUnreadCountOptions = {
  userId: string;
  reportIds?: string[];
  enabled?: boolean;
};

const UNREAD_QUERY_KEY = "report-unread-counts";

async function fetchUnreadCounts(
  userId: string,
  reportIds?: string[]
): Promise<ReportUnreadCounts> {
  if (!reportIds || reportIds.length === 0) return {};

  // Fetch unread counts per report efficiently
  const res = await fetch(
    `/api/reports/unread?user_id=${userId}${reportIds.map((id) => `&report_id=${id}`).join("")}`
  );

  if (!res.ok) return {};
  const json = await res.json();
  return (json.data as ReportUnreadCounts) ?? {};
}

export function useUnreadCount({
  userId,
  reportIds,
  enabled = true,
}: UseUnreadCountOptions) {
  const queryClient = useQueryClient();

  // Fetch initial counts
  const { data: unreadCounts = {} } = useQuery({
    queryKey: [UNREAD_QUERY_KEY, userId, reportIds?.join(",")],
    queryFn: () => fetchUnreadCounts(userId, reportIds),
    enabled: enabled && !!userId && !!reportIds && reportIds.length > 0,
    refetchInterval: 30000, // Poll every 30s as fallback
    staleTime: 10000,
  });

  // Subscribe to realtime updates for unread counts
  useEffect(() => {
    if (!enabled || !userId) return;

    const channel = supabase
      .channel("report-unread-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "report_comments",
        },
        () => {
          // Invalidate to refetch counts
          queryClient.invalidateQueries({
            queryKey: [UNREAD_QUERY_KEY, userId],
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "report_comments",
          filter: `read_at=is.null`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: [UNREAD_QUERY_KEY, userId],
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId, enabled, queryClient]);

  const getReportUnread = useCallback(
    (reportId: string): number => {
      return unreadCounts[reportId] ?? 0;
    },
    [unreadCounts]
  );

  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  return {
    unreadCounts,
    totalUnread,
    getReportUnread,
  };
}