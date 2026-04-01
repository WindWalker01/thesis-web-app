"use client";

import { useState } from "react";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

import { RecoveryPasswordInput } from "../schemas/reset-password-schema";

interface SetNewPasswordStepProps {
    serverError: string | null;
    isUpdatingPassword: boolean;
    form: UseFormReturn<RecoveryPasswordInput>;
    onSubmit: (data: RecoveryPasswordInput) => void | Promise<void>;
}

export function SetNewPasswordStep({
    serverError,
    isUpdatingPassword,
    form,
    onSubmit,
}: SetNewPasswordStepProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <Card className="overflow-hidden border-slate-700/50 bg-slate-800/50 p-0 shadow-2xl backdrop-blur-sm">
            <CardContent className="p-0">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-6 md:p-8">
                    <div className="flex flex-col items-center text-center">
                        <h1 className="text-2xl font-bold text-white">Set new password</h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Code verified. Choose a strong new password.
                        </p>
                    </div>

                    {serverError && (
                        <Alert className="border-red-500/30 bg-red-500/10 text-red-400">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="ml-2">{serverError}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-1.5">
                        <Label className="text-slate-300">New Password</Label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter new password"
                                {...form.register("password")}
                                className="h-11 pr-10 border-slate-600/60 bg-slate-900/60 text-white"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {form.formState.errors.password && (
                            <p className="text-xs text-red-400">
                                {form.formState.errors.password.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-slate-300">Confirm New Password</Label>
                        <div className="relative">
                            <Input
                                type={showConfirm ? "text" : "password"}
                                placeholder="Confirm new password"
                                {...form.register("confirmPassword")}
                                className="h-11 pr-10 border-slate-600/60 bg-slate-900/60 text-white"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                            >
                                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {form.formState.errors.confirmPassword && (
                            <p className="text-xs text-red-400">
                                {form.formState.errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={isUpdatingPassword}
                        className="h-11 w-full bg-blue-600 font-semibold text-white hover:bg-blue-500"
                    >
                        {isUpdatingPassword ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating password...
                            </>
                        ) : (
                            "Update Password"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}