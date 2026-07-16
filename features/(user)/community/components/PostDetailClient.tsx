"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Flag,
  Globe,
  Loader2,
  Lock,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmActionModal from "../../settings/components/ConfirmActionModal";
import { LoginRequiredModal } from "./LoginRequiredModal";
import { SharePostButton } from "./SharePostButton";
import { ReportArtworkModal } from "../subfeatures/report-artwork/components/ReportArtworkModal";
import { useArtPost } from "../hooks/useArtPost";
import { usePostDetail } from "../hooks/usePostDetail";
import type { CommunityPostDetail } from "../server/community-feed";

export function PostDetailClient({
  post: initialPost,
  currentUserId,
  authed,
}: CommunityPostDetail) {
  const router = useRouter();

  const { state, actions } = usePostDetail({
    authed,
    currentUserId,
    post: initialPost,
  });

  const { post, isOwner, isVoting } = state;

  const {
    deleteModalOpen,
    isDeleting,
    handleDeletePost,
    openDeleteModal,
    closeDeleteModal,
  } = useArtPost({
    postId: post.postId,
    onDeleted: () => {
      router.push("/community");
    },
  });

  const upvoteActive = post.currentUserVote === "upvote";
  const downvoteActive = post.currentUserVote === "downvote";
  const VisibilityIcon = post.visibility === "private" ? Lock : Globe;

  return (
    <main className="bg-background text-foreground font-display min-h-screen">
      <div className="h-1 w-full bg-linear-to-r from-blue-600 via-primary to-orange-400" />

      <div className="mx-auto max-w-3xl px-4 pb-16 pt-24 sm:px-6">
        <Link
          href="/community"
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-2 text-sm font-medium transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to community
        </Link>

        <article className="border-border/70 bg-card/90 overflow-hidden rounded-3xl border shadow-sm">
          <div className="flex items-start justify-between gap-4 p-4 sm:p-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="border-border bg-muted relative h-11 w-11 shrink-0 overflow-hidden rounded-full border">
                {post.profileImage ? (
                  <Image
                    src={post.profileImage}
                    alt={post.fullName ?? post.username}
                    fill
                    sizes="44px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="relative flex h-full w-full items-center justify-center border-slate-900 bg-linear-to-br from-blue-500 to-orange-500 text-3xl font-black text-white shadow-[0_0_32px_rgba(59,130,246,0.4)]">
                    {(post.fullName ?? post.username)
                      .trim()
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-foreground truncate text-base font-semibold">
                  @{post.username}
                </p>

                <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-sm">
                  <Link
                    href={post.subredditHref ?? "/community"}
                    className="hover:text-primary font-medium transition"
                  >
                    {post.subredditName}
                  </Link>
                  <span>•</span>
                  <span>{post.timeAgo}</span>
                  <span>•</span>
                  <VisibilityIcon className="h-3.5 w-3.5" />
                  {post.isNsfw && (
                    <span className="inline-flex shrink-0 items-center rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold tracking-widest text-red-500 uppercase">
                      NSFW
                    </span>
                  )}
                </div>
              </div>
            </div>

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:bg-muted hover:text-foreground shrink-0 rounded-full p-2 transition"
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
                        href={`/community/edit-post/${post.postId}`}
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
                    onClick={post.hasReported ? undefined : actions.openReport}
                    disabled={post.hasReported}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Flag className="h-4 w-4" />
                    {post.hasReported ? "Reported" : "Report artwork"}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="px-4 pb-3 sm:px-5">
            {post.category && (
              <div className="border-primary/15 bg-primary/10 text-primary mb-3 inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide uppercase">
                {post.category}
              </div>
            )}

            <h1 className="text-foreground text-xl leading-snug font-black sm:text-2xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-muted-foreground mt-2 text-base leading-6">
                {post.excerpt}
              </p>
            )}

            {post.tags?.[0] ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="border-border bg-background text-muted-foreground rounded-full border px-2.5 py-1 text-[11px] font-medium">
                  #{post.tags[0]}
                </span>
              </div>
            ) : null}
          </div>

          <div className="border-border/70 bg-background border-y">
            <div className="relative aspect-square w-full">
              <Image
                src={post.imageSrc}
                alt={post.imageAlt ?? "artwork preview"}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-contain"
              />
            </div>
          </div>

          <div className="text-muted-foreground flex items-center justify-between gap-3 px-4 py-3 text-sm sm:px-5">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 font-semibold">
                {post.score}
              </div>
              <span>
                {post.upvoteCount} upvotes • {post.downvoteCount} downvotes
              </span>
            </div>
          </div>

          <div className="border-border/70 border-t px-3 py-2 sm:px-4">
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={actions.upVote}
                className={[
                  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-base font-medium transition",
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
                onClick={actions.downVote}
                className={[
                  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-base font-medium transition",
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

              <SharePostButton postId={post.postId} title={post.title} />
            </div>
          </div>
        </article>
      </div>

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

      <ReportArtworkModal
        open={state.reportOpen}
        onOpenChange={actions.setReportOpen}
        postId={post.postId}
        title={post.title}
        username={post.username}
        onSubmit={actions.handleSubmitReport}
      />

      <LoginRequiredModal
        open={state.loginOpen}
        onOpenChange={actions.setLoginOpen}
        loginHref="/login"
        message={
          state.message || "You must be logged in to interact with the community."
        }
      />
    </main>
  );
}
