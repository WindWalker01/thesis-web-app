"use client";

import Link from "next/link";
import NavBar from "@/components/blocks/navbar";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, ShieldCheck, ScanSearch, FileCheck, MessageCircle,
  Award, Hash, AlertTriangle, CheckCheck, Trash2, ArrowLeft,
  Filter,
} from "lucide-react";

/* ── Types ── */
type NotifCategory = "all" | "ownership" | "plagiarism" | "community";

interface Notification {
  id: number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  timestamp: string;
  category: NotifCategory;
  read: boolean;
}

/* ── Dummy notifications (replace with API) ── */
const INITIAL_NOTIFICATIONS: Notification[] = [
  { id:  1, icon: FileCheck,    iconColor: "text-green-400",  iconBg: "bg-green-400/10",  title: "Artwork Registered",        description: "Your artwork 'Sunset Concept Art' has been successfully registered on the blockchain.",               timestamp: "2 minutes ago",   category: "ownership",  read: false },
  { id:  2, icon: ScanSearch,   iconColor: "text-orange-400", iconBg: "bg-orange-400/10", title: "Plagiarism Scan Alert",      description: "Plagiarism scan detected 2 similar artworks to 'Digital Bloom'. Similarity: 87%.",                 timestamp: "15 minutes ago",  category: "plagiarism", read: false },
  { id:  3, icon: ShieldCheck,  iconColor: "text-blue-400",   iconBg: "bg-blue-400/10",   title: "Hash Verification Complete", description: "Your perceptual hash verification for 'Cyber Samurai' is complete and recorded.",                   timestamp: "1 hour ago",      category: "ownership",  read: true  },
  { id:  4, icon: MessageCircle,iconColor: "text-purple-400", iconBg: "bg-purple-400/10", title: "New Comment",                description: "Artist 'tenshin_art' commented on your artwork 'Cyber Samurai': 'Amazing work!'",                  timestamp: "3 hours ago",     category: "community",  read: true  },
  { id:  5, icon: Award,        iconColor: "text-yellow-400", iconBg: "bg-yellow-400/10", title: "Certificate Generated",      description: "Ownership certificate for 'Digital Bloom' has been generated and is ready to download.",            timestamp: "1 day ago",       category: "ownership",  read: true  },
  { id:  6, icon: Hash,         iconColor: "text-blue-400",   iconBg: "bg-blue-400/10",   title: "Artwork Fingerprinted",      description: "Artwork 'Neon Cityscape' successfully fingerprinted using Perceptual Hashing algorithm.",           timestamp: "2 days ago",      category: "ownership",  read: true  },
  { id:  7, icon: ScanSearch,   iconColor: "text-green-400",  iconBg: "bg-green-400/10",  title: "Scan Complete — Clean",      description: "Plagiarism scan for 'Abstract Waves' completed. No similar artworks found.",                       timestamp: "3 days ago",      category: "plagiarism", read: true  },
  { id:  8, icon: AlertTriangle,iconColor: "text-amber-400",  iconBg: "bg-amber-400/10",  title: "Potential Similarity Found", description: "Ownership verification recorded for 'Forest Spirit'. Possible similarity detected (62%).",          timestamp: "4 days ago",      category: "plagiarism", read: true  },
  { id:  9, icon: MessageCircle,iconColor: "text-purple-400", iconBg: "bg-purple-400/10", title: "Artwork Upvoted",            description: "Your artwork 'Mech Warrior' received 5 new upvotes from the community.",                          timestamp: "5 days ago",      category: "community",  read: true  },
  { id: 10, icon: FileCheck,    iconColor: "text-green-400",  iconBg: "bg-green-400/10",  title: "Scan Completed",             description: "Artwork plagiarism scan for 'Cosmos Dream' completed. 0 matches found.",                          timestamp: "6 days ago",      category: "plagiarism", read: true  },
];

const CATEGORY_TABS: { id: NotifCategory; label: string }[] = [
  { id: "all",        label: "All"        },
  { id: "ownership",  label: "Ownership"  },
  { id: "plagiarism", label: "Plagiarism" },
  { id: "community",  label: "Community"  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [activeCategory, setActiveCategory] = useState<NotifCategory>("all");

  const filtered = activeCategory === "all"
    ? notifications
    : notifications.filter((n) => n.category === activeCategory);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const clearAll = () =>
    setNotifications((prev) =>
      activeCategory === "all" ? [] : prev.filter((n) => n.category !== activeCategory)
    );

  const markOneRead = (id: number) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  const deleteOne = (id: number) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <main className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <div className="h-1 w-full bg-linear-to-r from-blue-600 via-blue-400 to-orange-400" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">

        {/* Back */}
        <Link href="/settings-button" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-500 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
        >
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black">Notifications</h1>
              {unreadCount > 0 && (
                <span className="text-sm font-bold bg-orange-500 text-white px-2.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 mt-1">Stay updated on your artwork activity.</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
            <button
              onClick={clearAll}
              disabled={filtered.length === 0}
              className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-red-500/10 hover:text-red-500 hover:border-red-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        </motion.div>

        {/* Category tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: 0.08, duration: 0.35 }}
          className="flex gap-2 mb-6 overflow-x-auto pb-1"
        >
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all
                ${activeCategory === tab.id
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-blue-400 hover:text-blue-500"
                }`}
            >
              {tab.label}
              {tab.id !== "all" && (
                <span className="ml-1.5 text-[10px] opacity-70">
                  {notifications.filter((n) => n.category === tab.id && !n.read).length > 0
                    ? `${notifications.filter((n) => n.category === tab.id && !n.read).length} new`
                    : notifications.filter((n) => n.category === tab.id).length
                  }
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* Notification list */}
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 flex flex-col items-center text-center"
              >
                <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                <p className="font-bold text-slate-400">No notifications</p>
                <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
              </motion.div>
            ) : (
              filtered.map((notif, i) => {
                const Icon = notif.icon;
                return (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0  }}
                    exit={{    opacity: 0, x: 40, transition: { duration: 0.2 } }}
                    transition={{ delay: i * 0.04, duration: 0.35 }}
                    className={`group relative bg-white dark:bg-slate-900 rounded-2xl border transition-all
                      ${!notif.read
                        ? "border-blue-200 dark:border-blue-900 bg-blue-500/5"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                  >
                    <div className="flex gap-4 p-4">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl ${notif.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <Icon className={`w-5 h-5 ${notif.iconColor}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-bold leading-snug ${!notif.read ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                            {notif.title}
                          </p>
                          {!notif.read && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed mt-0.5 pr-4">{notif.description}</p>
                        <p className="text-[10px] text-slate-400 mt-1.5 font-medium">{notif.timestamp}</p>
                      </div>
                    </div>

                    {/* Hover actions */}
                    <div className="absolute right-3 top-3 hidden group-hover:flex items-center gap-1">
                      {!notif.read && (
                        <button
                          onClick={() => markOneRead(notif.id)}
                          title="Mark as read"
                          className="w-7 h-7 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 flex items-center justify-center transition-colors"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteOne(notif.id)}
                        title="Delete"
                        className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}