"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Gavel,
  ChevronDown,
  Loader2,
  ShieldCheck,
  ShieldX,
  Trash2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatTimeAgo } from "@/lib/client-utils";
import { DECISION_LABELS } from "../types";
import { VALID_STATUS_TRANSITIONS } from "@/features/reports/types";
import type { ReportStatus, ReportDecision } from "@/features/reports/types";

interface ResolutionCardProps {
  reportId: string;
  currentStatus: ReportStatus;
  decision: ReportDecision | null;
  onUpdateStatus: (status: string, notes?: string) => Promise<void>;
  onModerateArtwork?: (action: string, reason: string) => Promise<void>;
  hasAssociatedArtwork?: boolean;
  artworkTitle?: string;
  isUpdatingStatus: boolean;
  isModeratingArtwork?: boolean;
}

const ARTWORK_ACTION_HELP: Record<string, string> = {
  approve_artwork:
    "No infringement found. The artwork is cleared and the report is closed with no violation.",
  reject_artwork:
    "Infringement confirmed. The artwork status will be updated and the report is resolved.",
  remove_artwork:
    "Delete the infringing artwork to fully resolve this report. This action removes all associated data and cannot be undone.",
};

export function ResolutionCard({
  reportId,
  currentStatus,
  decision,
  onUpdateStatus,
  onModerateArtwork,
  hasAssociatedArtwork = false,
  artworkTitle = "this artwork",
  isUpdatingStatus,
  isModeratingArtwork = false,
}: ResolutionCardProps) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [moderationAction, setModerationAction] = useState("");
  const [moderationReason, setModerationReason] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: "default" | "destructive";
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  const validNextStatuses = VALID_STATUS_TRANSITIONS[currentStatus] ?? [];

  const handleStatusUpdate = () => {
    if (!selectedStatus) return;
    setConfirmDialog({
      open: true,
      title: "Change Report Status",
      description: `Are you sure you want to change the status to "${selectedStatus.replace(/_/g, " ")}"?`,
      onConfirm: async () => {
        await onUpdateStatus(selectedStatus, statusNotes || undefined);
        setSelectedStatus("");
        setStatusNotes("");
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleModerateArtwork = () => {
    if (!moderationAction || !moderationReason.trim()) return;
    const actionLabels: Record<string, string> = {
      approve_artwork: "Dismiss Report",
      reject_artwork: "Uphold Report",
      remove_artwork: "Remove & Resolve",
    };
    setConfirmDialog({
      open: true,
      title: actionLabels[moderationAction] ?? moderationAction,
      description: `This will ${actionLabels[moderationAction]?.toLowerCase() ?? moderationAction} "${artworkTitle}" and resolve the associated report.`,
      variant: moderationAction === "remove_artwork" ? "destructive" : "default",
      onConfirm: async () => {
        if (onModerateArtwork) {
          await onModerateArtwork(moderationAction, moderationReason);
        }
        setModerationAction("");
        setModerationReason("");
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Resolution</CardTitle>
          <CardDescription className="text-xs">
            Manage report status and record decisions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Decision */}
          {decision && (
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2">
                {decision.decision === "infringement_confirmed" ? (
                  <CheckCircle2 className="h-5 w-5 text-red-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-green-500" />
                )}
                <p className="text-sm font-medium">
                  {DECISION_LABELS[decision.decision] ?? decision.decision}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">{decision.summary}</p>
              <p className="text-[10px] text-muted-foreground/60">
                Recorded {formatTimeAgo(decision.created_at)}
              </p>
            </div>
          )}

          {/* Status Change */}
          {validNextStatuses.length > 0 && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-medium">Change Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    {validNextStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Notes (optional)</label>
                <Input
                  placeholder="Reason for status change..."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  className="h-9"
                />
              </div>
              <Button
                onClick={handleStatusUpdate}
                disabled={!selectedStatus || isUpdatingStatus}
                className="w-full gap-2"
                size="sm"
              >
                {isUpdatingStatus ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                {isUpdatingStatus ? "Updating..." : "Update Status"}
              </Button>
            </>
          )}

          {/* Hint: must be under review first */}
          {currentStatus === "pending_review" && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20 p-3">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Move this report to &apos;Under Review&apos; before you can take
                moderation actions.
              </p>
            </div>
          )}

          {/* ===== ARTWORK MODERATION ACTIONS ===== */}
          {hasAssociatedArtwork &&
            currentStatus === "under_review" &&
            !decision && (
              <>
                <Separator className="my-2" />
                <div className="rounded-lg border border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/10 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="h-4 w-4 text-orange-600" />
                    <p className="text-xs font-semibold text-orange-700 dark:text-orange-400">
                      Artwork Moderation Actions
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-3">
                    Take action on &quot;{artworkTitle}&quot; directly from this
                    report. The report will be resolved automatically.
                  </p>

                  <div className="space-y-2">
                    {/* Dismiss Report */}
                    <div className="rounded-lg border border-green-200 bg-green-50/50 p-2">
                      <Button
                        onClick={() => {
                          setModerationAction("approve_artwork");
                          setModerationReason(
                            "Report dismissed — no infringement found after investigation"
                          );
                        }}
                        disabled={isModeratingArtwork}
                        className="w-full gap-2 h-8 text-xs"
                        size="sm"
                      >
                        {isModeratingArtwork &&
                        moderationAction === "approve_artwork" ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <ShieldCheck className="h-3 w-3" />
                        )}
                        Dismiss Report
                      </Button>
                      <p className="mt-1 text-[9px] leading-tight text-green-700 dark:text-green-400">
                        <Info className="inline h-2.5 w-2.5 mr-0.5 align-text-bottom" />
                        {ARTWORK_ACTION_HELP.approve_artwork}
                      </p>
                    </div>

                    {/* Uphold Report */}
                    <div className="rounded-lg border border-red-200 bg-red-50/50 p-2">
                      <Button
                        onClick={() => {
                          setModerationAction("reject_artwork");
                          setModerationReason(
                            "Report upheld — infringement confirmed after investigation"
                          );
                        }}
                        disabled={isModeratingArtwork}
                        variant="destructive"
                        className="w-full gap-2 h-8 text-xs"
                        size="sm"
                      >
                        {isModeratingArtwork &&
                        moderationAction === "reject_artwork" ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <ShieldX className="h-3 w-3" />
                        )}
                        Uphold Report
                      </Button>
                      <p className="mt-1 text-[9px] leading-tight text-red-700 dark:text-red-400">
                        <Info className="inline h-2.5 w-2.5 mr-0.5 align-text-bottom" />
                        {ARTWORK_ACTION_HELP.reject_artwork}
                      </p>
                    </div>

                    {/* Remove & Resolve */}
                    <div className="rounded-lg border border-red-300 bg-red-100/50 dark:border-red-900 dark:bg-red-950/10 p-2">
                      <Button
                        onClick={() => {
                          setModerationAction("remove_artwork");
                          setModerationReason(
                            "Artwork removed to resolve infringement report"
                          );
                        }}
                        disabled={isModeratingArtwork}
                        variant="destructive"
                        className="w-full gap-2 h-8 text-xs"
                        size="sm"
                      >
                        {isModeratingArtwork &&
                        moderationAction === "remove_artwork" ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                        Remove & Resolve
                      </Button>
                      <p className="mt-1 text-[9px] leading-tight text-red-700 dark:text-red-400">
                        <Info className="inline h-2.5 w-2.5 mr-0.5 align-text-bottom" />
                        {ARTWORK_ACTION_HELP.remove_artwork}
                      </p>
                    </div>

  </div>

                  {/* Reason input for moderation */}
                  {moderationAction && (
                    <div className="mt-3 space-y-2">
                      <label className="text-xs font-medium">Reason</label>
                      <Textarea
                        placeholder={`Explain why you want to ${moderationAction.replace(/_/g, " ")}...`}
                        value={moderationReason}
                        onChange={(e) => setModerationReason(e.target.value)}
                        rows={2}
                      />
                      <Button
                        onClick={handleModerateArtwork}
                        disabled={
                          !moderationReason.trim() || isModeratingArtwork
                        }
                        className="w-full gap-2"
                        size="sm"
                        variant={
                          moderationAction === "remove_artwork"
                            ? "destructive"
                            : "default"
                        }
                      >
                        {isModeratingArtwork ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ShieldCheck className="h-4 w-4" />
                        )}
                        {isModeratingArtwork
                          ? "Processing..."
                          : `Confirm ${moderationAction.replace(/_/g, " ")}`}
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>
              {confirmDialog.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog((prev) => ({ ...prev, open: false }))
              }
            >
              Cancel
            </Button>
            <Button
              variant={confirmDialog.variant ?? "default"}
              onClick={confirmDialog.onConfirm}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}