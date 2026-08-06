"use client";

import Link from "next/link";
import { AlertTriangle, ChevronRight, ScanSearch } from "lucide-react";
import { useCurrentUserPlagiarismHistory } from "../hooks/useFetchPlagiarismHistory";
import { Card } from "../../artwork-ownership/components/ArtworkOwnershipSection";

function StatusBadge({
    status,
}: {
    status: "clean" | "warning" | "running" | "failed";
}) {
    if (status === "clean") {
        return (
            <span className="text-[10px] font-bold bg-green-500/10 text-green-500 px-2.5 py-1 rounded-full">
                Clean
            </span>
        );
    }

    if (status === "warning") {
        return (
            <span className="text-[10px] font-bold bg-orange-500/10 text-orange-500 px-2.5 py-1 rounded-full">
                Matches Found
            </span>
        );
    }

    if (status === "running") {
        return (
            <span className="text-[10px] font-bold bg-blue-500/10 text-blue-500 px-2.5 py-1 rounded-full">
                Running
            </span>
        );
    }

    return (
        <span className="text-[10px] font-bold bg-red-500/10 text-red-500 px-2.5 py-1 rounded-full">
            Failed
        </span>
    );
}

function getPlagiarismHistoryHref(scan: {
    artId: string;
    artworkStatus: string;
    status: "clean" | "warning" | "running" | "failed";
}) {
    const issueStatuses = new Set(["flagged", "removed"]);

    if (scan.status === "warning" && issueStatuses.has(scan.artworkStatus)) {
        return `/profile/issues/${scan.artId}`;
    }

    return `/profile/artworks/${scan.artId}`;
}

export default function PlagiarismHistorySection() {
    const { history, isLoading, error } = useCurrentUserPlagiarismHistory();

    return (
        <>
            <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <ScanSearch className="w-4 h-4 text-blue-500" />
                </div>
                <h2 className="text-xl font-black">Plagiarism Scan History</h2>
            </div>

            <Card>
                <div className="border-b border-slate-100 px-4 py-4 dark:border-slate-800 sm:px-6">
                    <p className="text-sm font-black uppercase tracking-widest text-slate-400">
                        Recent Scans
                    </p>
                </div>

                {error ? (
                    <div className="px-4 py-4 text-base text-red-500 sm:px-6">{error}</div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                                >
                                    <div className="space-y-2">
                                        <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                                        <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                                    </div>
                                    <div className="flex items-center gap-3 self-start sm:self-auto">
                                        <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                                        <div className="h-6 w-24 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
                                    </div>
                                </div>
                            ))
                        ) : history.length === 0 ? (
                            <div className="px-4 py-10 text-center sm:px-6">
                                <div className="mx-auto mb-3 w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <AlertTriangle className="w-4 h-4 text-slate-400" />
                                </div>
                                <p className="text-base font-semibold text-slate-500">
                                    No plagiarism scan history found.
                                </p>
                                <p className="text-sm text-slate-400 mt-1">
                                    Your completed scan results will appear here.
                                </p>
                            </div>
                        ) : (
                            history.map((scan) => {
                                const href = getPlagiarismHistoryHref(scan);

                                return (
                                    <Link
                                        key={scan.id}
                                        href={href}
                                        className="group block px-4 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 sm:px-6"
                                    >
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                                            <div className="min-w-0">
                                                <p className="truncate text-base font-semibold transition-colors group-hover:text-blue-500">
                                                    {scan.artwork}
                                                </p>
                                                <p className="text-sm text-slate-400 mt-0.5">
                                                    {scan.date}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 sm:shrink-0">
                                                <span className="text-xs text-slate-400 sm:text-sm">
                                                    {scan.matches} match{scan.matches !== 1 ? "es" : ""}
                                                    {typeof scan.similarity === "number"
                                                        ? ` · ${scan.similarity.toFixed(2)}%`
                                                        : ""}
                                                </span>
                                                <StatusBadge status={scan.status} />
                                                <ChevronRight className="hidden h-4 w-4 text-slate-300 transition-colors group-hover:text-blue-500 sm:block" />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>
                )}
            </Card>
        </>
    );
}