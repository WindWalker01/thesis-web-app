"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminActionResult, SendNotificationPayload } from "../types";

export async function sendNotification(
  payload: SendNotificationPayload
): Promise<AdminActionResult> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Not authenticated." };

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || profile.role !== "admin") {
      return { success: false, message: "Unauthorized." };
    }

    if (payload.recipient_ids.length === 0) {
      return { success: false, message: "No recipients specified." };
    }

    const notifications = payload.recipient_ids.map((recipientId) => ({
      user_id: recipientId,
      type: "system_announcement" as const,
      title: payload.title,
      message: payload.message,
      metadata: {
        action: "admin_notification",
        notification_type: payload.type,
        sent_by: user.id,
      },
    }));

    const { error } = await supabase.from("notifications").insert(notifications);

    if (error) {
      return { success: false, message: error.message };
    }

    // Create audit log
    await supabase.from("admin_audit_logs").insert({
      admin_id: user.id,
      action: "send_notification",
      reason: `Sent ${payload.type} notification to ${payload.recipient_ids.length} user(s): ${payload.title}`,
      metadata: {
        recipient_count: payload.recipient_ids.length,
        notification_type: payload.type,
        title: payload.title,
        recipients: payload.recipient_ids,
      },
    });

    return {
      success: true,
      message: `Notification sent to ${payload.recipient_ids.length} user(s).`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to send notification.",
    };
  }
}

export async function sendNotificationToAllVerifiedArtists(
  title: string,
  message: string,
  type: SendNotificationPayload["type"]
): Promise<AdminActionResult> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Not authenticated." };

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || profile.role !== "admin") {
      return { success: false, message: "Unauthorized." };
    }

    // Get all verified artists
    const { data: artists } = await supabase
      .from("users")
      .select("id")
      .eq("is_verified", true)
      .eq("role", "user");

    if (!artists || artists.length === 0) {
      return { success: false, message: "No verified artists found." };
    }

    const recipientIds = artists.map((a: { id: string }) => a.id);

    const notifications = recipientIds.map((recipientId) => ({
      user_id: recipientId,
      type: "system_announcement" as const,
      title,
      message,
      metadata: {
        action: "admin_notification",
        notification_type: type,
        sent_by: user.id,
        broadcast: true,
      },
    }));

    const { error } = await supabase.from("notifications").insert(notifications);

    if (error) {
      return { success: false, message: error.message };
    }

    await supabase.from("admin_audit_logs").insert({
      admin_id: user.id,
      action: "send_notification",
      reason: `Broadcast ${type} notification to all ${recipientIds.length} verified artists: ${title}`,
      metadata: {
        recipient_count: recipientIds.length,
        notification_type: type,
        title,
        broadcast: true,
      },
    });

    return {
      success: true,
      message: `Notification sent to ${recipientIds.length} verified artists.`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to send notification.",
    };
  }
}