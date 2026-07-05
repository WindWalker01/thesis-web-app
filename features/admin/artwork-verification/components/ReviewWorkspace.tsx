"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ImageIcon,
  FileText,
  Hash,
  ExternalLink,
  Database,
  Globe,
  Clock,
  User,
  Loader2,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn, formatTimeAgo } from "@/lib/client-utils";
import { useReviewDetail } from "../hooks/useReviewDetail";
import { ReviewStatusBadge } from "./ReviewStatusBadge";
import { RiskBadge } from "./RiskBadge";
import {
  approveArtwork,
  rejectArtwork,
  requestInformation,
  addReviewNote,
  assignReviewer,
  unassignReviewer,
} from "../server/reviews";
import type { ReviewDetail, ReviewAction } from "../types";

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

  // Zoom
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Autosave notes
  const autosaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Update notes when detail loads
  useEffect(() => {
    if (detail?.review_notes) {
      setReviewNotes(detail.review_notes);
    }
  }, [detail?.review_notes]);

  // Autosave notes
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        if (detail?.status !== "approved" && detail?.status !== "rejected") {
          setDecisionNotes(reviewNotes);
          setApproveDialogOpen(true);
        }
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        if (detail?.status !== "approved" && detail?.status !== "rejected") {
          setDecisionNotes(reviewNotes);
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
  }, [detail?.status, reviewNotes]);

  // Loading
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

  // Error
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
  const scan = detail.scan;
  const isDecided = detail.status === "approved" || detail.status === "rejected";
  const similarity = scan?.best_similarity_percentage ?? null;

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
            {/* Preview */}
            <div className="relative overflow-hidden rounded-xl border border-border bg-muted">
              <div
                className={cn(
                  "relative transition-all duration-200",
                  isFullscreen ? "fixed inset-0 z-50 bg-background p-4" : "aspect-[4/3]"
                )}
              >
                {artwork.c_secure_url ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src={artwork.c_secure_url}
                      alt={artwork.title}
                      fill
                      className="object-contain"
                      style={{ transform: `scale(${zoomLevel})` }}
                    />
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-muted-foreground/40" />
                  </div>
                )}

                {/* Zoom controls */}
                <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg border bg-background/80 p-1 backdrop-blur-sm">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-xs tabular-nums w-8 text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </Button>
                  <Separator orientation="vertical" className="h-5" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-3.5 w-3.5" />
                    ) : (
                      <Maximize2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Artwork Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Title</p>
                    <p className="font-medium">{artwork.title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Artist</p>
                    <p className="font-medium">
                      {artwork.owner.first_name} {artwork.owner.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Username</p>
                    <p className="font-medium">@{artwork.owner.username}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Uploaded</p>
                    <p className="font-medium">{formatTimeAgo(artwork.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{artwork.status.replace(/_/g, " ")}</p>
                  </div>
                  {artwork.chain && (
                    <div>
                      <p className="text-xs text-muted-foreground">Blockchain</p>
                      <p className="font-medium capitalize">{artwork.chain}</p>
                    </div>
                  )}
                </div>

                {artwork.description && (
                  <div>
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {artwork.description}
                    </p>
                  </div>
                )}

                <Separator />

                {/* Hashes */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Hash className="h-3 w-3" /> Hashes
                  </p>
                  <div className="space-y-1.5">
                    <div>
                      <p className="text-[10px] text-muted-foreground">File Hash</p>
                      <p className="font-mono text-[10px] break-all text-muted-foreground">
                        {artwork.file_hash.substring(0, 32)}...
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Perceptual Hash</p>
                      <p className="font-mono text-[10px] break-all text-muted-foreground">
                        {artwork.perceptual_hash.substring(0, 32)}...
                      </p>
                    </div>
                    {artwork.evidence_hash && (
                      <div>
                        <p className="text-[10px] text-muted-foreground">Evidence Hash</p>
                        <p className="font-mono text-[10px] break-all text-muted-foreground">
                          {artwork.evidence_hash.substring(0, 32)}...
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {artwork.tx_hash && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground">Transaction</p>
                      <p className="font-mono text-xs break-all text-muted-foreground">
                        {artwork.tx_hash.substring(0, 20)}...
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Center Panel - Similarity Analysis */}
        <div className="w-full lg:w-[40%] border-b lg:border-b-0 lg:border-r border-border">
          <div className="p-4 space-y-4">
            {/* Similarity Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Similarity Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {scan ? (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Overall Similarity</span>
                          <RiskBadge similarity={similarity} />
                        </div>
                        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              similarity !== null && similarity >= 95
                                ? "bg-red-500"
                                : similarity !== null && similarity >= 85
                                  ? "bg-orange-500"
                                  : similarity !== null && similarity >= 75
                                    ? "bg-yellow-500"
                                    : "bg-gray-400"
                            )}
                            style={{ width: `${similarity ?? 0}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">Best Match Source</p>
                        <p className="text-sm font-semibold capitalize mt-1">
                          {scan.best_source ?? "Unknown"}
                        </p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground">Total Matches</p>
                        <p className="text-sm font-semibold mt-1">{scan.total_matches}</p>
                      </div>
                    </div>

                    {scan.best_link && (
                      <div className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground mb-1">Source URL</p>
                        <Link
                          href={scan.best_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary inline-flex items-center gap-1 text-xs break-all underline underline-offset-4"
                        >
                          {scan.best_link}
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </Link>
                      </div>
                    )}

                    {/* Matches List */}
                    {scan.matches && Array.isArray(scan.matches) && scan.matches.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground">All Matches</p>
                        <ScrollArea className="max-h-64">
                          <div className="space-y-2">
                            {(scan.matches as Array<{ rank?: number; similarity_percentage?: number; source?: string; type?: string; link?: string; url?: string }>).map((match, i) => (
                              <div
                                key={i}
                                className="rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    {match.type === "database" ? (
                                      <Database className="h-3.5 w-3.5 text-muted-foreground" />
                                    ) : (
                                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                                    )}
                                    <span className="text-sm font-medium">
                                      Match #{match.rank ?? i + 1}
                                    </span>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {match.similarity_percentage?.toFixed(1) ?? "N/A"}%
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {match.source ?? match.type ?? "Unknown source"}
                                </p>
                                {match.link && (
                                  <Link
                                    href={match.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-primary inline-flex items-center gap-1 text-[10px] mt-1 underline underline-offset-4"
                                  >
                                    {match.link.substring(0, 60)}...
                                    <ExternalLink className="h-2.5 w-2.5" />
                                  </Link>
                                )}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No similarity scan data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Side-by-side comparison placeholder */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Side-by-side Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="split">
                  <TabsList className="h-8">
                    <TabsTrigger value="split" className="text-xs">Split View</TabsTrigger>
                    <TabsTrigger value="slider" className="text-xs">Slider</TabsTrigger>
                    <TabsTrigger value="overlay" className="text-xs">Overlay</TabsTrigger>
                  </TabsList>
                  <TabsContent value="split" className="mt-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="aspect-square rounded-lg border bg-muted overflow-hidden relative">
                        {artwork.c_secure_url ? (
                          <Image
                            src={artwork.c_secure_url}
                            alt="Current artwork"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                          </div>
                        )}
                        <div className="absolute bottom-1 left-1 rounded bg-background/80 px-1.5 py-0.5 text-[10px]">
                          Submitted
                        </div>
                      </div>
                      <div className="aspect-square rounded-lg border bg-muted overflow-hidden relative">
                        {scan?.best_url ? (
                          <Image
                            src={scan.best_url}
                            alt="Matched artwork"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                          </div>
                        )}
                        <div className="absolute bottom-1 left-1 rounded bg-background/80 px-1.5 py-0.5 text-[10px]">
                          Match
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="slider" className="mt-3">
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">Drag the slider to compare</p>
                    </div>
                  </TabsContent>
                  <TabsContent value="overlay" className="mt-3">
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">Opacity overlay comparison</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Panel - Review Actions */}
        <div className="w-full lg:w-[25%]">
          <div className="p-4 space-y-4">
            {/* Status & Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Review Panel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <ReviewStatusBadge status={detail.status} />
                </div>

                {/* Reviewer */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Reviewer</span>
                  <span className="text-sm font-medium">
                    {detail.reviewer
                      ? `${detail.reviewer.first_name} ${detail.reviewer.last_name}`
                      : "Unassigned"}
                  </span>
                </div>

                {!isDecided && (
                  <div className="space-y-2">
                    {detail.reviewer ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={handleUnassign}
                        disabled={isAssigning}
                      >
                        {isAssigning ? (
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        ) : null}
                        Unassign Me
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={handleAssignToMe}
                        disabled={isAssigning}
                      >
                        {isAssigning ? (
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        ) : (
                          <User className="mr-2 h-3 w-3" />
                        )}
                        Assign to Me
                      </Button>
                    )}
                  </div>
                )}

                <Separator />

                {/* Action Buttons */}
                {!isDecided ? (
                  <div className="space-y-2">
                    <Button
                      className="w-full gap-2"
                      onClick={() => {
                        setDecisionNotes(reviewNotes);
                        setApproveDialogOpen(true);
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve Registration
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full gap-2"
                      onClick={() => {
                        setDecisionNotes(reviewNotes);
                        setRejectDialogOpen(true);
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                      Reject Registration
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => setInfoDialogOpen(true)}
                    >
                      <HelpCircle className="h-4 w-4" />
                      Request More Information
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20 p-3 text-center">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      {detail.status === "approved"
                        ? "Approved"
                        : detail.status === "rejected"
                          ? "Rejected"
                          : "Decision Made"}
                    </p>
                    {detail.decision_reason && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {detail.decision_reason}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Review Notes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Review Notes</span>
                  {isSavingNotes && (
                    <span className="text-[10px] text-muted-foreground">Saving...</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add your review notes here..."
                  value={reviewNotes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  rows={6}
                  className="text-sm resize-none"
                  disabled={isDecided}
                />
              </CardContent>
            </Card>

            {/* Activity Feed */}
            {detail.actions.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-64">
                    <div className="space-y-3">
                      {detail.actions.map((action) => (
                        <div key={action.id} className="flex items-start gap-2">
                          <div className="mt-0.5 h-2 w-2 rounded-full bg-muted-foreground/30 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium capitalize">
                              {action.action.replace(/_/g, " ")}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {action.admin.first_name} {action.admin.last_name} &middot;{" "}
                              {formatTimeAgo(action.created_at)}
                            </p>
                            {action.notes && (
                              <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                                {action.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
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
                      onChange={(e) => {
                        if (e.target.checked) {
                          setInfoDocuments([...infoDocuments, doc]);
                        } else {
                          setInfoDocuments(infoDocuments.filter((d) => d !== doc));
                        }
                      }}
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