"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Bell,
    Shield,
    Palette,
    ScanSearch,
    FileCheck,
    LogOut,
    ChevronRight,
    Upload,
    Settings,
} from "lucide-react";

import { useCurrentUserProfile } from "../../profile/hooks/useFetchProfile";
import { useSettingsPage, type SettingsTab } from "../hooks/useSettingsPage";
import PlagiarismHistorySection from "../subfeatures/plagiarism-history/components/PlagiarismHistorySection";
import ArtworkOwnershipSection from "../subfeatures/artwork-ownership/components/ArtworkOwnershipSection";
import ProfileSection from "./ProfileSection";
import ThemeSection from "./ThemeSection";
import ChangePasswordSection from "./ChangePasswordSection";
import LogoutConfirmModal from "./LogouConfirmModal";

interface SidebarItem {
    id: SettingsTab;
    label: string;
    icon: React.ElementType;
    href?: string;
    group?: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
    { id: "profile", label: "Profile", icon: User, group: "Account" },
    {
        id: "notifications",
        label: "Notifications",
        icon: Bell,
        group: "Account",
        href: "/settings/notifications",
    },
    { id: "security", label: "Security", icon: Shield, group: "Account" },
    { id: "theme", label: "Theme", icon: Palette, group: "Preferences" },
    {
        id: "artwork-ownership",
        label: "Artwork Ownership",
        icon: FileCheck,
        group: "Data",
    },
    {
        id: "plagiarism-history",
        label: "Plagiarism History",
        icon: ScanSearch,
        group: "Data",
    },
    {
        id: "plagiarism-checker",
        label: "Plagiarism Checker",
        icon: ScanSearch,
        group: "Quick Links",
        href: "/plagiarism-checker",
    },
    {
        id: "upload-artwork",
        label: "Upload Artwork",
        icon: Upload,
        group: "Quick Links",
        href: "/upload-artwork",
    },
];

const GROUPS = ["Account", "Preferences", "Data", "Quick Links"];

export function Card({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden ${className}`}
        >
            {children}
        </div>
    );
}

export default function SettingsPage() {
    const { profile } = useCurrentUserProfile();
    const {
        activeTab,
        setActiveTab,
        showLogout,
        openLogoutModal,
        closeLogoutModal,
        handleLogout,
        isLoggingOut,
    } = useSettingsPage();

    const activeItem = SIDEBAR_ITEMS.find((item) => item.id === activeTab);

    return (
        <main className="min-h-screen bg-background font-display text-foreground overflow-x-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-blue-400 to-orange-400" />

            <div className="relative bg-slate-900 pt-24 pb-14 px-6 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.035] pointer-events-none"
                    style={{
                        backgroundImage:
                            "radial-gradient(rgba(96,165,250,1) 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                    }}
                />

                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/25 rounded-full px-4 py-1.5 mb-4">
                            <Settings className="w-3 h-3 text-blue-400" />
                            <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">
                                Account Settings
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white leading-none">
                            Settings
                        </h1>
                        <p className="text-slate-400 text-sm mt-2">
                            Manage your account and ArtForgeLab preferences.
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 pb-0.5">
                        <span>Settings</span>
                        {activeItem && (
                            <>
                                <ChevronRight className="w-3 h-3" />
                                <span className="text-blue-400 font-semibold">
                                    {activeItem.label}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-blue-600">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-6 md:gap-10">
                    {[
                        { label: "Account", value: `${profile?.fullName ?? ""}` },
                        { label: "Role", value: "Digital Artist" },
                        { label: "Since", value: `${profile?.joinDate ?? ""}` },
                    ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2 text-sm">
                            <span className="text-blue-200 text-xs uppercase tracking-widest font-medium">
                                {item.label}
                            </span>
                            <span className="text-white font-black">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex gap-6 items-start">
                    <aside className="w-56 shrink-0 sticky top-20">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            {GROUPS.map((group) => {
                                const items = SIDEBAR_ITEMS.filter(
                                    (item) => item.group === group
                                );

                                return (
                                    <div key={group}>
                                        <div className="px-4 pt-3 pb-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
                                                {group}
                                            </p>
                                        </div>

                                        {items.map((item) => {
                                            const Icon = item.icon;
                                            const isActive =
                                                activeTab === item.id && !item.href;

                                            const buttonContent = (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        !item.href && setActiveTab(item.id)
                                                    }
                                                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-all group
${isActive
                                                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-r-2 border-blue-500"
                                                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <Icon className="w-3.5 h-3.5 shrink-0" />
                                                        <span className="text-xs">
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                    <ChevronRight className="w-3 h-3 opacity-30 group-hover:opacity-70" />
                                                </button>
                                            );

                                            return item.href ? (
                                                <Link key={item.id} href={item.href}>
                                                    {buttonContent}
                                                </Link>
                                            ) : (
                                                <div key={item.id}>{buttonContent}</div>
                                            );
                                        })}

                                        <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4 my-1" />
                                    </div>
                                );
                            })}

                            <div className="px-3 pb-3 pt-1">
                                <button
                                    type="button"
                                    onClick={openLogoutModal}
                                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-500/8 rounded-xl transition-all"
                                >
                                    <LogOut className="w-3.5 h-3.5 shrink-0" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* ── Main content ── */}
                    <div className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="space-y-4"
                            >
                                {/* ══════════════ THEME ══════════════ */}
                                {activeTab === "theme" && <ThemeSection />}

                                {/* ══════════════ SECURITY ══════════════ */}
                                {activeTab === "security" && <ChangePasswordSection />}

                                {/* ══════════════ ARTWORK OWNERSHIP ══════════════ */}
                                {activeTab === "artwork-ownership" && (<ArtworkOwnershipSection />)}

                                {/* ══════════════ PLAGIARISM HISTORY ══════════════ */}
                                {activeTab === "plagiarism-history" && (<PlagiarismHistorySection />)}

                                {/* ══════════════ PROFILE ══════════════ */}
                                {activeTab === "profile" && <ProfileSection />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                <LogoutConfirmModal
                    open={showLogout}
                    title="Log out?"
                    description="You&apos;ll need to log in again to access your artworks and ownership records."
                    icon={<LogOut className="w-6 h-6 text-red-500" />}
                    confirmLabel="Log Out"
                    loadingLabel="Logging out..."
                    isLoading={isLoggingOut}
                    onCancel={closeLogoutModal}
                    onConfirm={handleLogout}
                    confirmButtonClassName="bg-red-500 hover:bg-red-600 text-white"
                />
            </AnimatePresence>
        </main>
    );
}