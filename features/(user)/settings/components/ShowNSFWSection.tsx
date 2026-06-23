"use client";

import { ShieldAlert, Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card } from "../subfeatures/artwork-ownership/components/ArtworkOwnershipSection";
import { useShowNsfwContent } from "../subfeatures/show-nsfw-content/hooks/useShowNsfwContent";

export default function ShowNSFWSection() {
  const { showNsfwContent, togglePreference, isPending } = useShowNsfwContent();

  return (
    <>
      {/* ── Section Header ── */}
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
          <ShieldAlert className="h-4 w-4 text-blue-500" />
        </div>
        <h2 className="text-xl font-black">Content Settings</h2>
      </div>

      {/* ── Main Settings Card ── */}
      <Card>
        <div className="p-6">
          <p className="mb-5 text-xs font-black tracking-widest text-slate-400 uppercase">
            Preferences
          </p>

          {/* ── Toggle Switch Row ── */}
          <div className="flex max-w-2xl items-center justify-between gap-6 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="max-w-md space-y-1">
              <label
                htmlFor="nsfw-toggle"
                className="text-foreground cursor-pointer text-base font-bold"
              >
                Show NSFW Content
              </label>
              <p className="text-xs leading-normal text-slate-400">
                Turn this on if you want to see mature or sensitive artwork on
                the platform.
              </p>
            </div>

            <Switch
              id="nsfw-toggle"
              checked={showNsfwContent}
              onCheckedChange={togglePreference}
              disabled={isPending}
              aria-label="Toggle showing NSFW content"
            />
          </div>
        </div>

        {/* ── Status Explanation Banner ── */}
        <div className="bg-muted/20 mx-6 mb-6 flex items-start gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
            {showNsfwContent ? (
              <Eye className="h-4 w-4 text-blue-500" />
            ) : (
              <EyeOff className="h-4 w-4 text-slate-400" />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-foreground text-xs font-bold">
              What happens now?
            </p>
            <p className="text-[11px] leading-relaxed text-slate-400">
              {showNsfwContent
                ? "Mature artwork will now be visible when you search or browse your home feed."
                : "All mature artwork is hidden automatically. You will not see it anywhere in your feeds or search results."}
            </p>
          </div>
        </div>

        {/* ── Card Footer ── */}
        <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/20">
          <p className="text-[11px] text-slate-400">
            Your choice is saved securely to your profile and takes effect
            immediately.
          </p>
        </div>
      </Card>
    </>
  );
}
