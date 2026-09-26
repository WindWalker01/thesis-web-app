// Pulse animation helper — reusable shimmer block
function Shimmer({ className }: { className: string }) {
    return (
        <div className={`animate-pulse rounded bg-muted/60 ${className}`} />
    );
}

// ── Banner skeleton ────────────────────────────────────────────────────────────
function BannerSkeleton() {
    return (
        <div className="relative bg-slate-900 overflow-hidden">
            {/* Gradient banner bg */}
            <div className="h-40 md:h-52 w-full bg-linear-to-r from-blue-950 via-slate-900 to-orange-950 relative overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: "radial-gradient(rgba(96,165,250,1) 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                    }}
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative -mt-14 pb-6 flex flex-col md:flex-row md:items-end gap-5">

                    {/* Avatar */}
                    <div className="shrink-0">
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-slate-700 animate-pulse border-4 border-slate-900" />
                    </div>

                    {/* Text block */}
                    <div className="flex-1 min-w-0 pb-1 space-y-2.5">
                        <div className="flex items-center gap-3">
                            <div className="h-7 w-44 rounded-lg bg-slate-700 animate-pulse" />
                            <div className="h-5 w-24 rounded-full bg-slate-700/70 animate-pulse" />
                        </div>
                        <div className="h-4 w-28 rounded bg-slate-700/60 animate-pulse" />
                        <div className="hidden md:flex flex-col gap-1.5 pt-0.5">
                            <div className="h-3 w-96 rounded bg-slate-700/40 animate-pulse" />
                            <div className="h-3 w-72 rounded bg-slate-700/40 animate-pulse" />
                        </div>
                        <div className="h-3 w-32 rounded bg-slate-700/30 animate-pulse" />
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 shrink-0 pb-1">
                        <div className="h-9 w-32 rounded-xl bg-slate-700 animate-pulse" />
                        <div className="h-9 w-24 rounded-xl bg-slate-700/60 animate-pulse" />
                    </div>
                </div>

                {/* Stats strip — 4 stats matching ProfileStats */}
                <div className="flex flex-wrap border-t border-white/5">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className={`flex items-center gap-3 px-6 py-4 ${i !== 0 ? "border-l border-white/5" : ""}`}
                        >
                            <div className="w-4 h-4 rounded bg-slate-700/60 animate-pulse" />
                            <div className="space-y-1.5">
                                <div className="h-5 w-8 rounded bg-slate-700 animate-pulse" />
                                <div className="h-2.5 w-16 rounded bg-slate-700/50 animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Top bar skeleton ───────────────────────────────────────────────────────────
function TopBarSkeleton() {
    return (
        <div className="flex items-center gap-3 mb-5 flex-wrap">
            {/* Filter button */}
            <Shimmer className="h-9 w-24" />
            {/* Search input */}
            <Shimmer className="h-9 flex-1 max-w-sm" />
            {/* Result count */}
            <Shimmer className="h-4 w-14 hidden sm:block" />
            <div className="flex-1" />
            {/* Sort */}
            <Shimmer className="h-9 w-36" />
            {/* View mode */}
            <Shimmer className="h-9 w-[72px]" />
        </div>
    );
}

// ── Sidebar skeleton ───────────────────────────────────────────────────────────
function SidebarSkeleton() {
    return (
        <div className="shrink-0 w-[220px] bg-card border border-border rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <Shimmer className="h-3 w-14" />
            </div>

            {/* Three filter sections matching Category / Ownership / Hash Status */}
            {[7, 3, 3].map((rowCount, si) => (
                <div key={si} className="border-b border-border last:border-0">
                    {/* Dropdown header */}
                    <div className="flex items-center justify-between px-4 py-3">
                        <Shimmer className="h-3 w-16" />
                        <Shimmer className="h-3 w-3" />
                    </div>
                    {/* Filter rows */}
                    <div className="px-3 pb-3 space-y-1">
                        {[...Array(rowCount)].map((_, ri) => (
                            <div key={ri} className="flex items-center gap-2.5 px-2 py-2">
                                <Shimmer className="w-5 h-5 shrink-0" />
                                <Shimmer className={`h-3 ${ri === 0 ? "w-24" : "w-20"}`} />
                                <Shimmer className="h-3 w-4 ml-auto" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Artwork grid skeleton ─────────────────────────────────────────────────────
function ArtworkGridSkeleton() {
    return (
        <div className="flex-1 min-w-0">
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-card border border-border rounded-2xl overflow-hidden"
                    >
                        {/* Thumbnail */}
                        <Shimmer className="aspect-square w-full rounded-none" />
                        {/* Card info */}
                        <div className="p-3 space-y-2">
                            <Shimmer className="h-4 w-3/4" />
                            <Shimmer className="h-3 w-1/2" />
                            <Shimmer className="h-5 w-16 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Full page skeleton ─────────────────────────────────────────────────────────

export function ProfilePageSkeleton() {
    return (
        <>
            <BannerSkeleton />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <TopBarSkeleton />

                <div className="flex gap-5 items-start">
                    <SidebarSkeleton />
                    <ArtworkGridSkeleton />
                </div>
            </div>
        </>
    );
}