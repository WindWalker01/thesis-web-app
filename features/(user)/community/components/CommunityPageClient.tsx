"use client";

import Link from "next/link";
import {
  Brush,
  ChevronDown,
  Filter,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { ArtPost } from "./art-post";
import { LoginRequiredModal } from "./login-required-modal";
import { ReportArtworkModal } from "../../report-infringement/components/report-artwork-modal";
import { useGalleryPage } from "../hooks/useCommunityPage";
import { useCommunityFeed } from "../hooks/useCommunityFeed";
import { InfoRow } from "./InfoRow";
import { StatCard } from "./StatCard";
import { FilterChip } from "./FilterChip";
import type { CommunityPageData } from "../types";

export default function CommunityPageClient({
  authed,
  currentUserId,
  currentUsername,
  posts,
  stats,
}: CommunityPageData) {
  const { state, actions } = useGalleryPage(authed);

  const {
    state: feedState,
    actions: feedActions,
  } = useCommunityFeed({
    authed,
    currentUserId,
    posts,
  });

  return (
    <main className="min-h-screen bg-background font-display text-foreground">
      <div className="h-1 w-full bg-linear-to-r from-blue-600 via-primary to-orange-400" />

      <section className="border-b border-border bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                <Users className="h-3.5 w-3.5" />
                Community Gallery
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
                  Discover, share, and protect digital artworks
                </h1>
                <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
                  Explore registered works from the ArtForgeLab community, support artists
                  through engagement, and report suspicious or infringing content in one
                  secure space.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/community/create-post"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  Create post
                </Link>

                <Link
                  href="/upload-artwork"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Upload protected artwork
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <StatCard
                icon={<Brush className="h-4 w-4" />}
                label="Published works"
                value={stats.publishedWorks}
              />
              <StatCard
                icon={<Sparkles className="h-4 w-4" />}
                label="Active artists"
                value={stats.activeArtists}
              />
              <StatCard
                icon={<ShieldCheck className="h-4 w-4" />}
                label="Protected posts"
                value={stats.protectedPosts}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <div className="z-10 bg-background pb-1 pt-1">
              <div className="rounded-3xl border border-border bg-card px-4 py-3 shadow-sm sm:px-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-xl font-black">Featured community posts</h2>
                    <p className="text-sm text-muted-foreground">
                      Browse registered artworks shared by artists in the platform.
                    </p>
                  </div>

                  <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                    <div className="relative w-full sm:min-w-[280px] lg:w-[320px]">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        value={feedState.search}
                        onChange={(e) => feedActions.setSearch(e.target.value)}
                        placeholder="Search title, artist, category..."
                        className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none ring-0 placeholder:text-muted-foreground focus:border-primary"
                      />
                    </div>

                    <div className="relative">
                      <button
                        ref={feedState.filtersButtonRef}
                        type="button"
                        onClick={() => feedActions.setFiltersOpen(!feedState.filtersOpen)}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted/60"
                      >
                        <Filter className="h-4 w-4" />
                        Filters
                        <ChevronDown className="h-4 w-4" />
                      </button>

                      {feedState.filtersOpen ? (
                        <div
                          ref={feedState.filtersMenuRef}
                          className="absolute right-0 z-30 mt-2 w-[320px] rounded-2xl border border-border bg-card p-4 shadow-xl"
                        >
                          <div className="space-y-4">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Feed scope
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <FilterChip
                                  active={feedState.feedScope === "community"}
                                  onClick={() => feedActions.setFeedScope("community")}
                                  label="Community"
                                />
                                {authed ? (
                                  <FilterChip
                                    active={feedState.feedScope === "mine"}
                                    onClick={() => feedActions.setFeedScope("mine")}
                                    label="My posts"
                                  />
                                ) : null}
                              </div>
                            </div>

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Visibility
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <FilterChip
                                  active={feedState.visibilityFilter === "all"}
                                  onClick={() => feedActions.setVisibilityFilter("all")}
                                  label="All"
                                />
                                <FilterChip
                                  active={feedState.visibilityFilter === "public"}
                                  onClick={() => feedActions.setVisibilityFilter("public")}
                                  label="Public"
                                />
                                {authed && feedState.feedScope === "mine" ? (
                                  <FilterChip
                                    active={feedState.visibilityFilter === "private"}
                                    onClick={() => feedActions.setVisibilityFilter("private")}
                                    label="Private"
                                  />
                                ) : null}
                              </div>
                            </div>

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Sort by
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <FilterChip
                                  active={feedState.sortBy === "newest"}
                                  onClick={() => feedActions.setSortBy("newest")}
                                  label="Newest"
                                />
                                <FilterChip
                                  active={feedState.sortBy === "oldest"}
                                  onClick={() => feedActions.setSortBy("oldest")}
                                  label="Oldest"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-border pt-3">
                              <button
                                type="button"
                                onClick={feedActions.resetFilters}
                                className="text-xs font-semibold text-muted-foreground transition hover:text-foreground"
                              >
                                Reset filters
                              </button>

                              <button
                                type="button"
                                onClick={() => feedActions.setFiltersOpen(false)}
                                className="text-xs font-semibold text-primary transition hover:opacity-80"
                              >
                                Done
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {feedState.availableFilters.map((filter) => {
                    const active = feedState.activeFilter === filter;
                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => feedActions.setActiveFilter(filter)}
                        className={[
                          "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/60",
                        ].join(" ")}
                      >
                        {filter}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {feedState.filteredPosts.length === 0 ? (
                <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
                  <h3 className="text-lg font-bold">No artworks found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Try another search term or change the selected filters.
                  </p>
                </div>
              ) : (
                feedState.filteredPosts.map((post) => (
                  <ArtPost
                    key={post.id}
                    {...post}
                    onReport={() => actions.openReport(post)}
                    onUpvote={() => actions.upVote(post)}
                    onDownvote={() => actions.downVote(post)}
                  />
                ))
              )}
            </div>
          </div>

          <aside className="sticky top-20 self-start space-y-4">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-base font-black">Community principles</h3>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <InfoRow
                  title="Originality first"
                  description="Post artworks you created or have the right to share."
                />
                <InfoRow
                  title="Respect ownership"
                  description="Verified and registered works should be treated as protected content."
                />
                <InfoRow
                  title="Report responsibly"
                  description="Use reporting for copyright, abuse, spam, or harmful content."
                />
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-base font-black">Why this page matters</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                This community module supports your thesis goal of building a
                community-driven reputation system while still keeping ownership,
                authenticity, and infringement reporting visible in the user experience.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <LoginRequiredModal
        open={state.loginOpen}
        onOpenChange={actions.setLoginOpen}
        loginHref="/login"
        message={state.message}
      />

      <ReportArtworkModal
        open={state.reportOpen}
        onOpenChange={actions.setReportOpen}
        postId={state.selectedPost?.postId}
        title={state.selectedPost?.title}
        username={state.selectedPost?.username}
        onSubmit={actions.handleSubmitReport}
      />
    </main>
  );
}