"use client";

import { ArrowUp, ArrowDown, Share2, MoreHorizontal, Flag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useArtPost } from "../hooks/useArtPost";

/**
 * Props for the ArtPost component.
 * Think of this as the "data + callbacks" the parent page gives to this UI card.
 */
export type ArtPostProps = {
  // Subreddit/community info
  subredditName: string;
  subredditHref?: string;
  subredditIconSrc: string;

  // Author info
  username: string;
  userHref?: string;
  timeAgo?: string;

  // Post content
  title: string;
  imageSrc: string;
  imageAlt?: string;

  // Score (can be number or formatted string)
  score?: string | number;

  // Optional callbacks (parent can hook these into API calls)
  onUpvote?: () => void;
  onDownvote?: () => void;
  onShare?: () => void;

  // Trigger opening the "Report modal" (or any report action)
  onReport?: () => void;

  // Extra styling hook if we want to customize from outside
  className?: string;
};

export function ArtPost({
  subredditName,
  subredditHref = "/", // default: if not provided, link to home
  subredditIconSrc,
  username,
  userHref = "/", // default: if not provided, link to home
  timeAgo = "",
  title,
  imageSrc,
  imageAlt = "art picture",
  score = "—",
  onUpvote,
  onDownvote,
  onShare,
  onReport,
  className = "",
}: ArtPostProps) {
  /**
   * useArtPost handles the "More options" dropdown behavior:
   * - open/close state
   * - refs to button and menu (for click-outside detection)
   * - unique menu id for accessibility (aria-controls)
   */
  const { isOpen: open, setIsOpen: setOpen, btnRef, menuRef, menuId } = useArtPost();

  return (
    /**
     * Entire post card container.
     * Note: It's currently styled like a clickable card (cursor-pointer),
     * but it doesn’t have onClick navigation yet. If you plan to make the whole
     * card open a post page, you can add an onClick here later.
     */
    <article
      className={[
        "w-full max-w-170 mx-auto rounded-3xl",
        "hover:bg-[#f6f8f9] dark:hover:bg-[#181c1f] transition",
        "px-3 sm:px-4 py-2 cursor-pointer",
        className,
      ].join(" ")}
    >
      {/* ===================== Header ===================== */}
      <div className="flex items-start justify-between gap-3">
        {/* Left side: subreddit + user info */}
        <div className="flex min-w-0 items-center gap-2 text-[12px] sm:text-sm text-gray-500 dark:text-gray-300">
          {/* Subreddit icon */}
          <Image
            src={subredditIconSrc}
            alt={`${subredditName} logo`}
            width={24}
            height={24}
            className="rounded-full shrink-0"
          />

          {/* Link to subreddit/community */}
          <Link
            href={subredditHref}
            className="font-semibold text-gray-900 dark:text-gray-100 hover:underline shrink-0"
          >
            r/{subredditName}
          </Link>

          <span className="shrink-0">•</span>

          {/* Author + time: truncate so it doesn't overflow on small screens */}
          <span className="truncate">
            Posted by{" "}
            <Link href={userHref} className="hover:underline">
              u/{username}
            </Link>
            {timeAgo ? ` • ${timeAgo}` : ""}
          </span>
        </div>

        {/* ===================== More menu ===================== */}
        <div className="relative shrink-0">
          {/* Button that toggles the dropdown menu */}
          <button
            ref={btnRef} // used by hook to detect click outside
            type="button"
            onClick={(e) => {
              // Prevents clicks from bubbling to the article (important if article becomes clickable later)
              e.stopPropagation();
              // Toggle open state
              setOpen((v) => !v);
            }}
            className="p-2 -m-2 rounded-full hover:bg-slate-300 dark:hover:bg-[#333d42] cursor-pointer transition"
            aria-label="More options"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={menuId} // links the button to the menu element for accessibility
          >
            <MoreHorizontal className="w-5 h-5 text-gray-500 dark:text-gray-300" />
          </button>

          {/* Dropdown menu only renders when open = true */}
          {open && (
            <div
              ref={menuRef} // used by hook to detect click outside
              id={menuId}
              role="menu"
              className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-[#EDEFF1] dark:border-[#343536] bg-white dark:bg-[#121619] shadow-lg z-50"
              // Stop propagation so clicking inside menu won't close the card or trigger parent handlers
              onClick={(e) => e.stopPropagation()}
            >
              {/* Report action */}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  // Close menu first (better UX), then trigger report callback
                  setOpen(false);
                  onReport?.();
                }}
                className="w-full text-left px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-[#f6f8f9] dark:hover:bg-[#181c1f] transition flex gap-2 cursor-pointer"
              >
                <Flag className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                Report Artwork
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===================== Title ===================== */}
      <div className="pt-2 pb-2">
        <h2 className="text-[15px] sm:text-[16px] font-semibold leading-snug text-gray-900 dark:text-gray-100">
          {title}
        </h2>
      </div>

      {/* ===================== Media/Image ===================== */}
      <div className="w-full overflow-hidden rounded-[14px] border border-[#EDEFF1] dark:border-[#343536]">
        {/* Using a fixed-height container + Image fill for responsive behavior */}
        <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-130">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, 680px"
            className="object-cover"
          />
        </div>
      </div>

      {/* ===================== Footer Actions ===================== */}
      <div className="flex items-center gap-2 pt-3 text-[13px] sm:text-sm text-gray-600 dark:text-gray-300">
        {/* Voting control group */}
        <div className="flex items-center gap-1 bg-slate-200 hover:bg-slate-300 dark:bg-[#2a3236] rounded-full py-1">
          <button
            type="button"
            onClick={onUpvote}
            className="p-1.5 rounded-full dark:hover:bg-[#333d42] cursor-pointer"
            aria-label="Upvote"
          >
            <ArrowUp className="w-4 h-4 hover:text-blue-400" />
          </button>

          {/* Score display */}
          <span className="font-medium px-1 text-gray-800 dark:text-gray-100">{score}</span>

          <button
            type="button"
            onClick={onDownvote}
            className="p-1.5 rounded-full dark:hover:bg-[#333d42] cursor-pointer"
            aria-label="Downvote"
          >
            <ArrowDown className="w-4 h-4 hover:text-red-400" />
          </button>
        </div>

        {/* Share action */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onShare}
            className="flex items-center gap-1.5 bg-slate-200 hover:bg-slate-300 dark:hover:bg-[#333d42] dark:bg-[#2a3236] px-3 py-2 rounded-full cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            {/* Responsive label (same text, but structure supports custom labels later) */}
            <span className="hidden xs:inline">Share</span>
            <span className="xs:hidden">Share</span>
          </button>
        </div>
      </div>
    </article>
  );
}