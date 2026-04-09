"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell,
    CheckCheck,
    Trash2,
    ArrowLeft,
} from "lucide-react";

import {
    CATEGORY_TABS
} from "../types";
import { useNotificationsPage } from "../hooks/useNotificationsPage";


export default function NotificationsPage() {
    const {
        activeCategory,
        setActiveCategory,
        notifications,
        filtered,
        unreadCount,
        isLoading,
        error,
        markAllRead,
        clearAll,
        markOneRead,
        deleteOne,
        isMarkingAllRead,
        isClearingAll,
    } = useNotificationsPage();

    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
            <div className="h-1 w-full bg-linear-to-r from-blue-600 via-blue-400 to-orange-400" />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
                <Link
                    href="/settings"
                    className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-500 transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
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
                        <p className="text-sm text-slate-400 mt-1">
                            Stay updated on your artwork activity.
                        </p>
                    </div>

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

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08, duration: 0.35 }}
                    className="flex gap-2 mb-6 overflow-x-auto pb-1"
                >
                    {CATEGORY_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveCategory(tab.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeCategory === tab.id
                                ? "bg-blue-500 text-white shadow-md"
                                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-blue-400 hover:text-blue-500"
                                }`}
                        >
                            {tab.label}
                            {tab.id !== "all" && (
                                <span className="ml-1.5 text-[10px] opacity-70">
                                    {notifications.filter(
                                        (notification) =>
                                            notification.category === tab.id &&
                                            !notification.is_read
                                    ).length > 0
                                        ? `${notifications.filter(
                                            (notification) =>
                                                notification.category === tab.id &&
                                                !notification.is_read
                                        ).length} new`
                                        : notifications.filter(
                                            (notification) =>
                                                notification.category === tab.id
                                        ).length}
                                </span>
                            )}
                        </button>
                    ))}
                </motion.div>

                <div className="space-y-2">
                    <AnimatePresence>
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4"
                                >
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                                            <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                                            <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : filtered.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 flex flex-col items-center text-center"
                            >
                                <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                                <p className="font-bold text-slate-400">No notifications</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    You're all caught up!
                                </p>
                            </motion.div>
                        ) : (
                            filtered.map((notification, index) => {
                                const Icon = notification.icon;
                                const rowContent = (
                                    <>
                                        <div className="flex gap-4 p-4">
                                            <div
                                                className={`w-10 h-10 rounded-xl ${notification.iconBg} flex items-center justify-center shrink-0 mt-0.5`}
                                            >
                                                <Icon
                                                    className={`w-5 h-5 ${notification.iconColor}`}
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p
                                                        className={`text-sm font-bold leading-snug ${!notification.is_read
                                                            ? "text-slate-900 dark:text-white"
                                                            : "text-slate-700 dark:text-slate-300"
                                                            }`}
                                                    >
                                                        {notification.title}
                                                    </p>
                                                    {!notification.is_read && (
                                                        <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                                                    )}
                                                </div>

                                                <p className="text-xs text-slate-500 leading-relaxed mt-0.5 pr-4">
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                                                    {notification.timestamp}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="absolute right-3 top-3 hidden group-hover:flex items-center gap-1">
                                            {!notification.is_read && (
                                                <button
                                                    onClick={(event) => {
                                                        event.preventDefault();
                                                        event.stopPropagation();
                                                        markOneRead(notification.id);
                                                    }}
                                                    title="Mark as read"
                                                    className="w-7 h-7 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 flex items-center justify-center transition-colors"
                                                >
                                                    <CheckCheck className="w-3.5 h-3.5" />
                                                </button>
                                            )}

                                            <button
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    event.stopPropagation();
                                                    deleteOne(notification.id);
                                                }}
                                                title="Delete"
                                                className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </>
                                );

                                if (notification.action_url) {
                                    return (
                                        <motion.div
                                            key={notification.id}
                                            layout
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{
                                                opacity: 0,
                                                x: 40,
                                                transition: { duration: 0.2 },
                                            }}
                                            transition={{
                                                delay: index * 0.04,
                                                duration: 0.35,
                                            }}
                                            className={`group relative bg-white dark:bg-slate-900 rounded-2xl border transition-all ${!notification.is_read
                                                ? "border-blue-200 dark:border-blue-900 bg-blue-500/5"
                                                : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                                                }`}
                                        >
                                            <Link href={notification.action_url}>
                                                {rowContent}
                                            </Link>
                                        </motion.div>
                                    );
                                }

                                return (
                                    <motion.div
                                        key={notification.id}
                                        layout
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{
                                            opacity: 0,
                                            x: 40,
                                            transition: { duration: 0.2 },
                                        }}
                                        transition={{
                                            delay: index * 0.04,
                                            duration: 0.35,
                                        }}
                                        className={`group relative bg-white dark:bg-slate-900 rounded-2xl border transition-all ${!notification.is_read
                                            ? "border-blue-200 dark:border-blue-900 bg-blue-500/5"
                                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                                            }`}
                                    >
                                        {rowContent}
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