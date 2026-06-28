"use client";

import type { ReportAction } from "@/features/reports/types";
import { formatDateTime } from "@/features/reports/lib/report-utils";
import { STATUS_LABELS } from "@/features/reports/lib/report-utils";
import { cn } from "@/lib/client-utils";

type TimelineProps = {
  actions: ReportAction[];
};

const ACTION_LABELS: Record<string, string> = {
  status_change: "Status Change",
  evidence_requested: "Evidence Requested",
  evidence_uploaded: "Evidence Uploaded",
  comment_added: "Comment Added",
  decision_recorded: "Decision Recorded",
  report_created: "Report Submitted",
};

export function Timeline({ actions }: TimelineProps) {
  if (actions.length === 0) {
    return (
      <p className="py-4 text-sm text-muted-foreground">
        No activity recorded yet.
      </p>
    );
  }

  // Sort ascending for chronological display
  const sorted = [...actions].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div className="relative space-y-0">
      {/* Vertical line */}
      <div className="absolute left-[11px] top-2 h-[calc(100%-16px)] w-0.5 bg-border" aria-hidden="true" />

      <ol className="space-y-4">
        {sorted.map((action, index) => (
          <li key={action.id} className="relative pl-8">
            {/* Dot */}
            <div
              className={cn(
                "absolute left-0 top-1.5 h-5 w-5 rounded-full border-2",
                index === sorted.length - 1
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/30 bg-background"
              )}
              aria-hidden="true"
            />

            {/* Content */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {ACTION_LABELS[action.action] ?? action.action}
                </span>
                {action.new_status && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    → {STATUS_LABELS[action.new_status]}
                  </span>
                )}
              </div>

              {action.notes && (
                <p className="text-sm text-muted-foreground">{action.notes}</p>
              )}

              <time
                className="block text-xs text-muted-foreground/60"
                dateTime={action.created_at}
              >
                {formatDateTime(action.created_at)}
              </time>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}