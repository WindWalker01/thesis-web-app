"use client";

import { use, useCallback, useRef } from "react";
import Link from "next/link";
import { useReportDetail } from "@/features/reports/hooks/useReportDetail";
import { useRealtimeMessages } from "@/features/reports/hooks/useRealtimeMessages";
import { useUploadEvidence } from "@/features/reports/hooks/useUploadEvidence";
import { useAppealReport } from "@/features/reports/hooks/useAppealReport";
import { StatusBadge } from "@/features/reports/components/StatusBadge";
import { Timeline } from "@/features/reports/components/Timeline";
import { ChatContainer } from "@/features/reports/components/ChatContainer";
import { EvidenceGallery } from "@/features/reports/components/EvidenceGallery";
import { DecisionCard } from "@/features/reports/components/DecisionCard";
import ReportDetailSkeleton from "@/features/reports/components/ReportDetailSkeleton";

import {
  REPORT_TYPE_LABELS,
  formatDateTime,
  formatTimeAgo,
  isTerminalStatus,
} from "@/features/reports/lib/report-utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect } from "react";
import {
  ArrowLeft,
  Flag,
  Clock,
  MessageSquare,
  Paperclip,
  Copy,
  History,
  AlertCircle,
  ChevronRight,
  FileText,
  Shield,
  Calendar,
} from "lucide-react";

type PageParams = {
  params: Promise<{ reportId: string }>;
};

export default function ReportDetailPage({ params }: PageParams) {
  const { reportId } = use(params);
  const {
    report,
    evidence,
    comments,
    decision,
    actions,
    isLoading,
    isError,
    error,
  } = useReportDetail(reportId);

  const uploadEvidenceMutation = useUploadEvidence();
  const appealMutation = useAppealReport();

  // Realtime messages
  const { messages, sendMessage, connectionStatus } = useRealtimeMessages({
    reportId,
    currentUserId: report?.reporter_id ?? "",
    initialMessages: comments,
    enabled: !!report,
  });

  // Show toast notifications for status changes
  const previousActionId = useRef<string | null>(null);

  useEffect(() => {
    if (!actions || actions.length === 0) return;

    const latestAction = actions[0];

    // Skip showing toast on initial load, only update ref
    if (previousActionId.current === null) {
      previousActionId.current = latestAction.id;
      return;
    }

    // Skip if action hasn't changed
    if (previousActionId.current === latestAction.id) {
      return;
    }

    // Update ref to new latest action
    previousActionId.current = latestAction.id;

    if (latestAction.action === "evidence_requested") {
      toast.info("Additional evidence has been requested by an admin.", {
        duration: 5000,
      });
    } else if (
      latestAction.action === "status_change" &&
      latestAction.new_status === "resolved"
    ) {
      toast.success("Your report has been resolved.");
    } else if (latestAction.action === "status_change") {
      toast.info(
        `Report status updated to "${latestAction.new_status?.replace(/_/g, " ")}".`,
        {
          duration: 4000,
        },
      );
    }
  }, [actions]);

  const handleSendMessage = useCallback(
    async (message: string) => {
      await sendMessage(message);
    },
    [sendMessage],
  );

  const handleUploadEvidence = useCallback(
    async (file: File, description?: string) => {
      await uploadEvidenceMutation.mutateAsync({ reportId, file, description });
    },
    [reportId, uploadEvidenceMutation],
  );

  const handleCopyId = useCallback(() => {
    navigator.clipboard.writeText(reportId);
    toast.success("Report ID copied to clipboard");
  }, [reportId]);

  // ---- Loading State ----
  if (isLoading) {
    return <ReportDetailSkeleton />;
  }

  // ---- Error State ----
  if (isError || !report) {
    return (
      <div className="mx-auto mt-12 min-h-screen max-w-6xl px-4 py-8">
        <div className="bg-card flex flex-col items-center justify-center rounded-xl border py-16 text-center">
          <div className="bg-destructive/10 mb-4 flex h-14 w-14 items-center justify-center rounded-full">
            <AlertCircle className="text-destructive h-7 w-7" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Report not found</h3>
          <p className="text-muted-foreground mb-6 max-w-sm text-sm">
            {error ??
              "This report could not be found or you don't have permission to view it."}
          </p>
          <Button asChild variant="outline">
            <Link href="/my-reports" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to My Reports
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const canUploadEvidence = !isTerminalStatus(report.status);

  return (
    <div className="mx-auto mt-12 max-w-6xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="text-muted-foreground flex items-center gap-2 text-sm">
          <li>
            <Link
              href="/my-reports"
              className="hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              My Reports
            </Link>
          </li>
          <li className="text-muted-foreground/40" aria-hidden="true">
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li
            className="text-foreground truncate font-medium"
            aria-current="page"
          >
            {report.title}
          </li>
        </ol>
      </nav>

      {/* Page Header with Quick Actions */}
      <div className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Flag className="h-4.5 w-4.5 text-orange-600 dark:text-orange-400" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                {report.title}
              </h1>
            </div>
            <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
              <StatusBadge status={report.status} className="text-sm" />
              <span className="text-muted-foreground/30" aria-hidden="true">
                ·
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDateTime(report.created_at)}
              </span>
              <span className="text-muted-foreground/30" aria-hidden="true">
                ·
              </span>
              <span className="flex items-center gap-1 font-mono text-xs">
                <FileText className="h-3.5 w-3.5" />
                ID: {report.id.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={() => document.getElementById("chat-input")?.focus()}
            className="gap-1.5"
          >
            <MessageSquare className="h-4 w-4" />
            Reply
          </Button>
          {canUploadEvidence && (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                document
                  .getElementById("evidence-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="gap-1.5"
            >
              <Paperclip className="h-4 w-4" />
              Upload Evidence
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyId}
            className="gap-1.5"
          >
            <Copy className="h-4 w-4" />
            Copy ID
          </Button>
          {actions.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                document
                  .getElementById("timeline-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="gap-1.5"
            >
              <History className="h-4 w-4" />
              View History
            </Button>
          )}
        </div>
      </div>

      {/* Responsive Grid: Desktop 2-column, Mobile single-column */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ===== LEFT COLUMN ===== */}
        <div className="space-y-6">
          {/* Overview */}
          <section
            aria-labelledby="overview-heading"
            className="bg-card overflow-hidden rounded-xl border"
          >
            <div className="bg-muted/30 flex items-center gap-2 border-b px-5 py-3.5">
              <FileText className="text-muted-foreground h-4 w-4" />
              <h2 id="overview-heading" className="text-sm font-semibold">
                Overview
              </h2>
            </div>
            <dl className="divide-border divide-y">
              <div className="flex items-center justify-between px-5 py-3.5">
                <dt className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
                  <Flag className="h-3.5 w-3.5" />
                  Report Type
                </dt>
                <dd className="text-sm font-medium">
                  {REPORT_TYPE_LABELS[report.report_type]}
                </dd>
              </div>
              <div className="flex items-center justify-between px-5 py-3.5">
                <dt className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
                  <Calendar className="h-3.5 w-3.5" />
                  Submitted
                </dt>
                <dd className="text-sm">{formatDateTime(report.created_at)}</dd>
              </div>
              <div className="flex items-center justify-between px-5 py-3.5">
                <dt className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  Last Updated
                </dt>
                <dd className="text-sm">
                  {formatTimeAgo(report.resolved_at ?? report.created_at)}
                </dd>
              </div>
              {report.resolved_at && (
                <div className="flex items-center justify-between px-5 py-3.5">
                  <dt className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
                    <Shield className="h-3.5 w-3.5" />
                    Resolution Date
                  </dt>
                  <dd className="text-sm">
                    {formatDateTime(report.resolved_at)}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {/* Description */}
          <section
            aria-labelledby="description-heading"
            className="bg-card overflow-hidden rounded-xl border"
          >
            <div className="bg-muted/30 flex items-center gap-2 border-b px-5 py-3.5">
              <FileText className="text-muted-foreground h-4 w-4" />
              <h2 id="description-heading" className="text-sm font-semibold">
                Description
              </h2>
            </div>
            <div className="px-5 py-4">
              <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap">
                {report.description}
              </p>
            </div>
          </section>

          {/* Status Timeline */}
          <section
            id="timeline-section"
            aria-labelledby="timeline-heading"
            className="bg-card overflow-hidden rounded-xl border"
          >
            <div className="bg-muted/30 flex items-center gap-2 border-b px-5 py-3.5">
              <History className="text-muted-foreground h-4 w-4" />
              <h2 id="timeline-heading" className="text-sm font-semibold">
                Investigation Timeline
              </h2>
            </div>
            <div className="px-5 py-4">
              <Timeline actions={actions} />
            </div>
          </section>

          {/* Admin Decision */}
          {decision && (
            <section
              aria-labelledby="decision-heading"
              className="bg-card overflow-hidden rounded-xl border"
            >
              <DecisionCard decision={decision} />
            </section>
          )}
        </div>

        {/* ===== RIGHT COLUMN ===== */}
        <div className="space-y-6">
          {/* Live Chat Conversation */}
          <section
            id="conversation-section"
            aria-labelledby="conversation-heading"
            className="flex flex-col"
          >
            <div className="bg-card flex flex-col overflow-hidden rounded-xl border">
              <div className="bg-muted/30 flex items-center gap-2 border-b px-5 py-3.5">
                <MessageSquare className="text-muted-foreground h-4 w-4" />
                <h2 id="conversation-heading" className="text-sm font-semibold">
                  Conversation
                </h2>
                <div className="ml-auto flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      connectionStatus === "connected"
                        ? "bg-emerald-500"
                        : connectionStatus === "connecting"
                          ? "bg-amber-500"
                          : "bg-destructive"
                    }`}
                  />
                  <span className="text-muted-foreground text-[10px] capitalize">
                    {connectionStatus}
                  </span>
                </div>
              </div>
              <div className="relative flex h-[500px] flex-col">
                <ChatContainer
                  reportId={reportId}
                  currentUserId={report.reporter_id}
                  currentUserName="You"
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onUploadEvidence={
                    canUploadEvidence ? handleUploadEvidence : undefined
                  }
                  connectionStatus={connectionStatus}
                  reportTitle={report.title}
                  disabled={!canUploadEvidence}
                  reporterName="You"
                  adminName="Administrator"
                />
              </div>
            </div>
          </section>

          {/* Evidence */}
          <section id="evidence-section" aria-labelledby="evidence-heading">
            <div className="bg-card overflow-hidden rounded-xl border">
              <div className="bg-muted/30 flex items-center gap-2 border-b px-5 py-3.5">
                <Paperclip className="text-muted-foreground h-4 w-4" />
                <h2 id="evidence-heading" className="text-sm font-semibold">
                  Evidence
                </h2>
                {evidence.length > 0 && (
                  <span className="bg-muted text-muted-foreground ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium">
                    {evidence.length} file{evidence.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="px-5 py-4">
                <EvidenceGallery
                  evidence={evidence}
                  reportId={reportId}
                  canUpload={canUploadEvidence}
                  onUpload={
                    canUploadEvidence ? handleUploadEvidence : undefined
                  }
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
