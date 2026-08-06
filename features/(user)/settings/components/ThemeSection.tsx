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
    {
      value: "light",
      label: "Light Mode",
      icon: Sun,
      desc: "Bright white interface.",
    },
    {
      value: "dark",
      label: "Dark Mode",
      icon: Moon,
      desc: "Dark slate interface.",
    },
    {
      value: "system",
      label: "System",
      icon: Monitor,
      desc: "Follows your OS setting.",
    },
  ];

  return (
    <>
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
          <Palette className="h-4 w-4 text-blue-500" />
        </div>
        <h2 className="text-xl font-black">Theme</h2>
      </div>

      <Card>
        <div className="p-6 pb-2">
          <p className="mb-4 text-sm font-black tracking-widest text-slate-400 uppercase">
            Appearance
          </p>

          {/* ── Three-option theme picker ── */}
          {mounted ? (
            <div className="grid max-w-sm grid-cols-3 gap-3">
              {THEME_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isActive =
                  theme === opt.value ||
                  (opt.value === "system" && theme === "system");
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={`group relative flex cursor-pointer flex-col items-center gap-2.5 rounded-xl border-2 p-4 transition-all duration-200 ${
                      isActive
                        ? "border-blue-500 bg-blue-500/8 shadow-[0_0_16px_rgba(59,130,246,0.15)]"
                        : "border-slate-200 hover:border-blue-300 hover:bg-blue-500/5 dark:border-slate-700 dark:hover:border-blue-600"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${isActive ? "bg-blue-500/15" : "bg-slate-100 group-hover:bg-blue-500/10 dark:bg-slate-800"}`}
                    >
                      <Icon
                        className={`h-4 w-4 ${isActive ? "text-blue-500" : "text-slate-400 group-hover:text-blue-400"}`}
                      />
                    </div>
                    <span
                      className={`text-center text-[11px] leading-tight font-bold ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-300"}`}
                    >
                      {opt.label}
                    </span>
                    {isActive && (
                      <span className="rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[8px] font-black tracking-widest text-blue-500 uppercase">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Skeleton while mounting */
            <div className="grid max-w-sm grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
                />
              ))}
            </div>
          )}
        </div>

        {/* Live preview strip */}
        {mounted && (
          <div className="border-border bg-muted/30 mx-6 mt-4 mb-5 flex items-center gap-3 rounded-xl border p-4">
            <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              {resolvedTheme === "dark" ? (
                <Moon className="h-4 w-4 text-blue-400" />
              ) : (
                <Sun className="h-4 w-4 text-amber-400" />
              )}
            </div>
            <div>
              <p className="text-foreground text-sm font-bold">
                Currently:{" "}
                <span className="text-primary capitalize">
                  {resolvedTheme} mode
                </span>
              </p>
              <p className="text-muted-foreground mt-0.5 text-[10px]">
                Changes apply instantly across the entire ArtForgeLab interface.
              </p>
            </div>
          </div>
        )}

        <div className="border-t border-slate-100 px-6 pt-4 pb-5 dark:border-slate-800">
          <p className="text-sm text-slate-400">
            <span className="font-semibold text-slate-500 dark:text-slate-300">
              System{" "}
            </span>{" "}
            mode automatically follows your device&apos;s OS preference.
          </p>
        </div>
      </Card>
    </>
  );
}
