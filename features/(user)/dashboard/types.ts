export type DashboardTimeRange = "24h" | "7d" | "1m" | "1y" | "max";

export type DashboardChartPoint = {
    label: string;
    votes: number;
};

export type DashboardTopPost = {
    id: string;
    title: string;
    category: string;
    upvotes: number;
    views: number;
    trend: "up" | "down";
    color: string;
    timeAgo: string;
};

export type DashboardActivityTone = "upvote" | "verified" | "issue" | "upload" | "default";

export type DashboardActivityItem = {
    id: string;
    text: string;
    time: string;
    tone: DashboardActivityTone;
};

export type DashboardStats = {
    totalArtworks: number;
    verified: number;
    totalUpvotes: number;
    openIssues: number;
};

export type DashboardEngagement = {
    totalUpvotes: string;
    totalViews: string;
    avgUpvotesPerPost: string;
    mostUpvotedTitle: string;
};

export type DashboardHeroStats = {
    artworks: string;
    verified: string;
    upvotes: string;
    phashCheck: string;
    cryptoHash: string;
};

export type DashboardData = {
    stats: DashboardStats;
    heroStats: DashboardHeroStats;
    chartData: Record<DashboardTimeRange, DashboardChartPoint[]>;
    topPosts: DashboardTopPost[];
    engagement: DashboardEngagement;
    recentActivity: DashboardActivityItem[];
    protectedArtworks: number;
};

export type DashboardResult =
    | { success: true; data: DashboardData }
    | { success: false; message: string };