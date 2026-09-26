"use client";

import Image from "next/image";
import { Expand, ImageOff } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/client-utils";

/**
 * Artwork image panel for the verification card.
 *
 * Shows the *complete* artwork (object-contain) so it is never cropped, and
 * fills the surrounding space with a blurred, zoomed copy of the same image so
 * the panel keeps a consistent shape for any aspect ratio (portrait, landscape,
 * square). Tapping opens the full-resolution image in a lightbox.
 */
export function ArtworkImagePanel({
  src,
  title,
  className,
}: {
  src: string | null;
  title: string;
  className?: string;
}) {
  const alt = title || "Registered artwork";

  if (!src) {
    return (
      <div
        className={cn(
          "flex aspect-square w-full items-center justify-center rounded-2xl bg-slate-100 text-slate-400 lg:aspect-[4/5] dark:bg-slate-800 dark:text-slate-600",
          className,
        )}
      >
        <ImageOff className="h-10 w-10" />
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="View full artwork"
          className={cn(
            "group relative block aspect-square w-full overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none lg:aspect-[4/5] dark:bg-slate-800 dark:ring-slate-700/60",
            className,
          )}
        >
          {/* Blurred backdrop fills the letterbox area */}
          <Image
            src={src}
            alt=""
            aria-hidden
            fill
            sizes="(max-width: 1024px) 100vw, 40rem"
            className="scale-110 object-cover blur-2xl brightness-90"
          />
          {/* Complete artwork, never cropped */}
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 1024px) 100vw, 40rem"
            className="object-contain p-2"
            priority
          />
          {/* Expand affordance — always visible on touch, on hover for pointer */}
          <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-lg bg-black/55 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100">
            <Expand className="h-3.5 w-3.5" />
            View full
          </span>
        </button>
      </DialogTrigger>

      <DialogContent
        showCloseButton
        className="max-w-[96vw] border-0 bg-transparent p-0 shadow-none sm:max-w-3xl"
      >
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <div className="relative h-[82vh] w-full">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="96vw"
            className="object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
