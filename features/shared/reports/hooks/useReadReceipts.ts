"use client";

import { useCallback, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";

type UseReadReceiptsOptions = {
  reportId: string;
  currentUserId: string;
  enabled?: boolean;
};

export function useReadReceipts({
  reportId,
  currentUserId,
  enabled = true,
}: UseReadReceiptsOptions) {
  const hasMarkedRead = useRef(false);

  const markMessagesAsRead = useCallback(async () => {
    try {
      const res = await fetch(`/api/reports/${reportId}/read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report_id: reportId }),
      });

      if (!res.ok) {
        // Silently fail - this is non-critical
        return;
      }
    } catch {
      // Silently fail
    }
  }, [reportId]);

  // Mark messages as read when chat opens
  useEffect(() => {
    if (!enabled || !reportId || !currentUserId) return;
    if (hasMarkedRead.current) return;

    hasMarkedRead.current = true;
    markMessagesAsRead();

    // Re-mark as read when visibility changes (user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        markMessagesAsRead();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [reportId, currentUserId, enabled, markMessagesAsRead]);

  return { markMessagesAsRead };
}