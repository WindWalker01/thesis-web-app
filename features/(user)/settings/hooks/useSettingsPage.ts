"use client";

import { useMemo, useState, useTransition } from "react";
import { signOut } from "@/features/(user)/auth/server/auth";

export type SettingsTab =
    | "profile"
    | "notifications"
    | "security"
    | "theme"
    | "artwork-ownership"
    | "plagiarism-history"
    | "plagiarism-checker"
    | "upload-artwork";

export function useSettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>("theme");
    const [showLogout, setShowLogout] = useState(false);
    const [isLoggingOut, startLogoutTransition] = useTransition();

    function openLogoutModal() {
        setShowLogout(true);
    }

    function closeLogoutModal() {
        if (isLoggingOut) return;
        setShowLogout(false);
    }

    function handleTabChange(tab: SettingsTab) {
        setActiveTab(tab);
    }

    function handleLogout() {
        startLogoutTransition(async () => {
            await signOut();
        });
    }

    return useMemo(
        () => ({
            activeTab,
            setActiveTab: handleTabChange,
            showLogout,
            openLogoutModal,
            closeLogoutModal,
            handleLogout,
            isLoggingOut,
        }),
        [activeTab, showLogout, isLoggingOut]
    );
}