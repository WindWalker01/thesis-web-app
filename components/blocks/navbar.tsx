"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ChevronDown,
  Upload,
  Bell,
  Settings,
  User as UserIcon,
  Menu,
  X,
  ShieldCheck,
  ScanSearch,
  FileCheck,
  MessageCircle,
  Award,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/features/(user)/auth/hooks/useAuth";
import LogoutButton from "@/features/(user)/auth/components/LogoutButton";

import { useNotifications } from "@/features/(user)/notifications-navbar/hooks/useNotification";
import { getNotificationUI } from "@/features/(user)/notifications-navbar/lib/notification-ui";
import { formatNotificationTime } from "@/features/(user)/notifications-navbar/lib/format-time";

/* ── Types ── */
interface Notification {
  id: number;
  icon: React.ElementType;
  color: string;
  bg: string;
  text: string;
  time: string;
  read: boolean;
}

type NavLink = {
  label: string;
  href: string;
  requiresAuth?: boolean;
};

const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard", requiresAuth: true },
  { label: "Community", href: "/community" },
  { label: "Plagiarism", href: "/plagiarism-checker" },
  { label: "About", href: "/about" },
];

const MORE_LINKS = [
  { label: "FAQ", href: "/#faq-section" },
  { label: "Terms of Use", href: "/terms-of-use" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

export default function NavBar() {
  const [moreOpen, setMoreOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user } = useAuth();

  const {
    notifications,
    unreadCount,
    isLoading: notificationsLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications(user?.id);

  const visibleNavLinks = useMemo(() => {
    return NAV_LINKS.filter((link) => {
      if (link.requiresAuth && !user) return false;
      return true;
    });
  }, [user]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* ── Logo ── */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80"
          >
            <Image
              src="/landing-page-elements/AFL_logoWeb.png"
              alt="Logo"
              width={44}
              height={52}
              className="shrink-0"
            />
            <span className="text-base font-bold tracking-tight text-blue-500">
              Art
              <span className="text-orange-600">
                Forge<span className="text-primary">Lab</span>
              </span>
            </span>
          </Link>

          {/* ── Desktop center nav (lg+) ── */}
          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 text-sm font-medium lg:flex">
            {visibleNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap transition-colors hover:text-blue-500"
              >
                {link.label}
              </Link>
            ))}

            {/* More dropdown */}
            <div
              className="relative"
              onBlur={() => setTimeout(() => setMoreOpen(false), 150)}
            >
              <button
                onClick={() => setMoreOpen((prev) => !prev)}
                className="flex cursor-pointer items-center gap-1 transition-colors hover:text-blue-500"
              >
                More
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ${moreOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute left-1/2 top-10 z-50 w-44 -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-background shadow-xl"
                  >
                    {MORE_LINKS.map((item, idx) => (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.06, duration: 0.15 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setMoreOpen(false)}
                          className="block px-4 py-2.5 text-sm transition-colors hover:bg-blue-500/10 hover:text-blue-500"
                        >
                          {item.label}
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Right side icons ── */}
          <div className="flex shrink-0 items-center gap-1">
            {/* Upload — sm+ */}
            {user && (
              <Link
                href="/upload-artwork"
                aria-label="Upload artwork"
                className="hidden h-9 w-9 items-center justify-center rounded-lg border border-orange-400 text-orange-400 transition-all hover:bg-orange-400 hover:text-white sm:flex"
              >
                <Upload className="h-4 w-4" />
              </Link>
            )}

            {/* ── Notification Bell ── */}
            {user && (
              <div
                className="relative"
                onBlur={() => setTimeout(() => setNotifOpen(false), 150)}
              >
                <button
                  onClick={() => setNotifOpen((prev) => !prev)}
                  aria-label="Notifications"
                  className="relative flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-all hover:bg-blue-500/10 hover:text-blue-500"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-black leading-none text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 top-12 z-50 w-[min(320px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
                    >
                      <div className="max-h-72 divide-y divide-border overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-border px-4 py-3">
                          <span className="text-sm font-bold">Notifications</span>

                          <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                              <>
                                <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold text-orange-500">
                                  {unreadCount} new
                                </span>

                                <button
                                  onClick={() => void markAllAsRead()}
                                  className="text-[10px] font-semibold text-blue-500 transition-colors hover:text-blue-400"
                                >
                                  Mark all read
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="max-h-72 divide-y divide-border overflow-y-auto">
                          {notificationsLoading ? (
                            <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                              Loading notifications...
                            </div>
                          ) : notifications.length === 0 ? (
                            <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                              No notifications yet.
                            </div>
                          ) : (
                            notifications.map((n, idx) => {
                              const { icon: Icon, color, bg } = getNotificationUI(n.type);

                              return (
                                <motion.button
                                  type="button"
                                  key={n.id}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.045, duration: 0.15 }}
                                  onClick={async () => {
                                    if (!n.is_read) {
                                      await markAsRead(n.id);
                                    }

                                    if (n.action_url) {
                                      window.location.href = n.action_url;
                                    }
                                  }}
                                  className={`flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${!n.is_read ? "bg-blue-500/5" : ""
                                    }`}
                                >
                                  <div
                                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg}`}
                                  >
                                    <Icon className={`h-4 w-4 ${color}`} />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-foreground">
                                      {n.title}
                                    </p>
                                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-foreground/80">
                                      {n.message}
                                    </p>
                                    <p className="mt-1 text-[10px] text-muted-foreground">
                                      {formatNotificationTime(n.created_at)}
                                    </p>
                                  </div>

                                  {!n.is_read && (
                                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                                  )}
                                </motion.button>
                              );
                            })
                          )}
                        </div>
                      </div>

                      <div className="border-t border-border px-4 py-3">
                        <Link
                          href="/settings/notifications"
                          onClick={() => setNotifOpen(false)}
                          className="block py-0.5 text-center text-xs font-semibold text-blue-500 transition-colors hover:text-blue-400"
                        >
                          View All Notifications →
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ── Theme Toggle — sm+ ── */}
            <ThemeToggle className="hidden sm:flex" />

            {user && (
              <>
                <Link
                  href="/settings"
                  aria-label="Settings"
                  className="hidden h-9 w-9 items-center justify-center rounded-lg text-foreground transition-all hover:bg-blue-500/10 hover:text-blue-500 sm:flex"
                >
                  <Settings className="h-4 w-4" />
                </Link>

                <Link
                  href="/profile"
                  aria-label="Profile"
                  className="hidden h-9 w-9 items-center justify-center rounded-lg text-foreground transition-all hover:bg-orange-500/10 hover:text-orange-500 sm:flex"
                >
                  <UserIcon className="h-4 w-4" />
                </Link>
              </>
            )}

            {/* Login / Register — sm+ */}
            <div className="hidden items-center gap-1 sm:flex">
              <div className="mx-1 h-5 w-px bg-border" />
              {user ? (
                <LogoutButton />
              ) : (
                <>
                  <Link
                    href="/login"
                    className="whitespace-nowrap px-1 text-sm font-medium transition-colors hover:text-blue-500"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="whitespace-nowrap rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* ── Hamburger — below lg ── */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle menu"
              className="ml-0.5 flex h-9 w-9 items-center justify-center rounded-lg transition-all hover:bg-muted lg:hidden"
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.span
                    key="x"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={closeMobile}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col border-l border-border bg-background lg:hidden"
            >
              {/* Panel header */}
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
                <span className="text-sm font-bold text-blue-500">
                  Art
                  <span className="text-orange-600">
                    Forge<span className="text-primary">Lab</span>
                  </span>
                </span>

                <div className="flex items-center gap-1">
                  <ThemeToggle />
                  <button
                    onClick={closeMobile}
                    className="flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto py-3">
                {/* Nav links */}
                <div className="px-3 pb-3">
                  <p className="px-3 pb-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Navigation
                  </p>

                  {visibleNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMobile}
                      className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-blue-500/10 hover:text-blue-500"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div className="mx-4 my-1 h-px bg-border" />

                {/* More links */}
                <div className="px-3 py-3">
                  <p className="px-3 pb-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    More
                  </p>

                  {MORE_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMobile}
                      className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-blue-500/10 hover:text-blue-500"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {user && (
                  <>
                    <div className="mx-4 my-1 h-px bg-border" />

                    <div className="px-3 py-3">
                      <p className="px-3 pb-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        Account
                      </p>

                      {[
                        {
                          icon: Upload,
                          label: "Upload Artwork",
                          href: "/upload-artwork",
                          color: "text-orange-500",
                        },
                        {
                          icon: Settings,
                          label: "Settings",
                          href: "/settings",
                          color: "text-blue-500",
                        },
                        {
                          icon: UserIcon,
                          label: "Profile",
                          href: "/profile",
                          color: "text-blue-500",
                        },
                      ].map(({ icon: Icon, label, href, color }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={closeMobile}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                        >
                          <Icon className={`h-4 w-4 ${color}`} />
                          <span>{label}</span>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="flex shrink-0 flex-col gap-2 border-t border-border px-4 py-5">
                {user ? (
                  <LogoutButton />
                ) : (
                  <>
                    <Link href="/login" onClick={closeMobile}>
                      <button className="w-full cursor-pointer rounded-xl border border-border py-2.5 text-sm font-semibold transition-colors hover:bg-muted">
                        Login
                      </button>
                    </Link>
                    <Link href="/register" onClick={closeMobile}>
                      <button className="w-full cursor-pointer rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
                        Register
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}