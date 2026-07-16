"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Clock,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Upload,
  Loader2,
  FileText,
  Download,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn, formatTimeAgo } from "@/lib/client-utils";
import { submitReviewEvidence } from "@/features/(user)/upload-artwork/server/submit-review-evidence";
import type { ReviewStatus, ReviewActionType, ReviewEvidence } from "@/features/admin/artwork-verification/types";

interface VerificationStatusCardProps {
  reviewId: string;
  status: ReviewStatus;
  decision_reason: string | null;
  review_notes: string | null;
  requested_documents: string[];
  resubmission_count: number;
  actions: Array<{
    id: string;
    action: ReviewActionType | string;
    admin: { first_name: string; last_name: string } | null;
    notes: string | null;
    created_at: string;
  }>;
  evidence: ReviewEvidence[];
  onEvidenceSubmitted?: () => void;
}

const STATUS_CONFIG = {
  pending: { label: "Pending Review", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100", border: "border-yellow-200" },
  under_review: { label: "Under Review", icon: Clock, color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200" },
  needs_info: { label: "Additional Information Required", icon: HelpCircle, color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-200" },
  approved: { label: "Verified", icon: ShieldCheck, color: "text-green-600", bg: "bg-green-100", border: "border-green-200" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-red-600", bg: "bg-red-100", border: "border-red-200" },
};

function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    viewed: "Admin viewed the artwork",
    assigned: "Review was assigned",
    unassigned: "Review was unassigned",
    approved: "Admin approved the artwork",
    rejected: "Admin rejected the artwork",
    comment_added: "Admin added a comment",
    information_requested: "Admin requested more information",
    decision_changed: "Decision was changed",
    blockchain_triggered: "Blockchain registration triggered",
    evidence_submitted: "You submitted additional evidence",
  };
  return labels[action] || action;
}

function getActionIcon(action: string) {
  switch (action) {
    case "approved":
    case "blockchain_triggered":
      return <ShieldCheck className="h-4 w-4 text-green-500" />;
    case "rejected":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "information_requested":
      return <HelpCircle className="h-4 w-4 text-purple-500" />;
    case "evidence_submitted":
      return <Upload className="h-4 w-4 text-blue-500" />;
    default:
      return <Clock className="h-4 w-4 text-slate-400" />;
  }
}

export function VerificationStatusCard({
  reviewId,
  status,
  decision_reason,
  review_notes,
  requested_documents,
  resubmission_count,
  actions,
  evidence,
  onEvidenceSubmitted,
}: VerificationStatusCardProps) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  const canSubmit = status === "needs_info";

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (files.length === 0 && !message.trim()) {
      toast.error("Please provide a message or upload files");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });

      const result = await submitReviewEvidence(reviewId, message, formData);
      if (result.success) {
        toast.success(result.message);
        setMessage("");
        setFiles([]);
        onEvidenceSubmitted?.();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to submit evidence");
    } finally {
      setIsSubmitting(false);
    }
  }, [reviewId, message, files, onEvidenceSubmitted]);

  const formatStatusLabel = (label: string) => label;

  return (
    <Card className="border-border overflow-hidden">
      <CardHeader className={cn("pb-3", config.bg)}>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className={cn("h-5 w-5", config.color)} />
          <span className={cn("font-bold", config.color)}>
            {formatStatusLabel(config.label)}
          </span>
          {resubmission_count > 0 && (
            <Badge variant="secondary" className="ml-auto text-xs">
              {resubmission_count} resubmission{resubmission_count !== 1 ? "s" : ""}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Admin Remarks */}
        {(decision_reason || review_notes) && (
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
              Admin Remarks
            </p>
            <p className="text-sm">{decision_reason || review_notes}</p>
          </div>
        )}

        {/* Requested Documents */}
        {requested_documents.length > 0 && canSubmit && (
          <div className="rounded-lg border border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/20 p-3">
            <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1 uppercase tracking-wider">
              Requested Documents
            </p>
            <ul className="list-disc list-inside text-sm text-purple-600 dark:text-purple-300 space-y-0.5">
              {requested_documents.map((doc, i) => (
                <li key={i}>{doc}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Evidence Submission Form */}
        {canSubmit && (
          <div className="space-y-3 rounded-lg border border-dashed border-primary/30 p-4">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Submit Additional Information</span>
            </div>

            <div>
              <Textarea
                placeholder="Provide additional explanation or context for your artwork..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="text-sm"
              />
            </div>

            <div>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm hover:bg-muted/50 transition-colors">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {files.length > 0
                    ? `${files.length} file(s) selected`
                    : "Upload files (PNG, JPG, PDF, ZIP, PSD)"}
                </span>
                <input
                  type="file"
                  multiple
                  accept=".png,.jpg,.jpeg,.pdf,.zip,.psd"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {files.length > 0 && (
                <div className="mt-2 space-y-1">
                  {Array.from(files).map((file, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      <span className="truncate">{file.name}</span>
                      <span className="shrink-0">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full gap-2"
              size="sm"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Submit Additional Information
            </Button>
          </div>
        )}

        {/* Submitted Evidence */}
        {evidence.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Your Submitted Evidence
            </p>
            {evidence.map((ev) => (
              <div key={ev.id} className="rounded-lg border border-border bg-muted/20 p-3">
                {ev.message && (
                  <p className="text-sm mb-2 text-muted-foreground">{ev.message}</p>
                )}
                {ev.files.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {ev.files.map((file, i) => (
                      <a
                        key={i}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-md border border-border bg-background p-2 text-xs hover:bg-muted/50 transition-colors"
                      >
                        {file.type.startsWith("image/") ? (
                          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded">
                            <Image
                              src={file.url}
                              alt={file.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <span className="truncate">{file.name}</span>
                      </a>
                    ))}
                  </div>
                )}
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {formatTimeAgo(ev.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* History Timeline */}
        {actions.length > 0 && (
          <div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              {showHistory ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              Verification History ({actions.length})
            </button>

            {showHistory && (
              <div className="mt-3 space-y-0">
                {actions.map((action, i) => (
                  <div key={action.id} className="relative flex gap-3 pb-4 last:pb-0">
                    {i < actions.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-0 w-px bg-border" />
                    )}
                    <div className="mt-0.5 shrink-0">
                      {getActionIcon(action.action)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {getActionLabel(action.action)}
                      </p>
                      {action.notes && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {action.notes}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {formatTimeAgo(action.created_at)}
                        {action.admin && ` by ${action.admin.first_name} ${action.admin.last_name}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}