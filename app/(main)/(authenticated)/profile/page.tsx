"use client";

import Link from "next/link";
import Image from "next/image";
import NavBar from "@/components/blocks/navbar";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, ScanSearch, Upload, Edit, ExternalLink,
  Calendar, ImageIcon, Award, CheckCircle, AlertTriangle,
  Hash, Filter, ChevronDown, Grid3X3, LayoutList,
  Search, X, SlidersHorizontal, ArrowUpDown,
} from "lucide-react";

/* ── Types ── */
type OwnershipStatus = "verified" | "pending";
type HashStatus      = "complete" | "processing";
type ViewMode        = "grid" | "list";

interface Artwork {
  id: number;
  title: string;
  category: string;
  uploadDate: string;
  ownershipStatus: OwnershipStatus;
  hashStatus: HashStatus;
  color: string;
  img?: string;
}

/* ── Dummy data ── */
const PROFILE = {
  name:          "Nathaniel Pogi 123.",
  handle:        "@nath_so_ugly",
  bio:           "Digital artist specializing in concept art, sci-fi illustrations, and perceptual design. Protecting my creations with ArtForgeLab.",
  joinDate:      "January 2026",
  totalArtworks: 12,
  totalScans:    8,
  verifiedCount: 10,
  initials:      "NP",
};

const CATEGORIES = [
  { label: "Digital Paintings", img: "/landing-page-elements/starry-night.png"    },
  { label: "Photography",       img: "/landing-page-elements/photography.png"     },
  { label: "Illustrations",     img: "/landing-page-elements/digital-art.png"     },
  { label: "NFTs",              img: "/landing-page-elements/art.png"             },
  { label: "Graphic Designs",   img: "/landing-page-elements/graphic-design.png"  },
  { label: "AI Art",            img: "/landing-page-elements/ai-image.png"        },
];

const ARTWORKS: Artwork[] = [
  { id:1,  title:"Sunset Concept Art",  category:"Digital Paintings", uploadDate:"Jan 10, 2026", ownershipStatus:"verified", hashStatus:"complete",   color:"from-orange-400 to-red-500",     img:"/landing-page-elements/starry-night.png"   },
  { id:2,  title:"Cyber Samurai",       category:"Illustrations",     uploadDate:"Jan 8, 2026",  ownershipStatus:"verified", hashStatus:"complete",   color:"from-blue-500 to-purple-600",    img:"/landing-page-elements/digital-art.png"    },
  { id:3,  title:"Digital Bloom",       category:"Photography",       uploadDate:"Jan 5, 2026",  ownershipStatus:"pending",  hashStatus:"complete",   color:"from-green-400 to-teal-500",     img:"/landing-page-elements/photography.png"    },
  { id:4,  title:"Abstract Waves",      category:"AI Art",            uploadDate:"Dec 28, 2025", ownershipStatus:"verified", hashStatus:"complete",   color:"from-indigo-400 to-blue-500",    img:"/landing-page-elements/ai-image.png"       },
  { id:5,  title:"Neon Cityscape",      category:"Graphic Designs",   uploadDate:"Dec 20, 2025", ownershipStatus:"verified", hashStatus:"complete",   color:"from-pink-500 to-orange-400",    img:"/landing-page-elements/graphic-design.png" },
  { id:6,  title:"Forest Spirit",       category:"Digital Paintings", uploadDate:"Dec 15, 2025", ownershipStatus:"verified", hashStatus:"complete",   color:"from-emerald-400 to-green-600",  img:"/landing-page-elements/starry-night.png"   },
  { id:7,  title:"Mech Warrior",        category:"Illustrations",     uploadDate:"Dec 10, 2025", ownershipStatus:"verified", hashStatus:"complete",   color:"from-slate-500 to-blue-600",     img:"/landing-page-elements/digital-art.png"    },
  { id:8,  title:"Cosmos Dream",        category:"NFTs",              uploadDate:"Dec 5, 2025",  ownershipStatus:"pending",  hashStatus:"processing", color:"from-violet-500 to-indigo-600",  img:"/landing-page-elements/art.png"            },
  { id:9,  title:"Retro Wave",          category:"Graphic Designs",   uploadDate:"Nov 28, 2025", ownershipStatus:"verified", hashStatus:"complete",   color:"from-pink-400 to-purple-500",    img:"/landing-page-elements/graphic-design.png" },
  { id:10, title:"Ancient Rune",        category:"NFTs",              uploadDate:"Nov 20, 2025", ownershipStatus:"verified", hashStatus:"complete",   color:"from-amber-400 to-orange-500",   img:"/landing-page-elements/art.png"            },
  { id:11, title:"Tech Interface",      category:"AI Art",            uploadDate:"Nov 15, 2025", ownershipStatus:"verified", hashStatus:"complete",   color:"from-cyan-400 to-blue-500",      img:"/landing-page-elements/ai-image.png"       },
  { id:12, title:"Dream Garden",        category:"Photography",       uploadDate:"Nov 10, 2025", ownershipStatus:"pending",  hashStatus:"complete",   color:"from-rose-400 to-pink-500",      img:"/landing-page-elements/photography.png"    },
];

const SORT_OPTIONS = [
  "Recently Added",
  "Oldest First",
  "Name A–Z",
  "Name Z–A",
  "Verified First",
];

/* ── Chevron dropdown ── */
function Dropdown({
  label, open, onToggle, children,
}: { label: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-xs font-black uppercase tracking-widest hover:text-primary transition-colors"
      >
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProfilePage() {
  /* ── Filter state ── */
  const [searchQuery,       setSearchQuery]       = useState("");
  const [selectedCategory,  setSelectedCategory]  = useState<string | null>(null);
  const [selectedStatus,    setSelectedStatus]    = useState<string | null>(null);
  const [selectedHash,      setSelectedHash]      = useState<string | null>(null);
  const [sortBy,            setSortBy]            = useState(SORT_OPTIONS[0]);
  const [viewMode,          setViewMode]          = useState<ViewMode>("grid");
  const [sidebarOpen,       setSidebarOpen]       = useState(true);
  const [sortOpen,          setSortOpen]          = useState(false);

  /* ── Sidebar section open states ── */
  const [catOpen,    setCatOpen]    = useState(true);
  const [statusOpen, setStatusOpen] = useState(true);
  const [hashOpen,   setHashOpen]   = useState(false);

  /* ── Derived filtered + sorted list ── */
  const filtered = useMemo(() => {
    let list = [...ARTWORKS];

    if (searchQuery.trim())
      list = list.filter((a) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    if (selectedCategory)
      list = list.filter((a) => a.category === selectedCategory);
    if (selectedStatus)
      list = list.filter((a) => a.ownershipStatus === selectedStatus);
    if (selectedHash)
      list = list.filter((a) => a.hashStatus === selectedHash);

    switch (sortBy) {
      case "Oldest First":   list.sort((a, b) => a.id - b.id); break;
      case "Name A–Z":       list.sort((a, b) => a.title.localeCompare(b.title)); break;
      case "Name Z–A":       list.sort((a, b) => b.title.localeCompare(a.title)); break;
      case "Verified First": list.sort((a, b) => (a.ownershipStatus === "verified" ? -1 : 1)); break;
      default:               list.sort((a, b) => b.id - a.id);
    }
    return list;
  }, [searchQuery, selectedCategory, selectedStatus, selectedHash, sortBy]);

  const activeFiltersCount =
    (selectedCategory ? 1 : 0) + (selectedStatus ? 1 : 0) + (selectedHash ? 1 : 0);

  const clearAll = () => {
    setSelectedCategory(null);
    setSelectedStatus(null);
    setSelectedHash(null);
    setSearchQuery("");
  };

  return (
    <main className="min-h-screen bg-background font-display text-foreground overflow-x-hidden">
      <NavBar />
      <div className="h-1 w-full bg-linear-to-r from-blue-600 via-primary to-orange-400" />

      {/* ══════════════════════════════════════
          PROFILE BANNER — Magic Eden style header
      ══════════════════════════════════════ */}
      <div className="relative bg-slate-900 overflow-hidden">
        {/* Banner bg */}
        <div className="h-40 md:h-52 w-full bg-linear-to-r from-blue-950 via-slate-900 to-orange-950 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-linear(rgba(96,165,250,1) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-80 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-40 bg-orange-500/8 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Profile info row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-14 pb-6 flex flex-col md:flex-row md:items-end gap-5">

            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-linear-to-br from-blue-500 to-orange-500 flex items-center justify-center text-white text-3xl font-black shadow-[0_0_32px_rgba(59,130,246,0.4)] border-4 border-slate-900">
                {PROFILE.initials}
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center border-2 border-slate-900">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0 text-white pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl md:text-2xl font-black">{PROFILE.name}</h1>
                <span className="text-[10px] font-bold bg-green-500/15 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-2.5 h-2.5" /> Verified Artist
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-1">{PROFILE.handle}</p>
              <p className="text-xs text-slate-500 max-w-lg leading-relaxed hidden md:block">{PROFILE.bio}</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                <Calendar className="w-3 h-3" />
                <span>Joined {PROFILE.joinDate}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0 pb-1">
              <Link href="/profile/edit-profile">
                <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-[0_0_16px_rgba(59,130,246,0.3)]">
                  <Edit className="w-3.5 h-3.5" /> Edit Profile
                </button>
              </Link>
              <Link href="/upload-form">
                <button className="flex items-center gap-2 border border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                  <Upload className="w-3.5 h-3.5" /> Upload
                </button>
              </Link>
            </div>
          </div>

          {/* ── Stat strip — like ME's collection stats ── */}
          <div className="flex flex-wrap gap-0 border-t border-white/5 mb-0">
            {[
              { label: "Artworks",          value: PROFILE.totalArtworks, icon: ImageIcon,  color: "text-blue-400"   },
              { label: "Scans",             value: PROFILE.totalScans,    icon: ScanSearch, color: "text-orange-400" },
              { label: "Verified",          value: PROFILE.verifiedCount, icon: Award,      color: "text-green-400"  },
              { label: "Blockchain Proofs", value: PROFILE.verifiedCount, icon: Hash,       color: "text-purple-400" },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.label}
                  className={`flex items-center gap-3 px-6 py-4 ${i !== 0 ? "border-l border-white/5" : ""}`}>
                  <Icon className={`w-4 h-4 ${s.color} shrink-0`} />
                  <div>
                    <p className="text-lg font-black text-white">{s.value}</p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          MAIN CONTENT — sidebar + grid
      ══════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── Top bar ── */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">

          {/* Filter toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search artworks..."
              className="w-full pl-9 pr-9 py-2 rounded-xl border border-border bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Result count */}
          <span className="text-sm text-muted-foreground whitespace-nowrap hidden sm:block">
            {filtered.length} items
          </span>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              onBlur={() => setTimeout(() => setSortOpen(false), 150)}
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
                  animate={{ opacity: 1, y: 0,  scale: 1    }}
                  exit={{    opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-11 w-44 bg-background border border-border rounded-xl shadow-xl z-30 overflow-hidden"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <button key={opt} onClick={() => { setSortBy(opt); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                        ${sortBy === opt ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted"}`}>
                      {opt}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* View mode */}
          <div className="flex items-center border border-border rounded-xl overflow-hidden">
            {([
              { mode: "grid" as ViewMode, icon: Grid3X3  },
              { mode: "list" as ViewMode, icon: LayoutList },
            ] as { mode: ViewMode; icon: React.ElementType }[]).map(({ mode, icon: Icon }) => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={`w-9 h-9 flex items-center justify-center transition-colors
                  ${viewMode === mode ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}>
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Active filter chips */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedCategory && (
              <span className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                {selectedCategory}
                <button onClick={() => setSelectedCategory(null)} className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedStatus && (
              <span className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-orange-500/10 border border-orange-400/20 text-xs font-semibold text-orange-500">
                {selectedStatus === "verified" ? "Verified" : "Pending"}
                <button onClick={() => setSelectedStatus(null)} className="hover:bg-orange-400/20 rounded-full p-0.5 transition-colors"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedHash && (
              <span className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-purple-500/10 border border-purple-400/20 text-xs font-semibold text-purple-500">
                Hash: {selectedHash}
                <button onClick={() => setSelectedHash(null)} className="hover:bg-purple-400/20 rounded-full p-0.5 transition-colors"><X className="w-3 h-3" /></button>
              </span>
            )}
            <button onClick={clearAll}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2">
              Clear all
            </button>
          </div>
        )}

        {/* ── Two-column layout ── */}
        <div className="flex gap-5 items-start">

          {/* ══ SIDEBAR FILTER PANEL ══ */}
          <AnimatePresence initial={false}>
            {sidebarOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 220, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.04, 0.62, 0.23, 0.98] }}
                className="shrink-0 sticky top-20 overflow-hidden"
              >
                <div className="w-55 bg-card border border-border rounded-2xl overflow-hidden">

                  {/* Panel header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Filter className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-black uppercase tracking-widest">Filters</span>
                    </div>
                    {activeFiltersCount > 0 && (
                      <button onClick={clearAll} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors font-medium">
                        Clear
                      </button>
                    )}
                  </div>

                  {/* ── Category ── */}
                  <Dropdown label="Category" open={catOpen} onToggle={() => setCatOpen(!catOpen)}>
                    <div className="space-y-0.5 pt-1">
                      {/* All option */}
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs font-medium transition-colors
                          ${!selectedCategory ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}
                      >
                        <div className="w-5 h-5 rounded bg-linear-to-br from-blue-400 to-orange-400 shrink-0" />
                        All Categories
                      </button>
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.label}
                          onClick={() => setSelectedCategory(selectedCategory === cat.label ? null : cat.label)}
                          className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs font-medium transition-colors
                            ${selectedCategory === cat.label
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                        >
                          <div className="w-5 h-5 rounded overflow-hidden shrink-0 relative">
                            <Image src={cat.img} alt={cat.label} fill className="object-cover" />
                          </div>
                          <span className="truncate">{cat.label}</span>
                          <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">
                            {ARTWORKS.filter((a) => a.category === cat.label).length}
                          </span>
                        </button>
                      ))}
                    </div>
                  </Dropdown>

                  {/* ── Ownership Status ── */}
                  <Dropdown label="Ownership" open={statusOpen} onToggle={() => setStatusOpen(!statusOpen)}>
                    <div className="space-y-0.5 pt-1">
                      {[
                        { value: null,       label: "All",      dot: "bg-slate-400"  },
                        { value: "verified", label: "Verified", dot: "bg-green-500"  },
                        { value: "pending",  label: "Pending",  dot: "bg-orange-400" },
                      ].map((opt) => (
                        <button
                          key={opt.label}
                          onClick={() => setSelectedStatus(opt.value)}
                          className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs font-medium transition-colors
                            ${selectedStatus === opt.value
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${opt.dot} shrink-0`} />
                          {opt.label}
                          <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">
                            {opt.value === null
                              ? ARTWORKS.length
                              : ARTWORKS.filter((a) => a.ownershipStatus === opt.value).length
                            }
                          </span>
                        </button>
                      ))}
                    </div>
                  </Dropdown>

                  {/* ── Hash Status ── */}
                  <Dropdown label="Hash Status" open={hashOpen} onToggle={() => setHashOpen(!hashOpen)}>
                    <div className="space-y-0.5 pt-1">
                      {[
                        { value: null,         label: "All",        dot: "bg-slate-400"  },
                        { value: "complete",   label: "Complete",   dot: "bg-blue-500"   },
                        { value: "processing", label: "Processing", dot: "bg-purple-400" },
                      ].map((opt) => (
                        <button
                          key={opt.label}
                          onClick={() => setSelectedHash(opt.value)}
                          className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs font-medium transition-colors
                            ${selectedHash === opt.value
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${opt.dot} shrink-0`} />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </Dropdown>

                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* ══ ARTWORK GRID / LIST ══ */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {filtered.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-24 text-center"
                >
                  <ImageIcon className="w-12 h-12 text-muted-foreground mb-3 opacity-40" />
                  <p className="text-base font-bold text-muted-foreground">No artworks found</p>
                  <p className="text-sm text-muted-foreground/60 mt-1">Try adjusting your filters</p>
                  <button onClick={clearAll}
                    className="mt-4 text-sm text-primary hover:underline font-semibold">
                    Clear all filters
                  </button>
                </motion.div>
              ) : viewMode === "grid" ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`grid gap-4 ${sidebarOpen
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                  }`}
                >
                  {filtered.map((art, i) => (
                    <motion.div
                      key={art.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0  }}
                      transition={{ delay: i * 0.035, duration: 0.3 }}
                      className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-[0_4px_24px_rgba(59,130,246,0.1)] transition-all duration-300 cursor-pointer"
                    >
                      {/* Art preview */}
                      <div className="relative aspect-square overflow-hidden">
                        {art.img ? (
                          <Image
                            src={art.img}
                            alt={art.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className={`w-full h-full bg-linear-to-br ${art.color} flex items-center justify-center`}>
                            <ImageIcon className="w-10 h-10 text-white/40" />
                          </div>
                        )}

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                              <ExternalLink className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                        </div>

                        {/* Category pill */}
                        <div className="absolute top-2 left-2">
                          <span className="text-[9px] font-bold uppercase tracking-widest bg-black/50 text-white/90 px-2 py-0.5 rounded-full backdrop-blur-sm">
                            {art.category}
                          </span>
                        </div>

                        {/* Hash badge */}
                        {art.hashStatus === "complete" && (
                          <div className="absolute top-2 right-2">
                            <div className="w-6 h-6 rounded-full bg-blue-500/80 backdrop-blur-sm flex items-center justify-center">
                              <Hash className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card info */}
                      <div className="p-3">
                        <p className="text-sm font-bold truncate mb-1">{art.title}</p>
                        <p className="text-[10px] text-muted-foreground mb-2">{art.uploadDate}</p>
                        <div className="flex items-center justify-between">
                          {art.ownershipStatus === "verified" ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-green-500/10 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded-full">
                              <CheckCircle className="w-2.5 h-2.5" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded-full">
                              <AlertTriangle className="w-2.5 h-2.5" /> Pending
                            </span>
                          )}
                          {art.hashStatus === "processing" && (
                            <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                              Processing…
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                /* ── LIST VIEW ── */
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  {filtered.map((art, i) => (
                    <motion.div
                      key={art.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.25 }}
                      className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-[0_2px_12px_rgba(59,130,246,0.08)] transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center gap-4 p-3">
                        {/* Thumbnail */}
                        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 relative">
                          {art.img ? (
                            <Image src={art.img} alt={art.title} fill className="object-cover" />
                          ) : (
                            <div className={`w-full h-full bg-linear-to-br ${art.color}`} />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{art.title}</p>
                          <p className="text-xs text-muted-foreground">{art.category} · {art.uploadDate}</p>
                        </div>

                        {/* Status badges */}
                        <div className="flex items-center gap-2 shrink-0">
                          {art.ownershipStatus === "verified" ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">
                              <CheckCircle className="w-2.5 h-2.5" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-amber-500/10 text-amber-500 px-2 py-1 rounded-full">
                              <AlertTriangle className="w-2.5 h-2.5" /> Pending
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full
                            ${art.hashStatus === "complete"
                              ? "bg-blue-500/10 text-blue-500"
                              : "bg-muted text-muted-foreground"}`}>
                            <Hash className="w-2.5 h-2.5" />
                            {art.hashStatus === "complete" ? "Hashed" : "Processing"}
                          </span>
                        </div>

                        <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}