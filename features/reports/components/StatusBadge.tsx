"use client";

import type { ReportStatus } from "@/features/reports/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/features/reports/lib/report-utils";
import { cn } from "@/lib/client-utils";

type StatusBadgeProps = {
  status: ReportStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_COLORS[status],
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          {
            "bg-blue-500": status === "open",
            "bg-amber-500": status === "under_review",
            "bg-purple-500": status === "waiting_for_reporter",
            "bg-emerald-500": status === "resolved",
            "bg-red-500": status === "rejected",
            "bg-gray-500": status === "closed",
          }
        )}
        aria-hidden="true"
      />
      {STATUS_LABELS[status]}
    </span>
  );
}