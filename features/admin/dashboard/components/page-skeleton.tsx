"use client";

function SkeletonBlock({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-muted/60 ${className}`}
    />
  );
}

export default function AdminDashboardPageSkeleton() {
  return (
    <div className="min-h-screen bg-background font-display text-foreground">
      {/* Top Nav */}
      <header className="border-border sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
          <SkeletonBlock className="h-8 w-8 rounded-lg" />
          <SkeletonBlock className="h-9 flex-1 max-w-md rounded-lg" />
          <div className="ml-auto flex items-center gap-3">
            <SkeletonBlock className="h-9 w-9 rounded-full" />
            <SkeletonBlock className="h-9 w-9 rounded-full" />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="border-border hidden w-64 shrink-0 border-r lg:block">
          <div className="space-y-1 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-4 lg:p-6 space-y-6">
          {/* Welcome */}
          <div className="space-y-2">
            <SkeletonBlock className="h-8 w-64" />
            <SkeletonBlock className="h-4 w-48" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-5">
                <SkeletonBlock className="mb-4 h-10 w-10 rounded-xl" />
                <SkeletonBlock className="h-3 w-20 mb-2" />
                <SkeletonBlock className="h-8 w-16 mb-2" />
                <SkeletonBlock className="h-3 w-24" />
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-5">
              <SkeletonBlock className="h-5 w-40 mb-4" />
              <SkeletonBlock className="h-48 w-full rounded-lg" />
            </div>
            <div className="bg-card border border-border rounded-2xl p-5">
              <SkeletonBlock className="h-5 w-40 mb-4" />
              <SkeletonBlock className="h-48 w-full rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-5">
                <SkeletonBlock className="h-5 w-32 mb-4" />
                <SkeletonBlock className="h-40 w-full rounded-lg" />
              </div>
            ))}
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-5">
              <SkeletonBlock className="h-5 w-36 mb-4" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <SkeletonBlock className="h-8 w-8 rounded-full" />
                  <div className="flex-1">
                    <SkeletonBlock className="h-3 w-full mb-1" />
                    <SkeletonBlock className="h-2 w-24" />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-card border border-border rounded-2xl p-5">
              <SkeletonBlock className="h-5 w-36 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <SkeletonBlock className="h-3 w-3 rounded-full" />
                    <div className="flex-1">
                      <SkeletonBlock className="h-3 w-full mb-1" />
                      <SkeletonBlock className="h-2 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}