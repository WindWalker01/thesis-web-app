function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`bg-muted/60 animate-pulse rounded-xl ${className}`} />;
}

export default function Loading() {
  return (
    <main className="bg-background text-foreground font-display min-h-screen">
      <div className="h-1 w-full bg-linear-to-r from-blue-600 via-primary to-orange-400" />

      <div className="mx-auto max-w-3xl px-4 pb-16 pt-24 sm:px-6">
        <SkeletonBlock className="mb-4 h-4 w-36" />

        <article className="border-border/70 bg-card/90 overflow-hidden rounded-3xl border shadow-sm">
          <div className="flex items-start gap-3 p-4 sm:p-5">
            <SkeletonBlock className="h-11 w-11 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <SkeletonBlock className="h-4 w-28" />
              <SkeletonBlock className="mt-2 h-3 w-48" />
            </div>
          </div>

          <div className="px-4 pb-3 sm:px-5">
            <SkeletonBlock className="mb-3 h-6 w-24 rounded-full" />
            <SkeletonBlock className="h-7 w-3/4" />
            <SkeletonBlock className="mt-3 h-4 w-full" />
            <SkeletonBlock className="mt-2 h-4 w-5/6" />
          </div>

          <div className="border-border/70 bg-muted/30 border-y">
            <SkeletonBlock className="aspect-square w-full rounded-none" />
          </div>

          <div className="border-border/70 border-t px-3 py-3 sm:px-4">
            <div className="grid grid-cols-3 gap-2">
              <SkeletonBlock className="h-11 rounded-2xl" />
              <SkeletonBlock className="h-11 rounded-2xl" />
              <SkeletonBlock className="h-11 rounded-2xl" />
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
