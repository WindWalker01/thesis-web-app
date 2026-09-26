"use client";

import Link from "next/link";
import { Controller, type UseFormReturn } from "react-hook-form";
import { ArrowLeft, AlertCircle, Loader2, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import {
  OTP_MAX_LENGTH,
  RecoveryOtpInput,
} from "../schemas/reset-password-schema";

interface VerifyOtpStepProps {
  email: string;
  serverError: string | null;
  isCheckingOtp: boolean;
  /** Optional: lets the user correct the email they confirmed earlier. */
  onChangeEmail?: () => void;
  form: UseFormReturn<RecoveryOtpInput>;
  onSubmit: (data: RecoveryOtpInput) => void | Promise<void>;
}

export function VerifyOtpStep({
  email,
  serverError,
  isCheckingOtp,
  onChangeEmail,
  form,
  onSubmit,
}: VerifyOtpStepProps) {
  return (
    <Card className="border-border/60 bg-card/80 shadow-xl backdrop-blur-sm">
      <CardContent className="p-0">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5 p-6 md:p-8"
        >
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <MailCheck className="h-6 w-6 text-primary" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-foreground">
              Enter reset code
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the code sent to{" "}
              <span className="font-medium text-foreground">{email}</span>.
            </p>
          </div>

          {serverError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                {serverError}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label className="flex justify-center text-muted-foreground">
              Verification code
            </Label>

            <Controller
              name="token"
              control={form.control}
              render={({ field }) => (
                <InputOTP
                  maxLength={OTP_MAX_LENGTH}
                  value={field.value}
                  onChange={field.onChange}
                  containerClassName="justify-center"
                >
                  <InputOTPGroup>
                    {Array.from({ length: OTP_MAX_LENGTH }).map((_, i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              )}
            />

            {form.formState.errors.token && (
              <p className="text-center text-sm text-destructive">
                {form.formState.errors.token.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isCheckingOtp}
            className="h-11 w-full font-semibold"
          >
            {isCheckingOtp ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify code"
            )}
          </Button>

          <div className="flex flex-col items-center gap-2">
            {onChangeEmail && (
              <button
                type="button"
                onClick={onChangeEmail}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Use a different email
              </button>
            )}
            <Link
              href="/forgot-password"
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Forgot Password
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
