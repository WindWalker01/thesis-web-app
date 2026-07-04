"use client";

export function UserManagementSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation skeleton */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="flex gap-2">
            <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
            <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6 space-y-6">
        {/* Statistics cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-10 w-full max-w-md animate-pulse rounded-lg bg-muted" />
          <div className="flex gap-2">
            <div className="h-10 w-20 animate-pulse rounded-lg bg-muted" />
            <div className="h-10 w-20 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>

        {/* Table skeleton */}
        <div className="rounded-xl border border-border">
          <div className="border-b border-border p-4">
            <div className="flex gap-4">
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                <div className="h-8 w-8 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}