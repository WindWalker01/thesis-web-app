"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { signOut } from "@/features/user/auth/server/auth";

export type SettingsTab =
    | "profile"
    | "notifications"
    | "security"
    | "theme"
    | "nsfw"
    | "artwork-ownership"
    | "plagiarism-history"
    | "plagiarism-checker"
    | "upload-artwork"
    | "my-reports";

export function useSettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>("theme");
    const [showLogout, setShowLogout] = useState(false);
    const [isLoggingOut, startLogoutTransition] = useTransition();

    const openLogoutModal = useCallback(() => {
        setShowLogout(true);
    }, []);

    const closeLogoutModal = useCallback(() => {
        if (isLoggingOut) return;
        setShowLogout(false);
    }, [isLoggingOut]);

    const handleTabChange = useCallback((tab: SettingsTab) => {
        setActiveTab(tab);
    }, []);

    const handleLogout = useCallback(() => {
        startLogoutTransition(async () => {
            await signOut();
        });
    }, [startLogoutTransition]);

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
        [activeTab, showLogout, isLoggingOut, openLogoutModal, closeLogoutModal, handleLogout, handleTabChange]
    );
}