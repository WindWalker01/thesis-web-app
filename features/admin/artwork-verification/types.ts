// ============================================
// Admin Artwork Verification - Types
// ============================================

// ── Review Status ──
export type ReviewStatus =
  | "pending"
  | "under_review"
  | "needs_info"
  | "approved"
  | "rejected";

// ── Review Decision ──
export type ReviewDecision = "approved" | "rejected" | "needs_info";

// ── Review Action Type ──
export type ReviewActionType =
  | "viewed"
  | "assigned"
  | "unassigned"
  | "approved"
  | "rejected"
  | "comment_added"
  | "information_requested"
  | "decision_changed"
  | "blockchain_triggered";

// ── Risk Level ──
export type RiskLevel = "critical" | "high" | "medium" | "low";

// ── Risk Level Config ──
export interface RiskLevelConfig {
  level: RiskLevel;
  label: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
}

// ── Review Queue Item ──
export type ReviewQueueItem = {
  id: string;
  artwork_id: string;
  status: ReviewStatus;
  reviewer_id: string | null;
  reviewer: {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
  } | null;
  assigned_at: string | null;
  created_at: string;
  artwork: {
    id: string;
    title: string;
    c_secure_url: string | null;
    file_hash: string;
    perceptual_hash: string;
    evidence_hash: string | null;
    description: string | null;
    status: string;
    created_at: string;
    owner: {
      id: string;
      username: string;
      first_name: string;
      last_name: string;
      c_profile_image: string | null;
    };
  };
  scan: {
    id: string;
    best_similarity_percentage: number | null;
    best_source: string | null;
    best_link: string | null;
    best_url: string | null;
    total_matches: number;
    matches: unknown;
    hashes: unknown;
    completed_at: string | null;
  } | null;
};

// ── Review Detail ──
export type ReviewDetail = {
  id: string;
  artwork_id: string;
  status: ReviewStatus;
  decision: ReviewDecision | null;
  decision_reason: string | null;
  review_notes: string | null;
  requested_documents: string[];
  reviewer_id: string | null;
  reviewer: {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
  } | null;
  assigned_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  artwork: {
    id: string;
    title: string;
    description: string | null;
    c_secure_url: string | null;
    c_asset_id: string | null;
    file_hash: string;
    perceptual_hash: string;
    evidence_hash: string | null;
    evidence: unknown;
    chain: string | null;
    tx_hash: string | null;
    block_number: number | null;
    work_id: string | null;
    status: string;
    created_at: string;
    owner: {
      id: string;
      username: string;
      first_name: string;
      last_name: string;
      email: string | null;
      c_profile_image: string | null;
    };
  };
  scan: {
    id: string;
    status: string;
    filename: string | null;
    original_hash: string | null;
    success: boolean;
    total_matches: number;
    best_source: string | null;
    best_link: string | null;
    best_url: string | null;
    best_match_pair: string | null;
    best_similarity_percentage: number | null;
    best_min_combined_distance: number | null;
    best_average_combined_distance: number | null;
    best_max_combined_distance: number | null;
    matches: unknown;
    hashes: unknown;
    raw_response: unknown;
    error_message: string | null;
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
  } | null;
  actions: ReviewAction[];
};

// ── Review Action (Audit) ──
export type ReviewAction = {
  id: string;
  review_id: string;
  admin_id: string;
  action: ReviewActionType;
  previous_status: string | null;
  new_status: string | null;
  notes: string | null;
  created_at: string;
  admin: {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
  };
};

// ── Review Statistics ──
export type ReviewStatistics = {
  pending: number;
  under_review: number;
  needs_info: number;
  approved_today: number;
  rejected_today: number;
  average_review_time_hours: number | null;
  high_risk: number;
};

// ── Review Filters ──
export type ReviewFilters = {
  status: string;
  similarity: string;
  date: string;
  artist: string;
  reviewer: string;
  source: string;
  search: string;
  sortBy: string;
};

// ── Review Activity Item ──
export type ReviewActivityItem = {
  id: string;
  review_id: string;
  admin: {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
  };
  action: ReviewActionType;
  artwork_title: string;
  notes: string | null;
  created_at: string;
};

// ── Paginated Response ──
export type PaginatedReviewsResponse = {
  items: ReviewQueueItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ── Query Params ──
export type ReviewsQueryParams = {
  page: number;
  limit: number;
  status?: string;
  similarity?: string;
  date?: string;
  artist?: string;
  reviewer?: string;
  source?: string;
  search?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
};

// ── Status Color Config ──
export const REVIEW_STATUS_CONFIG: Record<ReviewStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
  pending: {
    label: "Pending",
    color: "text-yellow-600",
    bg: "bg-yellow-100",
    border: "border-yellow-200/50",
    dot: "bg-yellow-500",
  },
  under_review: {
    label: "Under Review",
    color: "text-blue-600",
    bg: "bg-blue-100",
    border: "border-blue-200/50",
    dot: "bg-blue-500",
  },
  needs_info: {
    label: "Needs Info",
    color: "text-purple-600",
    bg: "bg-purple-100",
    border: "border-purple-200/50",
    dot: "bg-purple-500",
  },
  approved: {
    label: "Approved",
    color: "text-green-600",
    bg: "bg-green-100",
    border: "border-green-200/50",
    dot: "bg-green-500",
  },
  rejected: {
    label: "Rejected",
    color: "text-red-600",
    bg: "bg-red-100",
    border: "border-red-200/50",
    dot: "bg-red-500",
  },
};

// ── Risk Level Config ──
export const RISK_LEVEL_CONFIG: Record<RiskLevel, RiskLevelConfig> = {
  critical: {
    level: "critical",
    label: "Critical",
    color: "text-red-600",
    bg: "bg-red-100",
    border: "border-red-200/50",
    dot: "bg-red-500",
  },
  high: {
    level: "high",
    label: "High",
    color: "text-orange-600",
    bg: "bg-orange-100",
    border: "border-orange-200/50",
    dot: "bg-orange-500",
  },
  medium: {
    level: "medium",
    label: "Medium",
    color: "text-yellow-600",
    bg: "bg-yellow-100",
    border: "border-yellow-200/50",
    dot: "bg-yellow-500",
  },
  low: {
    level: "low",
    label: "Low",
    color: "text-gray-600",
    bg: "bg-gray-100",
    border: "border-gray-200/50",
    dot: "bg-gray-500",
  },
};

// ── Helper: Get risk level from similarity percentage ──
export function getRiskLevel(similarity: number | null): RiskLevel {
  if (similarity === null) return "low";
  if (similarity >= 95) return "critical";
  if (similarity >= 85) return "high";
  if (similarity >= 75) return "medium";
  return "low";
}

// ── Sort Options ──
export const REVIEW_SORT_OPTIONS = [
  { value: "highest_similarity", label: "Highest Similarity" },
  { value: "oldest", label: "Oldest First" },
  { value: "newest", label: "Newest First" },
  { value: "most_matches", label: "Most Similar Matches" },
] as const;

// ── Default Filters ──
export const DEFAULT_REVIEW_FILTERS: ReviewFilters = {
  status: "all",
  similarity: "all",
  date: "all",
  artist: "",
  reviewer: "",
  source: "all",
  search: "",
  sortBy: "highest_similarity",
};