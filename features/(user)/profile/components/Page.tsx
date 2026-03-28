"use client";

import NavBar from "@/components/blocks/navbar";

import { ARTWORKS, CATEGORIES, SORT_OPTIONS } from "../data";
import { useProfilePage } from "../hooks/useProfilePage";
import { useCurrentUserProfile } from "../hooks/useFetchProfile";
import { ProfileBanner } from "../components/ProfileBanner";
import { ProfileStats } from "../components/ProfileStats";
import { ProfilePageSkeleton } from "../components/ProfilePageSkeleton";
import { ArtworkTopBar } from "../components/ArtworkTopBar";
import { ActiveFilterChips } from "../components/ActiveFilterChips";
import { FilterSidebar } from "../components/FilterSidebar";
import { ArtworkGrid } from "../components/ArtworkGrid";

export default function ProfilePage() {
    const { profile, isLoading, error } = useCurrentUserProfile();

    const {
        filtered,
        searchQuery, setSearchQuery,
        selectedCategory, setSelectedCategory,
        selectedStatus, setSelectedStatus,
        selectedHash, setSelectedHash,
        sortBy, setSortBy,
        viewMode, setViewMode,
        sidebarOpen, setSidebarOpen,
        sortOpen, setSortOpen,
        catOpen, setCatOpen,
        statusOpen, setStatusOpen,
        hashOpen, setHashOpen,
        activeFiltersCount,
        clearAll,
    } = useProfilePage(ARTWORKS, SORT_OPTIONS);

    return (
        <main className="min-h-screen bg-background font-display text-foreground overflow-x-hidden">
            <NavBar />
            <div className="h-1 w-full bg-linear-to-r from-blue-600 via-primary to-orange-400" />

            {/* ── Full page skeleton while loading ── */}
            {isLoading && <ProfilePageSkeleton />}

            {/* ── Error state ── */}
            {!isLoading && error && (
                <>
                    <div className="flex items-center justify-center h-52 bg-slate-900">
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <p className="text-sm text-muted-foreground">
                            Could not load profile. Please refresh the page.
                        </p>
                    </div>
                </>
            )}

            {/* ── Loaded state ── */}
            {!isLoading && !error && profile && (
                <>
                    <ProfileBanner profile={profile}>
                        <ProfileStats
                            totalArtworks={ARTWORKS.length}
                            totalScans={8}
                            verifiedCount={ARTWORKS.filter((a) => a.ownershipStatus === "verified").length}
                        />
                    </ProfileBanner>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <ArtworkTopBar
                            searchQuery={searchQuery}
                            sortBy={sortBy}
                            viewMode={viewMode}
                            sortOpen={sortOpen}
                            sidebarOpen={sidebarOpen}
                            resultCount={filtered.length}
                            activeFiltersCount={activeFiltersCount}
                            sortOptions={SORT_OPTIONS}
                            onSearchChange={setSearchQuery}
                            onSortChange={setSortBy}
                            onViewModeChange={setViewMode}
                            onSortOpenChange={setSortOpen}
                            onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
                        />

                        <ActiveFilterChips
                            selectedCategory={selectedCategory}
                            selectedStatus={selectedStatus}
                            selectedHash={selectedHash}
                            onClearCategory={() => setSelectedCategory(null)}
                            onClearStatus={() => setSelectedStatus(null)}
                            onClearHash={() => setSelectedHash(null)}
                            onClearAll={clearAll}
                        />

                        <div className="flex gap-5 items-start">
                            <FilterSidebar
                                open={sidebarOpen}
                                artworks={ARTWORKS}
                                categories={CATEGORIES}
                                selectedCategory={selectedCategory}
                                selectedStatus={selectedStatus}
                                selectedHash={selectedHash}
                                activeFiltersCount={activeFiltersCount}
                                catOpen={catOpen}
                                statusOpen={statusOpen}
                                hashOpen={hashOpen}
                                onCategoryChange={setSelectedCategory}
                                onStatusChange={setSelectedStatus}
                                onHashChange={setSelectedHash}
                                onToggleCat={() => setCatOpen(!catOpen)}
                                onToggleStatus={() => setStatusOpen(!statusOpen)}
                                onToggleHash={() => setHashOpen(!hashOpen)}
                                onClearAll={clearAll}
                            />

                            <ArtworkGrid
                                artworks={filtered}
                                viewMode={viewMode}
                                sidebarOpen={sidebarOpen}
                                onClearFilters={clearAll}
                            />
                        </div>
                    </div>
                </>
            )}
        </main>
    );
}