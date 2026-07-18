"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  User,
  ChevronDown,
  Loader2,
  AlertCircle,
  MessageSquare,
  Paperclip,
  Send,
  Clock,
  ShieldAlert,
  ChevronUp,
  ChevronDownIcon,
  FileText,
  Upload,
} from "lucide-react";
import {
  MAX_EVIDENCE_FILE_SIZE,
  ALLOWED_EVIDENCE_MIME_TYPES,
  isAllowedFileType,
} from "@/features/reports/schemas/report-schemas";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn, formatDate, formatTimeAgo } from "@/lib/client-utils";
import { ReportStatusBadge } from "./ReportStatusBadge";
import { EvidenceViewer } from "./EvidenceViewer";
import { ResolutionCard } from "./ResolutionCard";
import { Timeline } from "@/features/reports/components/Timeline";
import type {
  AdminReportDetail,
  ReportStatus,
  ReportComment,
  ReportAction,
} from "@/features/reports/types";
import { REPORT_TYPE_LABELS } from "@/features/reports/types";

interface ReportDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: AdminReportDetail | undefined;
  isLoading: boolean;
  error: string | null;
  onUpdateStatus: (status: string, notes?: string) => Promise<void>;
  onAddComment: (message: string) => Promise<void>;
  onUploadEvidence?: (file: File, description?: string) => Promise<void>;
  isUpdatingStatus: boolean;
  isSendingComment: boolean;
  onRefresh: () => void;
}

export function ReportDrawer({
  open,
  onOpenChange,
  detail,
  isLoading,
  error,
  onUpdateStatus,
  onAddComment,
  onUploadEvidence,
  isUpdatingStatus,
  isSendingComment,
  onRefresh,
}: ReportDrawerProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showResolution, setShowResolution] = useState(false);
  const [isModeratingArtwork, setIsModeratingArtwork] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState<"chat" | "evidence">("chat");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new comments arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [detail?.comments]);

  const handleSendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;
    setIsSending(true);
    try {
      await onAddComment(trimmed);
      setMessage("");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadEvidence) return;

    // Validate file size
    if (file.size > MAX_EVIDENCE_FILE_SIZE) {
      toast.error("File must be under 10MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate file type
    if (!isAllowedFileType(file.type, file.name)) {
      toast.error("Unsupported file type");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    try {
      await onUploadEvidence(file);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload evidence");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle artwork moderation from the report drawer
  const handleModerateArtwork = async (action: string, reason: string) => {
    if (!detail) return;
    const artworkId = detail.reported_art_post?.registered_arts?.id;
    if (!artworkId) {
      toast.error("No associated artwork found for this report");
      return;
    }

    setIsModeratingArtwork(true);
    try {
      const response = await fetch(
        `/api/admin/reports/${detail.report.id}/moderate-artwork`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            reason,
            notes: reason,
            artworkId,
          }),
        }
      );
      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
        await onRefresh();
      } else {
        toast.error(result.error?.message ?? "Moderation action failed");
      }
    } catch {
      toast.error("Failed to moderate artwork");
    } finally {
      setIsModeratingArtwork(false);
    }
  };

  const reporterName = detail
    ? `${detail.reporter.first_name} ${detail.reporter.last_name ?? ""}`.trim()
    : "";

  // Determine if this report has an associated artwork
  const hasAssociatedArtwork = !!detail?.reported_art_post?.registered_arts;
  const artworkTitle =
    detail?.reported_art_post?.registered_arts?.title ?? "this artwork";

  // Sort comments chronologically (oldest first)
  const sortedComments = detail
    ? [...detail.comments].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0" style={{ maxWidth: "85vw" }}>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading report details...</span>
            </div>
          </div>
        ) : error || !detail ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="h-12 w-12 text-red-400 mb-3" />
            <p className="text-lg font-medium">Failed to load report</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button className="mt-4" variant="outline" onClick={onRefresh}>
              Retry
            </Button>
          </div>
        ) : (
          <>
            {/* ===== HEADER ===== */}
            <div className="shrink-0 border-b border-border px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-primary shrink-0" />
                    <DialogTitle className="text-base truncate">
                      {detail.report.title}
                    </DialogTitle>
                    <ReportStatusBadge status={detail.report.status as ReportStatus} />
                  </div>
                  <DialogDescription className="text-xs mt-1">
                    <span className="font-medium">
                      {REPORT_TYPE_LABELS[detail.report.report_type] ?? detail.report.report_type}
                    </span>
                    <span className="mx-1.5">&middot;</span>
                    <span>Reported by {reporterName || "@" + detail.reporter.username}</span>
                    <span className="mx-1.5">&middot;</span>
                    <span>{formatDate(detail.report.created_at)}</span>
                  </DialogDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1 shrink-0">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuLabel>Report Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => {
                        setShowResolution(true);
                        setShowTimeline(false);
                      }}
                    >
                      Resolution Options
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onRefresh}>
                      Refresh
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* ===== TWO-COLUMN BODY ===== */}
            <div className="flex flex-1 overflow-hidden">
              {/* LEFT COLUMN: Chat + Evidence */}
              <div className="w-1/2 border-r border-border flex flex-col overflow-hidden">
                {/* Sub-tabs for left column */}
                <div className="flex border-b border-border shrink-0">
                  <button
                    onClick={() => setActiveLeftTab("chat")}
                    className={cn(
                      "flex-1 px-4 py-2 text-xs font-medium border-b-2 transition-colors",
                      activeLeftTab === "chat"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <MessageSquare className="h-3 w-3 inline mr-1.5" />
                    Discussion
                  </button>
                  <button
                    onClick={() => setActiveLeftTab("evidence")}
                    className={cn(
                      "flex-1 px-4 py-2 text-xs font-medium border-b-2 transition-colors",
                      activeLeftTab === "evidence"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Paperclip className="h-3 w-3 inline mr-1.5" />
                    Evidence ({detail.evidence.length})
                  </button>
                </div>

                {/* Left content area */}
                <div className="flex-1 overflow-y-auto p-4">
                  {activeLeftTab === "chat" ? (
                    <>
                      {/* Reporter Info Banner */}
                      <div className="mb-4 rounded-lg border bg-muted/30 p-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-muted">
                            {detail.reporter.c_profile_image ? (
                              <Image
                                src={detail.reporter.c_profile_image}
                                alt={reporterName}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <User className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{reporterName}</p>
                            <p className="text-xs text-muted-foreground">
                              {detail.report.description
                                ? detail.report.description.substring(0, 150) +
                                  (detail.report.description.length > 150 ? "..." : "")
                                : "No description"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Chat Messages */}
                      {sortedComments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <MessageSquare className="h-8 w-8 text-muted-foreground/40 mb-2" />
                          <p className="text-sm text-muted-foreground">No messages yet.</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">
                            Send a message to start the investigation.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {sortedComments.map((comment) => (
                            <ChatBubble
                              key={comment.id}
                              comment={comment}
                              reporterName={reporterName}
                            />
                          ))}
                          <div ref={chatEndRef} />
                        </div>
                      )}

                      {/* Reply Box */}
                      <div className="mt-4 pt-3 border-t border-border">
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Type your message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isSending || isSendingComment || isUploading}
                            rows={2}
                            className="min-h-[50px] resize-none text-sm"
                            aria-label="Message"
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isUploading || !onUploadEvidence}
                              onClick={() => fileInputRef.current?.click()}
                              className="gap-1.5 text-xs"
                            >
                              {isUploading ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Upload className="h-3 w-3" />
                              )}
                              {isUploading ? "Uploading..." : "Attach File"}
                            </Button>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept={ALLOWED_EVIDENCE_MIME_TYPES.join(",")}
                              className="hidden"
                              onChange={handleFileChange}
                              aria-label="Upload evidence file"
                            />
                          </div>
                          <Button
                            onClick={handleSendMessage}
                            disabled={!message.trim() || isSending || isSendingComment}
                            size="sm"
                            className="gap-2 text-xs"
                          >
                            {isSending || isSendingComment ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Send className="h-3 w-3" />
                            )}
                            Send Message
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Evidence Tab */
                    <div>
                      {detail.evidence.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <Paperclip className="h-8 w-8 text-muted-foreground/40 mb-2" />
                          <p className="text-sm text-muted-foreground">No evidence uploaded yet.</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">
                            Evidence will appear here when the reporter uploads it.
                          </p>
                        </div>
                      ) : (
                        <EvidenceViewer evidence={detail.evidence} isLoading={false} />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Info + Timeline + Resolution */}
              <div className="w-1/2 flex flex-col overflow-hidden">
                <div className="overflow-y-auto p-4 space-y-4">
                  {/* Report Details Card */}
                  <div className="rounded-lg border p-3 space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Report Details
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-xs text-muted-foreground">Type</span>
                        <p className="font-medium capitalize">
                          {REPORT_TYPE_LABELS[detail.report.report_type] ?? detail.report.report_type}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Status</span>
                        <ReportStatusBadge status={detail.report.status as ReportStatus} />
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Reporter</span>
                        <p className="font-medium truncate">{reporterName}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Created</span>
                        <p className="font-medium">{formatDate(detail.report.created_at)}</p>
                      </div>
                    </div>
                    {detail.report.description && (
                      <div className="pt-1">
                        <span className="text-xs text-muted-foreground">Description</span>
                        <p className="text-sm mt-0.5">{detail.report.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Associated Artwork */}
                  {detail.reported_art_post?.registered_arts && (
                    <div className="rounded-lg border p-3 space-y-2">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Reported Artwork
                      </h4>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {detail.reported_art_post.registered_arts.c_secure_url ? (
                            <Image
                              src={detail.reported_art_post.registered_arts.c_secure_url}
                              alt={detail.reported_art_post.registered_arts.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {detail.reported_art_post.registered_arts.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Status: {detail.reported_art_post.registered_arts.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Activity Timeline (collapsible) */}
                  <div className="rounded-lg border overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowTimeline(!showTimeline)}
                      className="flex w-full items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Activity Timeline
                        </h4>
                      </div>
                      {showTimeline ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    {showTimeline && (
                      <div className="px-3 pb-3 max-h-40 overflow-y-auto">
                        <Timeline actions={detail.actions} />
                      </div>
                    )}
                  </div>

                  {/* Resolution (collapsible) */}
                  <div className="rounded-lg border overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowResolution(!showResolution)}
                      className="flex w-full items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Resolution
                        </h4>
                      </div>
                      {showResolution ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    {showResolution && (
                      <div className="px-3 pb-3">
                        <ResolutionCard
                          reportId={detail.report.id}
                          currentStatus={detail.report.status as ReportStatus}
                          decision={detail.decision}
                          onUpdateStatus={onUpdateStatus}
                          onModerateArtwork={handleModerateArtwork}
                          hasAssociatedArtwork={hasAssociatedArtwork}
                          artworkTitle={artworkTitle}
                          isUpdatingStatus={isUpdatingStatus}
                          isModeratingArtwork={isModeratingArtwork}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ===== Inline Chat Bubble Component =====
function ChatBubble({
  comment,
  reporterName,
}: {
  comment: ReportComment;
  reporterName: string;
}) {
  const isAdmin = comment.is_admin;

  return (
    <div
      className={cn("flex gap-2", isAdmin ? "justify-end" : "justify-start")}
    >
      {/* Reporter avatar (only for non-admin messages) */}
      {!isAdmin && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
          {reporterName.charAt(0)?.toUpperCase() ?? "R"}
        </div>
      )}

      <div
        className={cn(
          "max-w-[85%] space-y-0.5",
          isAdmin && "flex flex-col items-end"
        )}
      >
        {/* Sender label */}
        <div
          className={cn(
            "flex items-center gap-1.5 text-[10px]",
            isAdmin && "flex-row-reverse"
          )}
        >
          <span className="font-medium text-muted-foreground">
            {isAdmin ? "You" : reporterName}
          </span>
          {isAdmin && (
            <span className="rounded bg-primary/10 px-1 py-0.5 text-[9px] font-medium text-primary">
              Admin
            </span>
          )}
          <time
            className="text-muted-foreground/50"
            dateTime={comment.created_at}
          >
            {formatTimeAgo(comment.created_at)}
          </time>
        </div>

        {/* Message bubble */}
        <div
          className={cn(
            "rounded-xl px-3 py-1.5 text-xs",
            isAdmin
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          )}
        >
          <p className="whitespace-pre-wrap break-words">{comment.message}</p>
        </div>
      </div>

      {/* Admin avatar (only for admin messages) */}
      {isAdmin && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
          A
        </div>
      )}
    </div>
  );
}