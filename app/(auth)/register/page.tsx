"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import GoogleIcon from "@/components/google-icon";

import { getStrength } from "@/features/auth/register";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setSuccess(true);
    setLoading(false);
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setOauthLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setOauthLoading(false);
    }
  };

  const strength = getStrength(password);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30">
            <UserPlus className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Create an account
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Get started for free today
          </p>
        </div>

        <Card className="border-slate-700/50 bg-slate-800/50 shadow-2xl backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-white">Register</CardTitle>
            <CardDescription className="text-slate-400">
              Fill in your details to get started
            </CardDescription>
          </CardHeader>

          <CardContent>
            {success ? (
              <div className="space-y-4 py-6 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10">
                  <CheckCircle2 className="h-8 w-8 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Check your email
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    We sent a confirmation link to{" "}
                    <span className="text-blue-400">{email}</span>.<br />
                    Click the link to activate your account.
                  </p>
                </div>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="mt-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {error && (
                  <Alert
                    variant="destructive"
                    className="border-red-500/30 bg-red-500/10 text-red-400"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="ml-2">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignUp}
                  disabled={oauthLoading || loading}
                  className="h-11 w-full border-slate-600/60 bg-slate-900/40 text-slate-200 transition-all duration-200 hover:bg-slate-700 hover:text-white"
                >
                  {oauthLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <GoogleIcon />
                  )}
                  <span className="ml-2">Sign up with Google</span>
                </Button>

                <div className="flex items-center gap-3">
                  <Separator className="flex-1 bg-slate-700/60" />
                  <span className="text-xs whitespace-nowrap text-slate-500">
                    or register with email
                  </span>
                  <Separator className="flex-1 bg-slate-700/60" />
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="fullName"
                      className="text-sm font-medium text-slate-300"
                    >
                      Full name
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="h-11 border-slate-600/60 bg-slate-900/60 text-white placeholder:text-slate-500 focus-visible:border-indigo-500 focus-visible:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-slate-300"
                    >
                      Email address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 border-slate-600/60 bg-slate-900/60 text-white placeholder:text-slate-500 focus-visible:border-indigo-500 focus-visible:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-slate-300"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 border-slate-600/60 bg-slate-900/60 pr-10 text-white placeholder:text-slate-500 focus-visible:border-indigo-500 focus-visible:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-200"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {password.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.level ? strength.color : "bg-slate-700"}`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-slate-400">
                          Strength:{" "}
                          <span
                            className={
                              strength.level === 4
                                ? "text-green-400"
                                : strength.level === 3
                                  ? "text-yellow-400"
                                  : strength.level === 2
                                    ? "text-orange-400"
                                    : "text-red-400"
                            }
                          >
                            {strength.label}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium text-slate-300"
                    >
                      Confirm password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-11 border-slate-600/60 bg-slate-900/60 text-white placeholder:text-slate-500 focus-visible:border-indigo-500 focus-visible:ring-indigo-500"
                    />
                    {confirmPassword.length > 0 &&
                      password !== confirmPassword && (
                        <p className="text-xs text-red-400">
                          Passwords don&apos;t match
                        </p>
                      )}
                    {confirmPassword.length > 0 &&
                      password === confirmPassword && (
                        <p className="flex items-center gap-1 text-xs text-green-400">
                          <CheckCircle2 className="h-3 w-3" /> Passwords match
                        </p>
                      )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || oauthLoading}
                    className="h-11 w-full bg-indigo-600 font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:bg-indigo-500"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>

                  <p className="pt-1 text-center text-xs text-slate-500">
                    By registering, you agree to our{" "}
                    <Link
                      href="/terms"
                      className="text-slate-400 underline underline-offset-2 hover:text-white"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-slate-400 underline underline-offset-2 hover:text-white"
                    >
                      Privacy Policy
                    </Link>
                  </p>
                </form>
              </div>
            )}
          </CardContent>

          {!success && (
            <CardFooter className="justify-center border-t border-slate-700/50 pt-6">
              <p className="text-sm text-slate-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-blue-400 transition-colors hover:text-blue-300"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
