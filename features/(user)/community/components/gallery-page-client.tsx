"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Brush,
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
import { Post } from "../types";
import { useGalleryPage } from "../hooks/useGalleryPage";

const icon =
  "https://styles.redditmedia.com/t5_2qk7x/styles/communityIcon_gw3ypy6d357e1.png?width=48&height=48&frame=1&auto=webp&crop=48%3A48%2Csmart&s=82b75539c0b754d2498ab3c553d8857e6215fcc5";

const POSTS: Post[] = [
  {
    id: "p1",
    subredditName: "ArtForgeLab",
    subredditHref: "/community",
    subredditIconSrc: icon,
    username: "Tenshin",
    userHref: "/profile/Tenshin",
    timeAgo: "2 hours ago",
    title: "Moonlit Forest Guardian",
    imageSrc: icon,
    score: "1.2k",
    category: "Fantasy Illustration",
    excerpt:
      "A concept artwork exploring mythical creatures with a dark-blue cinematic atmosphere.",
    artistBadge: "Verified",
    tags: ["Fantasy", "Illustration", "Digital Painting"],
  },
  {
    id: "p2",
    subredditName: "ArtForgeLab",
    subredditHref: "/community",
    subredditIconSrc: icon,
    username: "Nathaniel",
    userHref: "/profile/Nathaniel",
    timeAgo: "5 hours ago",
    title: "Silent Streets of Manila",
    imageSrc: icon,
    score: "824",
    category: "Concept Art",
    excerpt:
      "Environment artwork focused on mood lighting, perspective, and layered urban detail.",
    artistBadge: "Emerging",
    tags: ["Concept Art", "Environment", "Cityscape"],
  },
  {
    id: "p3",
    subredditName: "ArtForgeLab",
    subredditHref: "/community",
    subredditIconSrc: icon,
    username: "Rovick",
    userHref: "/profile/Rovick",
    timeAgo: "1 day ago",
    title: "Crimson Echo",
    imageSrc: icon,
    score: "2.4k",
    category: "Character Design",
    excerpt:
      "A stylized character sheet with emphasis on silhouette readability and costume identity.",
    artistBadge: "Featured",
    tags: ["Character", "Stylized", "Design"],
  },
  {
    id: "p4",
    subredditName: "ArtForgeLab",
    subredditHref: "/community",
    subredditIconSrc: icon,
    username: "Ruzzel",
    userHref: "/profile/Ruzzel",
    timeAgo: "2 days ago",
    title: "Fragments of Dawn",
    imageSrc: icon,
    score: "640",
    category: "Digital Painting",
    excerpt:
      "Warm sunrise composition with painterly texture and soft atmospheric layering.",
    artistBadge: "Verified",
    tags: ["Painting", "Atmosphere", "Warm Tone"],
  },
];

const FILTERS = ["All", "Fantasy", "Concept Art", "Character", "Environment", "Painting"];

export default function GalleryPageClient({ authed }: { authed: boolean }) {
  const { state, actions } = useGalleryPage(authed);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredPosts = useMemo(() => {
    return POSTS.filter((post) => {
      const matchesSearch =
        !search.trim() ||
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.username.toLowerCase().includes(search.toLowerCase()) ||
        post.category?.toLowerCase().includes(search.toLowerCase()) ||
        post.tags?.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

      const matchesFilter =
        activeFilter === "All" ||
        post.category?.toLowerCase().includes(activeFilter.toLowerCase()) ||
        post.tags?.some((tag) => tag.toLowerCase().includes(activeFilter.toLowerCase()));

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  return (
    // ✅ overflow-x-hidden removed from here — move it to globals.css on body instead
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
                value="120+"
              />
              <StatCard
                icon={<Sparkles className="h-4 w-4" />}
                label="Active artists"
                value="35+"
              />
              <StatCard
                icon={<ShieldCheck className="h-4 w-4" />}
                label="Protected posts"
                value="Verified"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">

          {/* ── Left column ── */}
          <div className="space-y-5">

            {/* ✅ Sticky bar lives OUTSIDE the card, directly in the column */}
            <div className="sticky top-16 z-10 bg-background pb-1 pt-1">
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
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search title, artist, category..."
                        className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none ring-0 placeholder:text-muted-foreground focus:border-primary"
                      />
                    </div>

                    <button
                      type="button"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted/60"
                    >
                      <Filter className="h-4 w-4" />
                      Filters
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {FILTERS.map((filter) => {
                    const active = activeFilter === filter;
                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setActiveFilter(filter)}
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

            {/* Posts list */}
            <div className="space-y-4">
              {filteredPosts.length === 0 ? (
                <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
                  <h3 className="text-lg font-bold">No artworks found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Try another search term or change the selected category filter.
                  </p>
                </div>
              ) : (
                filteredPosts.map((post) => (
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

          {/* ── Right column / Aside ── */}
          {/* ✅ self-start prevents grid stretch so sticky can fire */}
          <aside className="space-y-4 sticky top-20 self-start">
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
        postId={state.selectedPost?.id}
        title={state.selectedPost?.title}
        username={state.selectedPost?.username}
        onSubmit={actions.handleSubmitReport}
      />
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
      <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
        {icon}
      </div>
      <p className="text-xs uppercase tracking-wide text-slate-300">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function InfoRow({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-3">
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
    </div>
  );
}