"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteSettings } from "@/features/admin/settings/lib/use-site-settings";
import { DEFAULT_SETTINGS } from "@/features/admin/settings/constants";
import { cn } from "@/lib/client-utils";
import { BrandNameDisplay } from "@/features/admin/settings/lib/split-brand-name";

type LogoProps = {
  /** Whether to show the text next to the logo image */
  showText?: boolean;
  /** Optional className override */
  className?: string;
  /** Image width (default: 44) */
  width?: number;
  /** Image height (default: 52) */
  height?: number;
  /** Link href (default: "/") */
  href?: string;
  /** Optional text variant for different contexts (e.g. "light" for dark backgrounds) */
  variant?: "default" | "light";
};

const DEFAULT_LOGO = DEFAULT_SETTINGS.platform_logo_url as string;

export function Logo({
  showText = true,
  className,
  width = 44,
  height = 52,
  href = "/",
  variant = "default",
}: LogoProps) {
  const { settings } = useSiteSettings();
  const logoUrl = settings.platform_logo_url || DEFAULT_LOGO;

  const content = (
    <div className={cn("flex shrink-0 items-center gap-2", className)}>
      <Image
        src={logoUrl}
        alt={settings.platform_name}
        width={width}
        height={height}
        className="shrink-0"
        onError={(e) => {
          // Fallback to default logo on error
          const target = e.currentTarget;
          if (target.src !== DEFAULT_LOGO) {
            target.src = DEFAULT_LOGO;
          }
        }}
      />
      {showText && (
        <span className="text-base font-bold tracking-tight">
          <BrandNameDisplay name={settings.platform_name} variant={variant} />
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="transition-opacity hover:opacity-80"
      >
        {content}
      </Link>
    );
  }

  return content;
}
