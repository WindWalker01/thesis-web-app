"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function AuthCallbackPage() {
    const router = useRouter();

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const [cooldown, setCooldown] = useState(0);
    const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

    useEffect(() => {
        let subscription: any;

        const handleCallback = async () => {
            const params = new URLSearchParams(window.location.search);

            const urlError = params.get("error_description");
            const email = params.get("email");

            if (urlError) {
                setStatus("error");
                setErrorMessage(decodeURIComponent(urlError));
                return;
            }

            const { data, error } = await supabase.auth.getSession();

            if (error) {
                setStatus("error");
                setErrorMessage(error.message);
                return;
            }

            if (data.session) {
                setStatus("success");
                setTimeout(() => router.push("/dashboard"), 1500);
                return;
            }

            const res = supabase.auth.onAuthStateChange((event, session) => {
                if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session) {
                    setStatus("success");
                    setTimeout(() => router.push("/dashboard"), 1500);
                }
            });

            subscription = res.data.subscription;
        };

        handleCallback();

        return () => {
            subscription?.unsubscribe();
        };
    }, [router]);

    useEffect(() => {
        if (cooldown <= 0) return;

        const timer = setTimeout(() => {
            setCooldown((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [cooldown]);

    const handleResend = async () => {
        try {
            setResendStatus("sending");

            const params = new URLSearchParams(window.location.search);
            const email = params.get("email");

            if (!email) {
                throw new Error("Missing email. Please register again.");
            }

            const { error } = await supabase.auth.resend({
                type: "signup",
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/confirm?email=${encodeURIComponent(email)}`
                }
            });

            if (error) throw error;

            setResendStatus("sent");
            setCooldown(60);

        } catch (err: any) {
            setResendStatus("error");
            setErrorMessage(err.message);
        }
    };

    return (
        <main className="flex min-h-svh flex-col items-center justify-center p-6">
            <div className="flex flex-col items-center gap-4 text-center max-w-sm">

                {status === "loading" && (
                    <>
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <h1 className="text-2xl font-bold">Confirming your email...</h1>
                        <p className="text-muted-foreground text-sm">
                            Please wait while we verify your account.
                        </p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <CheckCircle className="h-12 w-12 text-green-500" />
                        <h1 className="text-2xl font-bold">Email confirmed!</h1>
                        <p className="text-muted-foreground text-sm">
                            Redirecting you to the dashboard...
                        </p>
                    </>
                )}

                {status === "error" && (
                    <>
                        <XCircle className="h-12 w-12 text-destructive" />
                        <h1 className="text-2xl font-bold">Verification failed</h1>

                        <p className="text-muted-foreground text-sm">
                            {errorMessage}
                        </p>

                        <button
                            onClick={handleResend}
                            disabled={cooldown > 0 || resendStatus === "sending"}
                            className="text-primary hover:underline text-sm disabled:opacity-50"
                        >
                            {resendStatus === "sending"
                                ? "Sending..."
                                : cooldown > 0
                                    ? `Resend in ${cooldown}s`
                                    : "Resend confirmation email"}
                        </button>

                        <a href="/register" className="text-sm text-muted-foreground hover:underline">
                            Back to Register
                        </a>
                    </>
                )}
            </div>
        </main>
    );
}