"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type ColumnDef,
  type OnChangeFn,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  MessageSquare,
  Gavel,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatTimeAgo } from "@/lib/client-utils";
import { ReportStatusBadge } from "./ReportStatusBadge";
import { ReportActionsDropdown } from "./ReportActionsDropdown";
import { EmptyReports } from "./EmptyReports";
import type { AdminReportListItem, ReportStatus } from "@/features/reports/types";
import { REPORT_TYPE_LABELS } from "@/features/reports/types";

interface ReportsTableProps {
  reports: AdminReportListItem[];
  total: number;
  totalPages: number;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onViewReport: (id: string) => void;
  onAssign: (id: string) => void;
  onWarnUser: (id: string) => void;
  onSuspendUser: (id: string) => void;
  onBanUser: (id: string) => void;
  isLoading: boolean;
}

export function ReportsTable({
  reports,
  total,
  totalPages,
  page,
  perPage,
  onPageChange,
  onPerPageChange,
  onViewReport,
  onAssign,
  onWarnUser,
  onSuspendUser,
  onBanUser,
  isLoading,
}: ReportsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const columns = useMemo<ColumnDef<AdminReportListItem>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        size: 40,
      },
      {
        id: "artwork",
        header: "Reported Artwork",
        accessorFn: (row) => row.reported_art_post?.registered_arts?.title ?? "Unknown",
        cell: ({ row }) => {
          const art = row.original.reported_art_post?.registered_arts;
          return (
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                {art?.c_secure_url ? (
                  <Image
                    src={art.c_secure_url}
                    alt={art.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {art?.title ?? "Unknown Artwork"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {row.original.id.substring(0, 8)}...
                </p>
              </div>
            </div>
          );
        },
        enableSorting: true,
      },
      {
        id: "reporter",
        header: "Reporter",
        accessorFn: (row) => `${row.reporter.first_name} ${row.reporter.last_name ?? ""}`,
        cell: ({ row }) => {
          const r = row.original.reporter;
          const initial = (r.first_name?.charAt(0) ?? "?").toUpperCase();
          return (
            <div className="flex items-center gap-2">
              <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-muted">
                {r.c_profile_image ? (
                  <Image
                    src={r.c_profile_image}
                    alt={r.username}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-muted-foreground">
                    {initial}
                  </div>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {r.first_name} {r.last_name ?? ""}
              </span>
            </div>
          );
        },
        enableSorting: false,
      },
      {
        id: "type",
        header: "Category",
        accessorKey: "report_type",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs capitalize">
            {REPORT_TYPE_LABELS[row.original.report_type] ?? row.original.report_type}
          </Badge>
        ),
        enableSorting: true,
      },
      {
        id: "status",
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => (
          <ReportStatusBadge status={row.original.status as ReportStatus} />
        ),
        enableSorting: true,
      },
      {
        id: "meta",
        header: "Info",
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex items-center gap-2">
              {r.evidence_count > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground" title="Evidence">
                  <ImageIcon className="h-3 w-3" />
                  {r.evidence_count}
                </span>
              )}
              {r.comment_count > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground" title="Comments">
                  <MessageSquare className="h-3 w-3" />
                  {r.comment_count}
                </span>
              )}
              {r.has_decision && (
                <Gavel className="h-3 w-3 text-green-500" aria-label="Decision made" />
              )}
            </div>
          );
        },
        enableSorting: false,
      },
      {
        id: "created_at",
        header: "Created",
        accessorKey: "created_at",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {formatTimeAgo(row.original.created_at)}
          </span>
        ),
        enableSorting: true,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <ReportActionsDropdown
              reportId={row.original.id}
              onView={onViewReport}
              onAssign={onAssign}
              onWarnUser={onWarnUser}
              onSuspendUser={onSuspendUser}
              onBanUser={onBanUser}
            />
          </div>
        ),
        enableSorting: false,
        size: 60,
      },
    ],
    [onViewReport, onAssign, onWarnUser, onSuspendUser, onBanUser]
  );

  const table = useReactTable({
    data: reports,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting as OnChangeFn<SortingState>,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    rowCount: total,
  });

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border bg-muted/30">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-medium text-muted-foreground",
                      header.column.getCanSort() && "cursor-pointer select-none"
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ width: header.getSize() }}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: " ↑",
                        desc: " ↓",
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                    <span className="text-sm text-muted-foreground">Loading reports...</span>
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16">
                  <EmptyReports variant="no-results" />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border transition-colors hover:bg-muted/50 cursor-pointer"
                  onClick={() => onViewReport(row.original.id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3"
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Select
              value={String(perPage)}
              onValueChange={(v) => {
                onPerPageChange(Number(v));
                onPageChange(1);
              }}
            >
              <SelectTrigger className="h-8 w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}