import { AlertTriangle, CheckCircle } from "lucide-react";
import type { OwnershipStatus } from "../types";

type Props = { status: OwnershipStatus };

export function OwnershipBadge({ status }: Props) {
  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-1.5 py-0.5 text-xs font-bold text-green-600 dark:text-green-400">
        <CheckCircle className="h-2.5 w-2.5" />
        Verified
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-xs font-bold text-amber-500">
      <AlertTriangle className="h-2.5 w-2.5" />
      Pending
    </span>
  );
}
