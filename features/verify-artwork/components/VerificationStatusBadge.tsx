import { AlertTriangle, CheckCircle2, FileWarning, ShieldX, XCircle } from "lucide-react";

import type { VerifyArtworkStatus } from "../types";

const styles: Record<
    VerifyArtworkStatus,
    { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
> = {
    verified: {
        label: "Verified",
        className: "border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400",
        icon: CheckCircle2,
    },
    mismatch: {
        label: "Mismatch detected",
        className: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
        icon: AlertTriangle,
    },
    not_recorded: {
        label: "Not yet recorded",
        className: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
        icon: FileWarning,
    },
    not_found_on_chain: {
        label: "On-chain record not found",
        className: "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400",
        icon: XCircle,
    },
    revoked: {
        label: "Revoked on-chain",
        className: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
        icon: ShieldX,
    },
    incomplete: {
        label: "Incomplete record",
        className: "border-slate-500/20 bg-slate-500/10 text-slate-600 dark:text-slate-300",
        icon: FileWarning,
    },
    error: {
        label: "Verification error",
        className: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
        icon: XCircle,
    },
};

export function VerificationStatusBadge({ status }: { status: VerifyArtworkStatus }) {
    const config = styles[status];
    const Icon = config.icon;

    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${config.className}`}
        >
            <Icon className="h-3.5 w-3.5" />
            {config.label}
        </span>
    );
}