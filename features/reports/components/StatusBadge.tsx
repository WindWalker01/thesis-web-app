"use client";

import type { ReportStatus } from "@/features/reports/types";
import { STATUS_LABELS, STATUS_COLORS, STATUS_DOT_COLORS } from "@/features/reports/lib/report-utils";
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
          STATUS_DOT_COLORS[status]
        )}
        aria-hidden="true"
      />
      {STATUS_LABELS[status]}
    </span>
  );
}