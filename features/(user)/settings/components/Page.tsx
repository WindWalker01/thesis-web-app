"use client";

import { useState } from "react";
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
  ShieldAlert,
  FileText,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";

import { useCurrentUserProfile } from "../../profile/hooks/useFetchProfile";
import { useSettingsPage, type SettingsTab } from "../hooks/useSettingsPage";
import PlagiarismHistorySection from "../subfeatures/plagiarism-history/components/PlagiarismHistorySection";
import ArtworkOwnershipSection from "../subfeatures/artwork-ownership/components/ArtworkOwnershipSection";
import ProfileSection from "./ProfileSection";
import ThemeSection from "./ThemeSection";
import ShowNSFWSection from "./ShowNSFWSection";
import ChangePasswordSection from "./ChangePasswordSection";
import ConfirmActionModal from "./ConfirmActionModal";

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
    id: "nsfw",
    label: "Show NSFW Content",
    icon: ShieldAlert,
    group: "Preferences",
  },
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
  {
    id: "my-reports",
    label: "My Reports",
    icon: FileText,
    group: "Quick Links",
    href: "/my-reports",
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
      className={`overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [isMobileDetailView, setIsMobileDetailView] = useState(false);
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
    <main className="bg-background font-display text-foreground mt-10 min-h-screen overflow-x-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-blue-400 to-orange-400" />

      <div className="relative overflow-hidden bg-slate-900 px-4 pt-16 pb-10 sm:px-6 sm:pt-24 sm:pb-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(96,165,250,1) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="pointer-events-none absolute top-0 right-0 h-80 w-80 rounded-full bg-blue-500/8 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-orange-500/5 blur-3xl" />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-500/15 px-4 py-1.5">
              <Settings className="h-3 w-3 text-blue-400" />
              <span className="text-[10px] font-bold tracking-widest text-blue-300 uppercase">
                Account Settings
              </span>
            </div>
            <h1 className="text-3xl leading-none font-black text-white sm:text-4xl md:text-5xl">
              Settings
            </h1>
            <p className="mt-2 text-sm text-slate-400 sm:text-base">
              Manage your account and ArtForgeLab preferences.
            </p>
          </div>

          <div className="hidden items-center gap-1.5 pb-0.5 text-sm text-slate-500 sm:flex">
            <span>Settings</span>
            {activeItem && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="font-semibold text-blue-400">
                  {activeItem.label}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-blue-600">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-6 px-4 py-3 sm:px-6 md:gap-10">
          {[
            {
              label: "Account",
              value: `${profile?.firstName || profile?.lastName ? `${profile.firstName} ${profile.lastName}` : ""}`,
            },
            { label: "Role", value: "Digital Artist" },
            { label: "Since", value: `${profile?.joinDate ?? ""}` },
          ].map((item) => (
            <div
              key={item.label}
              className="flex min-w-0 items-center gap-2 text-sm sm:text-base"
            >
              <span className="text-sm font-medium tracking-widest text-blue-200 uppercase">
                {item.label}
              </span>
              <span className="truncate font-black text-white">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <aside
            className={`w-full shrink-0 lg:sticky lg:top-20 lg:w-56 ${isMobileDetailView ? "hidden lg:block" : "block"}`}
          >
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              {GROUPS.map((group, groupIndex) => {
                const items = SIDEBAR_ITEMS.filter(
                  (item) => item.group === group,
                );
                const isLastGroup = groupIndex === GROUPS.length - 1;

                return (
                  <div key={group}>
                    <div className="px-4 pt-3 pb-1">
                      <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase dark:text-slate-600">
                        {group}
                      </p>
                    </div>

                    {items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id && !item.href;

                      const buttonContent = (
                        <button
                          type="button"
                          onClick={() => {
                            if (item.href) return;
                            setActiveTab(item.id);
                            setIsMobileDetailView(true);
                          }}
                          className={`group flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left text-base font-medium transition-all ${
                            isActive
                              ? "bg-blue-500/10 text-blue-600 shadow-[inset_2px_0_0_0] shadow-blue-500 dark:text-blue-400"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="h-3.5 w-3.5 shrink-0" />
                            <span className="text-sm">{item.label}</span>
                          </div>
                          {item.href ? (
                            <ExternalLink className="h-3 w-3 opacity-20 transition-opacity group-hover:opacity-60" />
                          ) : (
                            <ChevronRight className="h-3 w-3 opacity-30 group-hover:opacity-70" />
                          )}
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

                    {!isLastGroup && (
                      <div className="mx-4 my-1 h-px bg-slate-100 dark:bg-slate-800" />
                    )}
                  </div>
                );
              })}

              <div className="px-3 pt-1 pb-3">
                <button
                  type="button"
                  onClick={openLogoutModal}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-500 transition-all hover:bg-red-500/8"
                >
                  <LogOut className="h-3.5 w-3.5 shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </aside>

          {/* ── Main content ── */}
          <div
            className={`min-w-0 flex-1 ${isMobileDetailView ? "block" : "hidden lg:block"}`}
          >
            <button
              type="button"
              onClick={() => setIsMobileDetailView(false)}
              className="mb-5 flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-white transition-colors hover:bg-blue-500/40 lg:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to settings
            </button>
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

                {activeTab === "nsfw" && <ShowNSFWSection />}

                {/* ══════════════ SECURITY ══════════════ */}
                {activeTab === "security" && <ChangePasswordSection />}

                {/* ══════════════ ARTWORK OWNERSHIP ══════════════ */}
                {activeTab === "artwork-ownership" && (
                  <ArtworkOwnershipSection />
                )}

                {/* ══════════════ PLAGIARISM HISTORY ══════════════ */}
                {activeTab === "plagiarism-history" && (
                  <PlagiarismHistorySection />
                )}

                {/* ══════════════ PROFILE ══════════════ */}
                {activeTab === "profile" && <ProfileSection />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        <ConfirmActionModal
          open={showLogout}
          title="Log out?"
          description="You'll need to log in again to access your artworks and ownership records."
          icon={<LogOut className="h-6 w-6 text-red-500" />}
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
