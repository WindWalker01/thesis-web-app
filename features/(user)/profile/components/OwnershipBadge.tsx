import { AlertTriangle, CheckCircle } from "lucide-react";
import type { OwnershipStatus } from "../types";

type Props = { status: OwnershipStatus };

export function OwnershipBadge({ status }: Props) {
    if (status === "verified") {
        return (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-green-500/10 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded-full">
                <CheckCircle className="w-2.5 h-2.5" />
                Verified
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded-full">
            <AlertTriangle className="w-2.5 h-2.5" />
            Pending
        </span>
    );
}