"use client";

import { Info } from "lucide-react";

export function ReportsInfoBanner() {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20 p-4">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p className="font-medium">About Reports Management</p>
          <p className="mt-1 leading-relaxed">
            Review community reports submitted against artworks. Reports help identify
            fraudulent, inappropriate, or policy-violating submissions. You may investigate,
            request evidence, and take moderation actions directly from this page.
          </p>
        </div>
      </div>
    </div>
  );
}