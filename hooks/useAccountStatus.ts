"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { AccountStatusValue } from "@/lib/account-status";

type UseAccountStatusResult = {
  status: AccountStatusValue | null;
  reason: string | null;
  expiresAt: string | null;
  loading: boolean;
};

/**
 * Reusable hook that fetches and returns the current user's account status.
 * Use this across the application to conditionally render UI based on status.
 *
 * @example
 * ```tsx
 * const { status, reason, expiresAt, loading } = useAccountStatus();
 *
 * if (loading) return <Loading />;
 * if (status === 'suspended') return <SuspendedNotice reason={reason} />;
 * ```
 */
export function useAccountStatus(): UseAccountStatusResult {
  const [status, setStatus] = useState<AccountStatusValue | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchStatus() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (mounted) {
            setStatus(null);
            setLoading(false);
          }
          return;
        }

        const { data } = await supabase
          .from("users")
          .select("account_status, suspension_reason, suspended_until")
          .eq("id", user.id)
          .single();

        if (mounted && data) {
          setStatus(data.account_status as AccountStatusValue);
          setReason(data.suspension_reason);
          setExpiresAt(data.suspended_until);
        }
      } catch {
        // Silently fail
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchStatus();

    return () => {
      mounted = false;
    };
  }, []);

  return { status, reason, expiresAt, loading };
}