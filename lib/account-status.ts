// ============================================
// Account Status - Centralized Validation
// ============================================
// This is the single source of truth for all account status enforcement.
// Every server action, API route, and layout check should use these utilities.

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AccountStatusValue = "active" | "suspended" | "banned";

export type AccountStatusResult = {
  status: AccountStatusValue;
  reason: string | null;
  suspended_until: string | null;
};

export type AccountStatusError = {
  blocked: true;
  status: AccountStatusValue;
  message: string;
  httpStatus: 403;
};

/**
 * Fetches the account status for a given user ID.
 * Returns the status, suspension reason, and expiration date.
 */
export async function getUserAccountStatus(
  userId: string
): Promise<AccountStatusResult> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("users")
    .select("account_status, suspension_reason, suspended_until")
    .eq("id", userId)
    .single();

  if (error || !data) {
    // If user not found, treat as banned to prevent access
    return { status: "banned", reason: null, suspended_until: null };
  }

  // Check if suspension has expired — auto-unsuspend
  if (
    data.account_status === "suspended" &&
    data.suspended_until &&
    new Date(data.suspended_until) <= new Date()
  ) {
    // Auto-unsuspend: set back to active
    await supabase
      .from("users")
      .update({
        account_status: "active",
        suspended_until: null,
        suspension_reason: null,
      })
      .eq("id", userId);

    return { status: "active", reason: null, suspended_until: null };
  }

  return {
    status: data.account_status as AccountStatusValue,
    reason: data.suspension_reason,
    suspended_until: data.suspended_until,
  };
}

/**
 * Checks if a user has an admin role.
 * Admins bypass account status restrictions.
 */
export async function isAdminUser(userId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  return data?.role === "admin";
}

/**
 * Validates that the authenticated user has an active account.
 * Throws an AccountStatusError if suspended or banned.
 * Returns the user ID if active.
 *
 * Use this at the top of every server action and API route
 * that performs authenticated write operations.
 */
export async function requireActiveAccount(): Promise<string> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw createAccountStatusError("banned", "Authentication required.");
  }

  // Admins bypass account status checks
  const admin = await isAdminUser(user.id);
  if (admin) return user.id;

  const accountStatus = await getUserAccountStatus(user.id);

  if (accountStatus.status === "suspended") {
    const expiryMessage = accountStatus.suspended_until
      ? ` until ${new Date(accountStatus.suspended_until).toLocaleDateString()}`
      : "";
    const reasonMessage = accountStatus.reason
      ? ` Reason: ${accountStatus.reason}`
      : "";

    throw createAccountStatusError(
      "suspended",
      `Your account is currently suspended${expiryMessage}.${reasonMessage} Please contact an administrator if you believe this was a mistake.`
    );
  }

  if (accountStatus.status === "banned") {
    throw createAccountStatusError(
      "banned",
      "Your account has been permanently banned for violating platform policies."
    );
  }

  return user.id;
}

/**
 * Creates a standardized AccountStatusError for throwing in server actions.
 */
function createAccountStatusError(
  status: AccountStatusValue,
  message: string
): AccountStatusError {
  const error = new Error(message) as Error & AccountStatusError;
  error.blocked = true;
  error.status = status;
  error.message = message;
  error.httpStatus = 403;
  return error as unknown as AccountStatusError;
}

/**
 * Type guard to check if an error is an AccountStatusError.
 */
export function isAccountStatusError(
  error: unknown
): error is AccountStatusError {
  return (
    typeof error === "object" &&
    error !== null &&
    "blocked" in error &&
    (error as AccountStatusError).blocked === true &&
    "httpStatus" in error &&
    (error as AccountStatusError).httpStatus === 403
  );
}