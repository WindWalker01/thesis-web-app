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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  onRecordDecision: (decision: string, summary: string) => Promise<void>;
  onAddComment: (message: string) => Promise<void>;
  onRequestEvidence: (message: string) => Promise<void>;
  isUpdatingStatus: boolean;
  isRecordingDecision: boolean;
  isSendingComment: boolean;
  isRequestingEvidence: boolean;
  onRefresh: () => void;
}

export function ReportDrawer({
  open,
  onOpenChange,
  detail,
  isLoading,
  error,
  onUpdateStatus,
  onRecordDecision,
  onAddComment,
  onRequestEvidence,
  isUpdatingStatus,
  isRecordingDecision,
  isSendingComment,
  isRequestingEvidence,
  onRefresh,
}: ReportDrawerProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showResolution, setShowResolution] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  const reporterName = detail
    ? `${detail.reporter.first_name} ${detail.reporter.last_name ?? ""}`.trim()
    : "";

  // Sort comments chronologically (oldest first)
  const sortedComments = detail
    ? [...detail.comments].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl lg:max-w-2xl flex flex-col p-0">
        {isLoading ? (
          <div className="flex-1 space-y-4 p-4">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
            <div className="h-32 animate-pulse rounded-xl bg-muted" />
            <div className="h-64 animate-pulse rounded-xl bg-muted" />
            <div className="h-48 animate-pulse rounded-xl bg-muted" />
          </div>
        ) : error || !detail ? (
          <div className="flex flex-1 flex-col items-center justify-center py-20">
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
            <div className="shrink-0 border-b border-border px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <SheetTitle className="text-base truncate">
                      {detail.report.title}
                    </SheetTitle>
                    <ReportStatusBadge status={detail.report.status as ReportStatus} />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      {REPORT_TYPE_LABELS[detail.report.report_type] ?? detail.report.report_type}
                    </span>
                    <span>•</span>
                    <span>{formatDate(detail.report.created_at)}</span>
                    <span>•</span>
                    <span className="truncate">
                      Reporter: {reporterName || "@" + detail.reporter.username}
                    </span>
                  </div>
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

            {/* ===== CHAT AREA (scrollable) ===== */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
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
                        ? detail.report.description.substring(0, 120) +
                          (detail.report.description.length > 120 ? "..." : "")
                        : "No description"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              {sortedComments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquare className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No messages yet.</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Send a message to start the investigation.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
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

              {/* Evidence Section */}
              {detail.evidence.length > 0 && (
                <div className="mt-6">
                  <Separator className="mb-4" />
                  <div className="flex items-center gap-2 mb-3">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-semibold">
                      Evidence ({detail.evidence.length})
                    </h4>
                  </div>
                  <EvidenceViewer evidence={detail.evidence} isLoading={false} />
                </div>
              )}

              {/* Collapsible: Timeline */}
              <div className="mt-6">
                <Separator className="mb-3" />
                <button
                  type="button"
                  onClick={() => setShowTimeline(!showTimeline)}
                  className="flex w-full items-center justify-between py-1"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-semibold">Activity Timeline</h4>
                  </div>
                  {showTimeline ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {showTimeline && (
                  <div className="mt-2">
                    <Timeline actions={detail.actions} />
                  </div>
                )}
              </div>

              {/* Collapsible: Resolution */}
              <div className="mt-6 mb-4">
                <Separator className="mb-3" />
                <button
                  type="button"
                  onClick={() => setShowResolution(!showResolution)}
                  className="flex w-full items-center justify-between py-1"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-semibold">Resolution</h4>
                  </div>
                  {showResolution ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {showResolution && (
                  <div className="mt-2">
                    <ResolutionCard
                      reportId={detail.report.id}
                      currentStatus={detail.report.status as ReportStatus}
                      decision={detail.decision}
                      onUpdateStatus={onUpdateStatus}
                      onRecordDecision={onRecordDecision}
                      onRequestEvidence={onRequestEvidence}
                      isUpdatingStatus={isUpdatingStatus}
                      isRecordingDecision={isRecordingDecision}
                      isRequestingEvidence={isRequestingEvidence}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ===== REPLY BOX (pinned to bottom) ===== */}
            <div className="shrink-0 border-t border-border bg-card p-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSending || isSendingComment}
                  rows={2}
                  className="min-h-[60px] resize-none"
                  aria-label="Message"
                />
              </div>
              <div className="mt-2 flex justify-end">
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isSending || isSendingComment}
                  size="sm"
                  className="gap-2"
                >
                  {isSending || isSendingComment ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {isSending || isSendingComment ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
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
      className={cn("flex gap-3", isAdmin ? "justify-end" : "justify-start")}
    >
      {/* Reporter avatar (only for non-admin messages) */}
      {!isAdmin && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
          {reporterName.charAt(0)?.toUpperCase() ?? "R"}
        </div>
      )}

      <div
        className={cn(
          "max-w-[80%] space-y-1",
          isAdmin && "flex flex-col items-end"
        )}
      >
        {/* Sender label */}
        <div
          className={cn(
            "flex items-center gap-2 text-xs",
            isAdmin && "flex-row-reverse"
          )}
        >
          <span className="font-medium">
            {isAdmin ? "You" : reporterName}
          </span>
          {isAdmin && (
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              Admin
            </span>
          )}
          <time
            className="text-muted-foreground/60"
            dateTime={comment.created_at}
          >
            {formatTimeAgo(comment.created_at)}
          </time>
        </div>

        {/* Message bubble */}
        <div
          className={cn(
            "rounded-xl px-3 py-2 text-sm",
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
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
          A
        </div>
      )}
    </div>
  );
}