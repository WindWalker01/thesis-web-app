"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

import {
    recoveryEmailSchema,
    type RecoveryEmailInput,
} from "../schemas/reset-password-schema";

interface EnterEmailStepProps {
    /** Pre-fills the field, e.g. after the user returned from the send-code page. */
    defaultEmail?: string;
    serverError: string | null;
    onSubmit: (data: RecoveryEmailInput) => void | Promise<void>;
}

/**
 * Shown when the user lands on /reset-password without any recovery context
 * (e.g. they already received a code — self-requested or admin-triggered —
 * and clicked "Already have a code?"). Collects the account email so the
 * OTP verification step can run.
 */
export function EnterEmailStep({
    defaultEmail = "",
    serverError,
    onSubmit,
}: EnterEmailStepProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RecoveryEmailInput>({
        resolver: zodResolver(recoveryEmailSchema),
        defaultValues: { email: defaultEmail },
    });

    return (
        <Card className="border-border/60 bg-card/80 shadow-xl backdrop-blur-sm">
            <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="flex flex-col items-center text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <KeyRound className="h-6 w-6 text-primary" />
                        </div>
                        <h1 className="mt-4 text-2xl font-bold text-foreground">
                            Already have a code?
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            If you already received a reset code — for example one sent by
                            an administrator — confirm your email below to verify it.
                        </p>
                    </div>

                    {serverError && (
                        <Alert variant="destructive">
                            <AlertDescription>{serverError}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="recovery-email" className="text-foreground">
                            Email address
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="recovery-email"
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                {...register("email")}
                                className="h-11 pl-10"
                            />
                        </div>
                        {errors.email && (
                            <p className="text-sm text-destructive">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-11 w-full font-semibold"
                    >
                        Continue to Code Entry
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
