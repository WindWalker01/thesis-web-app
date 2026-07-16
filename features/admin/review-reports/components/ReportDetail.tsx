"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Clock,
  User,
  FileText,
  MessageSquare,
  ImageIcon,
  Gavel,
  History,
  ChevronDown,
  Send,
  Upload,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatTimeAgo } from "@/lib/client-utils";
import type {
  AdminReportDetail,
  ReportStatus,
  ReportAction,
  ReportComment,
  ReportEvidence,
} from "@/features/reports/types";
import { VALID_STATUS_TRANSITIONS, REPORT_TYPE_LABELS } from "@/features/reports/types";

const DECISION_LABELS: Record<string, string> = {
  infringement_confirmed: "Infringement Confirmed",
  no_violation: "No Violation",
  insufficient_evidence: "Insufficient Evidence",
  duplicate_report: "Duplicate Report",
  other: "Other",
};

const ACTION_LABELS: Record<string, string> = {
  status_change: "Status Changed",
  evidence_requested: "Evidence Requested",
  evidence_uploaded: "Evidence Uploaded",
  comment_added: "Comment Added",
  decision_recorded: "Decision Recorded",
  report_created: "Report Created",
};

export default function ReportDetail({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [detail, setDetail] = useState<AdminReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [statusNotes, setStatusNotes] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [commentMessage, setCommentMessage] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  const [decisionValue, setDecisionValue] = useState("");
  const [decisionSummary, setDecisionSummary] = useState("");
  const [recordingDecision, setRecordingDecision] = useState(false);

  const [evidenceMessage, setEvidenceMessage] = useState("");
  const [requestingEvidence, setRequestingEvidence] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`);
      const result = await response.json();
      if (result.success) {
        setDetail(result.data as AdminReportDetail);
      } else {
        setError(result.error?.message ?? "Failed to load report");
      }
    } catch (err) {
      setError("Failed to load report details");
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;
    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: selectedStatus,
          notes: statusNotes || undefined,
        }),
      });
      const result = await response.json();
      if (result.success) {
        await fetchDetail();
        setSelectedStatus("");
        setStatusNotes("");
      } else {
        alert(result.error?.message ?? "Failed to update status");
      }
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentMessage.trim()) return;
    setSendingComment(true);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: commentMessage }),
      });
      const result = await response.json();
      if (result.success) {
        await fetchDetail();
        setCommentMessage("");
      } else {
        alert(result.error?.message ?? "Failed to add comment");
      }
    } catch (err) {
      alert("Failed to add comment");
    } finally {
      setSendingComment(false);
    }
  };

  const handleRecordDecision = async () => {
    if (!decisionValue || !decisionSummary.trim()) return;
    setRecordingDecision(true);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: decisionValue,
          summary: decisionSummary,
        }),
      });
      const result = await response.json();
      if (result.success) {
        await fetchDetail();
        setDecisionValue("");
        setDecisionSummary("");
      } else {
        alert(result.error?.message ?? "Failed to record decision");
      }
    } catch (err) {
      alert("Failed to record decision");
    } finally {
      setRecordingDecision(false);
    }
  };

  const handleRequestEvidence = async () => {
    if (!evidenceMessage.trim()) return;
    setRequestingEvidence(true);
    try {
      const response = await fetch(
        `/api/admin/reports/${reportId}/request-evidence`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: evidenceMessage }),
        }
      );
      const result = await response.json();
      if (result.success) {
        await fetchDetail();
        setEvidenceMessage("");
      } else {
        alert(result.error?.message ?? "Failed to request evidence");
      }
    } catch (err) {
      alert("Failed to request evidence");
    } finally {
      setRequestingEvidence(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-12 w-12 text-red-400 mb-3" />
        <p className="text-lg font-medium">Failed to load report</p>
        <p className="text-muted-foreground text-sm">{error}</p>
        <Button className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const { report, reporter, reported_art_post, evidence, comments, decision, actions } =
    detail;
  const validNextStatuses = VALID_STATUS_TRANSITIONS[report.status] ?? [];

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.push("/admin/reports")}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Reports
      </Button>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{report.title}</h1>
          <p className="text-muted-foreground">
            Report ID: {report.id.substring(0, 8)}...
          </p>
        </div>
        <Badge
          variant="secondary"
          className="border-0 text-sm"
        >
          {report.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Report Type</p>
                  <p className="font-medium">
                    {REPORT_TYPE_LABELS[report.report_type] ?? report.report_type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="font-medium">{formatDate(report.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Resolved At</p>
                  <p className="font-medium">
                    {report.resolved_at ? formatDate(report.resolved_at) : "\u2014"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm whitespace-pre-wrap">{report.description}</p>
              </div>
            </CardContent>
          </Card>

          {reported_art_post?.registered_arts && (
            <Card>
              <CardHeader>
                <CardTitle>Reported Artwork</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {reported_art_post.registered_arts.c_secure_url && (
                    <div className="relative h-32 w-32 rounded-lg overflow-hidden bg-muted shrink-0">
                      <Image
                        src={reported_art_post.registered_arts.c_secure_url}
                        alt={reported_art_post.registered_arts.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <p className="font-medium">
                      {reported_art_post.registered_arts.title}
                    </p>
                    {reported_art_post.registered_arts.description && (
                      <p className="text-sm text-muted-foreground">
                        {reported_art_post.registered_arts.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Status: {reported_art_post.registered_arts.status}</span>
                      <span>{" \u00B7 "}</span>
                      <span>
                        {formatDate(reported_art_post.registered_arts.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Evidence ({evidence.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {evidence.length === 0 ? (
                <p className="text-sm text-muted-foreground">No evidence uploaded yet</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {evidence.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 rounded-lg border p-3">
                      {item.mime_type?.startsWith("image/") ? (
                        <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                          <Image
                            src={item.file_url}
                            alt={item.file_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{item.file_name}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimeAgo(item.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversation ({comments.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No comments yet</p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`flex gap-3 ${comment.is_admin ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                        comment.is_admin
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {comment.is_admin ? "A" : "U"}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2.5 ${
                        comment.is_admin ? "bg-primary/10" : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{comment.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(comment.created_at)}
                        {comment.is_admin && " \u00B7 Admin"}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <Separator />
              <div className="flex gap-3">
                <Textarea
                  placeholder="Add a response..."
                  value={commentMessage}
                  onChange={(e) => setCommentMessage(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleAddComment}
                  disabled={!commentMessage.trim() || sendingComment}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  {sendingComment ? "Sending..." : "Send"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audit Trail ({actions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {actions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No actions recorded</p>
              ) : (
                <div className="space-y-3">
                  {actions.map((action) => (
                    <div key={action.id} className="flex items-start gap-3 border-l-2 border-muted pl-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {ACTION_LABELS[action.action] ?? action.action}
                        </p>
                        {action.previous_status && action.new_status && (
                          <p className="text-xs text-muted-foreground">
                            {action.previous_status.replace(/_/g, " ")} {"\u2192"}{" "}
                            {action.new_status.replace(/_/g, " ")}
                          </p>
                        )}
                        {action.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{action.notes}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimeAgo(action.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reporter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {reporter?.c_profile_image ? (
                    <Image
                      src={reporter.c_profile_image}
                      alt={reporter.first_name + " " + reporter.last_name}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{reporter.first_name} {reporter.last_name}</p>
                  <p className="text-sm text-muted-foreground">@{reporter.username}</p>
                </div>
              </div>
              {reporter.email && (
                <p className="text-sm text-muted-foreground">{reporter.email}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Member since {formatDate(reporter.created_at)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {validNextStatuses.length > 0 ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Change Status</label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                      <SelectContent>
                        {validNextStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes (optional)</label>
                    <Input
                      placeholder="Reason for status change..."
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleStatusUpdate}
                    disabled={!selectedStatus || updatingStatus}
                    className="w-full gap-2"
                  >
                    <ChevronDown className="h-4 w-4" />
                    {updatingStatus ? "Updating..." : "Update Status"}
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  This report has a final status and cannot be changed.
                </p>
              )}
              <Separator />
              <div className="space-y-2">
                <label className="text-sm font-medium">Request Additional Evidence</label>
                <Textarea
                  placeholder="Describe what evidence is needed..."
                  value={evidenceMessage}
                  onChange={(e) => setEvidenceMessage(e.target.value)}
                  rows={3}
                />
              </div>
              <Button
                onClick={handleRequestEvidence}
                disabled={!evidenceMessage.trim() || requestingEvidence}
                variant="outline"
                className="w-full gap-2"
              >
                <Upload className="h-4 w-4" />
                {requestingEvidence ? "Requesting..." : "Request Evidence"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resolution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {decision ? (
                <div className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    {decision.decision === "infringement_confirmed" ? (
                      <CheckCircle2 className="h-5 w-5 text-red-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-green-500" />
                    )}
                    <p className="font-medium">
                      {DECISION_LABELS[decision.decision] ?? decision.decision}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{decision.summary}</p>
                  <p className="text-xs text-muted-foreground">
                    Recorded {formatTimeAgo(decision.created_at)}
                  </p>
                </div>
              ) : report.status === "under_review" ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Decision</label>
                    <Select value={decisionValue} onValueChange={setDecisionValue}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select decision" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="infringement_confirmed">
                          Infringement Confirmed
                        </SelectItem>
                        <SelectItem value="no_violation">No Violation</SelectItem>
                        <SelectItem value="insufficient_evidence">
                          Insufficient Evidence
                        </SelectItem>
                        <SelectItem value="duplicate_report">Duplicate Report</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Summary</label>
                    <Textarea
                      placeholder="Explain the decision..."
                      value={decisionSummary}
                      onChange={(e) => setDecisionSummary(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <Button
                    onClick={handleRecordDecision}
                    disabled={!decisionValue || !decisionSummary.trim() || recordingDecision}
                    className="w-full gap-2"
                  >
                    <Gavel className="h-4 w-4" />
                    {recordingDecision ? "Recording..." : "Record Final Decision"}
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Report must be Under Review to record a decision.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}