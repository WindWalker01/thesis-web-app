"use client";

import {
  ArrowDown,
  ArrowUp,
  BadgeCheck,
  Flag,
  MoreHorizontal,
  Share2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { useArtPost } from "../hooks/useArtPost";

export type ArtPostProps = {
  subredditName: string;
  subredditHref?: string;
  subredditIconSrc: string;

  username: string;
  userHref?: string;
  timeAgo?: string;

  title: string;
  imageSrc: string;
  imageAlt?: string;

  score?: string | number;
  category?: string;
  excerpt?: string;
  artistBadge?: "Verified" | "Emerging" | "Featured";
  tags?: string[];

  onUpvote?: () => void;
  onDownvote?: () => void;
  onShare?: () => void;
  onReport?: () => void;

  className?: string;
};

const badgeStyles: Record<NonNullable<ArtPostProps["artistBadge"]>, string> = {
  Verified:
    "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Emerging:
    "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400",
  Featured:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

export function ArtPost({
  subredditName,
  subredditHref = "/community",
  subredditIconSrc,
  username,
  userHref = "/profile",
  timeAgo = "",
  title,
  imageSrc,
  imageAlt = "artwork preview",
  score = "—",
  category,
  excerpt,
  artistBadge,
  tags = [],
  onUpvote,
  onDownvote,
  onShare,
  onReport,
  className = "",
}: ArtPostProps) {
  const { isOpen: open, setIsOpen: setOpen, btnRef, menuRef, menuId } = useArtPost();

  return (
    <article
      className={[
        "overflow-hidden rounded-3xl border border-border/70 bg-card/90 shadow-sm backdrop-blur-sm transition-all hover:border-primary/20 hover:shadow-md",
        className,
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-4 sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <Image
            src={subredditIconSrc}
            alt={`${subredditName} logo`}
            width={44}
            height={44}
            className="h-11 w-11 shrink-0 rounded-full border border-border object-cover"
          />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Link
                href={userHref}
                className="truncate text-sm font-semibold text-foreground transition hover:text-primary"
              >
                @{username}
              </Link>

              {artistBadge && (
                <span
                  className={[
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                    badgeStyles[artistBadge],
                  ].join(" ")}
                >
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {artistBadge}
                </span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Link
                href={subredditHref}
                className="font-medium transition hover:text-primary"
              >
                {subredditName}
              </Link>
              <span>•</span>
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>

        <div className="relative shrink-0">
          <button
            ref={btnRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
            className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="More options"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={menuId}
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>

          {open && (
            <div
              ref={menuRef}
              id={menuId}
              role="menu"
              className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-border bg-popover shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onReport?.();
                }}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-foreground transition hover:bg-muted"
              >
                <Flag className="h-4 w-4" />
                Report artwork
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Text content */}
      <div className="px-4 pb-3 sm:px-5">
        {category && (
          <div className="mb-3 inline-flex rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
            {category}
          </div>
        )}

        <h2 className="text-lg font-black leading-snug text-foreground sm:text-xl">
          {title}
        </h2>

        {excerpt && (
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {excerpt}
          </p>
        )}

        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Media */}
      <div className="border-y border-border/70 bg-muted/30">
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/10] md:aspect-[16/9]">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 720px"
            className="object-cover"
          />
        </div>
      </div>

      {/* Footer meta */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-xs text-muted-foreground sm:px-5">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-primary/10 px-2 font-semibold text-primary">
            {score}
          </div>
          <span>community score</span>
        </div>

        <span>Protected artwork post</span>
      </div>

      {/* Actions */}
      <div className="border-t border-border/70 px-3 py-2 sm:px-4">
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onUpvote}
            className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
            aria-label="Upvote"
          >
            <ArrowUp className="h-4 w-4" />
            Upvote
          </button>

          <button
            type="button"
            onClick={onDownvote}
            className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
            aria-label="Downvote"
          >
            <ArrowDown className="h-4 w-4" />
            Downvote
          </button>

          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>
    </article>
  );
}