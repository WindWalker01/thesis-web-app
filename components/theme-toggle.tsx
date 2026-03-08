"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ThemeToggle
 * Drop-in anywhere — navbar, settings, etc.
 * Reads the resolved theme from next-themes and toggles between light / dark.
 * Uses `mounted` guard to avoid hydration mismatch.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only render after mount so server HTML matches
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    // Placeholder same size to prevent layout shift
    return <div className={`w-9 h-9 rounded-lg ${className}`} />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative w-9 h-9 rounded-lg flex items-center justify-center
                  hover:bg-blue-500/10 text-foreground hover:text-blue-500
                  transition-all cursor-pointer duration-200 ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0,   opacity: 1, scale: 1   }}
            exit={{    rotate:  90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute"
          >
            <Sun className="w-4 h-4 text-amber-400" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ rotate:  90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0,   opacity: 1, scale: 1   }}
            exit={{    rotate: -90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute"
          >
            <Moon className="w-4 h-4 text-blue-400" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}