import { Award, Crown, Star } from "lucide-react";

import type { ArtistBadge } from "../types";

type RecognitionBadgeProps = {
  tier?: ArtistBadge;
  className?: string;
};

type TierStyle = {
  label: string;
  icon: typeof Award;
  className: string;
};

/**
 * Visual style per recognition tier. "Emerging" is intentionally omitted so the
 * badge is hidden for low-recognition artists, keeping cards uncluttered and
 * making the higher tiers meaningful.
 *
 * Palette follows the app's orange/blue theme: blue for the entry tier,
 * a blue-to-orange gradient for the middle tier, and full orange for the
 * top tier. Each capsule carries a soft matching "aura" via box-shadow.
 */
const TIER_STYLES: Partial<Record<ArtistBadge, TierStyle>> = {
  Recognized: {
    label: "Recognized",
    icon: Star,
    className: [
      "border-blue-400/40 bg-blue-500/10 text-blue-600 dark:text-blue-400",
      "shadow-[0_0_12px_-2px_rgba(59,130,246,0.45)]",
      "dark:shadow-[0_0_14px_-2px_rgba(96,165,250,0.5)]",
    ].join(" "),
  },
  Acclaimed: {
    label: "Acclaimed",
    icon: Award,
    className: [
      "border-transparent bg-gradient-to-r from-blue-500/15 to-orange-500/15",
      "text-blue-600 dark:text-blue-300",
      "shadow-[0_0_14px_-2px_rgba(37,99,235,0.4),0_0_14px_-2px_rgba(249,115,22,0.4)]",
      "ring-1 ring-inset ring-blue-500/20",
    ].join(" "),
  },
  Master: {
    label: "Master",
    icon: Crown,
    className: [
      "border-orange-400/40 bg-orange-500/10 text-orange-600 dark:text-orange-400",
      "shadow-[0_0_18px_-2px_rgba(249,115,22,0.55)]",
      "dark:shadow-[0_0_20px_-2px_rgba(251,146,60,0.6)]",
    ].join(" "),
  },
};

/**
 * Community Recognition badge reflecting an artist's aggregate standing earned
 * from community engagement. Presentational only; the tier is computed server
 * side in the community feed.
 */
export function RecognitionBadge({ tier, className = "" }: RecognitionBadgeProps) {
  if (!tier) return null;

  const style = TIER_STYLES[tier];
  if (!style) return null;

  const Icon = style.icon;

  return (
    <span
      className={[
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest",
        style.className,
        className,
      ].join(" ")}
      title={`Community recognition: ${style.label}`}
    >
      <Icon className="h-3 w-3" />
      {style.label}
    </span>
  );
}