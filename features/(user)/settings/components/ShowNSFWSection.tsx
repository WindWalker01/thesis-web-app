// File: .../settings/components/ShowNSFWSection.tsx
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
            <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4 text-blue-500" />
                </div>
                <h2 className="text-xl font-black">Content Settings</h2>
            </div>

            {/* ── Main Settings Card ── */}
            <Card>
                <div className="p-6">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5">
                        Preferences
                    </p>

                    {/* ── Toggle Switch Row ── */}
                    <div className="flex items-center justify-between gap-6 max-w-2xl bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="space-y-1 max-w-md">
                            <label 
                                htmlFor="nsfw-toggle" 
                                className="text-sm font-bold text-foreground cursor-pointer"
                            >
                                Show NSFW Content
                            </label>
                            <p className="text-xs text-slate-400 leading-normal">
                                Turn this on if you want to see mature or sensitive artwork on the platform.
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
                <div className="mx-6 mb-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-muted/20 p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                        {showNsfwContent ? (
                            <Eye className="w-4 h-4 text-blue-500" />
                        ) : (
                            <EyeOff className="w-4 h-4 text-slate-400" />
                        )}
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-foreground">
                            What happens now?
                        </p>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            {showNsfwContent ? (
                                "Mature artwork will now be visible when you search or browse your home feed."
                            ) : (
                                "All mature artwork is hidden automatically. You will not see it anywhere in your feeds or search results."
                            )}
                        </p>
                    </div>
                </div>

                {/* ── Card Footer ── */}
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                    <p className="text-[11px] text-slate-400">
                        Your choice is saved securely to your profile and takes effect immediately.
                    </p>
                </div>
            </Card>
        </>
    );
}