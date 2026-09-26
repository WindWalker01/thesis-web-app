"use client";

import type { ReportAction } from "@/features/reports/types";
import { formatDateTime } from "@/features/reports/lib/report-utils";
import { STATUS_LABELS } from "@/features/reports/lib/report-utils";
import { cn } from "@/lib/client-utils";

type TimelineProps = {
  actions: ReportAction[];
};

const ACTION_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  report_created: {
    label: "Report Submitted",
    icon: (
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  status_change: {
    label: "Status Change",
    icon: (
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
      </svg>
    ),
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  evidence_requested: {
    label: "Evidence Requested",
    icon: (
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30",
  },
  evidence_uploaded: {
    label: "Evidence Uploaded",
    icon: (
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-100 dark:bg-violet-900/30",
  },
  comment_added: {
    label: "Comment Added",
    icon: (
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-100 dark:bg-sky-900/30",
  },
  decision_recorded: {
    label: "Decision Recorded",
    icon: (
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" />
      </svg>
    ),
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-100 dark:bg-rose-900/30",
  },
};

export function Timeline({ actions }: TimelineProps) {
  if (actions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <svg className="h-5 w-5 text-muted-foreground/60" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
      </div>
    );
  }

  // Sort ascending for chronological display
  const sorted = [...actions].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[15px] top-2 h-[calc(100%-16px)] w-0.5 bg-gradient-to-b from-border via-border to-transparent" aria-hidden="true" />

      <ol className="space-y-5">
        {sorted.map((action, index) => {
          const config = ACTION_CONFIG[action.action];
          const isLast = index === sorted.length - 1;

          return (
            <li key={action.id} className="relative pl-10">
              {/* Icon circle */}
              <div
                className={cn(
                  "absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-200",
                  isLast
                    ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : config
                      ? `${config.bg} ${config.color} border-transparent`
                      : "border-muted-foreground/30 bg-background text-muted-foreground"
                )}
                aria-hidden="true"
              >
                {config?.icon ?? (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>

              {/* Content */}
              <div className={cn("space-y-1", isLast && "font-medium")}>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-sm font-semibold">
                    {config?.label ?? action.action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                  {action.new_status && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      → {STATUS_LABELS[action.new_status]}
                    </span>
                  )}
                </div>

                {action.notes && (
                  <p className="text-sm text-muted-foreground/80 leading-relaxed">{action.notes}</p>
                )}

                <time
                  className="block text-xs text-muted-foreground/50"
                  dateTime={action.created_at}
                >
                  {formatDateTime(action.created_at)}
                </time>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
