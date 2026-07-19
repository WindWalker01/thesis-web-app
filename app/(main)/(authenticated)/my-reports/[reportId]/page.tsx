"use client";

import { use, useCallback } from "react";
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
  const {
    messages,
    sendMessage,
    connectionStatus,
  } = useRealtimeMessages({
    reportId,
    currentUserId: report?.reporter_id ?? "",
    initialMessages: comments,
    enabled: !!report,
  });

  // Show toast notifications for status changes
  useEffect(() => {
    if (!actions || actions.length === 0) return;

    const latestAction = actions[0];
    if (latestAction.action === "evidence_requested") {
      toast.info("Additional evidence has been requested by an admin.", {
        duration: 5000,
      });
    }
    if (latestAction.action === "status_change" && latestAction.new_status === "resolved") {
      toast.success("Your report has been resolved.");
    }
    if (latestAction.action === "status_change") {
      toast.info(`Report status updated to "${latestAction.new_status?.replace(/_/g, " ")}".`, {
        duration: 4000,
      });
    }
  }, [actions]);

  const handleSendMessage = useCallback(async (message: string) => {
    await sendMessage(message);
  }, [sendMessage]);

  const handleUploadEvidence = useCallback(async (file: File, description?: string) => {
    await uploadEvidenceMutation.mutateAsync({ reportId, file, description });
  }, [reportId, uploadEvidenceMutation]);

  const handleCopyId = useCallback(() => {
    navigator.clipboard.writeText(reportId);
    toast.success("Report ID copied to clipboard");
  }, [reportId]);

  // ---- Loading State ----
  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 h-4 w-48 animate-pulse rounded bg-muted" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-48 animate-pulse rounded-lg bg-muted" />
          </div>
          <div className="space-y-6">
            <div className="h-48 animate-pulse rounded-lg bg-muted" />
            <div className="h-32 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  // ---- Error State ----
  if (isError || !report) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Report not found</h3>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            {error ?? "This report could not be found or you don't have permission to view it."}
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
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link href="/my-reports" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" />
              My Reports
            </Link>
          </li>
          <li className="text-muted-foreground/40" aria-hidden="true">
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li className="truncate text-foreground font-medium" aria-current="page">
            {report.title}
          </li>
        </ol>
      </nav>

      {/* Page Header with Quick Actions */}
      <div className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Flag className="h-4.5 w-4.5 text-orange-600 dark:text-orange-400" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">{report.title}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <StatusBadge status={report.status} className="text-sm" />
              <span className="text-muted-foreground/30" aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDateTime(report.created_at)}
              </span>
              <span className="text-muted-foreground/30" aria-hidden="true">·</span>
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
              onClick={() => document.getElementById("evidence-section")?.scrollIntoView({ behavior: "smooth" })}
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
              onClick={() => document.getElementById("timeline-section")?.scrollIntoView({ behavior: "smooth" })}
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
          <section aria-labelledby="overview-heading" className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center gap-2 border-b bg-muted/30 px-5 py-3.5">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h2 id="overview-heading" className="text-sm font-semibold">Overview</h2>
            </div>
            <dl className="divide-y divide-border">
              <div className="flex items-center justify-between px-5 py-3.5">
                <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Flag className="h-3.5 w-3.5" />
                  Report Type
                </dt>
                <dd className="text-sm font-medium">{REPORT_TYPE_LABELS[report.report_type]}</dd>
              </div>
              <div className="flex items-center justify-between px-5 py-3.5">
                <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Submitted
                </dt>
                <dd className="text-sm">{formatDateTime(report.created_at)}</dd>
              </div>
              <div className="flex items-center justify-between px-5 py-3.5">
                <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Last Updated
                </dt>
                <dd className="text-sm">{formatTimeAgo(report.resolved_at ?? report.created_at)}</dd>
              </div>
              {report.resolved_at && (
                <div className="flex items-center justify-between px-5 py-3.5">
                  <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Shield className="h-3.5 w-3.5" />
                    Resolution Date
                  </dt>
                  <dd className="text-sm">{formatDateTime(report.resolved_at)}</dd>
                </div>
              )}
            </dl>
          </section>

          {/* Description */}
          <section aria-labelledby="description-heading" className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center gap-2 border-b bg-muted/30 px-5 py-3.5">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h2 id="description-heading" className="text-sm font-semibold">Description</h2>
            </div>
            <div className="px-5 py-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {report.description}
              </p>
            </div>
          </section>

          {/* Status Timeline */}
          <section id="timeline-section" aria-labelledby="timeline-heading" className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center gap-2 border-b bg-muted/30 px-5 py-3.5">
              <History className="h-4 w-4 text-muted-foreground" />
              <h2 id="timeline-heading" className="text-sm font-semibold">Investigation Timeline</h2>
            </div>
            <div className="px-5 py-4">
              <Timeline actions={actions} />
            </div>
          </section>

          {/* Admin Decision */}
          {decision && (
            <section aria-labelledby="decision-heading" className="rounded-xl border bg-card overflow-hidden">
              <DecisionCard decision={decision} />
            </section>
          )}
        </div>

        {/* ===== RIGHT COLUMN ===== */}
        <div className="space-y-6">
          {/* Live Chat Conversation */}
          <section id="conversation-section" aria-labelledby="conversation-heading" className="flex flex-col">
            <div className="rounded-xl border bg-card overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 border-b bg-muted/30 px-5 py-3.5">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <h2 id="conversation-heading" className="text-sm font-semibold">
                  Conversation
                </h2>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${
                    connectionStatus === "connected" ? "bg-emerald-500" :
                    connectionStatus === "connecting" ? "bg-amber-500" : "bg-destructive"
                  }`} />
                  <span className="text-[10px] text-muted-foreground capitalize">
                    {connectionStatus}
                  </span>
                </div>
              </div>
              <div className="relative h-[500px] flex flex-col">
                <ChatContainer
                  reportId={reportId}
                  currentUserId={report.reporter_id}
                  currentUserName="You"
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onUploadEvidence={canUploadEvidence ? handleUploadEvidence : undefined}
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
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="flex items-center gap-2 border-b bg-muted/30 px-5 py-3.5">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
                <h2 id="evidence-heading" className="text-sm font-semibold">Evidence</h2>
                {evidence.length > 0 && (
                  <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {evidence.length} file{evidence.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="px-5 py-4">
                <EvidenceGallery
                  evidence={evidence}
                  reportId={reportId}
                  canUpload={canUploadEvidence}
                  onUpload={canUploadEvidence ? handleUploadEvidence : undefined}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}