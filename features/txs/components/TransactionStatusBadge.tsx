import { CheckCircle2, Clock3, XCircle } from "lucide-react";

import type { BlockchainTxStatus } from "@/features/txs/types";

export function TransactionStatusBadge({
    status,
}: {
    status: BlockchainTxStatus;
}) {
    if (status === "success") {
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-500">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Success
            </span>
        );
    }

    if (status === "failed") {
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-500">
                <XCircle className="h-3.5 w-3.5" />
                Failed
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-500">
            <Clock3 className="h-3.5 w-3.5" />
            Pending
        </span>
    );
}