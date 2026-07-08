"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import AdminDashboardPageSkeleton from "./page-skeleton";

// Lazy-load chart components for performance
const UploadChart = dynamic(
  () => import("./upload-chart").then((m) => ({ default: m.UploadChart })),
  { ssr: false }
);
const NewUsersChart = dynamic(
  () => import("./new-users-chart").then((m) => ({ default: m.NewUsersChart })),
  { ssr: false }
);
const ReportsChart = dynamic(
  () => import("./reports-chart").then((m) => ({ default: m.ReportsChart })),
  { ssr: false }
);
const CategoryChart = dynamic(
  () => import("./category-chart").then((m) => ({ default: m.CategoryChart })),
  { ssr: false }
);
const EngagementChart = dynamic(
  () => import("./engagement-chart").then((m) => ({ default: m.EngagementChart })),
  { ssr: false }
);

import { OverviewCards } from "./overview-cards";
import { ActivityFeed } from "./activity-feed";
import { RecentReportsTable } from "./recent-reports-table";
import { LatestArtworks } from "./latest-artworks";
import { Leaderboard } from "./leaderboard";
import { MostReportedArtworks } from "./most-reported-artworks";
import { AdminNotifications } from "./admin-notifications";
import { SystemHealth } from "./system-health";
import { QuickActions } from "./quick-actions";

export default function AdminDashboardPage() {
  const { dashboard, isLoading, error, refetch } = useAdminDashboard();

  // Loading state
  if (isLoading) {
    return <AdminDashboardPageSkeleton />;
  }

  // Error state
  if (error || !dashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="max-w-md text-center space-y-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="text-xl font-bold">Failed to Load Dashboard</h2>
          <p className="text-muted-foreground text-sm">
            {error ?? "An unexpected error occurred while loading the admin dashboard."}
          </p>
          <Button onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, Administrator
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{today}</p>
        </div>
      </div>

      <Separator />

      {/* Statistics Cards */}
      <OverviewCards stats={dashboard.stats} />

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-muted/60" />}>
          <UploadChart data={dashboard.charts.artworkUploads} />
        </Suspense>
        <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-muted/60" />}>
          <NewUsersChart data={dashboard.charts.newUsers} />
        </Suspense>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted/60" />}>
          <ReportsChart data={dashboard.charts.reportStatuses} />
        </Suspense>
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted/60" />}>
          <CategoryChart data={dashboard.charts.artworkCategories} />
        </Suspense>
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted/60" />}>
          <EngagementChart data={dashboard.charts.dailyEngagement} />
        </Suspense>
      </div>

      {/* Activity & Reports Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed activities={dashboard.recentActivity} />
        <RecentReportsTable reports={dashboard.recentReports} />
      </div>

      {/* Artworks, Leaderboard, Most Reported Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <LatestArtworks artworks={dashboard.latestArtworks} />
        </div>
        <div className="lg:col-span-1">
          <Leaderboard artists={dashboard.leaderboard} />
        </div>
        <div className="lg:col-span-1">
          <MostReportedArtworks artworks={dashboard.mostReported} />
        </div>
      </div>

      {/* Notifications & System Health Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminNotifications notifications={dashboard.notifications} />
        <SystemHealth services={dashboard.systemHealth} />
      </div>
    </div>
  );
}