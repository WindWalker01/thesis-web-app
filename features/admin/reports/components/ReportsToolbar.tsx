"use client";

import { Search, RefreshCw, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/client-utils";

interface ReportsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  onToggleFilters: () => void;
  filtersOpen: boolean;
  isLoading: boolean;
  totalCount: number;
}

export function ReportsToolbar({
  search,
  onSearchChange,
  onRefresh,
  onExport,
  onToggleFilters,
  filtersOpen,
  isLoading,
  totalCount,
}: ReportsToolbarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 w-56 pl-9 text-sm lg:w-80"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFilters}
          className={cn("gap-2", filtersOpen && "bg-accent")}
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExport}>
              Export as CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>
      </div>

      {totalCount > 0 && (
        <span className="text-sm text-muted-foreground">
          {totalCount} report{totalCount !== 1 ? "s" : ""} found
        </span>
      )}
    </div>
  );
}