// ============================================
// Report Management - Utility Functions
// ============================================

import type { ReportStatus, ReportType, ReportDecisionValue } from "@/features/reports/types";

// ---- Status Display & Colors ----

export const STATUS_LABELS: Record<ReportStatus, string> = {
  pending_review: "Pending for Review",
  under_review: "Under Review",
  resolved: "Resolved",
};

export const STATUS_COLORS: Record<ReportStatus, string> = {
  pending_review:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  under_review:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  resolved:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export const STATUS_DOT_COLORS: Record<ReportStatus, string> = {
  pending_review: "bg-blue-500",
  under_review: "bg-amber-500",
  resolved: "bg-emerald-500",
};

// ---- Type Labels ----

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  plagiarism: "Plagiarism",
  repost: "Repost",
  tracing: "Tracing",
  commercial_use: "Commercial Use",
  counterfeit: "Counterfeit",
  ownership_dispute: "Ownership Dispute",
  other: "Other",
};

// ---- Decision Labels ----

export const DECISION_LABELS: Record<ReportDecisionValue, string> = {
  infringement_confirmed: "Infringement Confirmed",
  no_violation: "No Violation",
  insufficient_evidence: "Insufficient Evidence",
  duplicate_report: "Duplicate Report",
  other: "Other",
};

export const DECISION_COLORS: Record<ReportDecisionValue, string> = {
  infringement_confirmed:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  no_violation:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  insufficient_evidence:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  duplicate_report:
    "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  other:
    "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400",
};

// ---- Terminal Status Check ----

export function isTerminalStatus(status: ReportStatus): boolean {
  return ["resolved"].includes(status);
}

// ---- Formatting Helpers ----

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

// ---- File Helpers ----

export function getFileIcon(mimeType: string | null): string {
  if (!mimeType) return "📄";
  if (mimeType.startsWith("image/")) return "🖼️";
  if (mimeType === "application/pdf") return "📕";
  if (mimeType.startsWith("application/zip") || mimeType.startsWith("application/x-rar"))
    return "📦";
  if (mimeType.startsWith("text/")) return "📝";
  return "📄";
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ---- Chat Timestamp Formatting ----
// Like modern chat apps: "11:42 AM", "Yesterday", "July 18, 2026"

export function formatChatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Today: show time only
  if (diffDays === 0) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Yesterday
  if (diffDays === 1) {
    return "Yesterday";
  }

  // Within the last week: show day name
  if (diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }

  // Older: show full date
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ---- Truncate ----

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}
