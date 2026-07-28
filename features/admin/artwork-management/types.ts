// ============================================
// Admin Artwork Management - Types
// ============================================

// ── Artwork Status (matches art_status enum) ──
export type ArtworkStatus =
  | "pending_blockchain"
  | "active"
  | "flagged"
  | "under_review"
  | "removed"
  | "blockchain_failed"
  | "revoked";

// ── Visibility ──
export type ArtworkVisibility = "public" | "private" | "unlisted";

// ── Review Decision ──
export type ReviewDecision =
  | "approved"
  | "under_review"
  | "false_positive"
  | "needs_info"
  | "escalated"
  | "removed";

// ── Bulk Action Type ──
export type BulkActionType =
  | "archive"
  | "hide"
  | "delete"
  | "approve"
  | "mark_review"
  | "export";

// ── Sort Options ──
export type ArtworkSortOption =
  | "newest"
  | "oldest"
  | "alphabetical"
  | "highest_similarity"
  | "most_reported"
  | "most_upvoted";

// ── Artwork List Item (for table) ──
export type ArtworkListItem = {
  id: string;
  title: string;
  description: string | null;
  c_secure_url: string | null;
  c_asset_id: string | null;
  file_hash: string;
  perceptual_hash: string;
  status: ArtworkStatus;
  created_at: string;
  updated_at: string;
  owner: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    c_profile_image: string | null;
  };
  art_post: {
    id: string;
    visibility: string;
    is_archived: boolean;
    is_nsfw: boolean;
    upvote_count: number;
    downvote_count: number;
    score: number;
  } | null;
  scan: {
    id: string;
    status: string;
    best_similarity_percentage: number | null;
    total_matches: number;
    success: boolean;
  } | null;
  review: {
    id: string;
    status: string;
  } | null;
  genres: Array<{ id: number; name: string }>;
  report_count: number;
  needs_review: boolean;
};

// ── Artwork Detail (for drawer) ──
export type ArtworkDetail = {
  id: string;
  title: string;
  description: string | null;
  c_asset_id: string | null;
  c_secure_url: string | null;
  file_hash: string;
  perceptual_hash: string;
  author_id_hash: string | null;
  evidence_hash: string | null;
  evidence: unknown;
  chain: string | null;
  tx_hash: string | null;
  block_number: number | null;
  work_id: string | null;
  status: ArtworkStatus;
  created_at: string;
  updated_at: string;
  owner: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string | null;
    c_profile_image: string | null;
    is_verified: boolean;
  };
  art_post: {
    id: string;
    visibility: string;
    is_archived: boolean;
    is_nsfw: boolean;
    upvote_count: number;
    downvote_count: number;
    score: number;
    created_at: string;
  } | null;
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
  review: {
    id: string;
    status: string;
    decision: string | null;
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
    actions: Array<{
      id: string;
      action: string;
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
    }>;
  } | null;
  genres: Array<{ id: number; name: string }>;
  reports: Array<{
    id: string;
    title: string;
    report_type: string;
    status: string;
    created_at: string;
    reporter: {
      id: string;
      first_name: string;
      last_name: string;
      username: string;
      c_profile_image: string | null;
    };
  }>;
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
  }>;
  needs_review: boolean;
  review_conditions: string[];
};

// ── Artwork Statistics ──
export type ArtworkStats = {
  total_registered: number;
  pending_blockchain: number;
  blockchain_registered: number;
  flagged_for_review: number;
  public_posts: number;
  archived_posts: number;
  reported_artworks: number;
  similarity_matches: number;
  todays_uploads: number;
  highest_similarity_today: number | null;
};

// ── Filters ──
export type ArtworkFilters = {
  status: string;
  blockchain_status: string;
  similarity_status: string;
  visibility: string;
  archived: string;
  has_reports: string;
  has_similarity_scan: string;
  high_similarity: string;
  has_blockchain: string;
  has_evidence: string;
  genre: string;
  owner: string;
  date_from: string;
  date_to: string;
  sort_by: ArtworkSortOption;
};

// ── Query Params ──
export type ArtworksQueryParams = {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  blockchain_status?: string;
  similarity_status?: string;
  visibility?: string;
  archived?: string;
  has_reports?: string;
  has_similarity_scan?: string;
  high_similarity?: string;
  has_blockchain?: string;
  has_evidence?: string;
  genre?: string;
  owner?: string;
  date_from?: string;
  date_to?: string;
  sort_by: ArtworkSortOption;
  sort_order: "asc" | "desc";
};

// ── Paginated Response ──
export type PaginatedArtworksResponse = {
  items: ArtworkListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ── Admin Action Result ──
export type AdminActionResult =
  | { success: true; message: string }
  | { success: false; message: string };

// ── Config ──
export const SIMILARITY_THRESHOLD = 75;
export const MULTIPLE_MATCHES_THRESHOLD = 3;

// ── Status Labels ──
export const ARTWORK_STATUS_LABELS: Record<string, string> = {
  pending_blockchain: "Pending Blockchain",
  active: "Active",
  flagged: "Flagged",
  under_review: "Under Review",
  removed: "Removed",
  blockchain_failed: "Blockchain Failed",
  revoked: "Revoked",
};

export const ARTWORK_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
  pending_blockchain: {
    label: "Pending Blockchain",
    color: "text-yellow-600",
    bg: "bg-yellow-100",
    border: "border-yellow-200/50",
    dot: "bg-yellow-500",
  },
  active: {
    label: "Active",
    color: "text-green-600",
    bg: "bg-green-100",
    border: "border-green-200/50",
    dot: "bg-green-500",
  },
  flagged: {
    label: "Flagged",
    color: "text-orange-600",
    bg: "bg-orange-100",
    border: "border-orange-200/50",
    dot: "bg-orange-500",
  },
  under_review: {
    label: "Under Review",
    color: "text-blue-600",
    bg: "bg-blue-100",
    border: "border-blue-200/50",
    dot: "bg-blue-500",
  },
  removed: {
    label: "Removed",
    color: "text-red-700",
    bg: "bg-red-100",
    border: "border-red-300/50",
    dot: "bg-red-600",
  },
  blockchain_failed: {
    label: "Blockchain Failed",
    color: "text-red-600",
    bg: "bg-red-100",
    border: "border-red-200/50",
    dot: "bg-red-500",
  },
  revoked: {
    label: "Revoked",
    color: "text-purple-600",
    bg: "bg-purple-100",
    border: "border-purple-200/50",
    dot: "bg-purple-500",
  },
};

export const BLOCKCHAIN_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  registered: { label: "Registered", color: "text-green-600", bg: "bg-green-100" },
  pending: { label: "Pending", color: "text-yellow-600", bg: "bg-yellow-100" },
  failed: { label: "Failed", color: "text-red-600", bg: "bg-red-100" },
  none: { label: "Not Registered", color: "text-gray-600", bg: "bg-gray-100" },
};

export const VISIBILITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  public: { label: "Public", color: "text-green-600", bg: "bg-green-100" },
  private: { label: "Private", color: "text-gray-600", bg: "bg-gray-100" },
  unlisted: { label: "Unlisted", color: "text-blue-600", bg: "bg-blue-100" },
};

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "alphabetical", label: "Alphabetical" },
  { value: "highest_similarity", label: "Highest Similarity" },
  { value: "most_reported", label: "Most Reported" },
  { value: "most_upvoted", label: "Most Upvoted" },
] as const;

export const DEFAULT_FILTERS: ArtworkFilters = {
  status: "all",
  blockchain_status: "all",
  similarity_status: "all",
  visibility: "all",
  archived: "all",
  has_reports: "all",
  has_similarity_scan: "all",
  high_similarity: "all",
  has_blockchain: "all",
  has_evidence: "all",
  genre: "",
  owner: "",
  date_from: "",
  date_to: "",
  sort_by: "newest",
};