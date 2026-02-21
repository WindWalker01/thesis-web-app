"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import {
    MoreHorizontal,
    LogIn,
    UserPlus,
    Sun,
    Moon,
    Monitor,
} from "lucide-react";

type Props = {
    loginHref?: string;
    registerHref?: string;
};

function ThemeSwitch({ checked }: { checked: boolean }) {
    return (
        <span
            className={[
                "relative inline-flex h-5 w-9 items-center rounded-full transition",
                checked ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600",
            ].join(" ")}
            aria-hidden="true"
        >
            <span
                className={[
                    "inline-block h-4 w-4 transform rounded-full bg-white transition",
                    checked ? "translate-x-4" : "translate-x-1",
                ].join(" ")}
            />
        </span>
    );
}

export default function UserMenu({
    loginHref = "/signin",
    registerHref = "/register",
}: Props) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const { theme, setTheme, resolvedTheme } = useTheme();
    const current = (theme === "system" ? resolvedTheme : theme) ?? "light";
    const isDark = current === "dark";

    // Close on outside click
    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!menuRef.current) return;
            if (!menuRef.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    // Close on ESC
    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="p-2 rounded-3xl hover:bg-[#f6f8f9] dark:hover:bg-[#181c1f] transition cursor-pointer"
                aria-label="More options"
                aria-expanded={open}
                aria-haspopup="menu"
                title="More options"
            >
                <MoreHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            {open && (
                <div
                    role="menu"
                    className={[
                        "absolute right-0 mt-2 w-56 overflow-hidden",
                        "rounded-2xl border border-[#EDEFF1] dark:border-[#343536]",
                        "bg-white dark:bg-[#272729] shadow-lg",
                    ].join(" ")}
                >
                    <div className="py-2">
                        {/* Log In */}
                        <Link
                            href={loginHref}
                            role="menuitem"
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-[#F6F7F8] dark:hover:bg-[#343536]"
                            onClick={() => setOpen(false)}
                        >
                            <LogIn className="w-4 h-4" />
                            Log In
                        </Link>

                        {/* Register */}
                        <Link
                            href={registerHref}
                            role="menuitem"
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-[#F6F7F8] dark:hover:bg-[#343536]"
                            onClick={() => setOpen(false)}
                        >
                            <UserPlus className="w-4 h-4" />
                            Register
                        </Link>

                        <div className="my-2 h-px bg-[#EDEFF1] dark:bg-[#343536]" />
                        <p className="text-xs text-gray-800 dark:text-gray-400 ml-3 mb-1">Display mode</p>

                        {/* System: show CHECK when system is active */}
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => setTheme("system")}
                            className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-[#F6F7F8] dark:hover:bg-[#343536]"
                        >
                            <span className="flex items-center gap-2">
                                <Monitor className="w-4 h-4 opacity-80" />
                                System
                            </span>

                            {theme === "system" ? (
                                <span className="text-gray-500 dark:text-gray-300 text-xs">✓</span>
                            ) : (
                                <span className="text-gray-400 dark:text-gray-500 text-xs"> </span>
                            )}
                        </button>

                        {/* Dark mode: use a SWITCH on the right */}
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => setTheme(isDark ? "light" : "dark")}
                            className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-[#F6F7F8] dark:hover:bg-[#343536]"
                        >
                            <span className="flex items-center gap-2">
                                {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                                {isDark ? "Dark mode" : "Light mode"}
                            </span>

                            <ThemeSwitch checked={isDark} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}