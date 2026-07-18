"use client";

import { use } from "react";
import Link from "next/link";
import { useReportDetail } from "@/features/reports/hooks/useReportDetail";
import { useAddComment } from "@/features/reports/hooks/useAddComment";
import { useUploadEvidence } from "@/features/reports/hooks/useUploadEvidence";
import { useAppealReport } from "@/features/reports/hooks/useAppealReport";
import { StatusBadge } from "@/features/reports/components/StatusBadge";
import { Timeline } from "@/features/reports/components/Timeline";
import { Conversation } from "@/features/reports/components/Conversation";
import { ReplyBox } from "@/features/reports/components/ReplyBox";
import { EvidenceGallery } from "@/features/reports/components/EvidenceGallery";
import { DecisionCard } from "@/features/reports/components/DecisionCard";
import { AppealDialog } from "@/features/reports/components/AppealDialog";
import {
  REPORT_TYPE_LABELS,
  formatDateTime,
  formatTimeAgo,
  isTerminalStatus,
} from "@/features/reports/lib/report-utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useEffect } from "react";

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

  const addCommentMutation = useAddComment();
  const uploadEvidenceMutation = useUploadEvidence();
  const appealMutation = useAppealReport();

  // Show toast notifications for status changes
  useEffect(() => {
    if (!actions || actions.length === 0) return;

    const latestAction = actions[0]; // newest first from API
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

  const handleSendMessage = async (message: string) => {
    await addCommentMutation.mutateAsync({ reportId, message });
    toast.success("Message sent");
  };

  const handleUploadEvidence = async (file: File, description?: string) => {
    await uploadEvidenceMutation.mutateAsync({ reportId, file, description });
  };

  const handleAppeal = async (reason: string) => {
    await appealMutation.mutateAsync({ reportId, reason });
  };

  // ---- Loading State ----
  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Breadcrumb skeleton */}
        <div className="mb-6 h-4 w-48 animate-pulse rounded bg-muted" />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left column skeleton */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-48 animate-pulse rounded-lg bg-muted" />
          </div>

          {/* Right column skeleton */}
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
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <svg
              className="h-6 w-6 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold">Report not found</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {error ?? "This report could not be found or you don't have permission to view it."}
          </p>
          <Button asChild variant="outline">
            <Link href="/my-reports">Back to My Reports</Link>
          </Button>
        </div>
      </div>
    );
  }

  const canReply = !isTerminalStatus(report.status);
  const showAppeal = false; // Appeal flow removed with old statuses
  const canUploadEvidence = !isTerminalStatus(report.status);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link
              href="/my-reports"
              className="transition-colors hover:text-foreground"
            >
              My Reports
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="truncate text-foreground" aria-current="page">
            {report.title}
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight">{report.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Report ID: {report.id}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={report.status} />
            {showAppeal && (
              <AppealDialog reportId={reportId} onSubmit={handleAppeal} />
            )}
          </div>
        </div>
      </div>

      {/* Responsive Grid: Desktop 2-column, Mobile single-column */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ===== LEFT COLUMN ===== */}
        <div className="space-y-6">
          {/* Overview */}
          <section aria-labelledby="overview-heading">
            <div className="rounded-lg border bg-card">
              <div className="border-b bg-muted/50 px-4 py-3">
                <h2 id="overview-heading" className="text-sm font-semibold">
                  Overview
                </h2>
              </div>
              <dl className="divide-y divide-border">
                <div className="flex items-center justify-between px-4 py-3">
                  <dt className="text-xs font-medium text-muted-foreground">Report Type</dt>
                  <dd className="text-sm">{REPORT_TYPE_LABELS[report.report_type]}</dd>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <dt className="text-xs font-medium text-muted-foreground">Submitted</dt>
                  <dd className="text-sm">{formatDateTime(report.created_at)}</dd>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <dt className="text-xs font-medium text-muted-foreground">Last Updated</dt>
                  <dd className="text-sm">
                    {formatTimeAgo(report.resolved_at ?? report.created_at)}
                  </dd>
                </div>
                {report.resolved_at && (
                  <div className="flex items-center justify-between px-4 py-3">
                    <dt className="text-xs font-medium text-muted-foreground">Resolution Date</dt>
                    <dd className="text-sm">{formatDateTime(report.resolved_at)}</dd>
                  </div>
                )}
              </dl>
            </div>
          </section>

          {/* Description */}
          <section aria-labelledby="description-heading">
            <div className="rounded-lg border bg-card">
              <div className="border-b bg-muted/50 px-4 py-3">
                <h2 id="description-heading" className="text-sm font-semibold">
                  Description
                </h2>
              </div>
              <div className="px-4 py-3">
                <p className="whitespace-pre-wrap text-sm">{report.description}</p>
              </div>
            </div>
          </section>

          {/* Status Timeline */}
          <section aria-labelledby="timeline-heading">
            <div className="rounded-lg border bg-card">
              <div className="border-b bg-muted/50 px-4 py-3">
                <h2 id="timeline-heading" className="text-sm font-semibold">
                  Status Timeline
                </h2>
              </div>
              <div className="px-4 py-4">
                <Timeline actions={actions} />
              </div>
            </div>
          </section>

          {/* Admin Decision */}
          {decision && (
            <section aria-labelledby="decision-heading">
              <DecisionCard
                decision={decision}
              />
            </section>
          )}
        </div>

        {/* ===== RIGHT COLUMN ===== */}
        <div className="space-y-6">
          {/* Conversation */}
          <section aria-labelledby="conversation-heading">
            <div className="rounded-lg border bg-card">
              <div className="border-b bg-muted/50 px-4 py-3">
                <h2 id="conversation-heading" className="text-sm font-semibold">
                  Conversation
                </h2>
              </div>
              <div className="px-4 py-4">
                <Conversation
                  comments={comments}
                  currentUserId={report.reporter_id}
                />
              </div>

              {/* Reply Box */}
              {canReply && (
                <>
                  <Separator />
                  <div className="px-4 py-4">
                    <ReplyBox
                      reportId={reportId}
                      onSend={handleSendMessage}
                      onUploadEvidence={canUploadEvidence ? handleUploadEvidence : undefined}
                      disabled={addCommentMutation.isPending}
                      placeholder={
                        canUploadEvidence
                          ? "Type your message or attach evidence..."
                          : "Type your message..."
                      }
                    />
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Evidence */}
          <section aria-labelledby="evidence-heading">
            <div className="rounded-lg border bg-card">
              <div className="border-b bg-muted/50 px-4 py-3">
                <h2 id="evidence-heading" className="text-sm font-semibold">
                  Evidence
                </h2>
              </div>
              <div className="px-4 py-4">
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