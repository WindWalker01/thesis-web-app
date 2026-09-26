"use client";

import type { ReportDecision } from "@/features/reports/types";
import { DECISION_LABELS, DECISION_COLORS, formatDateTime } from "@/features/reports/lib/report-utils";
import { cn } from "@/lib/client-utils";

type DecisionCardProps = {
  decision: ReportDecision;
  adminName?: string | null;
};

export function DecisionCard({ decision, adminName }: DecisionCardProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      {/* Header */}
      <div className="border-b bg-muted/50 px-4 py-3">
        <h3 className="text-sm font-semibold">Admin Decision</h3>
      </div>

      <div className="space-y-4 p-4">
        {/* Decision Badge */}
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              DECISION_COLORS[decision.decision]
            )}
          >
            {DECISION_LABELS[decision.decision]}
          </span>
        </div>

        {/* Summary */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Summary</p>
          <p className="text-sm whitespace-pre-wrap">{decision.summary}</p>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-2 text-xs text-muted-foreground">
          {adminName && (
            <div className="flex items-center gap-2">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
              <span>By {adminName}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
            <time dateTime={decision.created_at}>
              {formatDateTime(decision.created_at)}
            </time>
          </div>
        </div>
      </div>
    </div>
  );
}