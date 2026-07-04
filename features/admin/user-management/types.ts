// ============================================
// Admin User Management - Types
// ============================================

export type AccountStatus = "active" | "suspended" | "banned";
export type UserRole = "user" | "admin";

// ── User Row (for the table) ──

export type UserRow = {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  email: string | null;
  c_profile_image: string | null;
  role: UserRole;
  account_status: AccountStatus;
  is_verified: boolean;
  created_at: string;
  last_active: string;
  registered_artworks_count: number;
  public_posts_count: number;
  reports_filed_count: number;
  reports_against_count: number;
};

// ── Paginated Response ──

export type PaginatedUsersResponse = {
  success: true;
  data: UserRow[];
  totalCount: number;
  pageCount: number;
};

export type UsersErrorResponse = {
  success: false;
  message: string;
};

export type UsersResult = PaginatedUsersResponse | UsersErrorResponse;

// ── Filters ──

export type UserFilters = {
  role: UserRole | "all";
  account_status: AccountStatus | "all";
  is_verified: boolean | null;
  has_reports: boolean | null;
  has_uploaded_artwork: boolean | null;
  has_blockchain_registrations: boolean | null;
  date_from: string | null;
  date_to: string | null;
};

export type UserSortOption =
  | "newest"
  | "oldest"
  | "most_active"
  | "most_reported"
  | "alphabetical";

// ── User Detail ──

export type UserDetail = {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  email: string | null;
  bio: string | null;
  c_profile_image: string | null;
  role: UserRole;
  account_status: AccountStatus;
  is_verified: boolean;
  country: string | null;
  suspended_until: string | null;
  suspension_reason: string | null;
  last_active: string;
  is_online: boolean;
  created_at: string;
  updated_at: string;
  wallet_address: string | null;
  statistics: UserStatistics;
};

export type UserStatistics = {
  registered_artworks: number;
  public_posts: number;
  total_upvotes_received: number;
  reports_filed: number;
  reports_against: number;
  similarity_matches: number;
  blockchain_registrations: number;
  notifications_count: number;
};

// ── User Artwork (for drawer) ──

export type UserArtwork = {
  id: string;
  title: string;
  c_secure_url: string | null;
  visibility: string;
  similarity_score: number | null;
  created_at: string;
  status: string;
  tx_hash: string | null;
  work_id: string | null;
};

// ── User Report (for drawer) ──

export type UserReport = {
  id: string;
  report_type: string;
  title: string;
  status: string;
  assigned_admin: string | null;
  decision: string | null;
  created_at: string;
};

// ── User Blockchain Activity (for drawer) ──

export type UserBlockchainActivity = {
  id: string;
  artwork_title: string;
  artwork_id: string;
  tx_hash: string | null;
  chain: string | null;
  block_number: number | null;
  work_id: string | null;
  status: string;
  created_at: string;
  verification_status: string;
};

// ── User Timeline Event (for drawer) ──

export type TimelineEvent = {
  id: string;
  type: TimelineEventType;
  title: string;
  description: string | null;
  related_id: string | null;
  link: string | null;
  created_at: string;
};

export type TimelineEventType =
  | "account_created"
  | "artwork_uploaded"
  | "artwork_registered"
  | "report_filed"
  | "report_received"
  | "similarity_detected"
  | "blockchain_recorded"
  | "notification_received"
  | "admin_action";

// ── Related Records Counts ──

export type RelatedRecords = {
  registered_artworks: number;
  public_posts: number;
  comments: number;
  reactions: number;
  reports: number;
  similarity_scans: number;
  blockchain_transactions: number;
  notifications: number;
};

// ── Statistics Cards Data ──

export type UserManagementStats = {
  total_users: number;
  verified_artists: number;
  suspended_users: number;
  banned_users: number;
  new_users_this_month: number;
  artists_with_artwork: number;
  users_with_reports: number;
};

// ── Admin Action Types ──

export type AdminActionType =
  | "suspend_user"
  | "ban_user"
  | "reactivate_user"
  | "verify_artist"
  | "remove_verification"
  | "reset_password"
  | "send_notification"
  | "force_logout"
  | "delete_account";

export type NotificationType = "information" | "warning" | "announcement";

export type SendNotificationPayload = {
  recipient_ids: string[];
  type: NotificationType;
  title: string;
  message: string;
};

export type SuspendPayload = {
  user_id: string;
  reason: string;
  duration: "temporary" | "permanent";
  duration_days?: number;
  admin_notes?: string;
};

export type BanPayload = {
  user_id: string;
  reason: string;
  evidence?: string;
};

export type AdminActionResult =
  | { success: true; message: string }
  | { success: false; message: string };

// ── CSV Export ──

export type UserExportRow = {
  username: string;
  email: string;
  role: string;
  status: string;
  verified: string;
  registration_date: string;
  artwork_count: number;
  report_count: number;
};