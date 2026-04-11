import { AlertTriangle, Info } from "lucide-react";

import type { VerifyArtworkResultData } from "../types";

export function VerifyArtworkResultStates({
    result,
}: {
    result: VerifyArtworkResultData;
}) {
    if (result.status === "verified") return null;

    const isWarning = result.status === "mismatch" || result.status === "revoked";

    return (
        <div
            className={`rounded-3xl border p-4 ${isWarning
                    ? "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400"
                    : "border-blue-500/20 bg-blue-500/5 text-blue-700 dark:text-blue-400"
                }`}
        >
            <div className="flex items-start gap-3">
                {isWarning ? (
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                ) : (
                    <Info className="mt-0.5 h-5 w-5 shrink-0" />
                )}

                <div>
                    <h3 className="font-semibold">
                        {isWarning ? "Review required" : "Verification information"}
                    </h3>
                    <p className="mt-1 text-sm opacity-90">{result.summary}</p>
                </div>
            </div>
        </div>
    );
}