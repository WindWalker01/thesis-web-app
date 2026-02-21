"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUp, ArrowDown, Share2, Bookmark, MoreHorizontal } from "lucide-react";

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

  onUpvote?: () => void;
  onDownvote?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  onMore?: () => void;

  className?: string;
};

export function ArtPost({
  subredditName,
  subredditHref = "/",
  subredditIconSrc,
  username,
  userHref = "/",
  timeAgo = "",
  title,
  imageSrc,
  imageAlt = "art picture",
  score = "—",
  onUpvote,
  onDownvote,
  onShare,
  onSave,
  onMore,
  className = "",
}: ArtPostProps) {
  return (
    <article
      className={[
        "w-full max-w-170 mx-auto rounded-3xl",
        "dark:bg-slate--",
        "hover:bg-[#f6f8f9] dark:hover:bg-[#181c1f] transition",
        "px-3 sm:px-4 py-2 cursor-pointer",
        className,
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-[12px] sm:text-sm text-gray-500 dark:text-gray-300">
          <Image
            src={subredditIconSrc}
            alt={`${subredditName} logo`}
            width={24}
            height={24}
            className="rounded-full shrink-0"
          />

          <Link
            href={subredditHref}
            className="font-semibold text-gray-900 dark:text-gray-100 hover:underline shrink-0"
          >
            r/{subredditName}
          </Link>

          <span className="shrink-0">•</span>

          <span className="truncate">
            Posted by{" "}
            <Link href={userHref} className="hover:underline">
              u/{username}
            </Link>
            {timeAgo ? ` • ${timeAgo}` : ""}
          </span>
        </div>

        <button
          type="button"
          onClick={onMore}
          className="p-2 -m-2 rounded-full shrink-0 hover:bg-slate-300 dark:hover:bg-[#333d42] cursor-pointer transition"
          aria-label="More options"
        >
          <MoreHorizontal className="w-5 h-5 text-gray-500 dark:text-gray-300" />
        </button>
      </div>

      {/* Title */}
      <div className="pt-2 pb-2">
        <h2 className="text-[15px] sm:text-[16px] font-semibold leading-snug text-gray-900 dark:text-gray-100">
          {title}
        </h2>
      </div>

      {/* Media */}
      <div className="w-full overflow-hidden rounded-[14px] border border-[#EDEFF1] dark:border-[#343536]">
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

      {/* Footer Actions */}
      <div className="flex items-center gap-2 pt-3 text-[13px] sm:text-sm text-gray-600 dark:text-gray-300">
        {/* Voting */}
        <div className="flex items-center gap-1 bg-slate-200 hover:bg-slate-300 dark:bg-[#2a3236] rounded-full py-1">
          <button
            type="button"
            onClick={onUpvote}
            className="p-1.5 rounded-full dark:hover:bg-[#333d42] cursor-pointer"
            aria-label="Upvote"
          >
            <ArrowUp className="w-4 h-4 hover:text-blue-400" />
          </button>

          <span className="font-medium px-1 text-gray-800 dark:text-gray-100">
            {score}
          </span>

          <button
            type="button"
            onClick={onDownvote}
            className="p-1.5 rounded-full dark:hover:bg-[#333d42] cursor-pointer"
            aria-label="Downvote"
          >
            <ArrowDown className="w-4 h-4 hover:text-red-400" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onShare}
            className="flex items-center gap-1.5 bg-slate-200 hover:bg-slate-300 dark:hover:bg-[#333d42] dark:bg-[#2a3236] px-3 py-2 rounded-full cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden xs:inline">Share</span>
            <span className="xs:hidden">Share</span>
          </button>

          {/*           <button
            type="button"
            onClick={onSave}
            className="flex items-center gap-1.5 hover:bg-[#F6F7F8] dark:hover:bg-[#343536] px-3 py-2 rounded-full cursor-pointer"
          >
            <Bookmark className="w-4 h-4" />
            <span className="hidden xs:inline">Save</span>
            <span className="xs:hidden">Save</span>
          </button> */}
        </div>
      </div>
    </article>
  );
}