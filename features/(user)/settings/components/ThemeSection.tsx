"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Palette, Sun, Moon, Monitor } from "lucide-react";
import { Card } from "../subfeatures/artwork-ownership/components/ArtworkOwnershipSection";

export default function ThemeSection() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme, resolvedTheme } = useTheme();

    useEffect(() => setMounted(true), []);

    /* ── Theme options ── */
    const THEME_OPTIONS = [
        { value: "light", label: "Light Mode", icon: Sun, desc: "Bright white interface." },
        { value: "dark", label: "Dark Mode", icon: Moon, desc: "Dark slate interface." },
        { value: "system", label: "System", icon: Monitor, desc: "Follows your OS setting." },
    ];

    return (
        <>
            <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Palette className="w-4 h-4 text-blue-500" />
                </div>
                <h2 className="text-xl font-black">Theme</h2>
            </div>

            <Card>
                <div className="p-6 pb-2">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
                        Appearance
                    </p>

                    {/* ── Three-option theme picker ── */}
                    {mounted ? (
                        <div className="grid grid-cols-3 gap-3 max-w-sm">
                            {THEME_OPTIONS.map((opt) => {
                                const Icon = opt.icon;
                                const isActive = theme === opt.value ||
                                    (opt.value === "system" && theme === "system");
                                return (
                                    <button
                                        key={opt.value}
                                        onClick={() => setTheme(opt.value)}
                                        className={`group relative p-4 rounded-xl border-2 flex flex-col items-center gap-2.5 transition-all duration-200 cursor-pointer
                                            ${isActive
                                                ? "border-blue-500 bg-blue-500/8 shadow-[0_0_16px_rgba(59,130,246,0.15)]"
                                                : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-500/5"
                                            }`}
                                    >
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors
                                            ${isActive ? "bg-blue-500/15" : "bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-500/10"}`}>
                                            <Icon className={`w-4 h-4 ${isActive ? "text-blue-500" : "text-slate-400 group-hover:text-blue-400"}`} />
                                        </div>
                                        <span className={`text-[11px] font-bold text-center leading-tight
                                            ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}>
                                            {opt.label}
                                        </span>
                                        {isActive && (
                                            <span className="text-[8px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded-full">
                                                Active
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        /* Skeleton while mounting */
                        <div className="grid grid-cols-3 gap-3 max-w-sm">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-28 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                            ))}
                        </div>
                    )}
                </div>

                {/* Live preview strip */}
                {mounted && (
                    <div className="mx-6 mb-5 mt-4 rounded-xl border border-border bg-muted/30 p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            {resolvedTheme === "dark"
                                ? <Moon className="w-4 h-4 text-blue-400" />
                                : <Sun className="w-4 h-4 text-amber-400" />
                            }
                        </div>
                        <div>
                            <p className="text-xs font-bold text-foreground">
                                Currently: <span className="text-primary capitalize">{resolvedTheme} mode</span>
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                Changes apply instantly across the entire ArtForgeLab interface.
                            </p>
                        </div>
                    </div>
                )}

                <div className="px-6 pb-5 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <p className="text-xs text-slate-400">
                        <span className="font-semibold text-slate-500 dark:text-slate-300">System</span> mode
                        automatically follows your device&apos;s OS preference.
                    </p>
                </div>
            </Card>
        </>
    );
}