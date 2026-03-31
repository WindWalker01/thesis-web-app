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

export function RegisterForm() {
  const {
    serverError,
    setServerError,
    oauthLoading,
    setOauthLoading,
    pendingEmail,
    setPendingEmail,
    showPassword,
    setShowPassword,
    showConfirm,
    setShowConfirm,
    register,
    handleSubmit,
    errors,
    isSubmitting,
    onSubmit,
    handleGoogleLogin
  } = useRegisterForm();

  if (pendingEmail) {
    return (
      <Card className="p-6 text-center border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
        <CardContent className="space-y-4">
          <MailCheck className="h-12 w-12 mx-auto text-blue-500" />
          <h1 className="text-2xl font-bold text-white">Check your email</h1>
          <p className="text-sm text-slate-400">
            We sent a confirmation link to <strong>{pendingEmail}</strong>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0 border-slate-700/50 bg-slate-800/50 shadow-2xl backdrop-blur-sm">
      <CardContent className="p-0">

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-5">

          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold text-white">Create Account</h1>
            <p className="text-sm text-slate-400">
              Fill in your details to get started
            </p>
          </div>

          {/* Error */}
          {serverError && (
            <Alert className="border-red-500/30 bg-red-500/10 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">{serverError}</AlertDescription>
            </Alert>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <Label className="text-slate-300">Full Name</Label>
            <Input
              placeholder="John Doe"
              {...register("fullName")}
              className="h-11 bg-slate-900/60 border-slate-600/60 text-white"
            />
            {errors.fullName && (
              <p className="text-xs text-red-400">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label className="text-slate-300">Email</Label>
            <Input
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              className="h-11 bg-slate-900/60 border-slate-600/60 text-white"
            />
            {errors.email && (
              <p className="text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label className="text-slate-300">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="h-11 pr-10 bg-slate-900/60 border-slate-600/60 text-white"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label className="text-slate-300">Confirm Password</Label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                {...register("confirmPassword")}
                className="h-11 pr-10 bg-slate-900/60 border-slate-600/60 text-white"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showConfirm ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting || oauthLoading}
            className="h-11 w-full bg-blue-600 font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all duration-200 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <Separator className="flex-1 bg-slate-700/60" />
            <span className="text-xs text-slate-500">or</span>
            <Separator className="flex-1 bg-slate-700/60" />
          </div>

          {/* Google */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={oauthLoading || isSubmitting}
            className="h-11 w-full border-slate-600/60 bg-slate-900/40 text-slate-200 hover:bg-slate-700 hover:text-white transition-all duration-200 cursor-pointer"
          >
            {oauthLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
            <span className="ml-2">Continue with Google</span>
          </Button>

          {/* Footer */}
          <p className="text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300">
              Sign in
            </Link>
          </p>

        </form>
      </CardContent>
    </Card>
  );
}