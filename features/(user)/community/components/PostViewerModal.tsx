"use client";

import Image from "next/image";
import Link from "next/link";
import {
    ArrowDown,
    ArrowUp,
    Flag,
    Globe,
    Loader2,
    Lock,
    MoreHorizontal,
    Pencil,
    Share2,
    Trash2,
    X,
} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmActionModal from "../../settings/components/ConfirmActionModal";
import { useArtPost } from "../hooks/useArtPost";
import type { Post } from "../types";

type PostViewerModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    post: Post | null;
    isOwner?: boolean;
    isVoting?: boolean;
    editHref?: string;
    onDeleted?: (postId: string) => void;
    onUpvote?: () => void;
    onDownvote?: () => void;
    onReport?: () => void;
};

export function PostViewerModal({
    open,
    onOpenChange,
    post,
    isOwner = false,
    isVoting = false,
    editHref,
    onDeleted,
    onUpvote,
    onDownvote,
    onReport,
}: PostViewerModalProps) {
    if (!post) return null;

    const upvoteActive = post.currentUserVote === "upvote";
    const downvoteActive = post.currentUserVote === "downvote";
    const VisibilityIcon = post.visibility === "private" ? Lock : Globe;

    const {
        deleteModalOpen,
        isDeleting,
        handleDeletePost,
        openDeleteModal,
        closeDeleteModal,
    } = useArtPost({
        postId: post.postId,
        onDeleted: (deletedPostId) => {
            onOpenChange(false);
            onDeleted?.(deletedPostId);
        },
    });

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    showCloseButton={false}
                    className="max-h-[92vh] overflow-hidden rounded-3xl border border-border/70 bg-background p-0 shadow-2xl sm:max-w-4xl"
                >
                    <DialogTitle className="sr-only">{post.title}</DialogTitle>
                    <DialogDescription className="sr-only">
                        View this community post in a focused modal.
                    </DialogDescription>

                    <div className="flex max-h-[92vh] min-h-0 flex-col">
                        <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur sm:px-5">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-foreground">
                                    @{post.username}&apos;s Post
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Community artwork post
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                aria-label="Close post viewer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto">
                            <article className="overflow-hidden bg-card/90">
                                <div className="flex items-start justify-between gap-4 p-4 sm:p-5">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
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
                                                <div className="bg-linear-to-br from-blue-500 to-orange-500 relative flex h-full w-full items-center justify-center border-slate-900 text-3xl font-black text-white shadow-[0_0_32px_rgba(59,130,246,0.4)]">
                                                    {(post.fullName ?? post.username)
                                                        .trim()
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                <p
                                                    className="truncate text-sm font-semibold text-foreground transition hover:text-primary"
                                                >
                                                    @{post.username}
                                                </p>
                                            </div>

                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                <Link
                                                    href={post.subredditHref ?? "/community"}
                                                    className="font-medium transition hover:text-primary"
                                                >
                                                    {post.subredditName}
                                                </Link>
                                                <span>•</span>
                                                <span>{post.timeAgo}</span>
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
                                                            href={editHref ?? `/community/edit-post/${post.postId}`}
                                                            className="flex items-center gap-2"
                                                            onClick={() => onOpenChange(false)}
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

                                <div className="px-4 pb-3 sm:px-5">
                                    {post.category && (
                                        <div className="mb-3 inline-flex rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                                            {post.category}
                                        </div>
                                    )}

                                    <h2 className="text-lg font-black leading-snug text-foreground sm:text-xl">
                                        {post.title}
                                    </h2>

                                    {post.excerpt && (
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                            {post.excerpt}
                                        </p>
                                    )}

                                    {post.tags?.length ? (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {post.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>

                                <div className="border-y border-border/70 bg-background">
                                    <div className="relative aspect-square w-full">
                                        <Image
                                            src={post.imageSrc}
                                            alt={post.imageAlt ?? "artwork preview"}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 900px"
                                            className="object-contain"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-3 px-4 py-3 text-xs text-muted-foreground sm:px-5">
                                    <div className="flex items-center gap-3">
                                        <div className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-primary/10 px-2 font-semibold text-primary">
                                            {post.score}
                                        </div>
                                        <span>
                                            {post.upvoteCount} upvotes • {post.downvoteCount} downvotes
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
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

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