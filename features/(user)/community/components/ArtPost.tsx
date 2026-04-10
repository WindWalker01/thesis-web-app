"use client";

import {
  ArrowDown,
  ArrowUp,
  Globe,
  Lock,
  Flag,
  Loader2,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmActionModal from "../../settings/components/ConfirmActionModal";
import { useArtPost } from "../hooks/useArtPost";
import type { VoteType, PostVisibility } from "../types";

export type ArtPostProps = {
  postId: string;

  subredditName: string;
  subredditHref?: string;

  username: string;
  userHref?: string;
  fullName?: string;
  profileImage?: string | null;
  timeAgo?: string;

  title: string;
  imageSrc: string;
  imageAlt?: string;

  score: number;
  upvoteCount: number;
  downvoteCount: number;
  currentUserVote: VoteType;
  visibility: PostVisibility;

  category?: string;
  excerpt?: string;
  artistBadge?: "Verified" | "Emerging" | "Featured";
  tags?: string[];

  isOwner?: boolean;
  editHref?: string;
  onDeleted?: (postId: string) => void;
  onOpen?: () => void;

  onUpvote?: () => void;
  onDownvote?: () => void;
  onShare?: () => void;
  onReport?: () => void;

  isVoting?: boolean;
  className?: string;
};

export function ArtPost({
  postId,
  subredditName,
  subredditHref = "/community",
  profileImage,
  username,
  fullName,
  timeAgo = "",
  title,
  imageSrc,
  imageAlt = "artwork preview",
  score,
  upvoteCount,
  downvoteCount,
  currentUserVote,
  category,
  excerpt,
  visibility,
  tags = [],
  isOwner = false,
  editHref,
  onDeleted,
  onOpen,
  onUpvote,
  onDownvote,
  onReport,
  isVoting = false,
  className = "",
}: ArtPostProps) {
  const {
    deleteModalOpen,
    isDeleting,
    handleDeletePost,
    openDeleteModal,
    closeDeleteModal,
  } = useArtPost({
    postId,
    onDeleted,
  });

  const upvoteActive = currentUserVote === "upvote";
  const downvoteActive = currentUserVote === "downvote";
  const VisibilityIcon = visibility === "private" ? Lock : Globe;

  return (
    <>
      <article
        className={[
          "overflow-hidden rounded-3xl border border-border/70 bg-card/90 shadow-sm backdrop-blur-sm transition-all hover:border-primary/20 hover:shadow-md",
          className,
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-4 p-4 sm:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt={fullName ?? username}
                  fill
                  sizes="44px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="bg-linear-to-br from-blue-500 to-orange-500 flex items-center justify-center text-white text-3xl font-black shadow-[0_0_32px_rgba(59,130,246,0.4)] border-slate-900 relative h-full w-full">
                  {(fullName ?? username).trim().charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <p
                  className="truncate text-sm font-semibold text-foreground transition hover:text-primary"
                >
                  @{username}
                </p>
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
                <span>•</span>
                <VisibilityIcon className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="shrink-0 rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="More options"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52 rounded-2xl">
              {isOwner ? (
                <>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link
                      href={editHref ?? `/community/edit-post/${postId}`}
                      className="flex items-center gap-2"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit post
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault();
                      openDeleteModal();
                    }}
                    className="flex cursor-pointer items-center gap-2 text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete post
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem
                  onClick={onReport}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Flag className="h-4 w-4" />
                  Report artwork
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="block w-full text-left cursor-pointer"
        >
          <div className="px-4 pb-3 sm:px-5">
            {category && (
              <div className="mb-3 inline-flex rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                {category}
              </div>
            )}

            <h2 className="text-lg font-black leading-snug text-foreground transition hover:text-primary sm:text-xl">
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
        </button>

        <div className="flex items-center justify-between gap-3 px-4 py-3 text-xs text-muted-foreground sm:px-5">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-primary/10 px-2 font-semibold text-primary">
              {score}
            </div>
            <span>
              {upvoteCount} upvotes • {downvoteCount} downvotes
            </span>
          </div>
        </div>

        <div className="border-t border-border/70 px-3 py-2 sm:px-4">
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={onUpvote}
              className={[
                "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition",
                upvoteActive
                  ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                  : "text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400",
              ].join(" ")}
              aria-label="Upvote"
            >
              {isVoting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
              Upvote
            </button>

            <button
              type="button"
              onClick={onDownvote}
              className={[
                "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition",
                downvoteActive
                  ? "bg-red-500/15 text-red-600 dark:text-red-400"
                  : "text-muted-foreground hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400",
              ].join(" ")}
              aria-label="Downvote"
            >
              {isVoting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
              Downvote
            </button>
          </div>
        </div>
      </article>

      <ConfirmActionModal
        open={deleteModalOpen}
        title="Delete this post?"
        description="This action will permanently remove this community post. This cannot be undone."
        icon={<Trash2 className="h-6 w-6 text-red-500" />}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isLoading={isDeleting}
        loadingLabel="Deleting..."
        onCancel={closeDeleteModal}
        onConfirm={handleDeletePost}
        confirmButtonClassName="bg-red-500 text-white hover:bg-red-600"
      />
    </>
  );
}