"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Gavel,
  ChevronDown,
  Upload,
  Loader2,
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
import { cn, formatTimeAgo } from "@/lib/client-utils";
import { DECISION_LABELS } from "../types";
import { VALID_STATUS_TRANSITIONS } from "@/features/reports/types";
import type { ReportStatus, ReportDecision } from "@/features/reports/types";

interface ResolutionCardProps {
  reportId: string;
  currentStatus: ReportStatus;
  decision: ReportDecision | null;
  onUpdateStatus: (status: string, notes?: string) => Promise<void>;
  onRecordDecision: (decision: string, summary: string) => Promise<void>;
  onRequestEvidence: (message: string) => Promise<void>;
  isUpdatingStatus: boolean;
  isRecordingDecision: boolean;
  isRequestingEvidence: boolean;
}

export function ResolutionCard({
  reportId,
  currentStatus,
  decision,
  onUpdateStatus,
  onRecordDecision,
  onRequestEvidence,
  isUpdatingStatus,
  isRecordingDecision,
  isRequestingEvidence,
}: ResolutionCardProps) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [decisionValue, setDecisionValue] = useState("");
  const [decisionSummary, setDecisionSummary] = useState("");
  const [evidenceMessage, setEvidenceMessage] = useState("");
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

  const handleRecordDecision = () => {
    if (!decisionValue || !decisionSummary.trim()) return;
    setConfirmDialog({
      open: true,
      title: "Record Final Decision",
      description: `This will record "${DECISION_LABELS[decisionValue] ?? decisionValue}" as the final decision. This action cannot be undone.`,
      onConfirm: async () => {
        await onRecordDecision(decisionValue, decisionSummary);
        setDecisionValue("");
        setDecisionSummary("");
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleRequestEvidence = () => {
    if (!evidenceMessage.trim()) return;
    setConfirmDialog({
      open: true,
      title: "Request Additional Evidence",
      description: `Send a request for additional evidence to the reporter.`,
      onConfirm: async () => {
        await onRequestEvidence(evidenceMessage);
        setEvidenceMessage("");
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
                        {status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
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

          <Separator />

          {/* Record Decision */}
          {currentStatus === "under_review" && !decision && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-medium">Record Decision</label>
                <Select value={decisionValue} onValueChange={setDecisionValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select decision" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="infringement_confirmed">Infringement Confirmed</SelectItem>
                    <SelectItem value="no_violation">No Violation</SelectItem>
                    <SelectItem value="insufficient_evidence">Insufficient Evidence</SelectItem>
                    <SelectItem value="duplicate_report">Duplicate Report</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Summary</label>
                <Textarea
                  placeholder="Explain the decision..."
                  value={decisionSummary}
                  onChange={(e) => setDecisionSummary(e.target.value)}
                  rows={3}
                />
              </div>
              <Button
                onClick={handleRecordDecision}
                disabled={!decisionValue || !decisionSummary.trim() || isRecordingDecision}
                className="w-full gap-2"
                size="sm"
              >
                {isRecordingDecision ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Gavel className="h-4 w-4" />
                )}
                {isRecordingDecision ? "Recording..." : "Record Final Decision"}
              </Button>
            </>
          )}

          {/* Request Evidence - only available for under_review or waiting_for_reporter */}
          {(currentStatus === "under_review" || currentStatus === "waiting_for_reporter") && (
            <>
              <Separator />
              <div className="space-y-2">
                <label className="text-xs font-medium">Request Additional Evidence</label>
                <Textarea
                  placeholder="Describe what evidence is needed..."
                  value={evidenceMessage}
                  onChange={(e) => setEvidenceMessage(e.target.value)}
                  rows={2}
                />
              </div>
              <Button
                onClick={handleRequestEvidence}
                disabled={!evidenceMessage.trim() || isRequestingEvidence}
                variant="outline"
                className="w-full gap-2"
                size="sm"
              >
                {isRequestingEvidence ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {isRequestingEvidence ? "Requesting..." : "Request Evidence"}
              </Button>
            </>
          )}

          {/* Hint: must be under review first */}
          {currentStatus === "open" && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20 p-3">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Move this report to &quot;Under Review&quot; before you can request additional evidence.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>{confirmDialog.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
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