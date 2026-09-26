"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/(user)/auth/hooks/useAuth";
import {
  clearPendingMatchAction,
  loadPendingMatchAction,
  type PendingMatchAction,
} from "../lib/match-action-storage";
import { MatchActionButton } from "./match-action-button";

/**
 * Restores the pending report/manual-review action after the user signed in
 * from a plagiarism match. The match context survives the auth round-trip in
 * sessionStorage; the original File does not, so external reviews prompt the
 * user to re-select the artwork they checked.
 */
export function PendingActionBanner() {
  const { isAuthenticated } = useAuth();
  const [pending, setPending] = useState<PendingMatchAction | null>(() => {
    if (typeof window === "undefined") return null;
    return loadPendingMatchAction();
  });

  if (!isAuthenticated || !pending) return null;

  const isInternal = pending.action === "report";
  const similarity =
    pending.context.similarity !== null
      ? `${pending.context.similarity.toFixed(1)}%`
      : "N/A";

  return (
    <div className="bg-primary/5 border border-primary/30 rounded-2xl px-4 py-3.5 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5 min-w-0">
          <AlertTriangle size={15} className="text-primary mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Continue your {isInternal ? "report" : "manual review"} request
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
              You were about to{" "}
              {isInternal ? "report a registered artwork match" : "request a manual review for an external match"}
              {similarity !== "N/A" && <> ({similarity} similarity)</>}.{" "}
              {isInternal
                ? "Confirm to submit the copyright report."
                : "Re-select the artwork you checked to attach it to the review."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <MatchActionButton
            context={pending.context}
            originalFile={null}
            filename={pending.filename}
            onSuccess={() => {
              clearPendingMatchAction();
              setPending(null);
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            aria-label="Dismiss"
            onClick={() => {
              clearPendingMatchAction();
              setPending(null);
            }}
          >
            <X size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
