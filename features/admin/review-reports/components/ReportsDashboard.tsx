"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  FileText,
  MessageSquare,
  ImageIcon,
  Gavel,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { formatDate, formatTimeAgo } from "@/lib/client-utils";
import type {
  AdminReportListItem,
  ReportStatus,
  ReportType,
  PaginatedResponse,
} from "@/features/reports/types";

type SortField = "created_at" | "status" | "report_type" | "title";

const STATUS_CONFIG: Record<
  ReportStatus,
  { label: string; color: string; bg: string }
> = {
  pending_review: { label: "Pending for Review", color: "text-blue-600", bg: "bg-blue-100" },
  under_review: {
    label: "Under Review",
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
  resolved: {
    label: "Resolved",
    color: "text-green-600",
    bg: "bg-green-100",
  },
};

const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  plagiarism: "Plagiarism",
  repost: "Repost",
  tracing: "Tracing",
  commercial_use: "Commercial Use",
  counterfeit: "Counterfeit",
  ownership_dispute: "Ownership Dispute",
  other: "Other",
};

export default function ReportsDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [reports, setReports] = useState<AdminReportListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(() =>
    parseInt(searchParams.get("page") ?? "1")
  );
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get("status") ?? ""
  );
  const [typeFilter, setTypeFilter] = useState<string>(
    searchParams.get("reportType") ?? ""
  );
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [sortBy, setSortBy] = useState<SortField>(
    (searchParams.get("sortBy") as SortField) ?? "created_at"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") as "asc" | "desc") ?? "desc"
  );

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (statusFilter) params.set("status", statusFilter);
      if (typeFilter) params.set("reportType", typeFilter);
      if (search) params.set("search", search);
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);

      const response = await fetch(
        `/api/admin/reports?${params.toString()}`
      );
      const result = await response.json();

      if (result.success) {
        const data = result.data as PaginatedResponse<AdminReportListItem>;
        setReports(data.items);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, typeFilter, search, sortBy, sortOrder]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSearch = () => {
    setPage(1);
    fetchReports();
  };

  const toggleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Reports Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage and review all infringement reports
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-1 block">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="w-[180px]">
              <label className="text-sm font-medium mb-1 block">
                Status
              </label>
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="pending_review">Pending for Review</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-[180px]">
              <label className="text-sm font-medium mb-1 block">
                Report Type
              </label>
              <Select
                value={typeFilter}
                onValueChange={(v) => {
                  setTypeFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {Object.entries(REPORT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSearch} className="gap-2">
              <Filter className="h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Reports</CardTitle>
              <CardDescription>
                {total} report{total !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-lg font-medium">No reports found</p>
              <p className="text-muted-foreground text-sm">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                      <button
                        onClick={() => toggleSort("title")}
                        className="flex items-center gap-1 hover:text-foreground"
                      >
                        Title
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                      Reporter
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                      <button
                        onClick={() => toggleSort("report_type")}
                        className="flex items-center gap-1 hover:text-foreground"
                      >
                        Type
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                      <button
                        onClick={() => toggleSort("status")}
                        className="flex items-center gap-1 hover:text-foreground"
                      >
                        Status
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                      <button
                        onClick={() => toggleSort("created_at")}
                        className="flex items-center gap-1 hover:text-foreground"
                      >
                        Date
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">
                      Info
                    </th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => {
                    const statusCfg = STATUS_CONFIG[report.status];
                    return (
                      <tr
                        key={report.id}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/reports/${report.id}`}
                            className="font-medium hover:underline line-clamp-1"
                          >
                            {report.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                              {report.reporter.c_profile_image ? (
                                <img
                                  src={report.reporter.c_profile_image}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-xs font-medium">
                                  {report.reporter.first_name
                                    ?.charAt(0)
                                    ?.toUpperCase() ?? "?"}
                                </span>
                              )}
                            </div>
                            <span className="text-sm">
                              {report.reporter.first_name} {report.reporter.last_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm">
                            {REPORT_TYPE_LABELS[report.report_type] ??
                              report.report_type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="secondary"
                            className={`${statusCfg.bg} ${statusCfg.color} border-0`}
                          >
                            {statusCfg.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-muted-foreground">
                            {formatTimeAgo(report.created_at)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-3">
                            {report.evidence_count > 0 && (
                              <span
                                className="flex items-center gap-1 text-xs text-muted-foreground"
                                title="Evidence"
                              >
                                <ImageIcon className="h-3 w-3" />
                                {report.evidence_count}
                              </span>
                            )}
                            {report.comment_count > 0 && (
                              <span
                                className="flex items-center gap-1 text-xs text-muted-foreground"
                                title="Comments"
                              >
                                <MessageSquare className="h-3 w-3" />
                                {report.comment_count}
                              </span>
                            )}
                            {report.has_decision && (
                              <Gavel
                                className="h-3 w-3 text-green-500"
                                aria-label="Decision made"
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/admin/reports/${report.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, page - 2);
              const pageNum = start + i;
              if (pageNum > totalPages) return null;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}