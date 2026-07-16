import { toast } from "sonner";

type SharePostArgs = {
  postId: string;
  title?: string;
};

const COMMUNITY_POST_PATH = "/community";

function getPostUrl(postId: string): string | null {
  if (typeof window === "undefined") return null;
  return `${window.location.origin}${COMMUNITY_POST_PATH}/${postId}`;
}

function getShareText(title?: string): string {
  if (title) return `Check out "${title}" on ArtForgeLab`;
  return "Check out this post on ArtForgeLab";
}

function openShareWindow(url: string): void {
  if (typeof window === "undefined") return;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function canUseNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export async function copyPostLink(postId: string): Promise<void> {
  const url = getPostUrl(postId);
  if (!url) return;

  try {
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  } catch {
    toast.error("Unable to copy link");
  }
}

export function shareToReddit({ postId, title }: SharePostArgs): void {
  const url = getPostUrl(postId);
  if (!url) return;

  const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(
    title ?? "ArtForgeLab Community post"
  )}`;

  openShareWindow(redditUrl);
}

export function shareToX({ postId, title }: SharePostArgs): void {
  const url = getPostUrl(postId);
  if (!url) return;

  const text = getShareText(title);
  const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

  openShareWindow(xUrl);
}

export function shareToFacebook({ postId }: Pick<SharePostArgs, "postId">): void {
  const url = getPostUrl(postId);
  if (!url) return;

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  openShareWindow(facebookUrl);
}

export function shareToWhatsApp({ postId, title }: SharePostArgs): void {
  const url = getPostUrl(postId);
  if (!url) return;

  const text = getShareText(title);
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;

  openShareWindow(whatsappUrl);
}

export async function nativeSharePost({ postId, title }: SharePostArgs): Promise<void> {
  const url = getPostUrl(postId);
  if (!url) return;

  const shareData: ShareData = {
    title: title ? `${title} — ArtForgeLab Community` : "ArtForgeLab Community post",
    text: title ? `Check out "${title}" on ArtForgeLab` : undefined,
    url,
  };

  if (!canUseNativeShare()) return;

  try {
    await navigator.share(shareData);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return;
    toast.error("Unable to share post");
  }
}

/**
 * Share a community post. Uses the native Web Share API when available
 * (mobile / supported browsers) and falls back to copying the link to the
 * clipboard with a toast. Safe to call from the browser only.
 */
export async function sharePost({ postId, title }: SharePostArgs): Promise<void> {
  if (canUseNativeShare()) {
    await nativeSharePost({ postId, title });
    return;
  }

  await copyPostLink(postId);
}
