// ============================================
// Admin Dashboard - Types
// ============================================

export type AdminDashboardStats = {
  totalUsers: number;
  verifiedArtists: number;
  totalArtworks: number;
  pendingReports: number;
  resolvedReports: number;
  blockchainRegistrations: number;
  detectedSimilarities: number;
  totalUpvotes: number;
};

export type ChartDataPoint = {
  date: string;
  count: number;
};

export type ReportStatusData = {
  name: string;
  value: number;
  color: string;
};

export type CategoryData = {
  name: string;
  count: number;
};

export type EngagementData = {
  date: string;
  upvotes: number;
};

export type AdminDashboardCharts = {
  artworkUploads: ChartDataPoint[];
  newUsers: ChartDataPoint[];
  reportStatuses: ReportStatusData[];
  artworkCategories: CategoryData[];
  dailyEngagement: EngagementData[];
};

export type ActivityItem = {
  id: string;
  type: "upload" | "report" | "blockchain" | "admin" | "verify" | "system";
  user: {
    name: string;
    avatar: string | null;
  } | null;
  description: string;
  timestamp: string;
  link: string | null;
};

export type RecentReport = {
  id: string;
  title: string;
  reporter: {
    name: string;
    avatar: string | null;
  };
  status: string;
  report_type: string;
  created_at: string;
};

export type LatestArtwork = {
  id: string;
  title: string;
  thumbnail: string | null;
  artist: string;
  artist_id: string;
  category: string | null;
  created_at: string;
  blockchain_status: string;
};

export type TopArtist = {
  id: string;
  username: string;
  full_name: string;
  avatar: string | null;
  artwork_count: number;
  total_upvotes: number;
  is_verified: boolean;
};

export type MostReportedArtwork = {
  art_post_id: string;
  artwork_title: string;
  thumbnail: string | null;
  report_count: number;
  top_reason: string;
  current_status: string;
};

export type AdminNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type SystemServiceStatus = {
  name: string;
  status: "healthy" | "warning" | "offline";
  endpoint: string;
};

export type AdminDashboardData = {
  stats: AdminDashboardStats;
  charts: AdminDashboardCharts;
  recentActivity: ActivityItem[];
  recentReports: RecentReport[];
  latestArtworks: LatestArtwork[];
  leaderboard: TopArtist[];
  mostReported: MostReportedArtwork[];
  notifications: AdminNotification[];
  systemHealth: SystemServiceStatus[];
};

export type AdminDashboardResult =
  | { success: true; data: AdminDashboardData }
  | { success: false; message: string };