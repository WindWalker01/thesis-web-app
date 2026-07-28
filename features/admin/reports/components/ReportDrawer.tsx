"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import Image from "next/image";
import {
  User,
  ChevronDown,
  Loader2,
  AlertCircle,
  MessageSquare,
  Paperclip,
  Clock,
  ShieldAlert,
  ChevronUp,
  ChevronDownIcon,
  FileText,
} from "lucide-react";
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
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/client-utils";
import { ReportStatusBadge } from "./ReportStatusBadge";
import { StatusActions } from "./StatusActions";
import { EvidenceViewer } from "./EvidenceViewer";
import { ResolutionCard } from "./ResolutionCard";
import { Timeline } from "@/features/reports/components/Timeline";
import { ChatContainer } from "@/features/reports/components/ChatContainer";
import { useRealtimeMessages } from "@/features/reports/hooks/useRealtimeMessages";
import type {
  AdminReportDetail,
  ReportStatus,
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
  const [showTimeline, setShowTimeline] = useState(false);
  const [showResolution, setShowResolution] = useState(false);
  const [isModeratingArtwork, setIsModeratingArtwork] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState<"chat" | "evidence">("chat");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // Get current user ID from Supabase session
  useEffect(() => {
    const getUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setCurrentUserId(session.user.id);
      }
    };
    getUserId();
  }, []);

  // Realtime messages for this report
  const {
    messages,
    sendMessage,
    connectionStatus,
  } = useRealtimeMessages({
    reportId: detail?.report.id ?? "",
    currentUserId,
    initialMessages: detail?.comments ?? [],
    enabled: open && !!detail && !!currentUserId,
  });

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
                    Live Chat
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
                <div className="flex-1 overflow-hidden">
                  {activeLeftTab === "chat" ? (
                    <div className="h-full relative">
                      <ChatContainer
                        reportId={detail.report.id}
                        currentUserId={currentUserId}
                        currentUserName="You"
                        messages={messages}
                        onSendMessage={onAddComment}
                        onUploadEvidence={onUploadEvidence}
                        connectionStatus={connectionStatus}
                        reportTitle={detail.report.title}
                        disabled={false}
                        reporterName={reporterName}
                        adminName="You"
                        reporterAvatar={detail.reporter.c_profile_image}
                      />
                    </div>
                  ) : (
                    <div className="overflow-y-auto p-4 h-full">
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
                    {detail.report.title && (
                      <div className="pt-2">
                        <div className="text-xs text-muted-foreground">Reason</div>
                        <p className="text-sm mt-1">{detail.report.title}</p>
                      </div>
                    )}
                    {detail.report.description && (
                      <div className="pt-2">
                        <div className="text-xs text-muted-foreground">Additional details</div>
                        <p className="text-sm mt-1">{detail.report.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Status Management */}
                  <StatusActions
                    currentStatus={detail.report.status as ReportStatus}
                    onUpdateStatus={onUpdateStatus}
                    isUpdatingStatus={isUpdatingStatus}
                  />

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
                          reportType={detail.report.report_type}
                          currentStatus={detail.report.status as ReportStatus}
                          decision={detail.decision}
                          hasAssociatedArtwork={hasAssociatedArtwork}
                          artworkIsArchived={false}
                          artworkId={detail.reported_art_post?.registered_arts?.id}
                          artworkTitle={artworkTitle}
                          isUpdatingStatus={isUpdatingStatus}
                          onResolved={onRefresh}
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