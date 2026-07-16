"use client";

import { useState } from "react";
import Image from "next/image";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ImageIcon, User } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, cn } from "@/lib/client-utils";
import { ArtworkStatusBadge, NeedsReviewBadge } from "./ArtworkStatusBadge";
import { ArtworkActions } from "./ArtworkActions";
import type { ArtworkListItem } from "../types";

interface ArtworkTableProps {
  artworks: ArtworkListItem[];
  total: number;
  totalPages: number;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onViewArtwork: (id: string) => void;
  onArchive?: (id: string) => void;
  onHide?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  isLoading: boolean;
}

export function ArtworkTable({
  artworks,
  total,
  totalPages,
  page,
  perPage,
  onPageChange,
  onPerPageChange,
  onViewArtwork,
  onArchive,
  onHide,
  onDelete,
  onSelectionChange,
  isLoading,
}: ArtworkTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const columns: ColumnDef<ArtworkListItem>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            onSelectionChange?.(
              value
                ? artworks.map((a) => a.id)
                : []
            );
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            const selected = Object.keys(rowSelection);
            if (value) {
              onSelectionChange?.([...selected, row.original.id]);
            } else {
              onSelectionChange?.(selected.filter((id) => id !== row.original.id));
            }
          }}
          aria-label={`Select ${row.original.title}`}
        />
      ),
      enableSorting: false,
      size: 40,
    },
    {
      id: "thumbnail",
      header: "",
      cell: ({ row }) => {
        const url = row.original.c_secure_url;
        return (
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
            {url ? (
              <Image
                src={url}
                alt={row.original.title}
                fill
                className="object-cover"
                sizes="40px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        );
      },
      enableSorting: false,
      size: 48,
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="min-w-0 max-w-[200px]">
          <button
            onClick={() => onViewArtwork(row.original.id)}
            className="truncate text-sm font-medium hover:text-primary transition-colors text-left"
          >
            {row.original.title}
          </button>
          {row.original.needs_review && (
            <NeedsReviewBadge className="mt-1" />
          )}
        </div>
      ),
    },
    {
      id: "artist",
      header: "Artist",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full bg-muted">
            {row.original.owner.c_profile_image ? (
              <Image
                src={row.original.owner.c_profile_image}
                alt={row.original.owner.username}
                fill
                className="object-cover"
                sizes="24px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-3 w-3 text-muted-foreground" />
              </div>
            )}
          </div>
          <span className="truncate text-sm text-muted-foreground">
            {row.original.owner.username}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      id: "genres",
      header: "Genres",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.genres.slice(0, 2).map((genre) => (
            <Badge key={genre.id} variant="secondary" className="text-[10px] px-1.5 py-0">
              {genre.name}
            </Badge>
          ))}
          {row.original.genres.length > 2 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              +{row.original.genres.length - 2}
            </Badge>
          )}
        </div>
      ),
      enableSorting: false,
    },
    {
      id: "visibility",
      header: "Visibility",
      cell: ({ row }) => {
        const visibility = row.original.art_post?.visibility ?? "—";
        return <ArtworkStatusBadge status={visibility} type="visibility" />;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <ArtworkStatusBadge status={row.original.status} />,
    },
    {
      id: "blockchain",
      header: "Blockchain",
      cell: ({ row }) => {
        const hasBlockchain = !!(row.original.scan?.success && row.original.status === "active");
        const status = hasBlockchain ? "registered" : row.original.status === "pending_blockchain" ? "pending" : "none";
        return <ArtworkStatusBadge status={status} type="blockchain" />;
      },
    },
    {
      id: "similarity",
      header: "Similarity",
      cell: ({ row }) => {
        const sim = row.original.scan?.best_similarity_percentage;
        if (sim === null || sim === undefined) return <span className="text-xs text-muted-foreground">—</span>;
        const color = sim >= 75 ? "text-red-600" : sim >= 50 ? "text-orange-600" : "text-green-600";
        return <span className={cn("text-sm font-medium", color)}>{sim}%</span>;
      },
    },
    {
      id: "reports",
      header: "Reports",
      cell: ({ row }) => {
        const count = row.original.report_count;
        if (count === 0) return <span className="text-xs text-muted-foreground">—</span>;
        return (
          <Badge variant="destructive" className="text-xs">
            {count}
          </Badge>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDate(row.original.created_at)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <ArtworkActions
          artworkId={row.original.id}
          txHash={row.original.scan?.id}
          onViewDetail={() => onViewArtwork(row.original.id)}
          onArchive={onArchive ? () => onArchive(row.original.id) : undefined}
          onHide={onHide ? () => onHide(row.original.id) : undefined}
          onDelete={onDelete ? () => onDelete(row.original.id) : undefined}
        />
      ),
      enableSorting: false,
      size: 48,
    },
  ];

  const table = useReactTable({
    data: artworks,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  const startItem = (page - 1) * perPage + 1;
  const endItem = Math.min(page * perPage, total);

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      "px-3 py-3 text-left text-xs font-medium text-muted-foreground",
                      header.column.getCanSort() && "cursor-pointer select-none hover:text-foreground"
                    )}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: <ChevronUp className="h-3 w-3" />,
                        desc: <ChevronDown className="h-3 w-3" />,
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b last:border-0 transition-colors",
                  row.getIsSelected() ? "bg-primary/5" : "hover:bg-accent/50"
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-3 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty state */}
        {artworks.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ImageIcon className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No artworks found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>
              {startItem}–{endItem} of {total}
            </span>
            <Select
              value={String(perPage)}
              onValueChange={(v) => {
                onPerPageChange(Number(v));
                onPageChange(1);
              }}
            >
              <SelectTrigger className="h-7 w-16 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((n) => (
                  <SelectItem key={n} value={String(n)} className="text-xs">
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>per page</span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="h-7 text-xs"
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              if (pageNum > totalPages) return null;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className="h-7 w-7 p-0 text-xs"
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="h-7 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}