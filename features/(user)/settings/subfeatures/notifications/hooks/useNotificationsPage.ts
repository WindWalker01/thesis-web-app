"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase/client";
import { useCurrentUserProfile } from "@/features/(user)/profile/hooks/useFetchProfile";
import { formatNotificationTime } from "@/features/(user)/notifications-navbar/lib/format-time";

import type {
    AppNotification,
    NotifCategory,
    UiNotification,
} from "../types";
import {
    buildFallbackActionUrl,
    getNotificationUI,
    mapNotificationCategory,
} from "..";

import {
    clearCurrentUserNotifications,
    deleteCurrentUserNotification,
    fetchCurrentUserNotifications,
    markAllCurrentUserNotificationsAsRead,
    markCurrentUserNotificationAsRead,
} from "../server/notifications";

export const notificationsPageKeys = {
    all: () => ["settings-notifications"] as const,
    currentUser: (userId?: string) => ["settings-notifications", userId ?? "guest"] as const,
};

export function useNotificationsPage() {
    const queryClient = useQueryClient();
    const { profile } = useCurrentUserProfile();
    const [activeCategory, setActiveCategory] = useState<NotifCategory>("all");

    const query = useQuery<UiNotification[]>({
        queryKey: notificationsPageKeys.currentUser(profile?.id),
        queryFn: async () => {
            const result = await fetchCurrentUserNotifications();

            if (!result.success) {
                throw new Error(result.message);
            }

            return result.notifications.map((notification: AppNotification) => {
                const ui = getNotificationUI(notification.type);

                return {
                    ...notification,
                    action_url: buildFallbackActionUrl(notification),
                    icon: ui.icon,
                    iconColor: ui.iconColor,
                    iconBg: ui.iconBg,
                    timestamp: formatNotificationTime(notification.created_at),
                    category: mapNotificationCategory(notification.type),
                };
            });
        },
        enabled: Boolean(profile?.id),
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 1,
        meta: { persist: false },
    });

    useEffect(() => {
        if (!profile?.id) return;

        const channel = supabase
            .channel(`settings-notifications-${profile.id}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${profile.id}`,
                },
                () => {
                    queryClient.invalidateQueries({
                        queryKey: notificationsPageKeys.currentUser(profile.id),
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [profile?.id, queryClient]);

    const notifications = query.data ?? [];

    const filtered = useMemo(() => {
        if (activeCategory === "all") return notifications;
        return notifications.filter((notification) => notification.category === activeCategory);
    }, [activeCategory, notifications]);

    const unreadCount = useMemo(() => {
        return notifications.filter((notification) => !notification.is_read).length;
    }, [notifications]);

    const markAllReadMutation = useMutation({
        mutationFn: markAllCurrentUserNotificationsAsRead,
        onSuccess: (result) => {
            if (!result.success) {
                toast.error(result.message);
                return;
            }

            queryClient.invalidateQueries({
                queryKey: notificationsPageKeys.currentUser(profile?.id),
            });
        },
        onError: () => {
            toast.error("Failed to mark all notifications as read.");
        },
    });

    const markOneReadMutation = useMutation({
        mutationFn: markCurrentUserNotificationAsRead,
        onSuccess: (result) => {
            if (!result.success) {
                toast.error(result.message);
                return;
            }

            queryClient.invalidateQueries({
                queryKey: notificationsPageKeys.currentUser(profile?.id),
            });
        },
        onError: () => {
            toast.error("Failed to mark notification as read.");
        },
    });

    const deleteOneMutation = useMutation({
        mutationFn: deleteCurrentUserNotification,
        onSuccess: (result) => {
            if (!result.success) {
                toast.error(result.message);
                return;
            }

            queryClient.invalidateQueries({
                queryKey: notificationsPageKeys.currentUser(profile?.id),
            });
        },
        onError: () => {
            toast.error("Failed to delete notification.");
        },
    });

    const clearAllMutation = useMutation({
        mutationFn: clearCurrentUserNotifications,
        onSuccess: (result) => {
            if (!result.success) {
                toast.error(result.message);
                return;
            }

            queryClient.invalidateQueries({
                queryKey: notificationsPageKeys.currentUser(profile?.id),
            });
        },
        onError: () => {
            toast.error("Failed to clear notifications.");
        },
    });

    function markAllRead() {
        if (unreadCount === 0 || markAllReadMutation.isPending) return;
        markAllReadMutation.mutate();
    }

    function clearAll() {
        if (filtered.length === 0 || clearAllMutation.isPending) return;
        clearAllMutation.mutate(filtered.map((notification) => notification.id));
    }

    function markOneRead(id: string) {
        if (markOneReadMutation.isPending) return;
        markOneReadMutation.mutate(id);
    }

    function deleteOne(id: string) {
        if (deleteOneMutation.isPending) return;
        deleteOneMutation.mutate(id);
    }

    return {
        profile,
        activeCategory,
        setActiveCategory,
        notifications,
        filtered,
        unreadCount,
        isLoading: query.isLoading,
        error: query.error instanceof Error ? query.error.message : null,
        markAllRead,
        clearAll,
        markOneRead,
        deleteOne,
        isMarkingAllRead: markAllReadMutation.isPending,
        isClearingAll: clearAllMutation.isPending,
    };
}