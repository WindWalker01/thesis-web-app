"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useReports, useReportStatistics } from "../hooks/useReports";
import { useReportDetail } from "../hooks/useReportDetail";
import { ReportStatsCards } from "./ReportStatsCards";
import { ReportsToolbar } from "./ReportsToolbar";
import { ReportsFilters } from "./ReportsFilters";
import { ReportsTable } from "./ReportsTable";
import { ReportDrawer } from "./ReportDrawer";
import { AssignAdminDialog } from "./AssignAdminDialog";
import { WarnUserDialog } from "./WarnUserDialog";
import { SuspendUserDialog } from "./SuspendUserDialog";
import { BanUserDialog } from "./BanUserDialog";
import { ReportsPageSkeleton } from "./page-skeleton";
import { ReportsInfoBanner } from "./InfoBanner";
import { ReportsStatusDescription } from "./StatusDescription";
import type { ReportFilters as FilterState } from "../types";

const DEFAULT_FILTERS: FilterState = {
  status: "all",
  priority: "all",
  assignedAdmin: "",
  reporter: "",
  reportedUser: "",
  reportedArtwork: "",
  dateFrom: "",
  dateTo: "",
  sortBy: "newest",
};

export default function ReportsManagementPage() {
  const searchParams = useSearchParams();

  // Pagination state
  const [page, setPage] = useState(() => parseInt(searchParams.get("page") ?? "1"));
  const [perPage, setPerPage] = useState(20);

  // Search and filters
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    status: searchParams.get("status") ?? "all",
    sortBy: searchParams.get("sortBy") ?? "newest",
  });

  // Detail drawer
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Action dialogs
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignReportId, setAssignReportId] = useState("");
  const [warnDialogOpen, setWarnDialogOpen] = useState(false);
  const [warnReportId, setWarnReportId] = useState("");
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [suspendReportId, setSuspendReportId] = useState("");
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banReportId, setBanReportId] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Determine sort params for API
  const getSortParams = () => {
    switch (filters.sortBy) {
      case "oldest":
        return { sortBy: "created_at" as const, sortOrder: "asc" as const };
      case "status":
        return { sortBy: "status" as const, sortOrder: "desc" as const };
      case "priority":
        return { sortBy: "report_type" as const, sortOrder: "desc" as const };
      default:
        return { sortBy: "created_at" as const, sortOrder: "desc" as const };
    }
  };

  const sortParams = getSortParams();

  // Queries
  const {
    data: reportsData,
    isLoading: reportsLoading,
    error: reportsError,
    refetch: refetchReports,
  } = useReports({
    page,
    limit: perPage,
    search: debouncedSearch,
    status: filters.status !== "all" ? filters.status : undefined,
    reportType: filters.priority !== "all" ? filters.priority : undefined,
    ...sortParams,
  });

  const { data: stats, isLoading: statsLoading } = useReportStatistics();

  const {
    data: reportDetail,
    isLoading: detailLoading,
    error: detailError,
    refetch: refetchDetail,
  } = useReportDetail(drawerOpen ? selectedReportId : null);

  // Action loading states
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSendingComment, setIsSendingComment] = useState(false);

  // Handlers
  const openDrawer = useCallback((reportId: string) => {
    setSelectedReportId(reportId);
    setDrawerOpen(true);
  }, []);

  const handleRefresh = useCallback(() => {
    refetchReports();
    if (selectedReportId) refetchDetail();
  }, [refetchReports, refetchDetail, selectedReportId]);

  const handleUpdateStatus = useCallback(async (status: string, notes?: string) => {
    if (!selectedReportId) return;
    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/admin/reports/${selectedReportId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
      const result = await response.json();
      if (result.success) {
        await refetchDetail();
        await refetchReports();
      } else {
        toast.error(result.error?.message ?? "Failed to update report status");
      }
    } catch {
      toast.error("Failed to update report status");
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [selectedReportId, refetchDetail, refetchReports]);

  const handleAddComment = useCallback(async (message: string) => {
    if (!selectedReportId) return;
    setIsSendingComment(true);
    try {
      const response = await fetch(`/api/admin/reports/${selectedReportId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const result = await response.json();
      if (result.success) {
        await refetchDetail();
      }
    } finally {
      setIsSendingComment(false);
    }
  }, [selectedReportId, refetchDetail]);

  const handleUploadEvidence = useCallback(async (file: File, description?: string) => {
    if (!selectedReportId) return;
    const formData = new FormData();
    formData.append("file", file);
    if (description) {
      formData.append("description", description);
    }
    try {
      const response = await fetch(`/api/reports/${selectedReportId}/evidence`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Evidence uploaded successfully");
        await refetchDetail();
      } else {
        toast.error(result.error?.message ?? "Failed to upload evidence");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload evidence");
    }
  }, [selectedReportId, refetchDetail]);

  const handleAssign = useCallback(async (reportId: string, adminId: string) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_id: adminId }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Admin assigned successfully");
        await refetchReports();
      } else {
        toast.error(result.error?.message ?? "Failed to assign admin");
      }
    } catch {
      toast.error("Failed to assign admin");
    }
  }, [refetchReports]);

  const handleExport = useCallback(async () => {
    if (!reportsData) return;
    const headers = ["ID,Title,Type,Status,Reporter,Created"];
    const rows = reportsData.items.map((r) =>
      `"${r.id}","${r.title}","${r.report_type}","${r.status}","${r.reporter.first_name} ${r.reporter.last_name ?? ""}","${r.created_at}"`
    );
    const csv = [...headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `reports-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [reportsData]);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearch("");
    setPage(1);
  }, []);

  // Loading state
  if (reportsLoading && page === 1) {
    return <ReportsPageSkeleton />;
  }

  // Error state
  if (reportsError && !reportsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="max-w-md text-center space-y-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="text-xl font-bold">Failed to Load Reports</h2>
          <p className="text-muted-foreground text-sm">
            {reportsError instanceof Error ? reportsError.message : "An error occurred"}
          </p>
          <Button onClick={() => refetchReports()} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  const reports = reportsData?.items ?? [];
  const total = reportsData?.total ?? 0;
  const totalPages = reportsData?.totalPages ?? 0;

  return (
    <>
      {/* Top Bar */}
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold tracking-tight sm:text-xl">
            Reports Management
          </h1>
          {total > 0 && (
            <Badge variant="secondary" className="text-xs">
              {total} total
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4 lg:p-6 space-y-6">
        {/* Informational Banner */}
        <ReportsInfoBanner />

        {/* Status Description */}
        {filters.status !== "all" && (
          <ReportsStatusDescription status={filters.status} />
        )}

        {/* Statistics Cards */}
        <ReportStatsCards stats={stats} isLoading={statsLoading} />

        {/* Toolbar */}
        <ReportsToolbar
          search={search}
          onSearchChange={setSearch}
          onRefresh={() => refetchReports()}
          onExport={handleExport}
          onToggleFilters={() => setFiltersOpen(!filtersOpen)}
          filtersOpen={filtersOpen}
          isLoading={reportsLoading}
          totalCount={total}
        />

        {/* Filters Panel */}
        {filtersOpen && (
          <ReportsFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClear={clearFilters}
          />
        )}

        {/* Reports Table */}
        <ReportsTable
          reports={reports}
          total={total}
          totalPages={totalPages}
          page={page}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
          onViewReport={openDrawer}
          onAssign={(id) => {
            setAssignReportId(id);
            setAssignDialogOpen(true);
          }}
          onWarnUser={(id) => {
            setWarnReportId(id);
            setWarnDialogOpen(true);
          }}
          onSuspendUser={(id) => {
            setSuspendReportId(id);
            setSuspendDialogOpen(true);
          }}
          onBanUser={(id) => {
            setBanReportId(id);
            setBanDialogOpen(true);
          }}
          isLoading={reportsLoading}
        />

        {/* Report Detail Drawer */}
        <ReportDrawer
          open={drawerOpen}
          onOpenChange={(open) => {
            setDrawerOpen(open);
            if (!open) setSelectedReportId(null);
          }}
          detail={reportDetail}
          isLoading={detailLoading}
          error={detailError instanceof Error ? detailError.message : null}
          onUpdateStatus={handleUpdateStatus}
          onAddComment={handleAddComment}
          onUploadEvidence={handleUploadEvidence}
          isUpdatingStatus={isUpdatingStatus}
          isSendingComment={isSendingComment}
          onRefresh={() => refetchDetail()}
        />
      </div>

      {/* Assign Admin Dialog */}
      <AssignAdminDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        reportId={assignReportId}
        onAssign={handleAssign}
      />

      {/* Warn User Dialog */}
      <WarnUserDialog
        open={warnDialogOpen}
        onOpenChange={setWarnDialogOpen}
        reportId={warnReportId}
        onSuccess={handleRefresh}
      />

      {/* Suspend User Dialog */}
      <SuspendUserDialog
        open={suspendDialogOpen}
        onOpenChange={setSuspendDialogOpen}
        reportId={suspendReportId}
        onSuccess={handleRefresh}
      />

      {/* Ban User Dialog */}
      <BanUserDialog
        open={banDialogOpen}
        onOpenChange={setBanDialogOpen}
        reportId={banReportId}
        onSuccess={handleRefresh}
      />

    </>
  );
}