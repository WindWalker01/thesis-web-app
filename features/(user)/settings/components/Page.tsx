"use client";

import Link from "next/link";
import Image from "next/image";
import NavBar from "@/components/blocks/navbar";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
    User, Bell, Shield, Palette, Lock, ScanSearch, FileCheck,
    LogOut, ChevronRight, Sun, Moon, Eye, EyeOff, AlertTriangle,
    CheckCircle, Upload, Settings, Monitor,
} from "lucide-react";

/* ── Types ── */
type SettingsTab =
    | "profile" | "notifications" | "security"
    | "theme" | "privacy" | "artwork-ownership" | "plagiarism-history"
    | "plagiarism-checker" | "upload-artwork";

interface SidebarItem {
    id: SettingsTab;
    label: string;
    icon: React.ElementType;
    href?: string;
    group?: string;
}

/* ── Sidebar groups ── */
const SIDEBAR_ITEMS: SidebarItem[] = [
    { id: "profile", label: "Profile", icon: User, group: "Account" },
    { id: "notifications", label: "Notifications", icon: Bell, group: "Account", href: "/settings/notifications" },
    { id: "security", label: "Security", icon: Shield, group: "Account" },
    { id: "theme", label: "Theme", icon: Palette, group: "Preferences" },
    { id: "privacy", label: "Privacy", icon: Lock, group: "Preferences" },
    { id: "artwork-ownership", label: "Artwork Ownership", icon: FileCheck, group: "Data" },
    { id: "plagiarism-history", label: "Plagiarism History", icon: ScanSearch, group: "Data" },
    { id: "plagiarism-checker", label: "Plagiarism Checker", icon: ScanSearch, group: "Quick Links", href: "/plagiarism-checker" },
    { id: "upload-artwork", label: "Upload Artwork", icon: Upload, group: "Quick Links", href: "/upload-artwork" },
];

const GROUPS = ["Account", "Preferences", "Data", "Quick Links"];

/* ── Toggle ── */
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
    return (
        <button
            onClick={onChange}
            className={`relative w-11 h-6 rounded-full transition-colors duration-300 cursor-pointer
        ${enabled ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-600"}`}
        >
            <motion.div
                layout
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm ${enabled ? "left-[22px]" : "left-0.5"}`}
            />
        </button>
    );
}

/* ── Dummy data ── */
const SCAN_HISTORY = [
    { artwork: "Sunset Concept Art", date: "Jan 10, 2026", matches: 2, status: "warning" },
    { artwork: "Cyber Samurai", date: "Jan 8, 2026", matches: 0, status: "clean" },
    { artwork: "Digital Bloom", date: "Jan 5, 2026", matches: 1, status: "warning" },
    { artwork: "Abstract Waves", date: "Dec 28, 2025", matches: 0, status: "clean" },
    { artwork: "Neon Cityscape", date: "Dec 20, 2025", matches: 0, status: "clean" },
];

const OWNERSHIP_RECORDS = [
    { artwork: "Sunset Concept Art", hash: "0x4f3a...e12b", date: "Jan 10, 2026", tx: "0xabc...789", verified: true },
    { artwork: "Cyber Samurai", hash: "0x7c1d...a45e", date: "Jan 8, 2026", tx: "0xdef...012", verified: true },
    { artwork: "Digital Bloom", hash: "0x2b9f...c78d", date: "Jan 5, 2026", tx: "0x123...456", verified: false },
];

/* ── Card shell ── */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden ${className}`}>
            {children}
        </div>
    );
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>("theme");
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [scanNotifs, setScanNotifs] = useState(true);
    const [showPass, setShowPass] = useState(false);
    const [showLogout, setShowLogout] = useState(false);
    const [mounted, setMounted] = useState(false);

    /* ── next-themes ── */
    const { theme, setTheme, resolvedTheme } = useTheme();

    // Prevent hydration mismatch for theme-dependent UI
    useEffect(() => setMounted(true), []);

    const activeItem = SIDEBAR_ITEMS.find((i) => i.id === activeTab);

    /* ── Theme options ── */
    const THEME_OPTIONS = [
        { value: "light", label: "Light Mode", icon: Sun, desc: "Bright white interface." },
        { value: "dark", label: "Dark Mode", icon: Moon, desc: "Dark slate interface." },
        { value: "system", label: "System", icon: Monitor, desc: "Follows your OS setting." },
    ];

    return (
        <main className="min-h-screen bg-background font-display text-foreground overflow-x-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-blue-400 to-orange-400" />

            {/* ── Hero ── */}
            <div className="relative bg-slate-900 pt-24 pb-14 px-6 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.035] pointer-events-none"
                    style={{
                        backgroundImage: "radial-gradient(rgba(96,165,250,1) 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                    }}
                />
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/25 rounded-full px-4 py-1.5 mb-4">
                            <Settings className="w-3 h-3 text-blue-400" />
                            <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Account Settings</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white leading-none">Settings</h1>
                        <p className="text-slate-400 text-sm mt-2">Manage your account and ArtForgeLab preferences.</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 pb-0.5">
                        <span>Settings</span>
                        {activeItem && (
                            <>
                                <ChevronRight className="w-3 h-3" />
                                <span className="text-blue-400 font-semibold">{activeItem.label}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Info bar ── */}
            <div className="bg-blue-600">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-6 md:gap-10">
                    {[
                        { label: "Account", value: "Ruzzel A." },
                        { label: "Role", value: "Digital Artist" },
                        { label: "Since", value: "Jan 2026" },
                    ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2 text-sm">
                            <span className="text-blue-200 text-xs uppercase tracking-widest font-medium">{item.label}</span>
                            <span className="text-white font-black">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Two-column layout ── */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex gap-6 items-start">

                    {/* ── Sidebar ── */}
                    <aside className="w-56 shrink-0 sticky top-20">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            {GROUPS.map((group) => {
                                const items = SIDEBAR_ITEMS.filter((i) => i.group === group);
                                return (
                                    <div key={group}>
                                        <div className="px-4 pt-3 pb-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">{group}</p>
                                        </div>
                                        {items.map((item) => {
                                            const Icon = item.icon;
                                            const isActive = activeTab === item.id && !item.href;
                                            const btn = (
                                                <button
                                                    key={item.id}
                                                    onClick={() => !item.href && setActiveTab(item.id)}
                                                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-all group
                            ${isActive
                                                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-r-2 border-blue-500"
                                                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <Icon className="w-3.5 h-3.5 shrink-0" />
                                                        <span className="text-xs">{item.label}</span>
                                                    </div>
                                                    <ChevronRight className="w-3 h-3 opacity-30 group-hover:opacity-70" />
                                                </button>
                                            );
                                            return item.href
                                                ? <Link key={item.id} href={item.href}>{btn}</Link>
                                                : btn;
                                        })}
                                        <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4 my-1" />
                                    </div>
                                );
                            })}

                            {/* Logout */}
                            <div className="px-3 pb-3 pt-1">
                                <button
                                    onClick={() => setShowLogout(true)}
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
                                {activeTab === "theme" && (
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
                                )}

                                {/* ══════════════ SECURITY ══════════════ */}
                                {activeTab === "security" && (
                                    <>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                <Shield className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <h2 className="text-xl font-black">Security</h2>
                                        </div>
                                        <Card>
                                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Change Password</p>
                                            </div>
                                            <div className="p-6 space-y-4 max-w-lg">
                                                {["Current Password", "New Password", "Confirm New Password"].map((label) => (
                                                    <div key={label} className="space-y-1.5">
                                                        <label className="text-xs font-semibold text-slate-400">{label}</label>
                                                        <div className="relative">
                                                            <input
                                                                type={showPass ? "text" : "password"}
                                                                placeholder="••••••••••"
                                                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                                                            />
                                                            <button onClick={() => setShowPass(!showPass)}
                                                                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors">
                                                                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                                                    Update Password
                                                </button>
                                            </div>
                                        </Card>
                                    </>
                                )}

                                {/* ══════════════ NOTIFICATIONS ══════════════ */}
                                {activeTab === "notifications" && (
                                    <>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                <Bell className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <h2 className="text-xl font-black">Notification Preferences</h2>
                                        </div>
                                        <Card>
                                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {[
                                                    { label: "Email Notifications", desc: "Receive updates via email.", value: emailNotifs, set: () => setEmailNotifs(!emailNotifs) },
                                                    { label: "Plagiarism Scan Alerts", desc: "Get notified when scans complete.", value: scanNotifs, set: () => setScanNotifs(!scanNotifs) },
                                                    { label: "Ownership Certificate Ready", desc: "Notify when certificates are generated.", value: true, set: () => { } },
                                                    { label: "Community Comments", desc: "Notify on new artwork comments.", value: true, set: () => { } },
                                                ].map((p) => (
                                                    <div key={p.label} className="flex items-center justify-between px-6 py-4">
                                                        <div>
                                                            <p className="text-sm font-semibold">{p.label}</p>
                                                            <p className="text-xs text-slate-400 mt-0.5">{p.desc}</p>
                                                        </div>
                                                        <Toggle enabled={p.value} onChange={p.set} />
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
                                    </>
                                )}

                                {/* ══════════════ PRIVACY ══════════════ */}
                                {activeTab === "privacy" && (
                                    <>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                <Lock className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <h2 className="text-xl font-black">Privacy</h2>
                                        </div>
                                        <Card>
                                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {[
                                                    { label: "Public Profile", desc: "Allow others to view your artist profile." },
                                                    { label: "Show Artwork in Gallery", desc: "Display your artworks in the community gallery." },
                                                    { label: "Visible Hash Records", desc: "Allow public verification of your artwork hashes." },
                                                ].map((item) => (
                                                    <div key={item.label} className="flex items-center justify-between px-6 py-4">
                                                        <div>
                                                            <p className="text-sm font-semibold">{item.label}</p>
                                                            <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                                                        </div>
                                                        <Toggle enabled={true} onChange={() => { }} />
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
                                        <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/8 to-orange-400/5 p-5 flex gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                                            </div>
                                            <p className="text-xs text-slate-400 leading-relaxed pt-1">
                                                Blockchain records are always publicly verifiable by design, regardless of privacy settings.
                                            </p>
                                        </div>
                                    </>
                                )}

                                {/* ══════════════ ARTWORK OWNERSHIP ══════════════ */}
                                {activeTab === "artwork-ownership" && (
                                    <>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                <FileCheck className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <h2 className="text-xl font-black">Artwork Ownership Records</h2>
                                        </div>
                                        <Card>
                                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Blockchain Certificates</p>
                                            </div>
                                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {OWNERSHIP_RECORDS.map((rec) => (
                                                    <div key={rec.artwork} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold truncate">{rec.artwork}</p>
                                                            <p className="text-xs text-slate-400 font-mono mt-0.5">{rec.hash} · {rec.date}</p>
                                                        </div>
                                                        {rec.verified
                                                            ? <span className="text-[10px] font-bold bg-green-500/10 text-green-500 px-2.5 py-1 rounded-full flex items-center gap-1 whitespace-nowrap"><CheckCircle className="w-3 h-3" />Verified</span>
                                                            : <span className="text-[10px] font-bold bg-orange-500/10 text-orange-500 px-2.5 py-1 rounded-full flex items-center gap-1 whitespace-nowrap"><AlertTriangle className="w-3 h-3" />Pending</span>
                                                        }
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
                                    </>
                                )}

                                {/* ══════════════ PLAGIARISM HISTORY ══════════════ */}
                                {activeTab === "plagiarism-history" && (
                                    <>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                <ScanSearch className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <h2 className="text-xl font-black">Plagiarism Scan History</h2>
                                        </div>
                                        <Card>
                                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Recent Scans</p>
                                            </div>
                                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {SCAN_HISTORY.map((scan) => (
                                                    <div key={scan.artwork} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                        <div>
                                                            <p className="text-sm font-semibold">{scan.artwork}</p>
                                                            <p className="text-xs text-slate-400 mt-0.5">{scan.date}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs text-slate-400">{scan.matches} match{scan.matches !== 1 ? "es" : ""}</span>
                                                            {scan.status === "clean"
                                                                ? <span className="text-[10px] font-bold bg-green-500/10 text-green-500 px-2.5 py-1 rounded-full">Clean</span>
                                                                : <span className="text-[10px] font-bold bg-orange-500/10 text-orange-500 px-2.5 py-1 rounded-full">Matches Found</span>
                                                            }
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
                                    </>
                                )}

                                {/* ══════════════ PROFILE ══════════════ */}
                                {activeTab === "profile" && (
                                    <>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                <User className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <h2 className="text-xl font-black">Profile</h2>
                                        </div>
                                        <Card>
                                            <div className="p-6 flex items-center gap-5">
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center text-white text-xl font-black shrink-0">
                                                    RA
                                                </div>
                                                <div>
                                                    <p className="font-black text-lg">Ruzzel A.</p>
                                                    <p className="text-sm text-slate-400">@ruzzel · Digital Artist</p>
                                                    <p className="text-xs text-slate-500 mt-1">Member since January 2026</p>
                                                </div>
                                            </div>
                                            <div className="px-6 pb-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                                                <Link href="/profile/edit-profile">
                                                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                                                        Edit Profile →
                                                    </button>
                                                </Link>
                                            </div>
                                        </Card>
                                    </>
                                )}

                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* ── Logout modal ── */}
            <AnimatePresence>
                {showLogout && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowLogout(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.94, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.94, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="bg-background rounded-2xl border border-border p-8 max-w-sm w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                <LogOut className="w-6 h-6 text-red-500" />
                            </div>
                            <h3 className="text-lg font-black text-center mb-2">Log out?</h3>
                            <p className="text-sm text-slate-400 text-center mb-6">
                                You&apos;ll need to log in again to access your artworks and ownership records.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowLogout(false)}
                                    className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">
                                    Cancel
                                </button>
                                <Link href="/login" className="flex-1">
                                    <button className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors">
                                        Log Out
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}