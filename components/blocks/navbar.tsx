"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BrainCircuitIcon, ChevronDown, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function NavBar() {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">

        {/* Clickable LOGO — redirects to landing page same as Home link */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
          <Image
              src="/landing-page-elements/AFL_LOGO_F.png"
              alt="Logo"
              width={60}
              height={70}
              className="shrink-0"
            />
          <span className="text-lg text-blue-500 font-bold tracking-tight">
            Art
            <span className="text-orange-600">
              Forge
              <span className="text-primary">Lab</span>
            </span>
          </span>
        </Link>

        {/* NAVIGATION LINKS — absolutely centered in the navbar */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-sm font-medium">

          <Link href="/" className="hover:text-blue-500 transition-colors">
            Home
          </Link>

          <Link href="/dashboard" className="hover:text-blue-500 transition-colors">
            Dashboard
          </Link>

          <Link href="/gallery" className="hover:text-blue-500 transition-colors">
            Community
          </Link>

          <Link href="/plagiarism-checker" className="hover:text-blue-500 transition-colors">
            Plagiarism
          </Link>

          <Link href="/about" className="hover:text-blue-500 transition-colors">
            About
          </Link>

          {/* MORE DROPDOWN */}
          {/* onBlur with setTimeout lets the link click register before the menu closes */}
          <div className="relative" onBlur={() => setTimeout(() => setMoreOpen(false), 150)}>
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="flex items-center gap-1 hover:text-blue-500 transition-colors cursor-pointer"
            >
              More
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ease-in-out ${moreOpen ? "rotate-180" : "rotate-0"}`}
              />
            </button>

            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0,  scale: 1    }}
                  exit={{    opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute top-10 left-1/2 -translate-x-1/2 w-44 bg-background border border-border rounded-xl shadow-xl overflow-hidden z-50"
                >
                  {[
                    // FAQ uses a hash anchor so clicking it scrolls to the FAQ section on the landing page.
                    // The id="faq-section" must exist on the FAQ <section> in page.tsx for this to work.
                    { label: "FAQ",            href: "/#faq-section"   },
                    { label: "Terms of Use",   href: "/terms-of-use"   },
                    { label: "Privacy Policy", href: "/privacy-policy" },
                  ].map((item, idx) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0  }}
                      transition={{ delay: idx * 0.06, duration: 0.15, ease: "easeOut" }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        className="block px-4 py-2.5 text-sm hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT SIDE — Login & Register as Link components so they navigate to their pages */}
        <div className="flex items-center gap-4 shrink-0">

          {/* TODO: hide this upload button when user is not logged in (wrap with isLoggedIn check) */}
          <Link
            href="/upload-form"
            aria-label="Upload artwork"
            className="w-9 h-9 rounded-lg border border-orange-400 text-orange-400 flex items-center justify-center hover:bg-orange-400 hover:text-white transition-all"
          >
            <Upload className="w-4 h-4" />
          </Link>

          {/* Login — text style, navigates to /login */}
          <Link
            href="/login"
            className="text-sm font-medium hover:text-blue-500 transition-colors"
          >
            Login
          </Link>

          {/* Register — filled button style, navigates to /register */}
          <Link
            href="/register"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition"
          >
            Register
          </Link>

        </div>

      </div>
    </nav>
  );
}

export default NavBar;