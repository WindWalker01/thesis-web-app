"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle, FileCheck, ChevronRight } from "lucide-react";
import { useCurrentUserOwnershipRecords } from "../hooks/useFetchOwnershipRecords";

export function Card({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden ${className}`}
        >
            {children}
        </div>
    );
}

function OwnershipStatusBadge({ verified }: { verified: boolean }) {
    if (verified) {
        return (
            <span className="text-[10px] font-bold bg-green-500/10 text-green-500 px-2.5 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                <CheckCircle className="w-3 h-3" />
                Verified
            </span>
        );
    }

    return (
        <span className="text-[10px] font-bold bg-orange-500/10 text-orange-500 px-2.5 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
            <AlertTriangle className="w-3 h-3" />
            Pending
        </span>
    );
}

export default function ArtworkOwnershipSection() {
    const { records, isLoading, error } = useCurrentUserOwnershipRecords();

    return (
        <>
            <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <FileCheck className="w-4 h-4 text-blue-500" />
                </div>
                <h2 className="text-xl font-black">Artwork Ownership Records</h2>
            </div>

            <Card>
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                        Blockchain Certificates
                    </p>
                </div>

                {error ? (
                    <div className="px-6 py-4 text-sm text-red-500">{error}</div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="px-6 py-4 flex items-center justify-between gap-4"
                                >
                                    <div className="space-y-2 min-w-0">
                                        <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                                        <div className="h-3 w-48 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                                    </div>
                                    <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
                                </div>
                            ))
                        ) : records.length === 0 ? (
                            <div className="px-6 py-10 text-center">
                                <div className="mx-auto mb-3 w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <FileCheck className="w-4 h-4 text-slate-400" />
                                </div>
                                <p className="text-sm font-semibold text-slate-500">
                                    No ownership records found.
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    Your blockchain-recorded and pending artworks will appear here.
                                </p>
                            </div>
                        ) : (
                            records.map((rec) => (
                                <Link
                                    key={rec.id}
                                    href={`/profile/artworks/${rec.id}`}
                                    className="group block px-6 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold truncate group-hover:text-blue-500 transition-colors">
                                                {rec.artwork}
                                            </p>
                                            <p className="text-xs text-slate-400 font-mono mt-0.5">
                                                {rec.hash}
                                                {rec.tx ? ` · ${rec.tx}` : ""}
                                                {" · "}
                                                {rec.date}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <OwnershipStatusBadge verified={rec.verified} />
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </Card>
        </>
    );
}