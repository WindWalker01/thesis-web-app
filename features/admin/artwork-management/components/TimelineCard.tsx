"use client";

import { Clock, Upload, Search, FileText, Shield, AlertTriangle, CheckCircle2, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, cn } from "@/lib/client-utils";
import type { ArtworkDetail } from "../types";

interface TimelineCardProps {
  artwork: ArtworkDetail;
}

interface TimelineEvent {
  type: string;
  title: string;
  description?: string;
  timestamp: string;
  icon: typeof Upload;
  color: string;
  bg: string;
}

export function TimelineCard({ artwork }: TimelineCardProps) {
  const events: TimelineEvent[] = [];

  // Artwork Uploaded
  events.push({
    type: "upload",
    title: "Artwork Uploaded",
    timestamp: artwork.created_at,
    icon: Upload,
    color: "text-blue-600",
    bg: "bg-blue-100",
  });

  // Similarity Scan
  if (artwork.scan) {
    events.push({
      type: "scan",
      title: artwork.scan.success ? "Similarity Scan Completed" : "Similarity Scan Failed",
      description: artwork.scan.success
        ? `Best match: ${artwork.scan.best_similarity_percentage}% (${artwork.scan.total_matches} matches)`
        : artwork.scan.error_message ?? undefined,
      timestamp: artwork.scan.completed_at ?? artwork.scan.created_at,
      icon: Search,
      color: artwork.scan.success ? "text-green-600" : "text-red-600",
      bg: artwork.scan.success ? "bg-green-100" : "bg-red-100",
    });
  }

  // Blockchain Registration
  if (artwork.tx_hash) {
    events.push({
      type: "blockchain",
      title: "Blockchain Recorded",
      description: `Transaction: ${artwork.tx_hash.slice(0, 20)}...`,
      timestamp: artwork.updated_at,
      icon: Shield,
      color: "text-green-600",
      bg: "bg-green-100",
    });
  }

  // Reports
  artwork.reports.forEach((report) => {
    events.push({
      type: "report",
      title: `Report Submitted: ${report.title}`,
      description: `Type: ${report.report_type} — Status: ${report.status}`,
      timestamp: report.created_at,
      icon: FileText,
      color: "text-red-600",
      bg: "bg-red-100",
    });
  });

  // Review Actions
  if (artwork.review?.actions) {
    artwork.review.actions.forEach((action) => {
      const actionLabels: Record<string, string> = {
        viewed: "Review Viewed",
        assigned: "Reviewer Assigned",
        unassigned: "Reviewer Unassigned",
        approved: "Manual Review Approved",
        rejected: "Manual Review Rejected",
        comment_added: "Review Comment Added",
        information_requested: "Additional Info Requested",
        decision_changed: "Decision Changed",
        blockchain_triggered: "Blockchain Registration Triggered",
      };

      events.push({
        type: "review",
        title: actionLabels[action.action] ?? `Admin Action: ${action.action}`,
        description: action.notes ?? undefined,
        timestamp: action.created_at,
        icon: UserCheck,
        color: "text-purple-600",
        bg: "bg-purple-100",
      });
    });
  }

  // Notifications
  artwork.notifications.forEach((notif) => {
    events.push({
      type: "notification",
      title: notif.title,
      description: notif.message,
      timestamp: notif.created_at,
      icon: notif.type === "scan_completed" || notif.type === "scan_flagged" ? Search
        : notif.type === "report_submitted" || notif.type === "report_resolved" ? FileText
        : notif.type === "blockchain_recorded" ? Shield
        : notif.type === "review_approved" ? CheckCircle2
        : AlertTriangle,
      color: notif.is_read ? "text-gray-600" : "text-blue-600",
      bg: notif.is_read ? "bg-gray-100" : "bg-blue-100",
    });
  });

  // Sort by timestamp descending
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Investigation Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-6 text-center">
            <Clock className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No timeline events available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Investigation Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          {events.map((event, i) => {
            const Icon = event.icon;
            return (
              <div key={i} className="relative flex gap-4 pb-6 last:pb-0">
                {/* Icon */}
                <div className={cn("relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", event.bg)}>
                  <Icon className={cn("h-4 w-4", event.color)} />
                </div>
                {/* Content */}
                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-sm font-medium">{event.title}</p>
                  {event.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    {formatDate(event.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}