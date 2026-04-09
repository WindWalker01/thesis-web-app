import type { ArtworkStatus } from "../types";
import { formatArtworkStatusLabel } from "..";

type Props = {
    status: ArtworkStatus;
};

const statusStyles: Record<ArtworkStatus, string> = {
    active:
        "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400",
    under_review:
        "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
    pending_blockchain:
        "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
    flagged:
        "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400",
    removed:
        "bg-slate-500/10 border-slate-500/20 text-slate-600 dark:text-slate-300",
    blockchain_failed:
        "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400",
    revoked:
        "bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400",
};

export function ArtworkStatusBadge({ status }: Props) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${statusStyles[status]}`}
        >
            {formatArtworkStatusLabel(status)}
        </span>
    );
}