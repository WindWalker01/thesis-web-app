import { CheckCircle2, XCircle } from "lucide-react";

import { truncateHash } from "@/lib/client-utils";
import type { VerifyComparisonItem } from "../types";

function formatValue(value: string | null) {
    if (!value) return "—";
    return value.length > 28 ? truncateHash(value, 12, 10) : value;
}

export function VerifyArtworkComparisonTable({
    items,
}: {
    items: VerifyComparisonItem[];
}) {
    return (
        <div className="rounded-3xl border border-border bg-card/80 p-5 backdrop-blur-xl">
            <div className="mb-4">
                <h2 className="text-lg font-black">Verification comparison</h2>
                <p className="text-sm text-muted-foreground">
                    Each stored ownership value is checked against the live blockchain record.
                </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border">
                <div className="hidden grid-cols-[1.2fr_1fr_1fr_140px] gap-4 border-b border-border bg-muted/40 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
                    <div>Field</div>
                    <div>Database value</div>
                    <div>Blockchain value</div>
                    <div>Result</div>
                </div>

                <div className="divide-y divide-border">
                    {items.map((item) => (
                        <div
                            key={item.key}
                            className="grid gap-3 px-4 py-4 md:grid-cols-[1.2fr_1fr_1fr_140px] md:items-center"
                        >
                            <div>
                                <div className="font-semibold">{item.label}</div>
                                {item.note ? (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {item.note}
                                    </p>
                                ) : null}
                            </div>

                            <div className="text-sm">
                                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground md:hidden">
                                    Database value
                                </div>
                                <span className="break-all">{formatValue(item.expected)}</span>
                            </div>

                            <div className="text-sm">
                                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground md:hidden">
                                    Blockchain value
                                </div>
                                <span className="break-all">{formatValue(item.actual)}</span>
                            </div>

                            <div>
                                <span
                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${item.matches
                                            ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                                        }`}
                                >
                                    {item.matches ? (
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                    ) : (
                                        <XCircle className="h-3.5 w-3.5" />
                                    )}
                                    {item.matches ? "Match" : "Mismatch"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}