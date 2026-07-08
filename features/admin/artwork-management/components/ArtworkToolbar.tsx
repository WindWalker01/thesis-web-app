"use client";

import { Search, RefreshCw, Download, Filter, MoreHorizontal, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/client-utils";

interface ArtworkToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  onToggleFilters: () => void;
  filtersOpen: boolean;
  isLoading: boolean;
  totalCount: number;
  selectedCount: number;
  onBulkAction: (action: string) => void;
}

export function ArtworkToolbar({
  search,
  onSearchChange,
  onRefresh,
  onExport,
  onToggleFilters,
  filtersOpen,
  isLoading,
  totalCount,
  selectedCount,
  onBulkAction,
}: ArtworkToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by title, artist, username, ID, hash..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 text-sm"
          aria-label="Search artworks"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Refresh */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="gap-2"
          aria-label="Refresh artworks"
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>

        {/* Export */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2" aria-label="Export artworks">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel>Export Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onExport}>
              Export as CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Bulk Actions */}
        {selectedCount > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="gap-2">
                <MoreHorizontal className="h-4 w-4" />
                Bulk ({selectedCount})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onBulkAction("archive")}>
                Archive Selected
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkAction("hide")}>
                Hide Selected
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkAction("approve")}>
                Approve Selected
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBulkAction("mark_review")}>
                Flag for Review
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onBulkAction("delete")}
                className="text-destructive"
              >
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Filters Toggle */}
        <Button
          variant={filtersOpen ? "default" : "outline"}
          size="sm"
          onClick={onToggleFilters}
          className="gap-2"
          aria-label="Toggle filters"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
        </Button>
      </div>

      {/* Total count */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
        <ImageIcon className="h-3.5 w-3.5" />
        <span>{totalCount} artwork{totalCount !== 1 ? "s" : ""}</span>
      </div>
    </div>
  );
}