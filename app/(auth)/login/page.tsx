"use client";

import Link from "next/link";
import { BrainCircuitIcon, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

// LoginForm component — authentication logic will be wired here later
// For now this is UI-only: inputs are controlled but no submit action is connected
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">

      {/* Top gradient accent bar — matches landing page style */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-blue-400 to-orange-400" />

      <div className="min-h-[calc(100vh-4px)] flex flex-col lg:flex-row">

        {/*LEFT PANEL — branding hero (hidden on mobile) */}
        <div
          className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white relative"
          style={{
            background:
              "linear-gradient(rgba(16, 34, 22, 0.75), rgba(16, 34, 22, 0.92)), url('/landing-page-elements/landing-page-bg.avif')",
            backgroundSize: "cover",
            backgroundPosition: "center top",
          }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit">
            <Image
                src="/landing-page-elements/AFL_logoWeb.png"
                alt="Logo"
                width={60}
                height={70}
                className="shrink-0"
              />
            <span className="text-lg font-bold tracking-tight">
              <span className="text-blue-400">Art</span>
              <span className="text-orange-500">Forge</span>
              <span className="text-white">Lab</span>
            </span>
          </Link>

          {/* Center copy */}
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 border-l-2 border-blue-500 pl-3">
              ArtForgeLab · Secure Access
            </p>
            <h1 className="text-4xl xl:text-5xl font-black leading-tight">
              Welcome <br />
              <span className="text-blue-400">Back,</span> Creator.
            </h1>
            <p className="text-slate-400 text-base max-w-sm leading-relaxed">
              Log in to manage your registered artworks, review plagiarism reports,
              and protect your intellectual property on the blockchain.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 pt-2">
              {["Proof of Authorship", "Plagiarism Detection", "Blockchain Registry"].map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom research badge */}
          <p className="text-xs text-slate-500">
            Undergraduate Thesis Research · Philippines 2026
          </p>
        </div>

        {/*  RIGHT PANEL — login form*/}
        <div className="flex-1 flex flex-col items-center justify-center  lg:px-6 ">

          {/* Mobile-only logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden hover:opacity-80 transition-opacity">
              <Image
                  src="/landing-page-elements/AFL_logoWeb.png"
                  alt="Logo"
                  width={60}
                  height={70}
                  className="shrink-0"
                />
            <span className="text-lg font-bold tracking-tight">
              <span className="text-blue-500">Art</span>
              <span className="text-orange-600">Forge</span>
              <span className="text-primary">Lab</span>
            </span>
          </Link>

          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">

              {/* Card header */}
              <div className="px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Sign In</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Don&apos;t have an account?{" "}
                  {/* Link to register page */}
                  <Link href="/register" className="text-blue-500 font-semibold hover:underline">
                    Register here
                  </Link>
                </p>
              </div>

              {/* Form fields — TODO: connect to authentication logic */}
              <div className="px-8 py-6 space-y-5">

                {/* Email field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="nathanielpogi@email.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 
                              dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 
                      text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                    {/* Toggle password visibility */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Forgot password link — TODO: connect to password reset flow */}
                  <div className="text-right">
                    <Link href="/forgot-password" className="text-xs text-blue-500 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                </div>

                {/* Submit button — TODO: connect onClick to login handler */}
                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all hover:scale-[1.02] cursor-pointer"
                >
                  Sign In
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                  <span className="text-xs text-slate-400">or continue with</span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                </div>

                {/* Google OAuth placeholder — TODO: connect to OAuth provider */}
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-700 py-3 
                            rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <img
                    className="w-4 h-4"
                    src="/landing-page-elements/google.png"
                    alt="Google"
                  />
                  Continue with Google
                </button>
              </div>
            </div>

            {/* Legal disclaimer — matches landing page amber box style */}
            <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-xs text-slate-400 text-center leading-relaxed">
                By signing in you agree to our{" "}
                <Link href="/terms-of-use" className="text-amber-400 hover:underline">Terms of Use</Link>
                {" "}and{" "}
                <Link href="/privacy-policy" className="text-amber-400 hover:underline">Privacy Policy</Link>.
                This system is for authorized users only.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}