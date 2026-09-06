"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

import {
  RecoveryOtpInput,
  RecoveryPasswordInput,
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
    let isMounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const initialize = async () => {
      // Register the recovery listener FIRST so we capture the
      // PASSWORD_RECOVERY event in every branch:
      //   1. Recovery link (PKCE code exchanged below)
      //   2. OTP verification (verifyOtp called from the form)
      const { data: listenerData } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (event === "PASSWORD_RECOVERY" && session?.user?.email) {
            if (!isMounted) return;
            const userEmail = session.user.email;
            setEmail(userEmail);
            sessionStorage.setItem("passwordResetEmail", userEmail);
            sessionStorage.setItem("passwordRecoveryVerified", "true");
            setOtpVerified(true);
          }
        },
      );
      authSubscription = listenerData.subscription;

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      // Recovery-link branch (admin-triggered reset, or self-service link):
      // The browser Supabase client was created at module-import time with
      // detectSessionInUrl: true, so it has already auto-detected the
      // ?code=xxx PKCE param in the URL and exchanged it. We do NOT call
      // exchangeCodeForSession again here — the code is already consumed.
      // Instead we just read the session that was established.
      if (code) {
        const { data } = await supabase.auth.getSession();

        if (isMounted && data.session?.user?.email) {
          const userEmail = data.session.user.email;
          setEmail(userEmail);
          sessionStorage.setItem("passwordResetEmail", userEmail);
          sessionStorage.setItem("passwordRecoveryVerified", "true");
          setOtpVerified(true);
          setIsHydrated(true);
        } else {
          // No session — the code was invalid or expired.
          if (isMounted) {
            router.replace("/forgot-password");
          }
        }
        return;
      }

      // Self-service OTP branch: the email is stored in sessionStorage
      // by the /forgot-password page. If a recovery session was already
      // verified (either via link exchange or OTP), keep the password step
      // visible across refreshes.
      const storedEmail = sessionStorage.getItem("passwordResetEmail");
      const storedVerified = sessionStorage.getItem("passwordRecoveryVerified");
      if (storedEmail) {
        if (isMounted) {
          setEmail(storedEmail);
          if (storedVerified === "true") {
            setOtpVerified(true);
          }
          setIsHydrated(true);
        }
        return;
      }

      // No recovery context at all — redirect to the self-service page.
      if (isMounted) {
        router.replace("/forgot-password");
      }
    };

    initialize();

    return () => {
      isMounted = false;
      authSubscription?.unsubscribe();
    };
  }, [router]);

  // Guard: clear recovery session when the user leaves the flow mid-way.
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

    // The PASSWORD_RECOVERY listener above also flips otpVerified; this
    // explicit set covers any timing gap.
    sessionStorage.setItem("passwordRecoveryVerified", "true");
    setOtpVerified(true);
    setIsCheckingOtp(false);
  };

  const submitNewPassword = async (
    data: RecoveryPasswordInput,
  ): Promise<void> => {
    setServerError(null);
    setIsUpdatingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

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
