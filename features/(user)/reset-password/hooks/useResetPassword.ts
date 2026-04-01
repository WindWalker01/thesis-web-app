"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { updatePassword } from "@/features/(user)/auth/server/auth";
import {
    RecoveryOtpInput,
    RecoveryPasswordInput
} from "../schemas/reset-password-schema";

export function useResetPassword() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [serverError, setServerError] = useState<string | null>(null);
    const [otpVerified, setOtpVerified] = useState(false);
    const [isCheckingOtp, setIsCheckingOtp] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        const storedEmail = sessionStorage.getItem("passwordResetEmail");

        if (!storedEmail) {
            router.replace("/forgot-password");
            return;
        }

        setEmail(storedEmail);
        setIsHydrated(true);
    }, [router]);

    useEffect(() => {
        if (!otpVerified || isSuccess) return;

        const handleUnload = async () => {
            sessionStorage.removeItem("passwordResetEmail");
            sessionStorage.removeItem("passwordRecoveryVerified");
            await supabase.auth.signOut();
        };

        const handleVisibility = () => {
            if (document.visibilityState === "hidden") {
                handleUnload();
            }
        };

        window.addEventListener("beforeunload", handleUnload);
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            window.removeEventListener("beforeunload", handleUnload);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, [otpVerified, isSuccess]);

    const verifyOtp = async (data: RecoveryOtpInput): Promise<void> => {
        if (!email) return;

        setServerError(null);
        setIsCheckingOtp(true);

        const { error } = await supabase.auth.verifyOtp({
            email,
            token: data.token,
            type: "recovery",
        });

        if (error) {
            setServerError(error.message);
            setIsCheckingOtp(false);
            return;
        }

        sessionStorage.setItem("passwordRecoveryVerified", "true");
        setOtpVerified(true);
        setIsCheckingOtp(false);
    };

    const submitNewPassword = async (
        data: RecoveryPasswordInput
    ): Promise<void> => {
        setServerError(null);
        setIsUpdatingPassword(true);

        const { error } = await updatePassword(data.password);

        if (error) {
            setServerError(error.message);
            setIsUpdatingPassword(false);
            return;
        }

        sessionStorage.removeItem("passwordResetEmail");
        sessionStorage.removeItem("passwordRecoveryVerified");

        await supabase.auth.signOut();

        setIsSuccess(true);
        setIsUpdatingPassword(false);

        setTimeout(() => {
            router.push("/login?message=password_updated");
            router.refresh();
        }, 1500);
    };

    return {
        email,
        serverError,
        otpVerified,
        isCheckingOtp,
        isUpdatingPassword,
        isSuccess,
        isHydrated,
        setServerError,
        verifyOtp,
        submitNewPassword,
    };
}