"use client";

import { useState } from "react";
import { Eye, EyeOff, AlertCircle, Info, Loader2, Lock } from "lucide-react";
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
    /** Whether the account was created via OAuth (e.g. Google) and has no password yet. */
    isOAuthAccount: boolean;
    form: UseFormReturn<RecoveryPasswordInput>;
    onSubmit: (data: RecoveryPasswordInput) => void | Promise<void>;
}

export function SetNewPasswordStep({
    serverError,
    isUpdatingPassword,
    isOAuthAccount,
    form,
    onSubmit,
}: SetNewPasswordStepProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <Card className="border-border/60 bg-card/80 shadow-xl backdrop-blur-sm">
            <CardContent className="p-0">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-6 md:p-8">
                    <div className="flex flex-col items-center text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Lock className="h-6 w-6 text-primary" />
                        </div>
                        <h1 className="mt-4 text-2xl font-bold text-foreground">
                            Set new password
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Code verified. Choose a strong new password.
                        </p>
                    </div>

                    {serverError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="ml-2">{serverError}</AlertDescription>
                        </Alert>
                    )}

                    {isOAuthAccount && (
                        <Alert className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300">
                            <Info className="h-4 w-4" />
                            <AlertDescription className="ml-2">
                                This account was created with Google. Setting a password adds
                                email sign-in to your account — you can keep using either
                                method to log in.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="new-password" className="text-foreground">New Password</Label>
                        <div className="relative">
                            <Input
                                id="new-password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder="Enter new password"
                                {...form.register("password")}
                                className="h-11 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {form.formState.errors.password && (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.password.message}
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            At least 8 characters, one uppercase letter and one number.
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="confirm-password" className="text-foreground">Confirm New Password</Label>
                        <div className="relative">
                            <Input
                                id="confirm-password"
                                type={showConfirm ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder="Confirm new password"
                                {...form.register("confirmPassword")}
                                className="h-11 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                aria-label={showConfirm ? "Hide password" : "Show password"}
                            >
                                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {form.formState.errors.confirmPassword && (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={isUpdatingPassword}
                        className="h-11 w-full font-semibold"
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