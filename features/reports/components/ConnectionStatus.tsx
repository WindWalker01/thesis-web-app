"use client";

import { cn } from "@/lib/client-utils";
import type { RealtimeConnectionStatus as RealtimeConnectionStatusType } from "@/features/reports/types";

type ConnectionStatusProps = {
  status: RealtimeConnectionStatusType;
};

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  if (status === "connected") return null;

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 py-1.5 text-xs font-medium",
        status === "connecting"
          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      )}
    >
      {status === "connecting" ? (
        <>
          <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Connecting...
        </>
      ) : (
        <>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          Reconnecting...
        </>
      )}
    </div>
  );
}