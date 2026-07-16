"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ReviewFilters as FilterState } from "../types";

interface ReviewFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClear: () => void;
}

export function ReviewFilters({ filters, onFiltersChange, onClear }: ReviewFiltersProps) {
  return (
    <div className="border-b border-border bg-muted/30 px-4 py-3">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select
            value={filters.status}
            onValueChange={(v) => onFiltersChange({ ...filters, status: v })}
          >
            <SelectTrigger className="h-9 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="needs_info">Needs Info</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Similarity</Label>
          <Select
            value={filters.similarity}
            onValueChange={(v) => onFiltersChange({ ...filters, similarity: v })}
          >
            <SelectTrigger className="h-9 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="95+">{">"} 95%</SelectItem>
              <SelectItem value="90-95">90-95%</SelectItem>
              <SelectItem value="80-90">80-90%</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Date</Label>
          <Select
            value={filters.date}
            onValueChange={(v) => onFiltersChange({ ...filters, date: v })}
          >
            <SelectTrigger className="h-9 w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Source</Label>
          <Select
            value={filters.source}
            onValueChange={(v) => onFiltersChange({ ...filters, source: v })}
          >
            <SelectTrigger className="h-9 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="internal">Internal Match</SelectItem>
              <SelectItem value="external">External Web Match</SelectItem>
              <SelectItem value="none">No Source</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Sort</Label>
          <Select
            value={filters.sortBy}
            onValueChange={(v) => onFiltersChange({ ...filters, sortBy: v })}
          >
            <SelectTrigger className="h-9 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="highest_similarity">Highest Similarity</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="most_matches">Most Matches</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="ghost" size="sm" onClick={onClear} className="h-9 text-xs">
          Reset Filters
        </Button>
      </div>
    </div>
  );
}