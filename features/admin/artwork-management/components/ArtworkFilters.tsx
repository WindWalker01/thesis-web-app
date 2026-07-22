"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ArtworkFilters as FilterState } from "../types";
import { SORT_OPTIONS } from "../types";

interface ArtworkFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClear: () => void;
}

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "pending_blockchain", label: "Pending Blockchain" },
  { value: "active", label: "Active" },
  { value: "flagged", label: "Flagged" },
  { value: "under_review", label: "Under Review" },
  { value: "removed", label: "Removed" },
  { value: "blockchain_failed", label: "Blockchain Failed" },
  { value: "revoked", label: "Revoked" },
];

const blockchainOptions = [
  { value: "all", label: "All" },
  { value: "registered", label: "Registered" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "none", label: "Not Registered" },
];

const similarityOptions = [
  { value: "all", label: "All Similarity" },
  { value: "high", label: "High (75%+)" },
  { value: "medium", label: "Medium (50-75%)" },
  { value: "low", label: "Low (<50%)" },
  { value: "none", label: "No Scan" },
];

const visibilityOptions = [
  { value: "all", label: "All Visibility" },
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
  { value: "unlisted", label: "Unlisted" },
];

const yesNoOptions = [
  { value: "all", label: "All" },
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

export function ArtworkFilters({ filters, onFiltersChange, onClear }: ArtworkFiltersProps) {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => key !== "sort_by" && value !== "" && value !== "all"
  );

  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Advanced Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClear} className="h-7 gap-1 text-xs">
            <X className="h-3 w-3" /> Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Artwork Status</label>
          <Select
            value={filters.status}
            onValueChange={(v) => updateFilter("status", v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Blockchain Status */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Blockchain Status</label>
          <Select
            value={filters.blockchain_status}
            onValueChange={(v) => updateFilter("blockchain_status", v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {blockchainOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Similarity */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Similarity Status</label>
          <Select
            value={filters.similarity_status}
            onValueChange={(v) => updateFilter("similarity_status", v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {similarityOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Visibility */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Visibility</label>
          <Select
            value={filters.visibility}
            onValueChange={(v) => updateFilter("visibility", v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {visibilityOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Sort By</label>
          <Select
            value={filters.sort_by}
            onValueChange={(v) => updateFilter("sort_by", v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Has Reports */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Has Reports</label>
          <Select
            value={filters.has_reports}
            onValueChange={(v) => updateFilter("has_reports", v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yesNoOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Has Blockchain */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Has Blockchain Record</label>
          <Select
            value={filters.has_blockchain}
            onValueChange={(v) => updateFilter("has_blockchain", v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yesNoOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Has Evidence */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Has Evidence</label>
          <Select
            value={filters.has_evidence}
            onValueChange={(v) => updateFilter("has_evidence", v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yesNoOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Archived */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Archived</label>
          <Select
            value={filters.archived}
            onValueChange={(v) => updateFilter("archived", v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yesNoOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* High Similarity */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">High Similarity (75%+)</label>
          <Select
            value={filters.high_similarity}
            onValueChange={(v) => updateFilter("high_similarity", v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yesNoOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Owner */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Owner</label>
          <Input
            placeholder="Search by owner..."
            value={filters.owner}
            onChange={(e) => updateFilter("owner", e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        {/* Genre */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Genre</label>
          <Input
            placeholder="e.g. digital, painting..."
            value={filters.genre}
            onChange={(e) => updateFilter("genre", e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        {/* Date From */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">From Date</label>
          <Input
            type="date"
            value={filters.date_from}
            onChange={(e) => updateFilter("date_from", e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        {/* Date To */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">To Date</label>
          <Input
            type="date"
            value={filters.date_to}
            onChange={(e) => updateFilter("date_to", e.target.value)}
            className="h-8 text-xs"
          />
        </div>
      </div>
    </div>
  );
}