import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { cn } from "@/lib/client-utils";

type ReferenceLinkProps = {
  href: string;
  /** Text rendered inside the link. Defaults to the href itself. */
  children?: React.ReactNode;
  /** Visual emphasis: "primary" (accent) or "muted" (secondary text). */
  tone?: "primary" | "muted";
  /** Text size preset. */
  size?: "xs" | "sm";
  className?: string;
};

/**
 * A single external reference link with a trailing external-link icon. Used by
 * both similarity report cards to render internet-match source/image links.
 */
export function ReferenceLink({
  href,
  children,
  tone = "primary",
  size = "sm",
  className,
}: ReferenceLinkProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex items-center gap-1 break-all underline underline-offset-4",
        tone === "primary" ? "text-primary" : "text-muted-foreground",
        size === "xs" ? "text-xs" : "text-base",
        className,
      )}
    >
      {children ?? href}
      <ExternalLink
        className={cn("shrink-0", size === "xs" ? "h-3 w-3" : "h-3.5 w-3.5")}
      />
    </Link>
  );
}
