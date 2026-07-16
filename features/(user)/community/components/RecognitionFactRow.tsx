"use client";

import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import type { RecognitionFact } from "../types";

type Props = {
    fact: RecognitionFact;
};

/**
 * A single observable fact row in the Artwork Recognition Profile.
 *
 * Displays a checkmark (satisfied) or X (not satisfied) icon alongside the
 * fact label, observed value, and a brief description of what it means.
 * Every value shown here maps directly to a database field — no derived scores.
 */
export function RecognitionFactRow({ fact }: Props) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
                {fact.satisfied ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
                ) : fact.key === "upvotes" ? (
                    <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground/60" />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-sm font-semibold text-foreground">
                        {fact.label}
                    </span>
                    <span className="text-sm text-muted-foreground">
                        {fact.detail}
                    </span>
                </div>

                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground/70">
                    {fact.description}
                </p>
            </div>
        </div>
    );
}