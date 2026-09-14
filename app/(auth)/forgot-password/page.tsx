"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck, KeyRound, Mail } from "lucide-react";
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
/* import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
 */
export default function ForgotPasswordPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState<string | null>(null);
  /* const [captchaToken, setCaptchaToken] = useState<string | null>(null); */

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setServerError(null);

    /*         if (!captchaToken) {
                    setServerError("Please complete the CAPTCHA verification.");
                    return;
                } */

    const { error } = await forgotPassword(data.email /* , captchaToken */);

    /* setCaptchaToken(null);
        turnstileRef.current?.reset(); */

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
      <Card className="border-border/60 bg-card/80 text-center shadow-xl backdrop-blur-sm">
        <CardContent className="space-y-4 p-6 pt-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
            <MailCheck className="h-7 w-7 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            We sent a password reset code to{" "}
            <span className="font-medium text-foreground">{emailSent}</span>.
          </p>
          <div className="space-y-2">
            <Button
              type="button"
              onClick={() => router.push("/reset-password")}
              className="h-11 w-full font-semibold"
            >
              Enter OTP Code
            </Button>
            <p className="text-xs text-muted-foreground">
              Didn&apos;t receive it? Check your spam folder or{" "}
              <button
                type="button"
                onClick={() => {
                  setEmailSent(null);
                  /* setCaptchaToken(null);
                                    turnstileRef.current?.reset(); */
                }}
                className="font-medium text-primary underline hover:text-primary/80"
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
    <Card className="border-border/60 bg-card/80 shadow-xl backdrop-blur-sm">
      <CardContent className="p-0">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 p-6 md:p-8"
        >
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-foreground">
              Forgot password?
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {"Enter your email and we'll send you a reset code."}
            </p>
          </div>

          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-foreground">
              Email address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register("email")}
                className="h-11 pl-10"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/*                     <div className="flex justify-start">
                        <Turnstile
                            ref={turnstileRef}
                            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                            onSuccess={(token) => setCaptchaToken(token)}
                            onExpire={() => {
                                setCaptchaToken(null);
                                turnstileRef.current?.reset();
                            }}
                            onError={() => {
                                setCaptchaToken(null);
                                turnstileRef.current?.reset();
                            }}
                            options={{ theme: "auto" }}
                        />
                    </div> */}

          <Button
            type="submit"
            disabled={isSubmitting /* || !captchaToken */}
            className="h-11 w-full font-semibold"
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

          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/reset-password")}
              className="flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              <KeyRound className="h-4 w-4" />
              Already have a code?
            </button>
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Back to Sign In
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
