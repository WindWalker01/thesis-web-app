import { Blocks, DatabaseZap, Link2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { truncateHash } from "@/lib/client-utils";
import type { BlockchainTxSource } from "@/features/txs/types";

function FeatureStat({
    title,
    value,
}: {
    title: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">{title}</p>
            <p className="mt-2 break-all text-sm font-semibold text-white">{value}</p>
        </div>
    );
}

function formatSourceLabel(sourceUsed: BlockchainTxSource | null) {
    if (sourceUsed === "explorer") return "Explorer API";
    if (sourceUsed === "rpc") return "RPC logs";
    return "Loading...";
}

export function TransactionsHero({
    contractAddress,
    chainLabel,
    sourceUsed,
}: {
    contractAddress: string;
    chainLabel: string;
    sourceUsed: BlockchainTxSource | null;
}) {
    return (
        <section className="border-b bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-20 text-white">
            <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
                <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
                    <div className="space-y-4">
                        <Badge
                            variant="secondary"
                            className="w-fit gap-2 bg-white/10 text-white hover:bg-white/10"
                        >
                            <Blocks className="h-3.5 w-3.5" />
                            Blockchain Transactions
                        </Badge>

                        <div className="space-y-3">
                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                                Public contract activity
                            </h1>
                            <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
                                Browse your artwork registry contract activity in a clean
                                explorer-style layout while keeping the public view focused on
                                transaction metadata only.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                        <FeatureStat title="Network" value={chainLabel || "Polygon Amoy"} />
                        <FeatureStat
                            title="Contract"
                            value={
                                contractAddress
                                    ? truncateHash(contractAddress, 10, 8)
                                    : "Loading..."
                            }
                        />
                        <FeatureStat
                            title="Source"
                            value={formatSourceLabel(sourceUsed)}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}