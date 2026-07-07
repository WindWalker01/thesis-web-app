"use client";

import { Share2 } from "lucide-react";

import { sharePost } from "../lib/share-post";

type SharePostButtonProps = {
  postId: string;
  title?: string;
  className?: string;
};

export function SharePostButton({
  postId,
  title,
  className = "",
}: SharePostButtonProps) {
  return (
    <button
      type="button"
      onClick={() => sharePost({ postId, title })}
      className={[
        "text-muted-foreground hover:bg-muted hover:text-foreground inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-base font-medium transition",
        className,
      ].join(" ")}
      aria-label="Share post"
    >
      <Share2 className="h-4 w-4" />
      Share
    </button>
  );
}
