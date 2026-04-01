"use client";

import Link from "next/link";
import { Controller, type UseFormReturn } from "react-hook-form";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";

import { RecoveryOtpInput } from "../schemas/reset-password-schema";

interface VerifyOtpStepProps {
    email: string;
    serverError: string | null;
    isCheckingOtp: boolean;
    form: UseFormReturn<RecoveryOtpInput>;
    onSubmit: (data: RecoveryOtpInput) => void | Promise<void>;
}

export function VerifyOtpStep({
    email,
    serverError,
    isCheckingOtp,
    form,
    onSubmit,
}: VerifyOtpStepProps) {
    return (
        <Card className="overflow-hidden border-slate-700/50 bg-slate-800/50 p-0 shadow-2xl backdrop-blur-sm">
            <CardContent className="p-0">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-6 md:p-8">
                    <div className="flex flex-col items-center text-center">
                        <h1 className="text-2xl font-bold text-white">Enter reset code</h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Enter the 8-digit code sent to <strong className="text-white">{email}</strong>.
                        </p>
                    </div>

                    {serverError && (
                        <Alert className="border-red-500/30 bg-red-500/10 text-red-400">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="ml-2">{serverError}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-1.5">
                        <Label className="text-slate-300 text-center">8-digit OTP</Label>

                        <Controller
                            name="token"
                            control={form.control}
                            render={({ field }) => (
                                <InputOTP
                                    maxLength={8}
                                    value={field.value}
                                    onChange={field.onChange}
                                    containerClassName="justify-center"
                                >
                                    <InputOTPGroup>
                                        {Array.from({ length: 8 }).map((_, i) => (
                                            <InputOTPSlot
                                                key={i}
                                                index={i}
                                                className="border-slate-600/60 bg-slate-900/60 text-white"
                                            />
                                        ))}
                                    </InputOTPGroup>
                                </InputOTP>
                            )}
                        />

                        {form.formState.errors.token && (
                            <p className="text-xs text-red-400">
                                {form.formState.errors.token.message}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={isCheckingOtp}
                        className="h-11 w-full bg-blue-600 font-semibold text-white hover:bg-blue-500"
                    >
                        {isCheckingOtp ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            "Verify OTP"
                        )}
                    </Button>

                    <Link
                        href="/forgot-password"
                        className="flex items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Forgot Password
                    </Link>
                </form>
            </CardContent>
        </Card>
    );
}