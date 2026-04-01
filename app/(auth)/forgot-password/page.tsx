"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertCircle, MailCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import {
    forgotPasswordSchema,
    type ForgotPasswordInput,
} from "@/features/(user)/auth/schemas/auth-schema";
import { forgotPassword } from "@/features/(user)/auth/server/auth";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);
    const [emailSent, setEmailSent] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordInput>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordInput) => {
        setServerError(null);
        const { error } = await forgotPassword(data.email);

        if (error) {
            setServerError(error.message);
            return;
        }

        if (typeof window !== "undefined") {
            sessionStorage.setItem("passwordResetEmail", data.email);
        }

        setEmailSent(data.email);
    };

    if (emailSent) {
        return (
            <Card className="p-6 text-center border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
                <CardContent className="space-y-4 pt-2">
                    <MailCheck className="h-12 w-12 mx-auto text-blue-500" />
                    <h1 className="text-2xl font-bold text-white">Check your email</h1>
                    <p className="text-sm text-slate-400">
                        We sent an 8-digit password reset code to{" "}
                        <strong className="text-white">{emailSent}</strong>.
                    </p>
                    <div className="space-y-2">
                        <Button
                            type="button"
                            onClick={() => router.push("/reset-password")}
                            className="w-full bg-blue-600 font-semibold text-white hover:bg-blue-500"
                        >
                            Enter OTP Code
                        </Button>
                        <p className="text-xs text-slate-500">
                            Didn&apos;t receive it? Check your spam folder or{" "}
                            <button
                                onClick={() => setEmailSent(null)}
                                className="text-blue-400 hover:text-blue-300 underline"
                            >
                                try again
                            </button>
                            .
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden p-0 border-slate-700/50 bg-slate-800/50 shadow-2xl backdrop-blur-sm">
            <CardContent className="p-0">
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-5">
                    <div className="flex flex-col items-center text-center">
                        <h1 className="text-2xl font-bold text-white">Forgot password?</h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Enter your email and we&apos;ll send you an 8-digit reset code.
                        </p>
                    </div>

                    {serverError && (
                        <Alert className="border-red-500/30 bg-red-500/10 text-red-400">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="ml-2">{serverError}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-slate-300">
                            Email address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            {...register("email")}
                            className="h-11 bg-slate-900/60 border-slate-600/60 text-white placeholder:text-slate-500 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                        />
                        {errors.email && (
                            <p className="text-xs text-red-400">{errors.email.message}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-11 w-full bg-blue-600 font-semibold text-white hover:bg-blue-500 transition-all duration-200 cursor-pointer"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending code...
                            </>
                        ) : (
                            "Send Reset Code"
                        )}
                    </Button>

                    <Link
                        href="/login"
                        className="flex items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Sign In
                    </Link>
                </form>
            </CardContent>
        </Card>
    );
}