"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  ExternalLink,
  Loader2,
  Info,
  CheckCircle2,
  Clock,
  Ban,
  Flag,
  FileSearch,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/client-utils";
import { toast } from "sonner";
import type { ArtworkDetail } from "../types";

interface ManualReviewCardProps {
  artwork: ArtworkDetail;
  onAction: (action: string, reason?: string) => Promise<void>;
}

export function ManualReviewCard({ artwork, onAction }: ManualReviewCardProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  const review = artwork.review;
  const reviewStatus = review?.status;
  const hasReports = artwork.reports.length > 0;
  const hasBlockchain = !!artwork.tx_hash;
  const hasScan = !!artwork.scan;
  const scanSuccess = artwork.scan?.success;
  const hasHighSimilarity =
    (artwork.scan?.best_similarity_percentage ?? 0) >= 75;

  const handleActionClick = (action: string) => {
    if (action === "remove") {
      setConfirmDialog({
        open: true,
        title: "Remove Artwork",
        description:
          "This will permanently delete the artwork and all associated data. This action cannot be undone.",
        onConfirm: () => {
          setConfirmDialog((prev) => ({ ...prev, open: false }));
          setSelectedAction(action);
          setReason("");
        },
      });
      return;
    }
    setSelectedAction(action);
    setReason("");
  };

  const handleConfirm = async () => {
    if (!selectedAction) return;
    setIsLoading(true);
    try {
      await onAction(selectedAction, reason);
      toast.success(
        selectedAction === "mark_reported"
          ? "Artwork flagged as reported"
          : `Action completed: ${selectedAction.replace(/_/g, " ")}`
      );
      setSelectedAction(null);
      setReason("");
    } catch {
      toast.error("Failed to perform action");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedAction(null);
    setReason("");
  };

  return (
    <>
      <Card className={artwork.needs_review ? "border-orange-200 bg-orange-50/50" : ""}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm">Artwork Integrity</CardTitle>
            {artwork.needs_review && (
              <Badge variant="outline" className="bg-orange-100 text-orange-600 text-[10px]">
                Action Required
              </Badge>
            )}
          </div>
          {reviewStatus && (
            <Badge variant="secondary" className="text-[10px]">
              {reviewStatus.replace("_", " ")}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Review Conditions */}
          {artwork.review_conditions.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Review Conditions</p>
              <div className="space-y-1">
                {artwork.review_conditions.map((condition, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <AlertTriangle className="h-3 w-3 text-orange-500 shrink-0" />
                    <span>{condition}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review Notes */}
          {review?.review_notes && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Review Notes</p>
              <p className="text-sm bg-muted rounded-lg p-3 whitespace-pre-wrap">
                {review.review_notes}
              </p>
            </div>
          )}

          {/* ── Status Summary ── */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              Status Summary
            </p>
            <div className="grid grid-cols-2 gap-2">
              {/* Blockchain Status */}
              <div className="rounded-lg border border-border p-2.5">
                <div className="flex items-center gap-1.5">
                  {hasBlockchain ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <Clock className="h-3.5 w-3.5 text-yellow-600" />
                  )}
                  <span className="text-xs font-medium">Blockchain</span>
                </div>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {hasBlockchain ? "Registered on-chain" : "Pending registration"}
                </p>
              </div>

              {/* Similarity Status */}
              <div className="rounded-lg border border-border p-2.5">
                <div className="flex items-center gap-1.5">
                  {hasScan && scanSuccess && !hasHighSimilarity ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  ) : hasScan && hasHighSimilarity ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-orange-600" />
                  ) : (
                    <FileSearch className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span className="text-xs font-medium">Similarity</span>
                </div>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {hasScan
                    ? hasHighSimilarity
                      ? `${artwork.scan!.best_similarity_percentage}% match flagged`
                      : "No significant matches"
                    : "Not scanned"}
                </p>
              </div>

              {/* Report Status */}
              <div className="rounded-lg border border-border p-2.5">
                <div className="flex items-center gap-1.5">
                  {hasReports ? (
                    <ShieldAlert className="h-3.5 w-3.5 text-red-600" />
                  ) : (
                    <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                  )}
                  <span className="text-xs font-medium">Reports</span>
                </div>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {hasReports
                    ? `${artwork.reports.length} active report${artwork.reports.length > 1 ? "s" : ""}`
                    : "No active reports"}
                </p>
              </div>

              {/* Artwork Status */}
              <div className="rounded-lg border border-border p-2.5">
                <div className="flex items-center gap-1.5">
                  {artwork.status === "active" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  ) : artwork.status === "flagged" ? (
                    <Flag className="h-3.5 w-3.5 text-orange-600" />
                  ) : artwork.status === "rejected" ? (
                    <Ban className="h-3.5 w-3.5 text-red-600" />
                  ) : (
                    <Clock className="h-3.5 w-3.5 text-yellow-600" />
                  )}
                  <span className="text-xs font-medium">Status</span>
                </div>
                <p className="mt-0.5 text-[10px] text-muted-foreground capitalize">
                  {artwork.status.replace(/_/g, " ")}
                </p>
              </div>
            </div>
          </div>

          {/* ── Active Reports ── */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              Active Reports
            </p>
            {hasReports ? (
              <div className="space-y-2">
                {artwork.reports.slice(0, 5).map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between rounded-lg border border-border p-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{report.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>by {report.reporter.first_name} {report.reporter.last_name}</span>
                        <span>•</span>
                        <span>{new Date(report.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[9px] capitalize shrink-0 ml-2"
                    >
                      {report.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                ))}
                <Link
                  href="/admin/reports"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  View all reports
                </Link>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-3">
                <p className="text-xs text-muted-foreground text-center">
                  No active reports against this artwork.
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* ── Quick Actions ── */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              Quick Actions
            </p>
            <div className="space-y-2">
              {/* Mark as Reported */}
              <div
                className={cn(
                  "rounded-lg border p-2.5",
                  selectedAction === "mark_reported"
                    ? "border-primary ring-1 ring-primary"
                    : "border-blue-200 bg-blue-50/50"
                )}
              >
                <Button
                  onClick={() => handleActionClick("mark_reported")}
                  disabled={isLoading}
                  variant={selectedAction === "mark_reported" ? "default" : "outline"}
                  className="w-full gap-2 h-8 text-xs justify-start"
                  size="sm"
                >
                  {isLoading && selectedAction === "mark_reported" ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <ShieldAlert className="h-3.5 w-3.5 text-blue-600" />
                  )}
                  Mark as Reported
                </Button>
                <p className="mt-1 text-[9px] leading-tight text-blue-700 dark:text-blue-400">
                  <Info className="inline h-2.5 w-2.5 mr-0.5 align-text-bottom" />
                  Flag this artwork as having an active report. It will be marked for further investigation.
                </p>

                {/* Inline reason input */}
                {selectedAction === "mark_reported" && (
                  <div className="mt-3 space-y-2">
                    <Textarea
                      placeholder="Describe the nature of the report..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={2}
                      className="min-h-[60px] text-xs"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleConfirm}
                        disabled={!reason.trim() || isLoading}
                        size="sm"
                        className="flex-1 gap-1 text-xs h-8"
                      >
                        {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                        {isLoading ? "Processing..." : "Confirm Report Flag"}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Remove Artwork */}
              <div className="rounded-lg border border-red-300 bg-red-100/50 dark:border-red-900 dark:bg-red-950/10 p-2.5">
                <Button
                  onClick={() => handleActionClick("remove")}
                  disabled={isLoading}
                  variant="destructive"
                  className="w-full gap-2 h-8 text-xs justify-start"
                  size="sm"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove Artwork
                </Button>
                <p className="mt-1 text-[9px] leading-tight text-red-700 dark:text-red-400">
                  <Info className="inline h-2.5 w-2.5 mr-0.5 align-text-bottom" />
                  Permanently delete this artwork. Use only for clear policy violations.
                </p>

                {/* Inline reason input */}
                {selectedAction === "remove" && (
                  <div className="mt-3 space-y-2">
                    <Textarea
                      placeholder="Explain why this artwork is being removed..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={2}
                      className="min-h-[60px] text-xs"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleConfirm}
                        disabled={!reason.trim() || isLoading}
                        size="sm"
                        variant="destructive"
                        className="flex-1 gap-1 text-xs h-8"
                      >
                        {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                        {isLoading ? "Processing..." : "Confirm Removal"}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog for destructive actions */}
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
              variant="destructive"
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