"use client";

import { cn } from "@/lib/client-utils";
import type { ReportStatus } from "@/features/reports/types";

const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
  pending_review: { label: "Pending for Review", color: "text-yellow-700", bg: "bg-yellow-100", border: "border-yellow-200", dot: "bg-yellow-500" },
  under_review: { label: "Under Review", color: "text-blue-700", bg: "bg-blue-100", border: "border-blue-200", dot: "bg-blue-500" },
  resolved: { label: "Resolved", color: "text-green-700", bg: "bg-green-100", border: "border-green-200", dot: "bg-green-500" },
};

interface ReportStatusBadgeProps {
  status: ReportStatus;
  className?: string;
  showDot?: boolean;
}

export function ReportStatusBadge({ status, className, showDot = true }: ReportStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending_review;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border",
        config.bg,
        config.color,
        config.border,
        className
      )}
    >
      {showDot && <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />}
      {config.label}
    </span>
  );
}

export function getStatusConfig(status: ReportStatus) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.pending_review;
}
