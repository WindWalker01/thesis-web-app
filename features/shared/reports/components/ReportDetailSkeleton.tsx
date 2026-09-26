import { ChevronRight } from "lucide-react";

export default function ReportDetailSkeleton() {
  return (
    <div className="mx-auto mt-12 max-w-6xl px-4 py-8">
      {/* Breadcrumb Skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <div className="bg-muted h-4 w-24 animate-pulse rounded" />
        <ChevronRight className="text-muted-foreground/40 h-3.5 w-3.5" />
        <div className="bg-muted h-4 w-48 animate-pulse rounded" />
      </div>

      {/* Page Header with Quick Actions Skeleton */}
      <div className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-3">
              <div className="bg-muted h-9 w-9 animate-pulse rounded-lg" />
              <div className="bg-muted h-8 w-64 animate-pulse rounded-md" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-muted h-5 w-24 animate-pulse rounded-full" />
              <span className="text-muted-foreground/30">·</span>
              <div className="bg-muted h-4 w-32 animate-pulse rounded" />
              <span className="text-muted-foreground/30">·</span>
              <div className="bg-muted h-4 w-32 animate-pulse rounded" />
            </div>
          </div>
        </div>

        {/* Quick Action Buttons Skeleton */}
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="bg-muted h-9 w-24 animate-pulse rounded-md" />
          <div className="bg-muted h-9 w-36 animate-pulse rounded-md" />
          <div className="bg-muted h-9 w-28 animate-pulse rounded-md" />
          <div className="bg-muted h-9 w-32 animate-pulse rounded-md" />
        </div>
      </div>

      {/* Responsive Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ===== LEFT COLUMN ===== */}
        <div className="space-y-6">
          {/* Overview Skeleton */}
          <section className="bg-card overflow-hidden rounded-xl border">
            <div className="bg-muted/30 flex items-center gap-2 border-b px-5 py-3.5">
              <div className="bg-muted h-4 w-4 animate-pulse rounded" />
              <div className="bg-muted h-4 w-20 animate-pulse rounded" />
            </div>
            <div className="divide-border divide-y">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-5 py-3.5"
                >
                  <div className="bg-muted h-4 w-24 animate-pulse rounded" />
                  <div className="bg-muted h-4 w-32 animate-pulse rounded" />
                </div>
              ))}
            </div>
          </section>

          {/* Description Skeleton */}
          <section className="bg-card overflow-hidden rounded-xl border">
            <div className="bg-muted/30 flex items-center gap-2 border-b px-5 py-3.5">
              <div className="bg-muted h-4 w-4 animate-pulse rounded" />
              <div className="bg-muted h-4 w-24 animate-pulse rounded" />
            </div>
            <div className="space-y-2 px-5 py-4">
              <div className="bg-muted h-4 w-full animate-pulse rounded" />
              <div className="bg-muted h-4 w-full animate-pulse rounded" />
              <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
            </div>
          </section>

          {/* Status Timeline Skeleton */}
          <section className="bg-card overflow-hidden rounded-xl border">
            <div className="bg-muted/30 flex items-center gap-2 border-b px-5 py-3.5">
              <div className="bg-muted h-4 w-4 animate-pulse rounded" />
              <div className="bg-muted h-4 w-36 animate-pulse rounded" />
            </div>
            <div className="space-y-6 px-5 py-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="bg-muted h-10 w-10 shrink-0 animate-pulse rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="bg-muted h-4 w-1/3 animate-pulse rounded" />
                    <div className="bg-muted h-3 w-1/4 animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ===== RIGHT COLUMN ===== */}
        <div className="space-y-6">
          {/* Live Chat Conversation Skeleton */}
          <section className="flex flex-col">
            <div className="bg-card flex flex-col overflow-hidden rounded-xl border">
              <div className="bg-muted/30 flex items-center gap-2 border-b px-5 py-3.5">
                <div className="bg-muted h-4 w-4 animate-pulse rounded" />
                <div className="bg-muted h-4 w-28 animate-pulse rounded" />
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="bg-muted h-2 w-2 animate-pulse rounded-full" />
                  <div className="bg-muted h-3 w-16 animate-pulse rounded" />
                </div>
              </div>
              <div className="relative flex h-[500px] flex-col p-4">
                <div className="flex-1 space-y-6">
                  {/* Message left */}
                  <div className="flex gap-3">
                    <div className="bg-muted h-8 w-8 shrink-0 animate-pulse rounded-full" />
                    <div className="space-y-1">
                      <div className="bg-muted h-3 w-20 animate-pulse rounded" />
                      <div className="bg-muted h-16 w-64 animate-pulse rounded-2xl rounded-tl-none" />
                    </div>
                  </div>
                  {/* Message right */}
                  <div className="flex flex-row-reverse gap-3">
                    <div className="bg-muted h-8 w-8 shrink-0 animate-pulse rounded-full" />
                    <div className="flex flex-col items-end space-y-1">
                      <div className="bg-muted h-3 w-20 animate-pulse rounded" />
                      <div className="bg-muted h-12 w-48 animate-pulse rounded-2xl rounded-tr-none" />
                    </div>
                  </div>
                  {/* Message left */}
                  <div className="flex gap-3">
                    <div className="bg-muted h-8 w-8 shrink-0 animate-pulse rounded-full" />
                    <div className="space-y-1">
                      <div className="bg-muted h-3 w-20 animate-pulse rounded" />
                      <div className="bg-muted h-24 w-72 animate-pulse rounded-2xl rounded-tl-none" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2 border-t pt-4">
                  <div className="bg-muted h-10 flex-1 animate-pulse rounded-md" />
                  <div className="bg-muted h-10 w-10 shrink-0 animate-pulse rounded-md" />
                </div>
              </div>
            </div>
          </section>

          {/* Evidence Skeleton */}
          <section>
            <div className="bg-card overflow-hidden rounded-xl border">
              <div className="bg-muted/30 flex items-center gap-2 border-b px-5 py-3.5">
                <div className="bg-muted h-4 w-4 animate-pulse rounded" />
                <div className="bg-muted h-4 w-20 animate-pulse rounded" />
              </div>
              <div className="px-5 py-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-muted aspect-square animate-pulse rounded-lg"
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
