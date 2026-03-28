import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowUpDown, ChevronDown, Grid3X3, LayoutList,
    Search, SlidersHorizontal, X,
} from "lucide-react";

import type { ViewMode } from "../types";

type Props = {
    searchQuery: string;
    sortBy: string;
    viewMode: ViewMode;
    sortOpen: boolean;
    sidebarOpen: boolean;
    resultCount: number;
    activeFiltersCount: number;
    sortOptions: readonly string[];
    onSearchChange: (v: string) => void;
    onSortChange: (v: string) => void;
    onViewModeChange: (v: ViewMode) => void;
    onSortOpenChange: (v: boolean) => void;
    onSidebarToggle: () => void;
};

export function ArtworkTopBar({
    searchQuery,
    sortBy,
    viewMode,
    sortOpen,
    sidebarOpen,
    resultCount,
    activeFiltersCount,
    sortOptions,
    onSearchChange,
    onSortChange,
    onViewModeChange,
    onSortOpenChange,
    onSidebarToggle,
}: Props) {
    return (
        <div className="flex items-center gap-3 mb-5 flex-wrap">

            {/* Sidebar filter toggle */}
            <button
                onClick={onSidebarToggle}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-all
          ${sidebarOpen
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "border-border hover:bg-muted"
                    }`}
            >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFiltersCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-black flex items-center justify-center">
                        {activeFiltersCount}
                    </span>
                )}
            </button>

            {/* Search */}
            <div className="flex-1 min-w-0 max-w-sm relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search artworks..."
                    className="w-full pl-9 pr-9 py-2 rounded-xl border border-border bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                />
                {searchQuery && (
                    <button
                        onClick={() => onSearchChange("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* Result count */}
            <span className="text-sm text-muted-foreground whitespace-nowrap hidden sm:block">
                {resultCount} items
            </span>

            <div className="flex-1" />

            {/* Sort dropdown */}
            <div className="relative">
                <button
                    onClick={() => onSortOpenChange(!sortOpen)}
                    onBlur={() => setTimeout(() => onSortOpenChange(false), 150)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border hover:bg-muted text-sm font-medium transition-all"
                >
                    <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="hidden sm:inline">{sortBy}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                    {sortOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.97 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-11 w-44 bg-background border border-border rounded-xl shadow-xl z-30 overflow-hidden"
                        >
                            {sortOptions.map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => { onSortChange(opt); onSortOpenChange(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                    ${sortBy === opt ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted"}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* View mode toggle */}
            <div className="flex items-center border border-border rounded-xl overflow-hidden">
                {(["grid", "list"] as ViewMode[]).map((mode) => {
                    const Icon = mode === "grid" ? Grid3X3 : LayoutList;
                    return (
                        <button
                            key={mode}
                            onClick={() => onViewModeChange(mode)}
                            className={`w-9 h-9 flex items-center justify-center transition-colors
                ${viewMode === mode
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted text-muted-foreground"
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                        </button>
                    );
                })}
            </div>

        </div>
    );
}