// ============================================
// Reporting & Complaint Management - Types
// ============================================

// ---- Report Status ----
export type ReportStatus =
  | "pending_review"
  | "under_review"
  | "resolved";

// ---- Report Type ----
export type ReportType =
  | "plagiarism"
  | "repost"
  | "tracing"
  | "commercial_use"
  | "counterfeit"
  | "ownership_dispute"
  | "other";

// ---- Decision Type ----
export type ReportDecisionValue =
  | "infringement_confirmed"
  | "no_violation"
  | "insufficient_evidence"
  | "duplicate_report"
  | "other";

// ---- Action Type ----
export type ReportActionType =
  | "status_change"
  | "evidence_requested"
  | "evidence_uploaded"
  | "comment_added"
  | "decision_recorded"
  | "report_created";

// ---- Report (base) ----
export type Report = {
  id: string;
  reporter_id: string;
  reported_art_post_id: string;
  report_type: ReportType;
  title: string;
  description: string;
  status: ReportStatus;
  created_at: string;
  resolved_at: string | null;
};

// ---- Report Comment (enhanced for live chat) ----
export type ReportComment = {
  id: string;
  report_id: string;
  user_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
  read_at: string | null;
  file_url: string | null;
  file_name: string | null;
  mime_type: string | null;
  message_type: "text" | "image" | "document";
  parent_id: string | null;
};

// ---- Message Delivery Status ----
export type MessageStatus = "sending" | "sent" | "delivered" | "seen";

// ---- Extended Chat Message with UI state ----
export type ChatMessage = ReportComment & {
  status: MessageStatus;
  temp_id?: string;
};

// ---- Typing Indicator ----
export type TypingUser = {
  user_id: string;
  started_typing_at: string;
  display_name: string;
  is_admin: boolean;
};

// ---- Connection Status ----
export type RealtimeConnectionStatus = "connected" | "connecting" | "disconnected";

// ---- Online Status ----
export type OnlineStatus = {
  is_online: boolean;
  last_active: string | null;
};

// ---- Unread Counts ----
export type ReportUnreadCounts = Record<string, number>; // reportId -> count

// ---- Read Receipt State ----
export type ReadReceiptState = {
  last_read_at: string | null;
  unread_count: number;
};

// ---- Report Evidence ----
export type ReportEvidence = {
  id: string;
  report_id: string;
  uploaded_by: string;
  file_url: string;
  file_name: string;
  mime_type: string | null;
  description: string | null;
  created_at: string;
};

// ---- Report Action (audit trail) ----
export type ReportAction = {
  id: string;
  report_id: string;
  admin_id: string;
  action: ReportActionType;
  previous_status: ReportStatus | null;
  new_status: ReportStatus | null;
  notes: string | null;
  created_at: string;
};

// ---- Report Decision ----
export type ReportDecision = {
  id: string;
  report_id: string;
  admin_id: string;
  decision: ReportDecisionValue;
  summary: string;
  created_at: string;
};

// ---- API Response types ----

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---- Admin Report List Item ----
export type AdminReportListItem = {
  id: string;
  title: string;
  report_type: ReportType;
  status: ReportStatus;
  created_at: string;
  resolved_at: string | null;
  reporter: {
    id: string;
    first_name: string;
    last_name: string | null;
    middle_name: string | null;
    username: string;
    c_profile_image: string | null;
  };
  reported_art_post: {
    id: string;
    registered_arts: {
      id: string;
      title: string;
      c_secure_url: string | null;
    } | null;
  } | null;
  evidence_count: number;
  comment_count: number;
  has_decision: boolean;
};

// ---- Admin Report Detail ----
export type AdminReportDetail = {
  report: Report;
  reporter: {
    id: string;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    username: string;
    email: string | null;
    c_profile_image: string | null;
    created_at: string;
  };
  reported_art_post: {
    id: string;
    registered_arts: {
      id: string;
      title: string;
      description: string | null;
      c_secure_url: string | null;
      file_hash: string;
      status: string;
      created_at: string;
      owner_id: string;
    } | null;
  } | null;
  evidence: ReportEvidence[];
  comments: ReportComment[];
  decision: ReportDecision | null;
  actions: ReportAction[];
};

// ---- Report Statistics ----
export type ReportStatistics = {
  total: number;
  pending_review: number;
  under_review: number;
  resolved: number;
  average_resolution_time_hours: number | null;
  reports_this_month: number;
  reports_by_type: { type: ReportType; count: number }[];
};

// ---- Status Transition Validation ----
export type StatusTransition = {
  from: ReportStatus;
  to: ReportStatus;
  allowed: boolean;
};

export const VALID_STATUS_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  pending_review: ["under_review"],
  under_review: ["resolved", "pending_review"],
  resolved: [],
};

// ---- Report Type Labels ----
export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  plagiarism: "Plagiarism",
  repost: "Repost",
  tracing: "Tracing",
  commercial_use: "Commercial Use",
  counterfeit: "Counterfeit",
  ownership_dispute: "Ownership Dispute",
  other: "Other",
};

// ---- Sort Options ----
export type AdminReportsSortBy = "created_at" | "status" | "report_type" | "title";
export type SortOrder = "asc" | "desc";

// ---- Query Params ----
export type AdminReportsQuery = {
  page: number;
  limit: number;
  status?: ReportStatus;
  reportType?: ReportType;
  search?: string;
  sortBy: AdminReportsSortBy;
  sortOrder: SortOrder;
};