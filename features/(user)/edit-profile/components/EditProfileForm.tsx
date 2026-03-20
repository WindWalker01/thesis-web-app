"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, CheckCircle, Loader2, Save, User, AtSign, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

import type { UserProfile } from "@/features/(user)/profile/server-actions/profile";
import { useEditProfileForm } from "../hooks/useEditProfileForm";

import Link from "next/link";

type Props = {
    profile: UserProfile;
};

export function EditProfileForm({ profile }: Props) {
    const {
        form,
        avatarInputRef,
        avatarPreview,
        isUploadingAvatar,
        avatarError,
        handleAvatarClick,
        handleAvatarChange,
        onSubmit,
    } = useEditProfileForm({ profile });

    const bio = form.watch("bio") ?? "";
    const isSubmitting = form.formState.isSubmitting;

    return (
        <div className="space-y-8">

            {/* ── Root error ── */}
            {form.formState.errors.root && (
                <Alert variant="destructive">
                    <AlertDescription>
                        {form.formState.errors.root.message}
                    </AlertDescription>
                </Alert>
            )}

            {/* ── Avatar section ── */}
            <div className="flex items-center gap-6">
                <div className="relative shrink-0">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center text-white text-3xl font-black border-2 border-border relative">
                        {avatarPreview ? (
                            <Image
                                src={avatarPreview}
                                alt="Avatar preview"
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        ) : (
                            <span>{profile.initials}</span>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleAvatarClick}
                        disabled={isUploadingAvatar}
                        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center text-primary-foreground shadow-md transition-colors disabled:opacity-60"
                    >
                        {isUploadingAvatar
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Camera className="w-3.5 h-3.5" />
                        }
                    </button>

                    <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleAvatarChange}
                    />
                </div>

                <div>
                    <p className="text-sm font-semibold">Profile Picture</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        JPG, PNG or WebP · Max 5 MB
                    </p>
                    {avatarError && (
                        <p className="text-xs text-destructive mt-1">{avatarError}</p>
                    )}
                    <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="px-0 mt-1 h-auto text-xs"
                        onClick={handleAvatarClick}
                        disabled={isUploadingAvatar}
                    >
                        Change Photo
                    </Button>
                </div>
            </div>

            <Separator />

            {/* ── Form fields ── */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    {/* Section: Basic Info */}
                    <div className="space-y-4">
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                            Basic Information
                        </p>

                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                            <Input
                                                placeholder="Your full name"
                                                className="pl-9"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                            <Input
                                                placeholder="your_username"
                                                className="pl-9"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        3–30 characters. Letters, numbers, underscores, dots, and hyphens only.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bio</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
                                            <Textarea
                                                placeholder="Tell the world about your art..."
                                                rows={4}
                                                className="pl-9 resize-none"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <div className="flex items-center justify-between">
                                        <FormMessage />
                                        <span className={`text-xs tabular-nums ml-auto ${bio.length > 230 ? "text-destructive" : "text-muted-foreground"}`}>
                                            {bio.length}/250
                                        </span>
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>

                    <Separator />

                    {/* ── Actions ── */}
                    <div className="flex gap-3">
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving…
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>

                        <Button
                            asChild
                            variant="outline"
                            className="flex-1"
                        >
                            <Link href="/profile">
                                Cancel
                            </Link>
                        </Button>
                    </div>

                </form>
            </Form>
        </div>
    );
}