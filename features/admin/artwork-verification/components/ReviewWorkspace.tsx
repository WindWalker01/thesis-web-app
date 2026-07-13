"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  HelpCircle,
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
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useReviewDetail } from "../hooks/useReviewDetail";
import { ReviewStatusBadge } from "./ReviewStatusBadge";
import {
  approveArtwork,
  rejectArtwork,
  requestInformation,
  addReviewNote,
  assignReviewer,
  unassignReviewer,
} from "../server/reviews";

// Sub-components
import { ArtworkPreviewPanel } from "./workspace/ArtworkPreviewPanel";
import { MetadataPanel } from "./workspace/MetadataPanel";
import { SimilarityAnalysisPanel } from "./workspace/SimilarityAnalysisPanel";
import { ComparisonViewer } from "./workspace/ComparisonViewer";
import { ReviewActionsPanel } from "./workspace/ReviewActionsPanel";
import { ReviewNotesSection } from "./workspace/ReviewNotesSection";
import { ActivityFeedSection } from "./workspace/ActivityFeedSection";

export default function ArtworkReviewWorkspace() {
  const params = useParams();
  const router = useRouter();
  const reviewId = params.id as string;

  const { data: detail, isLoading, error, refetch } = useReviewDetail(reviewId);

  // State
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isRequestingInfo, setIsRequestingInfo] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  // Dialogs
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [decisionNotes, setDecisionNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [infoDocuments, setInfoDocuments] = useState<string[]>([]);
  const [infoMessage, setInfoMessage] = useState("");

  // Autosave timer
  const autosaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Use ref to track reviewNotes for keyboard handler without re-registering effect
  const reviewNotesRef = useRef(reviewNotes);
  reviewNotesRef.current = reviewNotes;

  // Update notes when detail loads
  useEffect(() => {
    if (detail?.review_notes) {
      setReviewNotes(detail.review_notes);
    }
  }, [detail?.review_notes]);

  // Derive decision status
  const isDecided = detail && (detail.status === "approved" || detail.status === "rejected");
  // Autosave notes with stable callback
  const handleNotesChange = useCallback((value: string) => {
    setReviewNotes(value);
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(async () => {
      setIsSavingNotes(true);
      try {
        await addReviewNote(reviewId, value);
      } catch {
        // Silent fail for autosave
      } finally {
        setIsSavingNotes(false);
      }
    }, 2000);
  }, [reviewId]);

  // Dialog open handlers that pre-fill notes
  const handleOpenApproveDialog = useCallback(() => {
    setDecisionNotes(reviewNotesRef.current);
    setApproveDialogOpen(true);
  }, []);

  const handleOpenRejectDialog = useCallback(() => {
    setDecisionNotes(reviewNotesRef.current);
    setRejectDialogOpen(true);
  }, []);

  const handleOpenInfoDialog = useCallback(() => {
    setInfoDialogOpen(true);
  }, []);

  // Approve
  const handleApprove = useCallback(async () => {
    if (!decisionNotes.trim()) {
      toast.error("Please provide review notes");
      return;
    }
    setIsApproving(true);
    try {
      const result = await approveArtwork(reviewId, decisionNotes);
      if (result.success) {
        toast.success(result.message);
        setApproveDialogOpen(false);
        refetch();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to approve artwork");
    } finally {
      setIsApproving(false);
    }
  }, [reviewId, decisionNotes, refetch]);

  // Reject
  const handleReject = useCallback(async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    if (!decisionNotes.trim()) {
      toast.error("Please provide review notes");
      return;
    }
    setIsRejecting(true);
    try {
      const result = await rejectArtwork(reviewId, rejectReason, decisionNotes);
      if (result.success) {
        toast.success(result.message);
        setRejectDialogOpen(false);
        refetch();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to reject artwork");
    } finally {
      setIsRejecting(false);
    }
  }, [reviewId, rejectReason, decisionNotes, refetch]);

  // Request Info
  const handleRequestInfo = useCallback(async () => {
    if (!infoMessage.trim()) {
      toast.error("Please provide a message");
      return;
    }
    setIsRequestingInfo(true);
    try {
      const result = await requestInformation(reviewId, infoDocuments, infoMessage);
      if (result.success) {
        toast.success(result.message);
        setInfoDialogOpen(false);
        refetch();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to request information");
    } finally {
      setIsRequestingInfo(false);
    }
  }, [reviewId, infoDocuments, infoMessage, refetch]);

  // Assign to self
  const handleAssignToMe = useCallback(async () => {
    setIsAssigning(true);
    try {
      const result = await assignReviewer(reviewId, "__self__");
      if (result.success) {
        toast.success(result.message);
        refetch();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to assign");
    } finally {
      setIsAssigning(false);
    }
  }, [reviewId, refetch]);

  // Unassign
  const handleUnassign = useCallback(async () => {
    setIsAssigning(true);
    try {
      const result = await unassignReviewer(reviewId);
      if (result.success) {
        toast.success(result.message);
        refetch();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to unassign");
    } finally {
      setIsAssigning(false);
    }
  }, [reviewId, refetch]);

  // Info document checkbox handlers
  const handleDocToggle = useCallback((doc: string) => {
    setInfoDocuments((prev) =>
      prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc]
    );
  }, []);

  // Keyboard shortcuts - using ref to avoid re-registering on every keystroke
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        if (detail?.status !== "approved" && detail?.status !== "rejected") {
          setDecisionNotes(reviewNotesRef.current);
          setApproveDialogOpen(true);
        }
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        if (detail?.status !== "approved" && detail?.status !== "rejected") {
          setDecisionNotes(reviewNotesRef.current);
          setRejectDialogOpen(true);
        }
      } else if (e.key === "i" || e.key === "I") {
        e.preventDefault();
        if (detail?.status !== "approved" && detail?.status !== "rejected") {
          setInfoDialogOpen(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [detail?.status]); // Only depends on status, not reviewNotes

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading review...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !detail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="max-w-md text-center space-y-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="text-xl font-bold">Review Not Found</h2>
          <p className="text-muted-foreground text-sm">
            {error instanceof Error ? error.message : "This review could not be found."}
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
            <Button onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const artwork = detail.artwork;

  // Guard against missing artwork data
  if (!artwork) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="max-w-md text-center space-y-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="text-xl font-bold">Artwork Not Found</h2>
          <p className="text-muted-foreground text-sm">
            This artwork has been deleted or is no longer available. The review record still exists but the artwork data cannot be found.
          </p>
          <Button onClick={() => router.push("/admin/artwork-verification")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Review Queue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/admin/artwork-verification")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold truncate max-w-[200px] sm:max-w-[400px]">
                {artwork.title}
              </h1>
              <ReviewStatusBadge status={detail.status} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-muted-foreground">
              <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px]">A</kbd> Approve
              <kbd className="ml-1.5 rounded border border-border px-1.5 py-0.5 text-[10px]">R</kbd> Reject
              <kbd className="ml-1.5 rounded border border-border px-1.5 py-0.5 text-[10px]">I</kbd> Info
            </span>
          </div>
        </div>
      </header>

      {/* Main Content - Three Column Layout */}
      <div className="flex flex-col lg:flex-row">
        {/* Left Panel - Artwork Preview */}
        <div className="w-full lg:w-[35%] border-b lg:border-b-0 lg:border-r border-border">
          <div className="p-4 space-y-4">
            <ArtworkPreviewPanel
              c_secure_url={artwork.c_secure_url}
              title={artwork.title}
            />
            <MetadataPanel artwork={artwork} />
          </div>
        </div>

        {/* Center Panel - Similarity Analysis */}
        <div className="w-full lg:w-[40%] border-b lg:border-b-0 lg:border-r border-border">
          <div className="p-4 space-y-4">
            <SimilarityAnalysisPanel scan={detail.scan} />
            <ComparisonViewer
              c_secure_url={artwork.c_secure_url}
              best_url={detail.scan?.best_url ?? null}
              hasScan={!!detail.scan}
            />
          </div>
        </div>

        {/* Right Panel - Review Actions */}
        <div className="w-full lg:w-[25%]">
          <div className="p-4 space-y-4">
            <ReviewActionsPanel
              status={detail.status}
              reviewer={detail.reviewer}
              isAssigning={isAssigning}
              isDecided={!!isDecided}
              decision_reason={detail.decision_reason}
              onAssignToMe={handleAssignToMe}
              onUnassign={handleUnassign}
              onApprove={handleOpenApproveDialog}
              onReject={handleOpenRejectDialog}
              onRequestInfo={handleOpenInfoDialog}
            />
            <ReviewNotesSection
              reviewNotes={reviewNotes}
              isSaving={isSavingNotes}
              isDisabled={!!isDecided}
              onChange={handleNotesChange}
            />
            <ActivityFeedSection actions={detail.actions} />
          </div>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Artwork Registration?</DialogTitle>
            <DialogDescription>
              This artwork appears sufficiently original. Continue blockchain registration?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              placeholder="Add notes explaining your decision..."
              value={decisionNotes}
              onChange={(e) => setDecisionNotes(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isApproving || !decisionNotes.trim()}>
              {isApproving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Artwork Registration?</DialogTitle>
            <DialogDescription>
              Registration will stop. The artist will be notified. Reason is required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Rejection Reason *</label>
              <Textarea
                placeholder="Explain why this artwork is being rejected..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Review Notes</label>
              <Textarea
                placeholder="Internal notes..."
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isRejecting || !rejectReason.trim()}
            >
              {isRejecting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Info Dialog */}
      <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Additional Evidence</DialogTitle>
            <DialogDescription>
              Request the artist to provide additional proof of ownership.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Requested Documents</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {[
                  "Original PSD/AI file",
                  "Layered file",
                  "Time-lapse video",
                  "Progress screenshots",
                  "Initial sketches",
                  "Reference materials",
                ].map((doc) => (
                  <label
                    key={doc}
                    className="flex items-center gap-2 rounded-lg border p-2 cursor-pointer hover:bg-muted/50 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={infoDocuments.includes(doc)}
                      onChange={() => handleDocToggle(doc)}
                      className="rounded"
                    />
                    {doc}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Message to Artist *</label>
              <Textarea
                placeholder="Add a message explaining what is needed..."
                value={infoMessage}
                onChange={(e) => setInfoMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInfoDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRequestInfo}
              disabled={isRequestingInfo || !infoMessage.trim()}
            >
              {isRequestingInfo ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <HelpCircle className="mr-2 h-4 w-4" />
              )}
              Request Information
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}