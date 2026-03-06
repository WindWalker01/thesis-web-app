"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { MoreHorizontal, LogIn, UserPlus, Sun, Moon, Monitor } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export default function UserDropdownMenu({
    loginHref = "/signin",
    registerHref = "/register",
}: Props) {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const current = (theme === "system" ? resolvedTheme : theme) ?? "light";
    const isDark = current === "dark";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-3xl hover:bg-[#f6f8f9] dark:hover:bg-[#181c1f]"
                    aria-label="More options"
                    title="More options"
                >
                    <MoreHorizontal className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-56 rounded-2xl border border-[#EDEFF1] dark:border-[#343536] bg-white dark:bg-[#272729]"
            >
                {/* Log In */}
                <DropdownMenuItem asChild>
                    <Link href={loginHref} className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        Log In
                    </Link>
                </DropdownMenuItem>

                {/* Register */}
                <DropdownMenuItem asChild>
                    <Link href={registerHref} className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Register
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="text-xs text-gray-600 dark:text-gray-400">
                    Display mode
                </DropdownMenuLabel>

                {/* System */}
                <DropdownMenuItem
                    onSelect={(e) => {
                        e.preventDefault(); // keep menu open if you want; remove if you want it to close
                        setTheme("system");
                    }}
                    className="flex items-center justify-between"
                >
                    <span className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 opacity-80" />
                        System
                    </span>

                    {theme === "system" ? (
                        <span className="text-gray-500 dark:text-gray-300 text-xs">✓</span>
                    ) : (
                        <span className="text-transparent text-xs">✓</span>
                    )}
                </DropdownMenuItem>

                {/* Dark/Light toggle */}
                <DropdownMenuItem
                    onSelect={(e) => {
                        e.preventDefault(); // keep menu open while toggling
                        setTheme(isDark ? "light" : "dark");
                    }}
                    className="flex items-center justify-between"
                >
                    <span className="flex items-center gap-2">
                        {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                        {isDark ? "Dark mode" : "Light mode"}
                    </span>

                    <ThemeSwitch checked={isDark} />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}