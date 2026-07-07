import { toast } from "sonner";

type SharePostArgs = {
  postId: string;
  title?: string;
};

/**
 * Share a community post. Uses the native Web Share API when available
 * (mobile / supported browsers) and falls back to copying the link to the
 * clipboard with a toast. Safe to call from the browser only.
 */
export async function sharePost({ postId, title }: SharePostArgs): Promise<void> {
  if (typeof window === "undefined") return;

  const url = `${window.location.origin}/community/${postId}`;
  const shareData: ShareData = {
    title: title ? `${title} — ArtForgeLab Community` : "ArtForgeLab Community post",
    text: title ? `Check out "${title}" on ArtForgeLab` : undefined,
    url,
  };

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      // The user dismissed the native share sheet — treat as a no-op.
      if (error instanceof DOMException && error.name === "AbortError") return;
      // Any other failure falls through to the clipboard path below.
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  } catch {
    toast.error("Unable to copy link");
  }
}
