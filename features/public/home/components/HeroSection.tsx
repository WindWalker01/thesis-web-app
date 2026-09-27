"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import {
  HERO_STATS,
  heroCtaLabel,
  homeSignupHref,
} from "@/features/public/home/content";

type HeroSectionProps = {
  isAuthenticated: boolean;
};

export function HeroSection({ isAuthenticated }: HeroSectionProps) {
  return (
    <section className="relative pt-16">
      <div className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-4 lg:min-h-[92vh]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('/landing-page-elements/landing-page-bg.avif')",
            backgroundSize: "cover",
            backgroundPosition: "center top",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-slate-950/80 via-slate-950/75 to-slate-950/90" />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(96,165,250,1) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/8 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 bottom-0 h-72 w-72 rounded-full bg-orange-500/6 blur-3xl" />

        <div className="relative z-10 w-full max-w-4xl space-y-6 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-10 inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-500/15 px-5 py-2 sm:mt-0"
          >
            <BookOpen className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-sm font-bold tracking-widest text-blue-300 uppercase">
              Research-Based IP Rights Management
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl leading-tight font-black text-white md:text-6xl lg:text-8xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Document Your{" "}
            <span className="bg-linear-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
              Digital Artwork
            </span>
          </motion.h1>

          <motion.p
            className="mx-auto max-w-2xl text-base leading-relaxed text-slate-300 md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Upload, classify, and document your digital artwork. Detect visually
            similar works using perceptual hashing. Secure immutable evidence on
            the blockchain and establish verifiable proof of authorship.
          </motion.p>

          <motion.div
            className="flex flex-wrap justify-center gap-4 pt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link
              href={homeSignupHref(isAuthenticated)}
              className="rounded-xl bg-blue-500 px-8 py-4 text-base font-bold text-white shadow-[0_0_28px_rgba(59,130,246,0.35)] transition-all hover:scale-105 hover:bg-blue-600"
            >
              {heroCtaLabel(isAuthenticated)}
            </Link>
            <Link
              href="/about"
              className="rounded-xl border border-white/20 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-md transition-all hover:bg-white/18"
            >
              Learn More
            </Link>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-8 pt-6 text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {HERO_STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-0.5"
              >
                <span className="text-lg font-black text-white">
                  {stat.value}
                </span>
                <span className="text-sm tracking-widest text-slate-500 uppercase">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>

          <motion.p
            className="mx-auto max-w-xl pt-2 text-xs text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            ArtForgeLab assists artists in documenting authorship and detecting
            possible plagiarism. It does not replace formal copyright
            registration.
          </motion.p>
        </div>
      </div>

      <div className="to-background-light dark:to-background-dark pointer-events-none relative z-10 -mt-12 h-12 bg-linear-to-b from-transparent" />
    </section>
  );
}
