"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { signInSchema, type SignInInput } from "@/features/user/auth/schemas/auth-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

/**
 * Reads a same-origin `?next=` path from the current URL for post-login
 * redirection. Only accepts absolute paths (no scheme/authority) to prevent
 * open-redirect abuse.
 */
function getNextPath(): string | null {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    if (next && next.startsWith("/") && !next.startsWith("//")) return next;
    return null;
}

export function useLoginForm() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { signIn, signInWithGoogle } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [oauthLoading, setOauthLoading] = useState(false);
    /* const [captchaToken, setCaptchaToken] = useState<string | null>(null); */

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInInput>({
        resolver: zodResolver(signInSchema),
    });

    const onSubmit = async (data: SignInInput) => {
        setServerError(null);

        /*         if (!captchaToken) {
                    setServerError("Please complete the CAPTCHA verification.");
                    return;
                } */

        const { error } = await signIn(data/* , captchaToken */);
        if (error) {
            setServerError(error.message);
            return;
        }
        queryClient.clear();
        router.refresh();

        // Return to the page that triggered authentication (e.g. a plagiarism
        // match action) when one was provided via ?next=. Only allow same-origin
        // absolute paths to avoid open-redirect abuse.
        const next = getNextPath();
        if (next) {
            router.push(next);
            return;
        }

        // Determine redirect based on user role
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const { data: profile } = await supabase
                .from("users")
                .select("role")
                .eq("id", session.user.id)
                .maybeSingle();

            if (profile?.role === "admin") {
                router.push("/admin/dashboard");
                return;
            }
        }

        router.push("/dashboard");
        return;
    };

    const handleGoogleLogin = async () => {
        setServerError(null);
        setOauthLoading(true);
        try {
            await signInWithGoogle();
        } catch {
            setServerError("Failed to sign in with Google. Please try again.");
            setOauthLoading(false);
        }
    };

    return {
        showPassword,
        setShowPassword,
        register,
        handleSubmit,
        onSubmit,
        handleGoogleLogin,
        errors,
        isSubmitting,
        serverError,
        setServerError,
        oauthLoading,
        setOauthLoading,
        /*         captchaToken,
                setCaptchaToken */
    };
}