"use client";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted/60 ${className}`} />;
}

export function ArtworkVerificationSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-5 w-5 rounded" />
          <SkeletonBlock className="h-6 w-48" />
          <SkeletonBlock className="h-5 w-16 rounded-full" />
        </div>
      </div>

      <div className="p-4 lg:p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <SkeletonBlock className="h-10 w-10 rounded-xl" />
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="h-8 w-16" />
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-9 flex-1 max-w-md rounded-lg" />
          <SkeletonBlock className="h-9 w-24 rounded-lg" />
          <SkeletonBlock className="h-9 w-24 rounded-lg" />
          <SkeletonBlock className="h-9 w-9 rounded-lg" />
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <SkeletonBlock className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <SkeletonBlock className="h-3 w-48" />
                  <SkeletonBlock className="h-2 w-32" />
                </div>
                <SkeletonBlock className="h-5 w-16 rounded-full" />
                <SkeletonBlock className="h-5 w-20 rounded-full" />
                <SkeletonBlock className="h-5 w-24" />
                <SkeletonBlock className="h-8 w-8 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}