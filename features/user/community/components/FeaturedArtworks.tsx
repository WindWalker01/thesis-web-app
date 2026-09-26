"use client";

import Image from "next/image";
import { ArrowUp, Sparkles, Crown, Medal } from "lucide-react";

import type { Post } from "../types";

type FeaturedArtworksProps = {
  posts: Post[];
  authed: boolean;
  onNavigate?: (postId: string) => void;
};

/**
 * Per-rank presentation config for the top 5 slots. Purely visual — index in
 * `posts` still drives ordering/business logic untouched.
 */
const RANK_STYLES = [
  {
    label: "#1",
    icon: Crown,
    badgeClass:
      "bg-gradient-to-br from-amber-300 via-orange-400 to-blue-500 text-white shadow-[0_2px_12px_-2px_rgba(251,191,36,0.65)] ring-1 ring-amber-200/60",
    cardClass: "lg:scale-[1.06] lg:-mt-2",
    ringClass: "ring-1 ring-amber-300/40",
    auraClass:
      "bg-[radial-gradient(closest-side,rgba(251,191,36,0.55),rgba(249,115,22,0.35)_45%,rgba(59,130,246,0.3)_75%,transparent_80%)] blur-2xl group-hover:opacity-100",
  },
  {
    label: "#2",
    icon: Medal,
    badgeClass:
      "bg-gradient-to-br from-slate-300 via-slate-400 to-blue-500 text-white shadow-[0_2px_10px_-2px_rgba(100,116,139,0.5)] ring-1 ring-white/40",
    cardClass: "",
    ringClass: "ring-1 ring-border/60",
    auraClass:
      "bg-[radial-gradient(closest-side,rgba(59,130,246,0.4),rgba(249,115,22,0.22)_60%,transparent_80%)] blur-2xl group-hover:opacity-100",
  },
  {
    label: "#3",
    icon: Medal,
    badgeClass:
      "bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 text-white shadow-[0_2px_10px_-2px_rgba(217,119,6,0.45)] ring-1 ring-white/40",
    cardClass: "",
    ringClass: "ring-1 ring-border/60",
    auraClass:
      "bg-[radial-gradient(closest-side,rgba(249,115,22,0.42),rgba(59,130,246,0.2)_60%,transparent_80%)] blur-2xl group-hover:opacity-100",
  },
  {
    label: "#4",
    icon: null,
    badgeClass: "bg-background/90 text-foreground shadow ring-1 ring-border",
    cardClass: "",
    ringClass: "ring-1 ring-border/60",
    auraClass:
      "bg-[radial-gradient(closest-side,rgba(148,163,184,0.28),transparent_75%)] blur-xl group-hover:opacity-100",
  },
  {
    label: "#5",
    icon: null,
    badgeClass: "bg-background/90 text-foreground shadow ring-1 ring-border",
    cardClass: "",
    ringClass: "ring-1 ring-border/60",
    auraClass:
      "bg-[radial-gradient(closest-side,rgba(148,163,184,0.28),transparent_75%)] blur-xl group-hover:opacity-100",
  },
] as const;

/**
 * Featured Artworks band: highlights the most community recognized works.
 *
 * Purely presentational. Cards are compact and open the shared PostViewerModal
 * (via `onOpen`) so voting and full details stay in a single source of truth —
 * no vote UI or artwork data is duplicated here.
 */
export function FeaturedArtworks({ posts, authed, onNavigate }: FeaturedArtworksProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-blue-500/[0.05] via-background to-orange-500/[0.06]">
      {/* Ambient hall-of-fame wash, kept behind header only */}
      <div className="pointer-events-none absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-blue-400/10 blur-[100px]" />
      <div className="pointer-events-none absolute -top-24 right-1/4 h-80 w-80 rounded-full bg-orange-400/10 blur-[100px]" />

      <style>{`
        @keyframes featuredFadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-2">
          <div className="inline-flex items-center gap-2.5">
            <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-orange-500/15 text-primary ring-1 ring-primary/10">
              <span className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-blue-400/30 to-orange-400/30 blur-md" />
              <Sparkles className="h-4 w-4" />
            </span>
            <h2 className="relative text-2xl font-black tracking-tight sm:text-3xl">
              <span className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-400/25 to-orange-400/25 blur-xl" />
              <span className="bg-gradient-to-r from-blue-500 via-blue-400 to-orange-400 bg-clip-text text-transparent">
                Featured Artworks
              </span>
            </h2>
          </div>
          <p className="text-base text-muted-foreground/70">
            The most community recognized works, ranked by the score they have
            earned from fellow artists.
          </p>
        </div>

        <ul
          className={[
            "grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5 lg:gap-6",
            !authed ? "pointer-events-none select-none" : "",
          ].join(" ")}
        >
          {posts.map((post, index) => {
            const rank = RANK_STYLES[index] ?? RANK_STYLES[RANK_STYLES.length - 1];
            const RankIcon = rank.icon;
            const isTop = index === 0;

            return (
              <li
                key={post.id}
                className="relative"
                style={{
                  opacity: 0,
                  animation: "featuredFadeInUp 0.6s ease-out forwards",
                  animationDelay: `${index * 90}ms`,
                }}
              >
                <div className={["group relative h-full", rank.cardClass].join(" ")}>
                  {/* Holy aura — hidden by default, fades in behind the card on hover */}
                  <div
                    className={[
                      "pointer-events-none absolute -inset-3 -z-10 rounded-[2rem] opacity-0 transition-opacity duration-300 ease-out",
                      rank.auraClass,
                    ].join(" ")}
                    aria-hidden="true"
                  />

                  <button
                    type="button"
                    onClick={() => onNavigate?.(post.postId ?? post.id)}
                    className={[
                      "relative flex h-full w-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 text-left",
                      "bg-card/60 backdrop-blur-xl",
                      "shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-16px_rgba(0,0,0,0.15)]",
                      "transition-all duration-300 ease-out",
                      "hover:-translate-y-1.5 hover:scale-[1.03] hover:shadow-[0_1px_2px_rgba(0,0,0,0.05),0_28px_56px_-18px_rgba(0,0,0,0.28)]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      rank.ringClass,
                      isTop
                        ? "hover:shadow-[0_1px_2px_rgba(0,0,0,0.05),0_32px_64px_-16px_rgba(251,191,36,0.25)]"
                        : "",
                    ].join(" ")}
                    aria-label={`View featured artwork: ${post.title}, ranked ${rank.label}`}
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-muted/40">
                      <Image
                        src={post.imageSrc}
                        alt={post.imageAlt ?? post.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
                        className="object-cover transition-all duration-500 ease-out group-hover:scale-110 group-hover:brightness-105"
                      />

                      {/* Bottom gradient scrim for text legibility / mood */}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-85" />

                      {/* Rank badge */}
                      <span
                        className={[
                          "absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest backdrop-blur-sm",
                          "transition-transform duration-300 ease-out group-hover:scale-110",
                          rank.badgeClass,
                          isTop ? "px-3 py-1 text-[11px]" : "",
                        ].join(" ")}
                      >
                        {RankIcon ? <RankIcon className="h-3 w-3" /> : null}
                        {rank.label}
                      </span>

                      {/* Score badge */}
                      <span
                        className={[
                          "absolute right-2 top-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                          "bg-white/10 text-white backdrop-blur-md ring-1 ring-white/20 shadow-sm",
                          "transition-all duration-300 ease-out group-hover:bg-white/20 group-hover:shadow-md",
                        ].join(" ")}
                      >
                        <ArrowUp className="h-3 w-3 text-orange-300" />
                        {post.score}
                      </span>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-2 p-3.5">
                      <h3 className="line-clamp-2 text-sm font-bold leading-snug text-foreground transition-colors duration-200 group-hover:text-primary">
                        {post.title}
                      </h3>

                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400/70 to-orange-400/70 text-[8px] font-bold text-white ring-1 ring-border/50">
                          {post.username?.charAt(0)?.toUpperCase() ?? "?"}
                        </span>
                        <p className="truncate text-xs text-muted-foreground/80">
                          @{post.username}
                        </p>
                      </div>

                      <div className="mt-auto flex items-center gap-1 text-[11px] text-muted-foreground/60">
                        <ArrowUp className="h-3 w-3" />
                        <span>
                          {post.upvoteCount} upvote{post.upvoteCount === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}