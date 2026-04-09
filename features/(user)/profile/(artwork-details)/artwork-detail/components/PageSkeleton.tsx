import Link from "next/link";
import {
    ArrowLeft,
    BadgeCheck,
    FileText,
    ScanSearch,
    UserRound,
} from "lucide-react";
import { SectionHeader } from "./SectionHeader";

export default function ArtworkDetailPageSkeleton() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-background text-foreground mt-12">
            <div
                className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.45) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.45) 1px, transparent 1px)`,
                    backgroundSize: "48px 48px",
                }}
            />

            <div className="pointer-events-none absolute -top-24 left-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="pointer-events-none absolute top-20 right-0 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <Link
                    href="/profile"
                    className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-10"
                >
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                    Back to profile
                </Link>

                <section className="mb-8 overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-[0_12px_50px_rgba(0,0,0,0.12)]">
                    <div className="flex items-center justify-between border-b border-border px-5 py-3">
                        <Skeleton className="h-3 w-40" />
                        <Skeleton className="h-3 w-20" />
                    </div>

                    <div className="p-6 md:p-8">
                        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-8">
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-5">
                                    <Skeleton className="h-7 w-24 rounded-full" />
                                    <Skeleton className="h-7 w-24 rounded-full" />
                                </div>

                                <div className="space-y-3 mb-5">
                                    <Skeleton className="h-12 w-full max-w-xl" />
                                    <Skeleton className="h-12 w-full max-w-2xl" />
                                </div>

                                <div className="flex flex-wrap items-center gap-5 mb-5">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-40" />
                                </div>

                                <div className="space-y-2 max-w-2xl">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-[92%]" />
                                    <Skeleton className="h-4 w-[78%]" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 min-w-[260px] xl:w-[320px]">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="rounded-xl border border-border bg-background/70 px-4 py-3"
                                    >
                                        <Skeleton className="h-3 w-16 mb-2" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <Skeleton className="h-10 w-32 rounded-xl" />
                            <Skeleton className="h-10 w-44 rounded-xl" />
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
                    <div className="space-y-6">
                        <div className="overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-xl">
                            <SectionHeader icon={<FileText className="w-3.5 h-3.5" />} title="Artwork Preview" />
                            <div className="p-4 md:p-5">
                                <Skeleton className="aspect-square w-full rounded-xl" />
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-xl">
                            <SectionHeader icon={<ScanSearch className="w-3.5 h-3.5" />} title="Plagiarism Summary" />
                            <div className="p-4 md:p-5">
                                <div className="rounded-xl border border-border bg-background/50 p-5 space-y-2">
                                    <Skeleton className="h-4 w-52" />
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-3 w-[88%]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-xl">
                            <SectionHeader icon={<UserRound className="w-3.5 h-3.5" />} title="Creator Info" />
                            <div className="p-4 md:p-5">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <Skeleton className="h-4 w-40" />
                                        <Skeleton className="h-3 w-28" />
                                        <Skeleton className="h-3 w-52" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-xl">
                            <SectionHeader icon={<BadgeCheck className="w-3.5 h-3.5" />} title="Proof Summary" />
                            <div className="p-4 md:p-5 space-y-2">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <SkeletonInfoRow key={i} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <div className="overflow-hidden rounded-2xl border border-border bg-card/80">
                        <div className="border-b border-border bg-background/60 px-5 py-3.5">
                            <Skeleton className="h-3 w-40" />
                        </div>

                        <div className="p-4 md:p-5">
                            <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-6">
                                <div className="space-y-6">
                                    <div className="overflow-hidden rounded-2xl border border-border bg-card/80">
                                        <div className="border-b border-border bg-background/60 px-5 py-3.5">
                                            <Skeleton className="h-3 w-44" />
                                        </div>
                                        <div className="p-4 md:p-5 space-y-2">
                                            {Array.from({ length: 6 }).map((_, i) => (
                                                <SkeletonInfoRow key={i} />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="overflow-hidden rounded-2xl border border-border bg-card/80">
                                        <div className="border-b border-border bg-background/60 px-5 py-3.5">
                                            <Skeleton className="h-3 w-28" />
                                        </div>
                                        <div className="p-4 md:p-5 space-y-2">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <SkeletonInfoRow key={i} />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="overflow-hidden rounded-2xl border border-border bg-card/80">
                                        <div className="border-b border-border bg-background/60 px-5 py-3.5">
                                            <Skeleton className="h-3 w-32" />
                                        </div>
                                        <div className="p-4 md:p-5">
                                            <Skeleton className="h-64 w-full rounded-xl" />
                                        </div>
                                    </div>

                                    <div className="overflow-hidden rounded-2xl border border-border bg-card/80">
                                        <div className="border-b border-border bg-background/60 px-5 py-3.5">
                                            <Skeleton className="h-3 w-40" />
                                        </div>
                                        <div className="p-4 md:p-5">
                                            <Skeleton className="h-64 w-full rounded-xl" />
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-blue-500/15 bg-blue-500/5 p-4">
                                        <div className="space-y-2">
                                            <Skeleton className="h-3 w-24" />
                                            <Skeleton className="h-3 w-full" />
                                            <Skeleton className="h-3 w-[92%]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

function Skeleton({ className = "" }: { className?: string }) {
    return <div className={`animate-pulse rounded-md bg-muted/70 ${className}`} />;
}

function SkeletonInfoRow() {
    return (
        <div className="rounded-xl border border-border bg-background/70 px-4 py-3">
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-4 w-32" />
        </div>
    );
}