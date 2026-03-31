"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/(user)/auth/hooks/useAuth";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { signUpSchema, type SignUpInput } from "@/features/(user)/auth/schemas/auth-schema";
import { zodResolver } from "@hookform/resolvers/zod";

export function useRegisterForm() {
    const { signUp, signInWithGoogle } = useAuth();

    const [serverError, setServerError] = useState<string | null>(null);
    const [oauthLoading, setOauthLoading] = useState(false);
    const [pendingEmail, setPendingEmail] = useState<string | null>(null);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignUpInput>({
        resolver: zodResolver(signUpSchema),
    });

    const onSubmit = async (data: SignUpInput) => {
        setServerError(null);

        const { error } = await signUp(data);

        if (error) {
            setServerError(error.message);
            return;
        }

        setPendingEmail(data.email);
    };

    const handleGoogleLogin = async () => {
        setServerError(null);
        setOauthLoading(true);
        try {
            await signInWithGoogle();
        } catch {
            setServerError("Failed to sign in with Google.");
            setOauthLoading(false);
        }
    };

    return {
        serverError,
        setServerError,
        oauthLoading,
        setOauthLoading,
        pendingEmail,
        setPendingEmail,
        showPassword,
        setShowPassword,
        showConfirm,
        setShowConfirm,
        register,
        handleSubmit,
        errors,
        isSubmitting,
        onSubmit,
        handleGoogleLogin
    }
}