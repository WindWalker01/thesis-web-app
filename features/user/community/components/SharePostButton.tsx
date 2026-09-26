"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Copy,
  Share2,
} from "lucide-react";
import {
  FaFacebookF,
  FaRedditAlien,
  FaWhatsapp,
  FaXTwitter,
} from "react-icons/fa6";

import {
  canUseNativeShare,
  copyPostLink,
  nativeSharePost,
  shareToFacebook,
  shareToReddit,
  shareToWhatsApp,
  shareToX,
} from "../lib/share-post";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const formattedTitle = title?.trim() ? title.trim() : "this community post";
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    const target = triggerRef.current;
    if (!target) return;

    if (typeof IntersectionObserver === "function") {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) {
            setOpen(false);
          }
        },
        { threshold: 0 }
      );

      observer.observe(target);
      return () => observer.disconnect();
    }

    const handleViewportCheck = () => {
      const rect = target.getBoundingClientRect();
      const isVisible =
        rect.bottom > 0 &&
        rect.top < window.innerHeight &&
        rect.right > 0 &&
        rect.left < window.innerWidth;

      if (!isVisible) {
        setOpen(false);
      }
    };

    window.addEventListener("scroll", handleViewportCheck, { passive: true });
    window.addEventListener("resize", handleViewportCheck);
    return () => {
      window.removeEventListener("scroll", handleViewportCheck);
      window.removeEventListener("resize", handleViewportCheck);
    };
  }, [open]);

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          className={[
            "inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-base font-semibold transition",
            open
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
            className,
          ].join(" ")}
          aria-label="Share post"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        collisionPadding={16}
        onCloseAutoFocus={(event) => event.preventDefault()}
        className="w-80 rounded-2xl p-1.5 will-change-[transform,opacity] data-[state=closed]:duration-150 data-[state=open]:duration-200"
      >
        <DropdownMenuLabel className="px-2 py-2">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
            Share post
          </p>
          <p className="text-foreground mt-1 truncate text-sm font-semibold">
            {formattedTitle}
          </p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => copyPostLink(postId)}
          className="group flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2.5"
        >
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-500">
            <Copy className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="text-foreground block text-sm font-semibold">
              Copy link
            </span>
            <span className="text-muted-foreground block text-xs">
              Quick copy for chat or comments
            </span>
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => shareToReddit({ postId, title })}
          className="group flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2.5"
        >
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 text-orange-500">
            <FaRedditAlien className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="text-foreground block text-sm font-semibold">
              Reddit
            </span>
            <span className="text-muted-foreground block text-xs">
              Create a Reddit submission
            </span>
          </span>
          <ArrowUpRight className="text-muted-foreground ml-auto h-4 w-4" />
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => shareToX({ postId, title })}
          className="group flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2.5"
        >
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-500/15 text-slate-700 dark:text-slate-200">
            <FaXTwitter className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="text-foreground block text-sm font-semibold">
              X
            </span>
            <span className="text-muted-foreground block text-xs">
              Post with title and link
            </span>
          </span>
          <ArrowUpRight className="text-muted-foreground ml-auto h-4 w-4" />
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => shareToFacebook({ postId })}
          className="group flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2.5"
        >
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-500">
            <FaFacebookF className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="text-foreground block text-sm font-semibold">
              Facebook
            </span>
            <span className="text-muted-foreground block text-xs">
              Open Facebook share dialog
            </span>
          </span>
          <ArrowUpRight className="text-muted-foreground ml-auto h-4 w-4" />
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => shareToWhatsApp({ postId, title })}
          className="group flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2.5"
        >
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500">
            <FaWhatsapp className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="text-foreground block text-sm font-semibold">
              WhatsApp
            </span>
            <span className="text-muted-foreground block text-xs">
              Send as message with preview text
            </span>
          </span>
          <ArrowUpRight className="text-muted-foreground ml-auto h-4 w-4" />
        </DropdownMenuItem>

        {canUseNativeShare() ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => nativeSharePost({ postId, title })}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2.5"
            >
              <span className="bg-primary/15 text-primary inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                <Share2 className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="text-foreground block text-sm font-semibold">
                  More options
                </span>
                <span className="text-muted-foreground block text-xs">
                  Open your device share sheet
                </span>
              </span>
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
