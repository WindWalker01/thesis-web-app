"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
  ShieldCheck,
  MoreHorizontal,
  Eye,
  UserPlus,
  UserX,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatTimeAgo } from "@/lib/client-utils";
import { ReviewStatusBadge } from "./ReviewStatusBadge";
import { RiskBadge } from "./RiskBadge";
import { EmptyReviews } from "./EmptyReviews";
import type { ReviewQueueItem, ReviewStatus } from "../types";

interface ReviewQueueTableProps {
  reviews: ReviewQueueItem[];
  total: number;
  totalPages: number;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onViewReview: (id: string) => void;
  onAssign: (id: string) => void;
  onUnassign: (id: string) => void;
  isLoading: boolean;
  onClearFilters?: () => void;
}

export function ReviewQueueTable({
  reviews,
  total,
  totalPages,
  page,
  perPage,
  onPageChange,
  onPerPageChange,
  onViewReview,
  onAssign,
  onUnassign,
  isLoading,
  onClearFilters,
}: ReviewQueueTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const columns = useMemo<ColumnDef<ReviewQueueItem>[]>(
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
        header: "Artwork",
        accessorFn: (row) => row.artwork.title,
        cell: ({ row }) => {
          const art = row.original.artwork;
          return (
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                {art.c_secure_url ? (
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
                <p className="truncate text-sm font-medium max-w-[180px]">
                  {art.title}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {art.owner.first_name} {art.owner.last_name}
                </p>
              </div>
            </div>
          );
        },
        enableSorting: true,
      },
      {
        id: "uploaded",
        header: "Uploaded",
        accessorKey: "created_at",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {formatTimeAgo(row.original.created_at)}
          </span>
        ),
        enableSorting: true,
      },
      {
        id: "similarity",
        header: "Similarity",
        accessorFn: (row) => row.scan?.best_similarity_percentage ?? 0,
        cell: ({ row }) => {
          const sim: number | null = row.original.scan?.best_similarity_percentage ?? null;
          return (
            <span className="text-sm font-semibold tabular-nums">
              {sim !== null ? `${sim.toFixed(1)}%` : "N/A"}
            </span>
          );
        },
        enableSorting: true,
      },
      {
        id: "risk",
        header: "Risk Level",
        cell: ({ row }) => (
          <RiskBadge similarity={row.original.scan?.best_similarity_percentage ?? null} />
        ),
        enableSorting: false,
      },
      {
        id: "source",
        header: "Best Match Source",
        accessorFn: (row) => row.scan?.best_source ?? "None",
        cell: ({ row }) => {
          const source = row.original.scan?.best_source;
          return (
            <span className="text-sm text-muted-foreground capitalize">
              {source ?? "No source"}
            </span>
          );
        },
        enableSorting: false,
      },
      {
        id: "status",
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => (
          <ReviewStatusBadge status={row.original.status as ReviewStatus} />
        ),
        enableSorting: true,
      },
      {
        id: "reviewer",
        header: "Reviewer",
        cell: ({ row }) => {
          const reviewer = row.original.reviewer;
          return (
            <span className="text-sm text-muted-foreground">
              {reviewer
                ? `${reviewer.first_name} ${reviewer.last_name}`
                : "—"}
            </span>
          );
        },
        enableSorting: false,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const reviewId = row.original.id;
          const hasReviewer = !!row.original.reviewer;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onViewReview(reviewId)}>
                  <Eye className="mr-2 h-4 w-4" /> Review
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {hasReviewer ? (
                  <DropdownMenuItem onClick={() => onUnassign(reviewId)}>
                    <UserX className="mr-2 h-4 w-4" /> Unassign
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onAssign(reviewId)}>
                    <UserPlus className="mr-2 h-4 w-4" /> Assign to Me
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableSorting: false,
        size: 60,
      },
    ],
    [onViewReview, onAssign, onUnassign]
  );

  const table = useReactTable({
    data: reviews,
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
                    <span className="text-sm text-muted-foreground">Loading reviews...</span>
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16">
                  <EmptyReviews
                    variant={page === 1 ? "no-pending" : "no-results"}
                    onClearFilters={onClearFilters}
                  />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border transition-colors hover:bg-muted/50 cursor-pointer"
                  onClick={() => onViewReview(row.original.id)}
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