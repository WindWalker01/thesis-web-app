"use client";

import { type User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ChevronDown, Upload, Bell, Settings, User as UserIcon, Menu, X,
  ShieldCheck, ScanSearch, FileCheck, MessageCircle, Award,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/features/(user)/auth/hooks/useAuth";
import LogoutButton from "@/features/(user)/auth/components/LogoutButton";

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

/* ── Dummy notifications (replace with real API later) ── */
const DUMMY_NOTIFICATIONS: Notification[] = [
  { id: 1, icon: FileCheck, color: "text-green-400", bg: "bg-green-400/10", text: "Your artwork 'Sunset Concept Art' has been successfully registered.", time: "2m ago", read: false },
  { id: 2, icon: ScanSearch, color: "text-orange-400", bg: "bg-orange-400/10", text: "Plagiarism scan detected 2 similar artworks to 'Digital Bloom'.", time: "15m ago", read: false },
  { id: 3, icon: ShieldCheck, color: "text-blue-400", bg: "bg-blue-400/10", text: "Your perceptual hash verification is complete.", time: "1h ago", read: true },
  { id: 4, icon: MessageCircle, color: "text-purple-400", bg: "bg-purple-400/10", text: "New comment on your artwork 'Cyber Samurai'.", time: "3h ago", read: true },
  { id: 5, icon: Award, color: "text-yellow-400", bg: "bg-yellow-400/10", text: "Ownership certificate generated for 'Digital Bloom'.", time: "1d ago", read: true },
];

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Community", href: "/community" },
  { label: "Plagiarism", href: "/plagiarism-checker" },
  { label: "About", href: "/about" },
];

const MORE_LINKS = [
  { label: "FAQ", href: "/#faq-section" },
  { label: "Terms of Use", href: "/terms-of-use" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

function NavBar() {
  const [moreOpen, setMoreOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const unreadCount = DUMMY_NOTIFICATIONS.filter((n) => !n.read).length;
  const { user, loading } = useAuth();

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <nav className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
            <Image
              src="/landing-page-elements/AFL_logoWeb.png"
              alt="Logo"
              width={44}
              height={52}
              className="shrink-0"
            />
            <span className="text-base font-bold tracking-tight text-blue-500">
              Art<span className="text-orange-600">Forge<span className="text-primary">Lab</span></span>
            </span>
          </Link>

          {/* ── Desktop center nav (lg+) ── */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-6 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}
                className="hover:text-blue-500 transition-colors whitespace-nowrap">
                {link.label}
              </Link>
            ))}

            {/* More dropdown */}
            <div className="relative" onBlur={() => setTimeout(() => setMoreOpen(false), 150)}>
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className="flex items-center gap-1 hover:text-blue-500 transition-colors cursor-pointer"
              >
                More
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${moreOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute top-10 left-1/2 -translate-x-1/2 w-44 bg-background border border-border rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    {MORE_LINKS.map((item, idx) => (
                      <motion.div key={item.href}
                        initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.06, duration: 0.15 }}>
                        <Link href={item.href} onClick={() => setMoreOpen(false)}
                          className="block px-4 py-2.5 text-sm hover:bg-blue-500/10 hover:text-blue-500 transition-colors">
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
          <div className="flex items-center gap-1 shrink-0">

            {/* Upload — sm+ */}
            <Link href="/upload-artwork" aria-label="Upload artwork"
              className="hidden sm:flex w-9 h-9 rounded-lg border border-orange-400 text-orange-400 items-center justify-center hover:bg-orange-400 hover:text-white transition-all">
              <Upload className="w-4 h-4" />
            </Link>

            {/* ── Notification Bell ── */}
            <div className="relative" onBlur={() => setTimeout(() => setNotifOpen(false), 150)}>
              <button onClick={() => setNotifOpen(!notifOpen)} aria-label="Notifications"
                className="relative w-9 h-9 rounded-lg flex items-center justify-center hover:bg-blue-500/10 text-foreground hover:text-blue-500 transition-all">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-black flex items-center justify-center leading-none">
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
                    className="absolute top-12 right-0 w-[min(320px,calc(100vw-2rem))] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <span className="text-sm font-bold">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="divide-y divide-border max-h-72 overflow-y-auto">
                      {DUMMY_NOTIFICATIONS.map((n, idx) => {
                        const Icon = n.icon;
                        return (
                          <motion.div key={n.id}
                            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.045, duration: 0.15 }}
                            className={`flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer ${!n.read ? "bg-blue-500/5" : ""}`}>
                            <div className={`w-8 h-8 rounded-lg ${n.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                              <Icon className={`w-4 h-4 ${n.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs leading-relaxed text-foreground/80 line-clamp-2">{n.text}</p>
                              <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                            </div>
                            {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />}
                          </motion.div>
                        );
                      })}
                    </div>
                    <div className="px-4 py-3 border-t border-border">
                      <Link href="/settings-button/notifications" onClick={() => setNotifOpen(false)}
                        className="block text-center text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors py-0.5">
                        View All Notifications →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Theme Toggle — sm+ ── */}
            <ThemeToggle className="hidden sm:flex" />

            {/* Settings — sm+ */}
            <Link href="/settings-button" aria-label="Settings"
              className="hidden sm:flex w-9 h-9 rounded-lg items-center justify-center hover:bg-blue-500/10 text-foreground hover:text-blue-500 transition-all">
              <Settings className="w-4 h-4" />
            </Link>

            {/* Profile — sm+ */}
            <Link href="/profile" aria-label="Profile"
              className="hidden sm:flex w-9 h-9 rounded-lg items-center justify-center hover:bg-orange-500/10 text-foreground hover:text-orange-500 transition-all">
              <UserIcon className="w-4 h-4" />
            </Link>

            {/* Login / Register — sm+ */}
            <div className="hidden sm:flex items-center gap-1">
              <div className="w-px h-5 bg-border mx-1" />
              {user ? (
                <LogoutButton />
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium hover:text-blue-500 transition-colors px-1 whitespace-nowrap">
                    Login
                  </Link>
                  <Link href="/register"
                    className="bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition whitespace-nowrap">
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* ── Hamburger — below lg ── */}
            <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu"
              className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted transition-all ml-0.5">
              <AnimatePresence mode="wait">
                {mobileOpen
                  ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X className="w-5 h-5" /></motion.span>
                  : <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu className="w-5 h-5" /></motion.span>
                }
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={closeMobile}
            />

            {/* Slide-in panel */}
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className="fixed top-0 right-0 h-full w-72 bg-background border-l border-border z-50 lg:hidden flex flex-col"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 h-16 border-b border-border shrink-0">
                <span className="text-sm font-bold text-blue-500">
                  Art<span className="text-orange-600">Forge<span className="text-primary">Lab</span></span>
                </span>
                <div className="flex items-center gap-1">
                  {/* Theme toggle inside mobile drawer too */}
                  <ThemeToggle />
                  <button onClick={closeMobile}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto py-3">

                {/* Nav links */}
                <div className="px-3 pb-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-3 pb-2">Navigation</p>
                  {NAV_LINKS.map((link) => (
                    <Link key={link.href} href={link.href} onClick={closeMobile}
                      className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-500/10 hover:text-blue-500 transition-colors">
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div className="h-px bg-border mx-4 my-1" />

                {/* More links */}
                <div className="px-3 py-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-3 pb-2">More</p>
                  {MORE_LINKS.map((link) => (
                    <Link key={link.href} href={link.href} onClick={closeMobile}
                      className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-500/10 hover:text-blue-500 transition-colors">
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div className="h-px bg-border mx-4 my-1" />

                {/* Account shortcuts */}
                <div className="px-3 py-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-3 pb-2">Account</p>
                  {[
                    { icon: Upload, label: "Upload Artwork", href: "/upload-form", color: "text-orange-500" },
                    { icon: Settings, label: "Settings", href: "/settings-button", color: "text-blue-500" },
                    { icon: UserIcon, label: "Profile", href: "/profile", color: "text-blue-500" },
                  ].map(({ icon: Icon, label, href, color }) => (
                    <Link key={href} href={href} onClick={closeMobile}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span>{label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Auth buttons — pinned bottom */}
              {/* Auth buttons — pinned bottom */}
              <div className="px-4 py-5 border-t border-border space-y-2 shrink-0">
                {user ? (
                  <LogoutButton />
                ) : (
                  <>
                    <Link href="/login" onClick={closeMobile}>
                      <button className="w-full py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">
                        Login
                      </button>
                    </Link>
                    <Link href="/register" onClick={closeMobile}>
                      <button className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition">
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

export default NavBar;