"use client";

import { useEffect, useRef } from "react";
import type { ReportComment } from "@/features/reports/types";

type UseDesktopNotificationOptions = {
  reportId: string;
  reportTitle: string;
  enabled?: boolean;
};

export function useDesktopNotification({
  reportId,
  reportTitle,
  enabled = true,
}: UseDesktopNotificationOptions) {
  const lastNotifiedId = useRef<string | null>(null);
  const isFocused = useRef(true);
  const previousMessageCount = useRef(0);

  // Track page focus
  useEffect(() => {
    const handleFocus = () => {
      isFocused.current = true;
    };
    const handleBlur = () => {
      isFocused.current = false;
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if (!enabled) return;

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [enabled]);

  // Hook to be called when a new message arrives
  const notifyNewMessage = (comment: ReportComment, isAdmin: boolean) => {
    if (!enabled) return;
    if (comment.id === lastNotifiedId.current) return; // Deduplicate
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    if (isFocused.current) return; // Don't notify if user is on the page

    lastNotifiedId.current = comment.id;

    const senderLabel = isAdmin ? "Admin" : "User";
    const body = `${senderLabel} replied to "${reportTitle}"`;

    new Notification(`Report: ${reportTitle}`, {
      body,
      icon: "/favicon.ico",
      tag: `report-${reportId}`,
      silent: false,
    });
  };

  return { notifyNewMessage };
}