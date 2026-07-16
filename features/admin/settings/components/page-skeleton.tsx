"use client";

import { Card, CardContent } from "@/components/ui/card";

export function SettingsPageSkeleton() {
  return (
    <div className="flex min-h-screen gap-6 p-4 lg:p-6">
      {/* Sidebar skeleton */}
      <div className="hidden w-60 shrink-0 space-y-4 lg:block">
        <div className="h-10 animate-pulse rounded-lg bg-muted/60" />
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-9 animate-pulse rounded-lg bg-muted/60" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="flex-1 space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded bg-muted/60" />
          <div className="h-4 w-96 animate-pulse rounded bg-muted/60" />
        </div>

        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-4 p-6">
              <div className="h-5 w-40 animate-pulse rounded bg-muted/60" />
              <div className="h-4 w-full animate-pulse rounded bg-muted/60" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-muted/60" />
              <div className="flex items-center justify-between">
                <div className="h-4 w-32 animate-pulse rounded bg-muted/60" />
                <div className="h-6 w-12 animate-pulse rounded-full bg-muted/60" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}