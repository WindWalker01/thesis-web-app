"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AdminActionResult,
  SuspendPayload,
  BanPayload,
} from "../types";

export async function suspendUser(
  payload: SuspendPayload
): Promise<AdminActionResult> {
  try {
    const supabase = await createSupabaseServerClient();

    // Verify admin
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

    // Prevent self-suspension
    if (payload.user_id === user.id) {
      return { success: false, message: "You cannot suspend your own account." };
    }

    // Calculate suspension end date
    let suspendedUntil: string | null = null;
    if (payload.duration === "temporary" && payload.duration_days) {
      const date = new Date();
      date.setDate(date.getDate() + payload.duration_days);
      suspendedUntil = date.toISOString();
    }

    // Update user status
    const { error: updateError } = await supabase
      .from("users")
      .update({
        account_status: "suspended",
        suspended_until: suspendedUntil,
        suspension_reason: payload.reason,
      })
      .eq("id", payload.user_id);

    if (updateError) {
      return { success: false, message: updateError.message };
    }

    // Create audit log
    const { error: auditError } = await supabase
      .from("admin_audit_logs")
      .insert({
        admin_id: user.id,
        target_user_id: payload.user_id,
        action: "suspend_user",
        reason: payload.reason,
        previous_value: "active",
        new_value: "suspended",
        metadata: {
          duration: payload.duration,
          duration_days: payload.duration_days ?? null,
          admin_notes: payload.admin_notes ?? null,
          suspended_until: suspendedUntil,
        },
      });

    if (auditError) {
      console.error("Failed to create audit log:", auditError);
    }

    // Send notification to user
    const { error: notifError } = await supabase
      .from("notifications")
      .insert({
        user_id: payload.user_id,
        type: "system_announcement",
        title: "Account Suspended",
        message: `Your account has been suspended. Reason: ${payload.reason}${
          suspendedUntil
            ? `. Suspended until: ${new Date(suspendedUntil).toLocaleDateString()}`
            : ""
        }`,
        metadata: {
          action: "suspend",
          reason: payload.reason,
          suspended_until: suspendedUntil,
        },
      });

    if (notifError) {
      console.error("Failed to send notification:", notifError);
    }

    return {
      success: true,
      message: `User has been suspended${suspendedUntil ? ` until ${new Date(suspendedUntil).toLocaleDateString()}` : " permanently"}.`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to suspend user.",
    };
  }
}

export async function banUser(payload: BanPayload): Promise<AdminActionResult> {
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

    // Prevent self-ban
    if (payload.user_id === user.id) {
      return { success: false, message: "You cannot ban your own account." };
    }

    // Prevent banning other admins
    const { data: targetUser } = await supabase
      .from("users")
      .select("role")
      .eq("id", payload.user_id)
      .single();

    if (targetUser?.role === "admin") {
      return {
        success: false,
        message: "You cannot ban another administrator.",
      };
    }

    // Update user status
    const { error: updateError } = await supabase
      .from("users")
      .update({
        account_status: "banned",
        suspended_until: null,
        suspension_reason: payload.reason,
      })
      .eq("id", payload.user_id);

    if (updateError) {
      return { success: false, message: updateError.message };
    }

    // Create audit log
    const { error: auditError } = await supabase
      .from("admin_audit_logs")
      .insert({
        admin_id: user.id,
        target_user_id: payload.user_id,
        action: "ban_user",
        reason: payload.reason,
        previous_value: "active",
        new_value: "banned",
        metadata: { evidence: payload.evidence ?? null },
      });

    if (auditError) {
      console.error("Failed to create audit log:", auditError);
    }

    // Send notification
    const { error: notifError } = await supabase
      .from("notifications")
      .insert({
        user_id: payload.user_id,
        type: "system_announcement",
        title: "Account Banned",
        message: `Your account has been permanently banned. Reason: ${payload.reason}`,
        metadata: { action: "ban", reason: payload.reason },
      });

    if (notifError) {
      console.error("Failed to send notification:", notifError);
    }

    return {
      success: true,
      message: "User has been permanently banned.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to ban user.",
    };
  }
}

export async function reactivateUser(
  userId: string,
  reason?: string
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

    // Get current status for audit
    const { data: currentUser } = await supabase
      .from("users")
      .select("account_status")
      .eq("id", userId)
      .single();

    const previousStatus = currentUser?.account_status ?? "unknown";

    const { error: updateError } = await supabase
      .from("users")
      .update({
        account_status: "active",
        suspended_until: null,
        suspension_reason: null,
      })
      .eq("id", userId);

    if (updateError) {
      return { success: false, message: updateError.message };
    }

    // Create audit log
    await supabase.from("admin_audit_logs").insert({
      admin_id: user.id,
      target_user_id: userId,
      action: "reactivate_user",
      reason: reason ?? "Account reactivated by administrator.",
      previous_value: previousStatus,
      new_value: "active",
    });

    // Send notification
    await supabase.from("notifications").insert({
      user_id: userId,
      type: "system_announcement",
      title: "Account Reactivated",
      message: reason
        ? `Your account has been reactivated. Reason: ${reason}`
        : "Your account has been reactivated.",
      metadata: { action: "reactivate" },
    });

    return { success: true, message: "User has been reactivated." };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to reactivate user.",
    };
  }
}

export async function verifyArtist(
  userId: string,
  reason?: string
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

    const { error: updateError } = await supabase
      .from("users")
      .update({ is_verified: true })
      .eq("id", userId);

    if (updateError) {
      return { success: false, message: updateError.message };
    }

    // Create audit log
    await supabase.from("admin_audit_logs").insert({
      admin_id: user.id,
      target_user_id: userId,
      action: "verify_artist",
      reason: reason ?? "Artist verified by administrator.",
      previous_value: "false",
      new_value: "true",
    });

    // Send notification
    await supabase.from("notifications").insert({
      user_id: userId,
      type: "system_announcement",
      title: "Artist Verified",
      message: "Congratulations! Your account has been verified as an artist.",
      metadata: { action: "verify_artist" },
    });

    return { success: true, message: "Artist has been verified." };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to verify artist.",
    };
  }
}

export async function removeVerification(
  userId: string,
  reason?: string
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

    const { error: updateError } = await supabase
      .from("users")
      .update({ is_verified: false })
      .eq("id", userId);

    if (updateError) {
      return { success: false, message: updateError.message };
    }

    // Create audit log
    await supabase.from("admin_audit_logs").insert({
      admin_id: user.id,
      target_user_id: userId,
      action: "remove_verification",
      reason: reason ?? "Verification removed by administrator.",
      previous_value: "true",
      new_value: "false",
    });

    // Send notification
    await supabase.from("notifications").insert({
      user_id: userId,
      type: "system_announcement",
      title: "Verification Removed",
      message: reason
        ? `Your artist verification has been removed. Reason: ${reason}`
        : "Your artist verification has been removed.",
      metadata: { action: "remove_verification" },
    });

    return { success: true, message: "Verification has been removed." };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to remove verification.",
    };
  }
}

export async function sendPasswordReset(
  userId: string
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

    // Get user email
    const { data: targetUser } = await supabase
      .from("users")
      .select("email")
      .eq("id", userId)
      .single();

    if (!targetUser?.email) {
      return {
        success: false,
        message: "User does not have an email address.",
      };
    }

    // Trigger Supabase password reset
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      targetUser.email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/reset-password`,
      }
    );

    if (resetError) {
      return { success: false, message: resetError.message };
    }

    // Create audit log
    await supabase.from("admin_audit_logs").insert({
      admin_id: user.id,
      target_user_id: userId,
      action: "reset_password",
      reason: "Password reset triggered by administrator.",
    });

    return {
      success: true,
      message: "Password reset email has been sent to the user.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to send password reset.",
    };
  }
}

export async function deleteUser(
  userId: string,
  reason?: string
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

    // Prevent self-delete
    if (userId === user.id) {
      return { success: false, message: "You cannot delete your own account." };
    }

    // Prevent deleting other admins
    const { data: targetUser } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (targetUser?.role === "admin") {
      return {
        success: false,
        message: "You cannot delete another administrator.",
      };
    }

    // Soft delete: set account_status to banned and clear personal info
    const { error: updateError } = await supabase
      .from("users")
      .update({
        account_status: "banned",
        suspension_reason: reason ?? "Account deleted by administrator.",
        first_name: "[Deleted]",
        last_name: "[Account]",
        middle_name: null,
        username: `deleted_${userId.slice(0, 8)}`,
        bio: null,
        c_profile_image: null,
        email: null,
        is_verified: false,
      })
      .eq("id", userId);

    if (updateError) {
      return { success: false, message: updateError.message };
    }

    // Create audit log
    await supabase.from("admin_audit_logs").insert({
      admin_id: user.id,
      target_user_id: userId,
      action: "delete_account",
      reason: reason ?? "Account deleted by administrator.",
      previous_value: "active",
      new_value: "deleted",
    });

    return {
      success: true,
      message: "Account has been soft-deleted and anonymized.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete account.",
    };
  }
}

export async function bulkSuspendUsers(
  userIds: string[],
  reason: string
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

    // Filter out self and other admins
    const { data: targetUsers } = await supabase
      .from("users")
      .select("id, role")
      .in("id", userIds);

    const validIds = (targetUsers ?? [])
      .filter((u) => u.id !== user.id && u.role !== "admin")
      .map((u) => u.id);

    if (validIds.length === 0) {
      return {
        success: false,
        message: "No valid users to suspend.",
      };
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({
        account_status: "suspended",
        suspension_reason: reason,
      })
      .in("id", validIds);

    if (updateError) {
      return { success: false, message: updateError.message };
    }

    // Create audit logs
    const auditLogs = validIds.map((targetId) => ({
      admin_id: user.id,
      target_user_id: targetId,
      action: "bulk_suspend" as const,
      reason,
      previous_value: "active",
      new_value: "suspended",
    }));

    await supabase.from("admin_audit_logs").insert(auditLogs);

    // Send notifications
    const notifications = validIds.map((targetId) => ({
      user_id: targetId,
      type: "system_announcement" as const,
      title: "Account Suspended",
      message: `Your account has been suspended. Reason: ${reason}`,
      metadata: { action: "bulk_suspend", reason },
    }));

    await supabase.from("notifications").insert(notifications);

    return {
      success: true,
      message: `${validIds.length} user(s) have been suspended.`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to bulk suspend.",
    };
  }
}

export async function bulkBanUsers(
  userIds: string[],
  reason: string
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

    const { data: targetUsers } = await supabase
      .from("users")
      .select("id, role")
      .in("id", userIds);

    const validIds = (targetUsers ?? [])
      .filter((u) => u.id !== user.id && u.role !== "admin")
      .map((u) => u.id);

    if (validIds.length === 0) {
      return { success: false, message: "No valid users to ban." };
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({
        account_status: "banned",
        suspension_reason: reason,
      })
      .in("id", validIds);

    if (updateError) {
      return { success: false, message: updateError.message };
    }

    const auditLogs = validIds.map((targetId) => ({
      admin_id: user.id,
      target_user_id: targetId,
      action: "bulk_ban" as const,
      reason,
      previous_value: "active",
      new_value: "banned",
    }));

    await supabase.from("admin_audit_logs").insert(auditLogs);

    const notifications = validIds.map((targetId) => ({
      user_id: targetId,
      type: "system_announcement" as const,
      title: "Account Banned",
      message: `Your account has been permanently banned. Reason: ${reason}`,
      metadata: { action: "bulk_ban", reason },
    }));

    await supabase.from("notifications").insert(notifications);

    return {
      success: true,
      message: `${validIds.length} user(s) have been banned.`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to bulk ban.",
    };
  }
}

export async function warnUser(payload: {
  user_id: string;
  reason: string;
  report_id?: string;
}): Promise<AdminActionResult> {
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

    // Insert warning record
    const { error: insertError } = await supabase
      .from("user_warnings")
      .insert({
        user_id: payload.user_id,
        admin_id: user.id,
        report_id: payload.report_id ?? null,
        reason: payload.reason,
      });

    if (insertError) {
      return { success: false, message: insertError.message };
    }

    // Create audit log
    await supabase.from("admin_audit_logs").insert({
      admin_id: user.id,
      target_user_id: payload.user_id,
      action: "send_notification" as const,
      reason: payload.reason,
      metadata: {
        action_type: "warn_user",
        report_id: payload.report_id ?? null,
      },
    });

    // Send notification
    await supabase.from("notifications").insert({
      user_id: payload.user_id,
      type: "system_announcement",
      title: "Warning Received",
      message: `You have received a warning from an administrator.\n\nReason: ${payload.reason}`,
      metadata: {
        action: "warn_user",
        report_id: payload.report_id ?? null,
      },
    });

    return {
      success: true,
      message: "User has been warned.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to warn user.",
    };
  }
}

export async function bulkVerifyUsers(
  userIds: string[]
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

    const { error: updateError } = await supabase
      .from("users")
      .update({ is_verified: true })
      .in("id", userIds);

    if (updateError) {
      return { success: false, message: updateError.message };
    }

    const auditLogs = userIds.map((targetId) => ({
      admin_id: user.id,
      target_user_id: targetId,
      action: "bulk_verify" as const,
      reason: "Bulk verification by administrator.",
      previous_value: "false",
      new_value: "true",
    }));

    await supabase.from("admin_audit_logs").insert(auditLogs);

    return {
      success: true,
      message: `${userIds.length} user(s) have been verified.`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to bulk verify.",
    };
  }
}