// ============================================
// Admin Reports - Local Types
// ============================================

import type {
  AdminReportListItem,
  AdminReportDetail,
  ReportStatistics,
  ReportStatus,
  ReportType,
  ReportAction,
  ReportComment,
  ReportEvidence,
  ReportDecision,
  AdminReportsQuery,
  ModerationSummary,
  ActionRecommendation,
} from "@/features/reports/types";

// Re-export shared types for convenience
export type {
  AdminReportListItem,
  AdminReportDetail,
  ReportStatistics,
  ReportStatus,
  ReportType,
  ReportAction,
  ReportComment,
  ReportEvidence,
  ReportDecision,
  AdminReportsQuery,
  ModerationSummary,
  ActionRecommendation,
};

// Extended query params for the reports list
export interface ReportsQueryParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  reportType?: string;
  priority?: string;
  assignedAdmin?: string;
  reporter?: string;
  reportedUser?: string;
  reportedArtwork?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
}

// Color configuration for status badges
export interface StatusColorConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
}

// Filter state
export interface ReportFilters {
  status: string;
  priority: string;
  assignedAdmin: string;
  reporter: string;
  reportedUser: string;
  reportedArtwork: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
}

// Tab options for the detail drawer
export type ReportDetailTab =
  | "overview"
  | "evidence"
  | "timeline"
  | "notes"
  | "resolution";

// Decision labels
export const DECISION_LABELS: Record<string, string> = {
  no_violation: "No Violation",
  copyright_confirmed: "Copyright Confirmed",
  guideline_violation: "Community Guideline Violation",
  insufficient_evidence: "Insufficient Evidence",
  false_report: "False Report",
};

// Action labels
export const ACTION_LABELS: Record<string, string> = {
  status_change: "Status Changed",
  evidence_requested: "Evidence Requested",
  evidence_uploaded: "Evidence Uploaded",
  comment_added: "Comment Added",
  decision_recorded: "Decision Recorded",
  report_created: "Report Created",
  user_warned: "Warning Issued",
  user_suspended: "Account Suspended",
  user_banned: "Account Banned",
  artwork_removed: "Artwork Removed",
  artwork_restored: "Artwork Restored",
  artwork_nsfw: "Marked NSFW",
  plagiarism_scan_rerun: "Plagiarism Scan Re-run",
  evidence_reviewed: "Evidence Reviewed",
};

// Report type labels (re-exporting from shared)
export { REPORT_TYPE_LABELS } from "@/features/reports/types";