"use client";

import { useState } from "react";
import {
  ArrowRight,
  Search,
  Clock,
  RotateCcw,
  MessageSquareText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReportStatusBadge } from "./ReportStatusBadge";
import { VALID_STATUS_TRANSITIONS } from "@/features/reports/types";
import type { ReportStatus } from "@/features/reports/types";

// ---------------------------------------------------------------------------
// Contextual labels + icons for each status transition
// ---------------------------------------------------------------------------
const TRANSITION_LABELS: Record<
  ReportStatus,
  { label: string; description: string; icon: React.ReactNode }
> = {
  pending_review: {
    label: "Begin Investigation",
    description: "Assign this report to yourself and start the review process.",
    icon: <Search className="h-4 w-4" />,
  },
  under_review: {
    label: "Mark as Under Review",
    description: "Confirm you are actively investigating this report.",
    icon: <Clock className="h-4 w-4" />,
  },
  awaiting_evidence: {
    label: "Request Evidence",
    description:
      "Ask the reporter to provide additional evidence before proceeding.",
    icon: <MessageSquareText className="h-4 w-4" />,
  },
  resolved: {
    label: "Resolve",
    description:
      "Finalise this report with a decision. (Use the Resolution section below.)",
    icon: <ArrowRight className="h-4 w-4" />,
  },
};

/** When transitioning from one status → another, return a friendlier label */
function getTransitionLabel(from: ReportStatus, to: ReportStatus): {
  label: string;
  description: string;
  icon: React.ReactNode;
} {
  if (from === "under_review" && to === "awaiting_evidence") {
    return {
      label: "Request Evidence",
      description:
        "Request additional evidence from the reporter. The report will move to 'Awaiting Evidence'.",
      icon: <MessageSquareText className="h-4 w-4" />,
    };
  }
  if (from === "awaiting_evidence" && to === "under_review") {
    return {
      label: "Return to Review",
      description:
        "Evidence has been received. Move the report back to 'Under Review'.",
      icon: <RotateCcw className="h-4 w-4" />,
    };
  }
  if (from === "pending_review" && to === "under_review") {
    return {
      label: "Begin Investigation",
      description:
        "Assign yourself to this report and start reviewing the details.",
      icon: <Search className="h-4 w-4" />,
    };
  }
  // Fallback to generic label
  return TRANSITION_LABELS[to] ?? {
    label: `Change to ${to.replace(/_/g, " ")}`,
    description: `Update the report status to "${to.replace(/_/g, " ")}".`,
    icon: <ArrowRight className="h-4 w-4" />,
  };
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface StatusActionsProps {
  currentStatus: ReportStatus;
  onUpdateStatus: (status: string, notes?: string) => Promise<void>;
  isUpdatingStatus: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function StatusActions({
  currentStatus,
  onUpdateStatus,
  isUpdatingStatus,
}: StatusActionsProps) {
  const [selectedTransition, setSelectedTransition] =
    useState<ReportStatus | null>(null);
  const [notes, setNotes] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const validNextStatuses = VALID_STATUS_TRANSITIONS[currentStatus] ?? [];

  // No transitions available (resolved reports)
  if (validNextStatuses.length === 0) {
    return (
      <div className="rounded-lg border p-3 space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Status
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Current:</span>
          <ReportStatusBadge status={currentStatus} />
        </div>
        <p className="text-xs text-muted-foreground italic">
          This report has reached its final status.
        </p>
      </div>
    );
  }

  const handleConfirm = async () => {
    if (!selectedTransition) return;
    await onUpdateStatus(selectedTransition, notes.trim() || undefined);
    setDialogOpen(false);
    setSelectedTransition(null);
    setNotes("");
  };

  return (
    <div className="rounded-lg border p-3 space-y-3">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Status
      </h4>

      {/* Current status badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Current:</span>
        <ReportStatusBadge status={currentStatus} />
      </div>

      {/* Next status buttons */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-medium text-muted-foreground uppercase">
          Next Status
        </p>
        {validNextStatuses.map((nextStatus) => {
          const transition = getTransitionLabel(currentStatus, nextStatus);

          return (
            <Dialog
              key={nextStatus}
              open={dialogOpen && selectedTransition === nextStatus}
              onOpenChange={(open: boolean) => {
                setDialogOpen(open);
                if (!open) {
                  setSelectedTransition(null);
                  setNotes("");
                }
              }}
            >
              <DialogTrigger asChild>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTransition(nextStatus);
                    setNotes("");
                  }}
                  disabled={isUpdatingStatus}
                  className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2 text-left text-sm transition-all hover:bg-muted/50 hover:border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="shrink-0 text-muted-foreground">
                    {transition.icon}
                  </span>
                  <span className="flex-1 font-medium">{transition.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {transition.icon}
                    {transition.label}
                  </DialogTitle>
                  <DialogDescription>
                    {transition.description}
                  </DialogDescription>
                </DialogHeader>

                {/* Current → Next status indicator */}
                <div className="flex items-center gap-2 justify-center py-2">
                  <ReportStatusBadge status={currentStatus} />
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <ReportStatusBadge status={nextStatus} />
                </div>

                {/* Optional notes */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Notes <span className="text-muted-foreground/50">(optional)</span>
                  </label>
                  <Textarea
                    placeholder="Add a brief note explaining this status change..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="text-sm"
                  />
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={isUpdatingStatus}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={isUpdatingStatus}
                    className="gap-2"
                  >
                    {isUpdatingStatus ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        {transition.icon}
                        Confirm {transition.label}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          );
        })}
      </div>
    </div>
  );
}