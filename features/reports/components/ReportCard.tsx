"use client";

import Link from "next/link";
import type { Report } from "@/features/reports/types";
import { StatusBadge } from "./StatusBadge";
import { REPORT_TYPE_LABELS } from "@/features/reports/lib/report-utils";
import { formatTimeAgo } from "@/features/reports/lib/report-utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/client-utils";
import { ArrowRight, ImageIcon } from "lucide-react";

type ReportCardProps = {
  report: Report;
  artworkThumbnail?: string | null;
  artworkTitle?: string | null;
  unreadCount?: number;
};

export function ReportCard({
  report,
  artworkThumbnail,
  artworkTitle,
  unreadCount = 0,
}: ReportCardProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-200 hover:shadow-lg",
        unreadCount > 0 && "ring-1 ring-blue-400/30 dark:ring-blue-500/30"
      )}
    >
      <Link href={`/my-reports/${report.id}`} className="block p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg">
        <div className="flex items-start gap-4">
          {/* Unread indicator dot */}
          {unreadCount > 0 && (
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-blue-500" aria-hidden="true" />
          )}

          {/* Artwork Thumbnail */}
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
            {artworkThumbnail ? (
              <img
                src={artworkThumbnail}
                alt={artworkTitle ?? "Artwork thumbnail"}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground/60">
                <ImageIcon className="h-6 w-6" />
              </div>
            )}
            {unreadCount > 0 && (
              <div className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-500 px-1 text-[9px] font-bold leading-none text-white shadow-sm">
                {unreadCount > 9 ? "9+" : unreadCount}
              </div>
            )}
          </div>

          {/* Report Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold group-hover:text-blue-500 transition-colors">
                  {report.title}
                </h3>
                {artworkTitle && (
                  <p className="truncate text-xs text-muted-foreground">
                    Artwork: {artworkTitle}
                  </p>
                )}
              </div>
              <StatusBadge status={report.status} className="flex-shrink-0" />
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/70">{REPORT_TYPE_LABELS[report.report_type]}</span>
              <span className="text-muted-foreground/30" aria-hidden="true">·</span>
              <span>Submitted {formatTimeAgo(report.created_at)}</span>
              <span className="text-muted-foreground/30" aria-hidden="true">·</span>
              <span>ID: {report.id.slice(0, 8)}...</span>
            </div>
          </div>

          {/* View Button */}
          <div className="flex-shrink-0 self-center">
            <Button asChild variant="outline" size="sm">
              <span className="flex items-center gap-1">
                View Details
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Button>
          </div>
        </div>
      </Link>
    </Card>
  );
}
