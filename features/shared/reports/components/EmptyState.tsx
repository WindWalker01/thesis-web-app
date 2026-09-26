"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Search } from "lucide-react";

type EmptyStateProps = {
  title?: string;
  description?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export function EmptyState({
  title = "No reports yet",
  description = "If you believe your artwork has been used without permission, you can submit an infringement report. Our team will review your case and take appropriate action.",
  secondaryLabel = "Browse Community Gallery",
  secondaryHref = "/community",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950/30 dark:to-amber-900/30">
          <ShieldAlert className="h-16 w-16 text-orange-400 dark:text-orange-500" />
        </div>
        <div className="absolute -right-2 -bottom-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
          <Search className="h-5 w-5 text-blue-500 dark:text-blue-400" />
        </div>
      </div>

      <h3 className="mb-2 text-xl font-bold tracking-tight">{title}</h3>
      <p className="text-muted-foreground mb-8 max-w-md text-sm leading-relaxed">
        {description}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        {secondaryHref && (
          <Button asChild variant="outline" size="lg">
            <Link href={secondaryHref}>{secondaryLabel}</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
