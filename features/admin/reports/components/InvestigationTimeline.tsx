"use client";

import {
  Clock,
  FileText,
  MessageSquare,
  Gavel,
  AlertTriangle,
  ImageIcon,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatTimeAgo } from "@/lib/client-utils";
import { EmptyReports } from "./EmptyReports";
import { ACTION_LABELS } from "../types";
import type { ReportAction } from "@/features/reports/types";

interface InvestigationTimelineProps {
  actions: ReportAction[];
  isLoading?: boolean;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  status_change: <ShieldAlert className="h-4 w-4" />,
  evidence_requested: <AlertTriangle className="h-4 w-4" />,
  evidence_uploaded: <ImageIcon className="h-4 w-4" />,
  comment_added: <MessageSquare className="h-4 w-4" />,
  decision_recorded: <Gavel className="h-4 w-4" />,
  report_created: <FileText className="h-4 w-4" />,
};

const ACTION_COLORS: Record<string, string> = {
  status_change: "bg-blue-100 text-blue-600",
  evidence_requested: "bg-yellow-100 text-yellow-600",
  evidence_uploaded: "bg-green-100 text-green-600",
  comment_added: "bg-purple-100 text-purple-600",
  decision_recorded: "bg-red-100 text-red-600",
  report_created: "bg-gray-100 text-gray-600",
};

export function InvestigationTimeline({ actions, isLoading }: InvestigationTimelineProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Investigation Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-48 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (actions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Investigation Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyReports variant="no-notes" title="No activity recorded" description="No actions have been taken on this report yet." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">
          Investigation Timeline ({actions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          {actions.map((action, idx) => (
            <div key={action.id} className="relative flex gap-4 pb-6 last:pb-0">
              {idx < actions.length - 1 && (
                <div className="absolute left-[15px] top-8 h-full w-px bg-border" />
              )}
              <div
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  ACTION_COLORS[action.action] ?? "bg-muted text-muted-foreground"
                )}
              >
                {ACTION_ICONS[action.action] ?? <Clock className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {ACTION_LABELS[action.action] ?? action.action}
                </p>
                {action.previous_status && action.new_status && (
                  <p className="text-xs text-muted-foreground">
                    {action.previous_status.replace(/_/g, " ")} →{" "}
                    {action.new_status.replace(/_/g, " ")}
                  </p>
                )}
                {action.notes && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {action.notes}
                  </p>
                )}
                <p className="mt-0.5 text-[10px] text-muted-foreground/60">
                  {formatTimeAgo(action.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}