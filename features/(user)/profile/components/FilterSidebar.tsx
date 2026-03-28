import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Filter } from "lucide-react";

import type { Artwork, Category, HashStatus, OwnershipStatus } from "../types";
import { Dropdown } from "./Dropdown";

type Props = {
    open: boolean;
    artworks: Artwork[];
    categories: Category[];
    selectedCategory: string | null;
    selectedStatus: OwnershipStatus | null;
    selectedHash: HashStatus | null;
    activeFiltersCount: number;
    catOpen: boolean;
    statusOpen: boolean;
    hashOpen: boolean;
    onCategoryChange: (value: string | null) => void;
    onStatusChange: (value: OwnershipStatus | null) => void;
    onHashChange: (value: HashStatus | null) => void;
    onToggleCat: () => void;
    onToggleStatus: () => void;
    onToggleHash: () => void;
    onClearAll: () => void;
};

export function FilterSidebar({
    open,
    artworks,
    categories,
    selectedCategory,
    selectedStatus,
    selectedHash,
    activeFiltersCount,
    catOpen,
    statusOpen,
    hashOpen,
    onCategoryChange,
    onStatusChange,
    onHashChange,
    onToggleCat,
    onToggleStatus,
    onToggleHash,
    onClearAll,
}: Props) {
    return (
        <AnimatePresence initial={false}>
            {open && (
                <motion.aside
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 220, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.04, 0.62, 0.23, 0.98] }}
                    className="shrink-0 sticky top-20 overflow-hidden"
                >
                    <div className="w-55 bg-card border border-border rounded-2xl overflow-hidden">

                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                            <div className="flex items-center gap-2">
                                <Filter className="w-3.5 h-3.5 text-primary" />
                                <span className="text-xs font-black uppercase tracking-widest">Filters</span>
                            </div>
                            {activeFiltersCount > 0 && (
                                <button
                                    onClick={onClearAll}
                                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors font-medium"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* Category */}
                        <Dropdown label="Category" open={catOpen} onToggle={onToggleCat}>
                            <div className="space-y-0.5 pt-1">
                                <FilterButton
                                    active={!selectedCategory}
                                    onClick={() => onCategoryChange(null)}
                                    icon={<div className="w-5 h-5 rounded bg-linear-to-br from-blue-400 to-orange-400 shrink-0" />}
                                    label="All Categories"
                                />
                                {categories.map((cat) => (
                                    <FilterButton
                                        key={cat.label}
                                        active={selectedCategory === cat.label}
                                        onClick={() => onCategoryChange(selectedCategory === cat.label ? null : cat.label)}
                                        icon={
                                            <div className="w-5 h-5 rounded overflow-hidden shrink-0 relative">
                                                <Image src={cat.img} alt={cat.label} fill className="object-cover" />
                                            </div>
                                        }
                                        label={cat.label}
                                        count={artworks.filter((a) => a.category === cat.label).length}
                                    />
                                ))}
                            </div>
                        </Dropdown>

                        {/* Ownership Status */}
                        <Dropdown label="Ownership" open={statusOpen} onToggle={onToggleStatus}>
                            <div className="space-y-0.5 pt-1">
                                {[
                                    { value: null, label: "All", dot: "bg-slate-400" },
                                    { value: "verified", label: "Verified", dot: "bg-green-500" },
                                    { value: "pending", label: "Pending", dot: "bg-orange-400" },
                                ].map((opt) => (
                                    <FilterButton
                                        key={opt.label}
                                        active={selectedStatus === opt.value}
                                        onClick={() => onStatusChange(opt.value as OwnershipStatus | null)}
                                        icon={<div className={`w-2 h-2 rounded-full ${opt.dot} shrink-0`} />}
                                        label={opt.label}
                                        count={
                                            opt.value === null
                                                ? artworks.length
                                                : artworks.filter((a) => a.ownershipStatus === opt.value).length
                                        }
                                    />
                                ))}
                            </div>
                        </Dropdown>

                        {/* Hash Status */}
                        <Dropdown label="Hash Status" open={hashOpen} onToggle={onToggleHash}>
                            <div className="space-y-0.5 pt-1">
                                {[
                                    { value: null, label: "All", dot: "bg-slate-400" },
                                    { value: "complete", label: "Complete", dot: "bg-blue-500" },
                                    { value: "processing", label: "Processing", dot: "bg-purple-400" },
                                ].map((opt) => (
                                    <FilterButton
                                        key={opt.label}
                                        active={selectedHash === opt.value}
                                        onClick={() => onHashChange(opt.value as HashStatus | null)}
                                        icon={<div className={`w-2 h-2 rounded-full ${opt.dot} shrink-0`} />}
                                        label={opt.label}
                                    />
                                ))}
                            </div>
                        </Dropdown>

                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
}

/* ── Shared filter row button ── */
type FilterButtonProps = {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    count?: number;
};

function FilterButton({ active, onClick, icon, label, count }: FilterButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs font-medium transition-colors
        ${active
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
        >
            {icon}
            <span className="truncate">{label}</span>
            {count !== undefined && (
                <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">{count}</span>
            )}
        </button>
    );
}