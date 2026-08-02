"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { AppNotification } from "../types";

/**
 * Module-level reference-counting map to track userIds for which a
 * Supabase Realtime subscription has already been created. Prevents the
 * "cannot add postgres_changes callbacks after subscribe()" error when
 * multiple components call useNotifications in the same render tree.
 * The subscription is only cleaned up when the last component unsubscribes.
 */
const subscriptionRefCounts = new Map<string, number>();

const NOTIFICATION_LIMIT = 10;

export const notificationKeys = {
  all: (userId: string) => ["notifications", userId] as const,
};

async function fetchNotifications(userId: string): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select(
      `
      id,
      user_id,
      type,
      title,
      message,
      related_art_id,
      related_report_id,
      related_scan_id,
      action_url,
      metadata,
      is_read,
      read_at,
      created_at
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(NOTIFICATION_LIMIT);

  if (error) throw error;

  return (data ?? []) as AppNotification[];
}

export function useNotifications(userId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: userId
      ? notificationKeys.all(userId)
      : ["notifications", "guest"],
    queryFn: () => fetchNotifications(userId!),
    enabled: !!userId,
    staleTime: 1000 * 30,
    meta: { persist: false },
  });

  useEffect(() => {
    if (!userId) return;

    // Prevent duplicate subscriptions for the same userId across
    // multiple component instances in the same render tree. Use a
    // reference count so the channel is only created once and only
    // torn down when the last consumer unmounts.
    const existingCount = subscriptionRefCounts.get(userId) ?? 0;
    subscriptionRefCounts.set(userId, existingCount + 1);
    if (existingCount > 0) return;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<AppNotification>) => {
          queryClient.setQueryData<AppNotification[]>(
            notificationKeys.all(userId),
            (current = []) => {
              if (payload.eventType === "INSERT") {
                const incoming = payload.new as AppNotification;

                const exists = current.some((item) => item.id === incoming.id);
                if (exists) return current;

                return [incoming, ...current].slice(0, NOTIFICATION_LIMIT);
              }

              if (payload.eventType === "UPDATE") {
                const updated = payload.new as AppNotification;

                return current.map((item) =>
                  item.id === updated.id ? updated : item,
                );
              }

              if (payload.eventType === "DELETE") {
                const deleted = payload.old as AppNotification;
                return current.filter((item) => item.id !== deleted.id);
              }

              return current;
            },
          );
        },
      )
      .subscribe();

    return () => {
      const count = subscriptionRefCounts.get(userId) ?? 1;
      if (count <= 1) {
        subscriptionRefCounts.delete(userId);
        supabase.removeChannel(channel);
      } else {
        subscriptionRefCounts.set(userId, count - 1);
      }
    };
  }, [queryClient, userId]);

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("id", notificationId)
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) throw error;
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userId ? notificationKeys.all(userId) : undefined,
      });
    },
  });

  const notifications = query.data ?? [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    markAsRead: markAsRead.mutateAsync,
    markAllAsRead: markAllAsRead.mutateAsync,
  };
}
