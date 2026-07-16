"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Loader2,
  ImageIcon,
  ExternalLink,
  User,
  ShieldCheck,
  AlertTriangle,
  Clock,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatTimeAgo } from "@/lib/client-utils";
import { ReviewStatusBadge } from "./ReviewStatusBadge";
import { RiskBadge } from "./RiskBadge";
import {
  approveArtwork,
  rejectArtwork,
  requestInformation,
  assignReviewer,
  unassignReviewer,
} from "../server/reviews";
import type { ReviewDetail, ReviewStatus } from "../types";

interface ReviewQuickViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: ReviewDetail | undefined;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function ReviewQuickViewDialog({
  open,
  onOpenChange,
  detail,
  isLoading,
  error,
  onRefresh,
}: ReviewQuickViewDialogProps) {
  const router = useRouter();

  // Action states
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isRequestingInfo, setIsRequestingInfo] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [decisionNotes, setDecisionNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "activity" | "actions">("details");

  const isDecided = detail && (detail.status === "approved" || detail.status === "rejected");
  const artwork = detail?.artwork;

  const handleApprove = useCallback(async () => {
    if (!detail || !decisionNotes.trim()) {
      toast.error("Please provide review notes");
      return;
    }
    setIsApproving(true);
    try {
      const result = await approveArtwork(detail.id, decisionNotes);
      if (result.success) {
        toast.success(result.message);
        onRefresh();
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to approve artwork");
    } finally {
      setIsApproving(false);
    }
  }, [detail, decisionNotes, onRefresh, onOpenChange]);

  const handleReject = useCallback(async () => {
    if (!detail || !rejectReason.trim() || !decisionNotes.trim()) {
      toast.error("Please provide a rejection reason and notes");
      return;
    }
    setIsRejecting(true);
    try {
      const result = await rejectArtwork(detail.id, rejectReason, decisionNotes);
      if (result.success) {
        toast.success(result.message);
        onRefresh();
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to reject artwork");
    } finally {
      setIsRejecting(false);
    }
  }, [detail, rejectReason, decisionNotes, onRefresh, onOpenChange]);

  const handleRequestInfo = useCallback(async () => {
    if (!detail || !infoMessage.trim()) {
      toast.error("Please provide a message");
      return;
    }
    setIsRequestingInfo(true);
    try {
      const result = await requestInformation(detail.id, [], infoMessage);
      if (result.success) {
        toast.success(result.message);
        onRefresh();
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to request information");
    } finally {
      setIsRequestingInfo(false);
    }
  }, [detail, infoMessage, onRefresh, onOpenChange]);

  const handleAssignToMe = useCallback(async () => {
    if (!detail) return;
    setIsAssigning(true);
    try {
      const result = await assignReviewer(detail.id, "__self__");
      if (result.success) {
        toast.success(result.message);
        onRefresh();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to assign");
    } finally {
      setIsAssigning(false);
    }
  }, [detail, onRefresh]);

  const handleUnassign = useCallback(async () => {
    if (!detail) return;
    setIsAssigning(true);
    try {
      const result = await unassignReviewer(detail.id);
      if (result.success) {
        toast.success(result.message);
        onRefresh();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to unassign");
    } finally {
      setIsAssigning(false);
    }
  }, [detail, onRefresh]);

  const handleOpenFullReview = useCallback(() => {
    if (detail) {
      onOpenChange(false);
      router.push(`/admin/artwork-verification/${detail.id}`);
    }
  }, [detail, router, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto" style={{ maxWidth: "80vw" }}>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading review details...</span>
            </div>
          </div>
        ) : error || !detail ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mb-3" />
            <p className="text-lg font-medium">Failed to load review</p>
            <p className="text-sm text-muted-foreground mt-1">{error ?? "Review not found"}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={onRefresh}>
              Retry
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                  <DialogTitle className="text-base truncate">
                    {artwork?.title ?? "Unknown Artwork"}
                  </DialogTitle>
                </div>
                <ReviewStatusBadge status={detail.status as ReviewStatus} />
              </div>
              <DialogDescription className="text-xs mt-1">
                Review ID: {detail.id.substring(0, 8)}... &middot; Created {formatTimeAgo(detail.created_at)}
              </DialogDescription>
            </DialogHeader>

            {/* Artwork Preview + Key Info */}
            <div className="flex gap-4 p-3 rounded-lg border bg-muted/30">
              {/* Thumbnail */}
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                {artwork?.c_secure_url ? (
                  <Image
                    src={artwork.c_secure_url}
                    alt={artwork?.title ?? "Artwork"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                )}
              </div>

              {/* Key Info */}
              <div className="min-w-0 flex-1 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">Artist</span>
                  <p className="font-medium truncate">
                    {artwork?.owner.first_name} {artwork?.owner.last_name}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Similarity</span>
                  <p className="font-medium tabular-nums">
                    {detail.scan?.best_similarity_percentage !== null
                      ? `${detail.scan?.best_similarity_percentage?.toFixed(1)}%`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Risk Level</span>
                  <div>
                    <RiskBadge similarity={detail.scan?.best_similarity_percentage ?? null} />
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Reviewer</span>
                  <p className="font-medium truncate">
                    {detail.reviewer
                      ? `${detail.reviewer.first_name} ${detail.reviewer.last_name}`
                      : "Unassigned"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Source Matches</span>
                  <p className="font-medium">{detail.scan?.total_matches ?? 0} matches</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Best Source</span>
                  <p className="font-medium truncate capitalize">
                    {detail.scan?.best_source ?? "None"}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs: Details | Activity | Actions */}
            <div className="flex border-b border-border">
              {(["details", "activity", "actions"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2 text-xs font-medium border-b-2 transition-colors",
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab === "details" && "Details"}
                  {tab === "activity" && "Activity"}
                  {tab === "actions" && "Actions"}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "details" && (
              <div className="space-y-3 text-sm">
                {artwork?.description && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Description</span>
                    <p className="mt-0.5">{artwork.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-2">
                    <span className="text-xs text-muted-foreground">File Hash</span>
                    <p className="font-mono text-[10px] truncate mt-0.5">
                      {artwork?.file_hash?.substring(0, 32)}...
                    </p>
                  </div>
                  <div className="rounded-lg border p-2">
                    <span className="text-xs text-muted-foreground">Perceptual Hash</span>
                    <p className="font-mono text-[10px] truncate mt-0.5">
                      {artwork?.perceptual_hash?.substring(0, 32)}...
                    </p>
                  </div>
                </div>
                {detail.decision_reason && (
                  <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20 p-3">
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">Decision Reason</span>
                    <p className="mt-0.5 text-xs">{detail.decision_reason}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "activity" && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {detail.actions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No activity recorded yet.</p>
                ) : (
                  detail.actions.map((action) => (
                    <div key={action.id} className="flex items-start gap-2 text-sm border-b border-border pb-2 last:border-0">
                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs">
                          <span className="font-medium">{action.admin.first_name} {action.admin.last_name}</span>
                          {" "}{action.action.replace(/_/g, " ")}
                        </p>
                        {action.notes && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">{action.notes}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                          {formatTimeAgo(action.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "actions" && (
              <div className="space-y-4">
                {/* Assign/Unassign */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Reviewer</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {detail.reviewer
                        ? `${detail.reviewer.first_name} ${detail.reviewer.last_name}`
                        : "Unassigned"}
                    </span>
                    {!isDecided && (
                      detail.reviewer ? (
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleUnassign} disabled={isAssigning}>
                          {isAssigning ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                          Unassign
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleAssignToMe} disabled={isAssigning}>
                          {isAssigning ? <Loader2 className="h-3 w-3 animate-spin" /> : <User className="h-3 w-3" />}
                          Assign to Me
                        </Button>
                      )
                    )}
                  </div>
                </div>

                <Separator />

                {/* Decision Actions */}
                {!isDecided ? (
                  <div className="space-y-3">
                    {/* Approve */}
                    <div className="rounded-lg border border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/10 p-3">
                      <label className="text-xs font-medium text-green-700 dark:text-green-400">Approve Artwork</label>
                      <p className="text-[10px] text-green-600/70 dark:text-green-400/70 mb-2">
                        Makes the artwork publicly available and initiates blockchain registration.
                      </p>
                      <Textarea
                        placeholder="Add notes explaining your approval..."
                        value={decisionNotes}
                        onChange={(e) => setDecisionNotes(e.target.value)}
                        rows={2}
                        className="text-xs min-h-[50px]"
                      />
                      <Button
                        onClick={handleApprove}
                        disabled={isApproving || !decisionNotes.trim()}
                        className="w-full mt-2 gap-2 h-8 text-xs"
                        size="sm"
                      >
                        {isApproving ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                        {isApproving ? "Approving..." : "Approve Registration"}
                      </Button>
                    </div>

                    {/* Reject */}
                    <div className="rounded-lg border border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/10 p-3">
                      <label className="text-xs font-medium text-red-700 dark:text-red-400">Reject Artwork</label>
                      <p className="text-[10px] text-red-600/70 dark:text-red-400/70 mb-2">
                        Removes the artwork from the verification process and notifies the artist.
                      </p>
                      <Textarea
                        placeholder="Reason for rejection (sent to artist)..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={2}
                        className="text-xs min-h-[50px] mb-2"
                      />
                      <Textarea
                        placeholder="Internal review notes..."
                        value={decisionNotes}
                        onChange={(e) => setDecisionNotes(e.target.value)}
                        rows={2}
                        className="text-xs min-h-[50px]"
                      />
                      <Button
                        variant="destructive"
                        onClick={handleReject}
                        disabled={isRejecting || !rejectReason.trim() || !decisionNotes.trim()}
                        className="w-full mt-2 gap-2 h-8 text-xs"
                        size="sm"
                      >
                        {isRejecting ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                        {isRejecting ? "Rejecting..." : "Reject Registration"}
                      </Button>
                    </div>

                    {/* Request Info */}
                    <div className="rounded-lg border border-purple-200 bg-purple-50/50 dark:border-purple-900 dark:bg-purple-950/10 p-3">
                      <label className="text-xs font-medium text-purple-700 dark:text-purple-400">Request More Information</label>
                      <p className="text-[10px] text-purple-600/70 dark:text-purple-400/70 mb-2">
                        Sends a notification requesting additional evidence from the artist.
                      </p>
                      <Textarea
                        placeholder="Message to the artist..."
                        value={infoMessage}
                        onChange={(e) => setInfoMessage(e.target.value)}
                        rows={2}
                        className="text-xs min-h-[50px]"
                      />
                      <Button
                        variant="outline"
                        onClick={handleRequestInfo}
                        disabled={isRequestingInfo || !infoMessage.trim()}
                        className="w-full mt-2 gap-2 h-8 text-xs"
                        size="sm"
                      >
                        {isRequestingInfo ? <Loader2 className="h-3 w-3 animate-spin" /> : <HelpCircle className="h-3 w-3" />}
                        {isRequestingInfo ? "Requesting..." : "Request Information"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20 p-4 text-center">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      {detail.status === "approved" ? "Artwork Approved" : "Artwork Rejected"}
                    </p>
                    {detail.decision_reason && (
                      <p className="text-xs text-muted-foreground mt-1">{detail.decision_reason}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs"
                onClick={handleOpenFullReview}
              >
                <ExternalLink className="h-3 w-3" />
                Open Full Review
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}