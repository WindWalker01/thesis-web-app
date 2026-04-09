"use client";

import Link from "next/link";

import { SORT_OPTIONS, ProfileScope } from "../types";
import { useProfilePage } from "../hooks/useProfilePage";
import { useCurrentUserProfile } from "../hooks/useFetchProfile";
import { useCurrentUserArtworks } from "../hooks/useFetchProfileArtworks";
import { ProfileBanner } from "../components/ProfileBanner";
import { ProfileStats } from "../components/ProfileStats";
import { ProfilePageSkeleton } from "../components/ProfilePageSkeleton";
import { ArtworkTopBar } from "../components/ArtworkTopBar";
import { ActiveFilterChips } from "../components/ActiveFilterChips";
import { FilterSidebar } from "../components/FilterSidebar";
import { ArtworkGrid } from "../components/ArtworkGrid";

type Props = {
  scope?: ProfileScope;
};

export default function ProfilePage({ scope = "gallery" }: Props) {
  const { profile, isLoading, error } = useCurrentUserProfile();
  const {
    artworks,
    isLoading: artworksLoading,
    error: artworksError,
  } = useCurrentUserArtworks(scope);

  const categories = Array.from(
    new Map(
      artworks
        .filter((a) => a.img)
        .map((a) => [
          a.category,
          {
            label: a.category,
            img: a.img as string,
          },
        ])
    ).values()
  );

  const {
    filtered,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    selectedHash,
    setSelectedHash,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    sidebarOpen,
    setSidebarOpen,
    sortOpen,
    setSortOpen,
    catOpen,
    setCatOpen,
    statusOpen,
    setStatusOpen,
    hashOpen,
    setHashOpen,
    activeFiltersCount,
    clearAll,
  } = useProfilePage(artworks, SORT_OPTIONS);

  const pageLoading = isLoading || artworksLoading;
  const pageError = error || artworksError;

  const pageTitle = scope === "issues" ? "Review & Issues" : "My Collection";
  const pageDescription =
    scope === "issues"
      ? "Flagged, removed, revoked, and blockchain-failed artworks."
      : "Your visible artworks, including active, under review, and pending blockchain records.";

  return (
    <main className="min-h-screen bg-background font-display text-foreground overflow-x-hidden">
      <div className="h-1 w-full bg-linear-to-r from-blue-600 via-primary to-orange-400" />

      {pageLoading && <ProfilePageSkeleton />}

      {!pageLoading && pageError && (
        <>
          <div className="flex items-center justify-center h-52 bg-slate-900">
            <p className="text-sm text-red-400">{pageError}</p>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-sm text-muted-foreground">
              Could not load profile artworks. Please refresh the page.
            </p>
          </div>
        </>
      )}

      {!pageLoading && !pageError && profile && (
        <>
          <ProfileBanner profile={profile}>
            <ProfileStats
              totalArtworks={artworks.length}
              totalScans={artworks.length}
              verifiedCount={
                artworks.filter((a) => a.ownershipStatus === "verified").length
              }
            />
          </ProfileBanner>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black">{pageTitle}</h2>
                <p className="text-sm text-muted-foreground">{pageDescription}</p>
              </div>

              <div className="inline-flex rounded-xl border border-border p-1 bg-card">
                <Link
                  href="/profile"
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    scope === "gallery"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  My Collection
                </Link>
                <Link
                  href="/profile/issues"
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    scope === "issues"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Review & Issues
                </Link>
              </div>
            </div>

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
                artworks={artworks}
                categories={categories}
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
                scope={scope}
              />
            </div>
          </div>
        </>
      )}
    </main>
  );
}