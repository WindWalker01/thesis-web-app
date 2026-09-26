"use client";

export function ReportCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border bg-card p-4">
      <div className="flex items-start gap-4">
        {/* Thumbnail placeholder */}
        <div className="h-16 w-16 flex-shrink-0 rounded-md bg-muted" />

        <div className="flex-1 space-y-3">
          {/* Title */}
          <div className="h-4 w-3/4 rounded bg-muted" />
          {/* Report type + status */}
          <div className="flex gap-2">
            <div className="h-5 w-20 rounded-full bg-muted" />
            <div className="h-5 w-24 rounded-full bg-muted" />
          </div>
          {/* Dates */}
          <div className="flex gap-4">
            <div className="h-3 w-28 rounded bg-muted" />
            <div className="h-3 w-28 rounded bg-muted" />
          </div>
        </div>

        {/* View button placeholder */}
        <div className="h-9 w-24 flex-shrink-0 rounded-md bg-muted" />
      </div>
    </div>
  );
}