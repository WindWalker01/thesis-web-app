"use client";

import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import GoogleIcon from "@/components/google-icon";
import { useLoginForm } from "../hooks/useLoginForm";

export function LoginForm() {
  const { showPassword,
    setShowPassword,
    register,
    handleSubmit,
    onSubmit,
    handleGoogleLogin,
    errors,
    isSubmitting,
    serverError,
    setServerError,
    oauthLoading,
    setOauthLoading 
  } = useLoginForm();

  return (
    <Card className="overflow-hidden p-0 border-slate-700/50 bg-slate-800/50 shadow-2xl backdrop-blur-sm">
      <CardContent className="grid p-0" >

        {/* ── Form side ── */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-5">

          <div className="flex flex-col items-center gap-1 text-center pb-1">
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-sm text-slate-400">
              Sign in to your ArtForgeLab account
            </p>
          </div>

          {serverError && (
            <Alert variant="destructive" className="border-red-500/30 bg-red-500/10 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">{serverError}</AlertDescription>
            </Alert>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-slate-300">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email")}
              className="h-11 border-slate-600/60 bg-slate-900/60 text-white placeholder:text-slate-500 focus-visible:border-blue-500 focus-visible:ring-blue-500"
            />
            {errors.email && (
              <p className="text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-slate-300">
                Password
              </Label>
              <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("password")}
                className="h-11 border-slate-600/60 bg-slate-900/60 pr-10 text-white placeholder:text-slate-500 focus-visible:border-blue-500 focus-visible:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting || oauthLoading}
            className="h-11 w-full bg-blue-600 font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all duration-200 cursor-pointer"
          >
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in…</>
            ) : (
              "Sign In"
            )}
          </Button>

          <div className="flex items-center gap-3">
            <Separator className="flex-1 bg-slate-700/60" />
            <span className="text-xs whitespace-nowrap text-slate-500">or</span>
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

          <p className="text-center text-sm text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
              Sign up
            </Link>
          </p>
        </form>

      </CardContent>
    </Card>
  );
}