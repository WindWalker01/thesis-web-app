"use client";

import Link from "next/link";
import { BrainCircuitIcon, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

// RegisterForm component — authentication logic will be wired here later
// For now this is UI-only: inputs are controlled but no submit action is connected
export default function RegisterPage() {
  const [showPassword, setShowPassword]         = useState(false);
  const [showConfirmPassword, setShowConfirm]   = useState(false);

  return (
    <main className="min-h-screen overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">

      {/* Top gradient accent bar — matches landing page style */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-blue-400 to-orange-400" />

      <div className="min-h-[calc(100vh-4px)] flex flex-col lg:flex-row">

        {/* ── LEFT PANEL — branding hero (hidden on mobile) ── */}
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
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-400 border-l-2 border-orange-500 pl-3">
              ArtForgeLab · Join the Registry
            </p>
            <h1 className="text-4xl xl:text-5xl font-black leading-tight">
              Protect Your <br />
              <span className="text-orange-400">Digital</span> Legacy.
            </h1>
            <p className="text-slate-400 text-base max-w-sm leading-relaxed">
              Create your account to start registering artworks on the blockchain,
              run plagiarism checks, and secure your intellectual property with
              cryptographic proof of authorship.
            </p>

            {/* Numbered steps */}
            <div className="space-y-3 pt-2">
              {[
                { step: "01", text: "Create your account" },
                { step: "02", text: "Upload & register your artwork" },
                { step: "03", text: "Get blockchain-backed proof" },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-3">
                  <span className="text-xs font-black text-orange-400 w-6">{s.step}</span>
                  <span className="text-sm text-slate-300">{s.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom research badge */}
          <p className="text-xs text-slate-500">
            Undergraduate Thesis Research · Philippines 2026
          </p>
        </div>

        {/* ── RIGHT PANEL — registration form ── */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-6">

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
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Create Account</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Already have an account?{" "}
                  {/* Link back to login page */}
                  <Link href="/login" className="text-blue-500 font-semibold hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>

              {/* Form fields — TODO: connect to registration/authentication logic */}
              <div className="px-8 py-6 space-y-5">

                {/* Full name field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Nathaniel El Gwapo"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 
                               dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

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
                               dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
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
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 
                               dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
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
                </div>

                {/* Confirm password field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 
                               dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    />
                    {/* Toggle confirm password visibility */}
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit button — TODO: connect onClick to register handler */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600
                           text-white font-bold py-3 rounded-xl transition-all hover:scale-[1.02] cursor-pointer"
                >
                  Create Account
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
                  className="w-full flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-700 py-3 rounded-xl 
                             text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
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
                By creating an account you agree to our{" "}
                <Link href="/terms-of-use" className="text-amber-400 hover:underline">Terms of Use</Link>
                {" "}and{" "}
                <Link href="/privacy-policy" className="text-amber-400 hover:underline">Privacy Policy</Link>.
                Governed by <span className="text-slate-300 font-medium">R.A. 8293</span> and <span className="text-slate-300 font-medium">IPOPHL</span>.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}