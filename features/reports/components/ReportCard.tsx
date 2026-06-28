"use client";

import Link from "next/link";
import type { Report } from "@/features/reports/types";
import { StatusBadge } from "./StatusBadge";
import { REPORT_TYPE_LABELS } from "@/features/reports/lib/report-utils";
import { formatDate, formatTimeAgo } from "@/features/reports/lib/report-utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/client-utils";

type ReportCardProps = {
  report: Report;
  artworkThumbnail?: string | null;
  artworkTitle?: string | null;
};

export function ReportCard({
  report,
  artworkThumbnail,
  artworkTitle,
}: ReportCardProps) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4 p-4">
        {/* Artwork Thumbnail */}
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
          {artworkThumbnail ? (
            <img
              src={artworkThumbnail}
              alt={artworkTitle ?? "Artwork thumbnail"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Report Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold">{report.title}</h3>
              {artworkTitle && (
                <p className="truncate text-xs text-muted-foreground">
                  Artwork: {artworkTitle}
                </p>
              )}
            </div>
            <StatusBadge status={report.status} className="flex-shrink-0" />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>{REPORT_TYPE_LABELS[report.report_type]}</span>
            <span className="text-muted-foreground/40">|</span>
            <span>Submitted {formatTimeAgo(report.created_at)}</span>
            <span className="text-muted-foreground/40">|</span>
            <span>Updated {formatTimeAgo(report.resolved_at ?? report.created_at)}</span>
          </div>
        </div>

        {/* View Button */}
        <div className="flex-shrink-0 self-center">
          <Button asChild variant="outline" size="sm">
            <Link href={`/my-reports/${report.id}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}