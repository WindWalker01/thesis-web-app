"use client";

export function ReportsPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation skeleton */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-7 w-48 animate-pulse rounded-lg bg-muted" />
            <div className="h-4 w-72 animate-pulse rounded-lg bg-muted" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-56 animate-pulse rounded-lg bg-muted" />
            <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
            <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
            <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6 space-y-6">
        {/* Statistics cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>

        {/* Filters skeleton */}
        <div className="h-12 animate-pulse rounded-xl bg-muted" />

        {/* Table skeleton */}
        <div className="rounded-xl border border-border">
          <div className="border-b border-border p-4">
            <div className="flex gap-4">
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="h-5 w-5 animate-pulse rounded bg-muted" />
                <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
                <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-8 w-8 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
          <div className="border-t border-border p-4">
            <div className="flex items-center justify-between">
              <div className="h-5 w-48 animate-pulse rounded bg-muted" />
              <div className="flex items-center gap-2">
                <div className="h-8 w-24 animate-pulse rounded bg-muted" />
                <div className="h-8 w-8 animate-pulse rounded bg-muted" />
                <div className="h-8 w-8 animate-pulse rounded bg-muted" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}