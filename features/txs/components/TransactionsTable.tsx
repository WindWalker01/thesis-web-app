import { ExternalLink } from "lucide-react";

import { TransactionStatusBadge } from "@/features/txs/components/TransactionStatusBadge";
import type { BlockchainTransactionItem } from "@/features/txs/types";
import { formatTimeAgo, truncateHash } from "@/lib/client-utils";

function MethodBadge({
    methodLabel,
    method,
}: {
    methodLabel: string;
    method: BlockchainTransactionItem["method"];
}) {
    const styles =
        method === "register"
            ? "border-blue-500/20 bg-blue-500/10 text-blue-500"
            : method === "revoke"
              ? "border-orange-500/20 bg-orange-500/10 text-orange-500"
              : "border-slate-500/20 bg-slate-500/10 text-slate-500";

    return (
        <span
            className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${styles}`}
        >
            {methodLabel}
        </span>
    );
}

export function TransactionsTable({
    items,
}: {
    items: BlockchainTransactionItem[];
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-xl">
            <div className="hidden grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr_1fr_1fr_0.8fr] gap-4 border-b border-border bg-muted/40 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground md:grid">
                <div>Transaction Hash</div>
                <div>Method</div>
                <div>Block</div>
                <div>Age</div>
                <div>From</div>
                <div>To</div>
                <div>Status</div>
            </div>

            <div className="divide-y divide-border">
                {items.map((item) => (
                    <div
                        key={`${item.txHash}-${item.blockNumber ?? "pending"}`}
                        className="grid gap-4 px-5 py-4 md:grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr_1fr_1fr_0.8fr] md:items-center"
                    >
                        <div className="space-y-1">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground md:hidden">
                                Transaction Hash
                            </p>
                            <a
                                href={item.explorerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-500 hover:underline"
                            >
                                {truncateHash(item.txHash, 12, 10)}
                                <ExternalLink className="h-3.5 w-3.5" />
                            </a>

                            {item.workId ? (
                                <p className="text-xs text-muted-foreground">
                                    Work ID: {item.workId}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground md:hidden">
                                Method
                            </p>
                            <MethodBadge
                                methodLabel={item.methodLabel}
                                method={item.method}
                            />
                        </div>

                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground md:hidden">
                                Block
                            </p>
                            <p className="text-sm font-medium">
                                {item.blockNumber ?? "Pending"}
                            </p>
                        </div>

                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground md:hidden">
                                Age
                            </p>
                            <p className="text-sm font-medium">
                                {item.timestamp ? formatTimeAgo(item.timestamp) : "Pending"}
                            </p>
                        </div>

                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground md:hidden">
                                From
                            </p>
                            <p className="text-sm font-medium">
                                {truncateHash(item.from, 8, 6)}
                            </p>
                        </div>

                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground md:hidden">
                                To
                            </p>
                            <p className="text-sm font-medium">
                                {truncateHash(item.to, 8, 6)}
                            </p>
                        </div>

                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground md:hidden">
                                Status
                            </p>
                            <TransactionStatusBadge status={item.status} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}