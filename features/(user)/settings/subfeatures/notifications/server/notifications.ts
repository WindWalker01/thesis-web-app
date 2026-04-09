"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppNotification } from "../types";

type NotificationsResult =
    | { success: true; notifications: AppNotification[] }
    | { success: false; message: string };

type NotificationActionResult =
    | { success: true }
    | { success: false; message: string };

async function getAuthenticatedUserId() {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        return { supabase, userId: null as string | null, error: "You must be logged in." };
    }

    return { supabase, userId: user.id, error: null as string | null };
}

export async function fetchCurrentUserNotifications(): Promise<NotificationsResult> {
    const { supabase, userId, error: authError } = await getAuthenticatedUserId();

    if (authError || !userId) {
        return { success: false, message: authError ?? "Unauthorized." };
    }

    const { data, error } = await supabase
        .from("notifications")
        .select(`
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
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) {
        return {
            success: false,
            message: error.message,
        };
    }

    return {
        success: true,
        notifications: (data ?? []) as AppNotification[],
    };
}

export async function markCurrentUserNotificationAsRead(
    notificationId: string
): Promise<NotificationActionResult> {
    const { supabase, userId, error: authError } = await getAuthenticatedUserId();

    if (authError || !userId) {
        return { success: false, message: authError ?? "Unauthorized." };
    }

    const { error } = await supabase
        .from("notifications")
        .update({
            is_read: true,
            read_at: new Date().toISOString(),
        })
        .eq("id", notificationId)
        .eq("user_id", userId);

    if (error) {
        return {
            success: false,
            message: error.message,
        };
    }

    return { success: true };
}

export async function markAllCurrentUserNotificationsAsRead(): Promise<NotificationActionResult> {
    const { supabase, userId, error: authError } = await getAuthenticatedUserId();

    if (authError || !userId) {
        return { success: false, message: authError ?? "Unauthorized." };
    }

    const { error } = await supabase
        .from("notifications")
        .update({
            is_read: true,
            read_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("is_read", false);

    if (error) {
        return {
            success: false,
            message: error.message,
        };
    }

    return { success: true };
}

export async function deleteCurrentUserNotification(
    notificationId: string
): Promise<NotificationActionResult> {
    const { supabase, userId, error: authError } = await getAuthenticatedUserId();

    if (authError || !userId) {
        return { success: false, message: authError ?? "Unauthorized." };
    }

    const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId)
        .eq("user_id", userId);

    if (error) {
        return {
            success: false,
            message: error.message,
        };
    }

    return { success: true };
}

export async function clearCurrentUserNotifications(
    notificationIds: string[]
): Promise<NotificationActionResult> {
    if (notificationIds.length === 0) {
        return { success: true };
    }

    const { supabase, userId, error: authError } = await getAuthenticatedUserId();

    if (authError || !userId) {
        return { success: false, message: authError ?? "Unauthorized." };
    }

    const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", userId)
        .in("id", notificationIds);

    if (error) {
        return {
            success: false,
            message: error.message,
        };
    }

    return { success: true };
}