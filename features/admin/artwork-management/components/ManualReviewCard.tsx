"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Eye, FileQuestion, ArrowUpRight, Trash2 } from "lucide-react";
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
import { cn } from "@/lib/client-utils";
import { toast } from "sonner";
import type { ArtworkDetail } from "../types";

interface ManualReviewCardProps {
  artwork: ArtworkDetail;
  onAction: (action: string, reason?: string) => Promise<void>;
}

export function ManualReviewCard({ artwork, onAction }: ManualReviewCardProps) {
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const review = artwork.review;
  const reviewStatus = review?.status;

  const handleConfirm = async () => {
    if (!confirmAction) return;
    setIsLoading(true);
    try {
      await onAction(confirmAction, reason);
      toast.success(`Action completed: ${confirmAction}`);
      setConfirmAction(null);
      setReason("");
    } catch {
      toast.error("Failed to perform action");
    } finally {
      setIsLoading(false);
    }
  };

  const reviewActions = [
    { action: "approve", label: "Approve Artwork", icon: CheckCircle2, color: "text-green-600", variant: "default" as const },
    { action: "under_review", label: "Keep Under Review", icon: Eye, color: "text-blue-600", variant: "outline" as const },
    { action: "false_positive", label: "Mark False Positive", icon: CheckCircle2, color: "text-green-600", variant: "outline" as const },
    { action: "request_evidence", label: "Request More Evidence", icon: FileQuestion, color: "text-purple-600", variant: "outline" as const },
    { action: "request_explanation", label: "Request Explanation", icon: FileQuestion, color: "text-purple-600", variant: "outline" as const },
    { action: "escalate", label: "Escalate", icon: ArrowUpRight, color: "text-orange-600", variant: "outline" as const },
    { action: "hide", label: "Hide Artwork", icon: Eye, color: "text-gray-600", variant: "outline" as const },
    { action: "archive", label: "Archive Artwork", icon: Eye, color: "text-gray-600", variant: "outline" as const },
    { action: "remove", label: "Remove Artwork", icon: Trash2, color: "text-red-600", variant: "destructive" as const },
  ];

  const confirmDialogs: Record<string, { title: string; description: string; requiresReason: boolean }> = {
    approve: { title: "Approve Artwork", description: "This will approve the artwork and move it to blockchain registration.", requiresReason: true },
    under_review: { title: "Keep Under Review", description: "The artwork will remain under review.", requiresReason: true },
    false_positive: { title: "Mark as False Positive", description: "Mark the similarity scan results as a false positive.", requiresReason: true },
    request_evidence: { title: "Request More Evidence", description: "Request additional evidence from the artist.", requiresReason: true },
    request_explanation: { title: "Request Explanation", description: "Request an explanation from the artist.", requiresReason: true },
    escalate: { title: "Escalate Artwork", description: "Escalate this artwork for further review.", requiresReason: true },
    hide: { title: "Hide Artwork", description: "Hide this artwork from public view.", requiresReason: false },
    archive: { title: "Archive Artwork", description: "Archive this artwork.", requiresReason: false },
    remove: { title: "Remove Artwork", description: "Permanently delete this artwork. This action cannot be undone.", requiresReason: true },
  };

  return (
    <>
      <Card className={artwork.needs_review ? "border-orange-200 bg-orange-50/50" : ""}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm">Manual Review</CardTitle>
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
        <CardContent className="space-y-3">
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

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            {reviewActions.map(({ action, label, icon: Icon, color, variant }) => (
              <Button
                key={action}
                variant={variant}
                size="sm"
                className="gap-1.5 text-xs justify-start"
                onClick={() => {
                  setConfirmAction(action);
                  setReason("");
                }}
              >
                <Icon className={cn("h-3.5 w-3.5", color)} />
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction ? confirmDialogs[confirmAction]?.title ?? "Confirm Action" : "Confirm"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction ? confirmDialogs[confirmAction]?.description : ""}
            </DialogDescription>
          </DialogHeader>
          {confirmAction && confirmDialogs[confirmAction]?.requiresReason && (
            <Textarea
              placeholder="Enter reason or notes..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px]"
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button
              variant={confirmAction === "remove" ? "destructive" : "default"}
              onClick={handleConfirm}
              disabled={isLoading || (confirmAction ? confirmDialogs[confirmAction]?.requiresReason && !reason.trim() : false)}
            >
              {isLoading ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
