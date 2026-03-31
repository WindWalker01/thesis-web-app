"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { signInSchema, type SignInInput } from "@/features/(user)/auth/schemas/auth-schema";
import { zodResolver } from "@hookform/resolvers/zod";

export function useLoginForm() {
    const router = useRouter();
    const { signIn, signInWithGoogle } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [oauthLoading, setOauthLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInInput>({
        resolver: zodResolver(signInSchema),
    });

    const onSubmit = async (data: SignInInput) => {
        setServerError(null);
        const { error } = await signIn(data);
        if (error) {
            setServerError(error.message);
            return;
        }
        router.refresh();
        router.push("/dashboard");
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
        setOauthLoading
    };
}