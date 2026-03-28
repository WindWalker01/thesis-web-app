"use client";

import Link from "next/link";
import NavBar from "@/components/blocks/navbar";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useCurrentUserProfile } from "@/features/(user)/profile/hooks/useFetchProfile";
import { EditProfileForm } from "./EditProfileForm";
import { EditProfileSkeleton } from "./EditProfileSkeleton";

export default function EditProfilePage() {
    const { profile, isLoading, error } = useCurrentUserProfile();

    return (
        <main className="min-h-screen bg-background font-display text-foreground">
            <NavBar />
            <div className="h-1 w-full bg-linear-to-r from-blue-600 via-primary to-orange-400" />
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
            >
                <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-16">

                    {/* Back link */}
                    <Link
                        href="/profile"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Profile
                    </Link>


                    <h1 className="text-3xl font-black mb-1">Edit Profile</h1>
                    <p className="text-sm text-muted-foreground mb-8">
                        Update your artist information and public profile.
                    </p>

                    <div className="bg-card rounded-3xl border border-border p-8">
                        {isLoading && <EditProfileSkeleton />}

                        {!isLoading && error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}

                        {!isLoading && !error && profile && (
                            <EditProfileForm profile={profile} />
                        )}
                    </div>
                </div>
            </motion.div>
            {/* ── Success toast — driven by EditProfileForm via successMessage ── */}
            {/* Toast is rendered inside EditProfileForm via its own AnimatePresence */}
        </main >
    );
}