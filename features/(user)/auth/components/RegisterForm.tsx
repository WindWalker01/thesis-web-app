"use client";

import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import GoogleIcon from "@/components/google-icon";
import { useRegisterForm } from "../hooks/useRegisterForm";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef } from "react";

export function RegisterForm() {
  const {
    serverError,
    oauthLoading,
    pendingEmail,
    showPassword, setShowPassword,
    showConfirm, setShowConfirm,
    register, handleSubmit, errors,
    isSubmitting, onSubmit, handleGoogleLogin,
    captchaToken, setCaptchaToken,
  } = useRegisterForm();

  const turnstileRef = useRef<TurnstileInstance | null>(null);

  const handleRegisterSubmit = handleSubmit(async (data) => {
    await onSubmit(data);

    setCaptchaToken(null);
    turnstileRef.current?.reset();
  });

  if (pendingEmail) {
    return (
      <Card className="p-6 text-center border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 backdrop-blur-sm">
        <CardContent className="space-y-4 pt-2">
          <MailCheck className="h-12 w-12 mx-auto text-blue-500" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Check your email</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            We sent a confirmation link to{" "}
            <strong className="text-slate-700 dark:text-slate-200">{pendingEmail}</strong>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0 border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 shadow-2xl dark:shadow-none backdrop-blur-sm">
      <CardContent className="p-0">
        <form onSubmit={handleRegisterSubmit} className="p-6 md:p-8 space-y-5">

          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Account</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Fill in your details to get started
            </p>
          </div>

          {serverError && (
            <Alert className="border-red-300 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">{serverError}</AlertDescription>
            </Alert>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</Label>
            <Input
              placeholder="John Doe"
              {...register("fullName")}
              className="h-11 border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500 dark:border-slate-600/60 dark:bg-slate-900/60 dark:text-white dark:placeholder:text-slate-500"
            />
            {errors.fullName && (
              <p className="text-xs text-red-500 dark:text-red-400">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</Label>
            <Input
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              className="h-11 border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500 dark:border-slate-600/60 dark:bg-slate-900/60 dark:text-white dark:placeholder:text-slate-500"
            />
            {errors.email && (
              <p className="text-xs text-red-500 dark:text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password")}
                className="h-11 pr-10 border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500 dark:border-slate-600/60 dark:bg-slate-900/60 dark:text-white dark:placeholder:text-slate-500"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 dark:text-red-400">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</Label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm your password"
                {...register("confirmPassword")}
                className="h-11 pr-10 border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500 dark:border-slate-600/60 dark:bg-slate-900/60 dark:text-white dark:placeholder:text-slate-500"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 dark:text-red-400">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex justify-start">
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
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting || oauthLoading || !captchaToken}
            className="h-11 w-full bg-blue-600 font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</>
              : "Sign Up"
            }
          </Button>

          <div className="flex items-center gap-3">
            <Separator className="flex-1 bg-slate-200 dark:bg-slate-700/60" />
            <span className="text-xs text-slate-400 dark:text-slate-500">or</span>
            <Separator className="flex-1 bg-slate-200 dark:bg-slate-700/60" />
          </div>

          {/* Google */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={oauthLoading || isSubmitting}
            className="h-11 w-full border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-600/60 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white transition-all duration-200 cursor-pointer"
          >
            {oauthLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
            <span className="ml-2">Continue with Google</span>
          </Button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}