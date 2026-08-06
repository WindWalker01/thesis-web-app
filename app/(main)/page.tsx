"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ShieldUser,
  FileClockIcon,
  InfoIcon,
  ShieldCheck,
  Users,
  Blocks,
  AlertTriangle,
  Plus,
  Upload,
  BookOpen,
  Fingerprint,
  Search,
  Flag,
  ImageIcon,
} from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useAuth } from "@/features/(user)/auth/hooks/useAuth";
import { useSiteSettings } from "@/features/admin/settings/lib/use-site-settings";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { settings } = useSiteSettings();

  const faqs = useMemo(
    () => [
      {
        q: "How does artwork registration work?",
        a: "When you upload a digital artwork, the system automatically classifies it and generates two types of digital fingerprints — a perceptual hash for visual similarity detection and a cryptographic hash for integrity verification. The cryptographic hash is then recorded on the blockchain with an immutable timestamp, creating verifiable proof of authorship documentation.",
        open: true,
      },
      {
        q: "What is perceptual hashing and how does it detect similar artworks?",
        a: "Perceptual hashing is an algorithm that creates a compact visual fingerprint of an image based on its visual features — not its raw pixel data. Unlike cryptographic hashing (where even one different pixel produces a completely different hash), perceptual hashes remain similar for visually similar images. This allows the system to detect modified versions, derivatives, and possible instances of plagiarism by comparing hashes across the artwork database.",
      },
      {
        q: "What information is recorded on the blockchain?",
        a: "Only the cryptographic hash of the artwork and a timestamp are stored on-chain as part of a blockchain transaction. No personal data, artwork files, or image content is ever stored on the blockchain. The transaction serves as immutable evidence linking the artwork hash to a specific point in time, which can be independently verified.",
      },
      {
        q: "Does ArtForgeLab replace copyright registration with IPOPHL?",
        a: "No. ArtForgeLab is a documentation and evidence-generation tool. It does not confer legal copyright, nor does it replace formal copyright registration with the Intellectual Property Office of the Philippines (IPOPHL) or any other legal authority. Artists should still pursue formal registration for full legal protection.",
      },
      {
        q: "Can the system determine whether legal infringement has occurred?",
        a: "No. The similarity detection module only identifies visually similar artworks based on perceptual hashing. It serves as an indicator for possible plagiarism, but it does not — and cannot — automatically determine legal infringement. Such determinations require judicial or administrative proceedings under applicable intellectual property laws.",
      },
      {
        q: "How are reports and complaints handled?",
        a: "If you believe your work has been infringed, you can submit a report with supporting evidence through the platform. Reports are reviewed administratively, and you can track the status of your report through your dashboard. The platform facilitates documentation and evidence collection but does not adjudicate disputes.",
      },
    ],
    [],
  );

  const [collectorsRef, collectorsInView] = useInView({
    threshold: 0.3,
    triggerOnce: true,
    delay: 100,
  });

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(
    faqs.findIndex((faq) => faq.open) >= 0
      ? faqs.findIndex((faq) => faq.open)
      : null,
  );

  return (
    <main className="bg-background-light dark:bg-background-dark font-display min-h-screen overflow-x-hidden text-slate-900 dark:text-slate-100">
      {/* ═══════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════ */}
      <section className="relative pt-16">
        <div className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-4 lg:min-h-[92vh]">
          {/* ── Background image — always visible in both themes ── */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url('/landing-page-elements/landing-page-bg.avif')",
              backgroundSize: "cover",
              backgroundPosition: "center top",
            }}
          />
          {/* ── Dark overlay — always dark so text is always readable ── */}
          <div className="absolute inset-0 bg-linear-to-b from-slate-950/80 via-slate-950/75 to-slate-950/90" />

          {/* Dot-grid texture overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(96,165,250,1) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          {/* Hero radial glow */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/8 blur-3xl" />
          <div className="pointer-events-none absolute right-1/4 bottom-0 h-72 w-72 rounded-full bg-orange-500/6 blur-3xl" />

          <div className="relative z-10 w-full max-w-4xl space-y-6 px-4 text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-500/15 px-5 py-2"
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
              Upload, classify, and document your digital artwork. Detect
              visually similar works using perceptual hashing. Secure immutable
              evidence on the blockchain and establish verifiable proof of
              authorship.
            </motion.p>

            <motion.div
              className="flex flex-wrap justify-center gap-4 pt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link
                href={isAuthenticated ? "/upload-artwork" : "/register"}
                className="rounded-xl bg-blue-500 px-8 py-4 text-base font-bold text-white shadow-[0_0_28px_rgba(59,130,246,0.35)] transition-all hover:scale-105 hover:bg-blue-600"
              >
                {isAuthenticated ? "Upload Artwork" : "Sign Up"}
              </Link>
              <Link
                href="/about"
                className="rounded-xl border border-white/20 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-md transition-all hover:bg-white/18"
              >
                Learn More
              </Link>
            </motion.div>

            {/* Stat strip */}
            <motion.div
              className="flex flex-wrap justify-center gap-8 pt-6 text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {[
                { value: "Perceptual Hash", label: "Similarity Detection" },
                { value: "Cryptographic Hash", label: "Proof of Authorship" },
                { value: "Blockchain", label: "Immutable Documentation" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center gap-0.5"
                >
                  <span className="text-lg font-black text-white">
                    {s.value}
                  </span>
                  <span className="text-sm tracking-widest text-slate-500 uppercase">
                    {s.label}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* Small disclaimer */}
            <motion.p
              className="mx-auto max-w-xl pt-2 text-xs text-slate-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              ArtForgeLab assists artists in documenting authorship and
              detecting possible plagiarism. It does not replace formal
              copyright registration.
            </motion.p>
          </div>
        </div>

        {/* Bottom fade into page bg */}
        <div className="to-background-light dark:to-background-dark pointer-events-none relative z-10 -mt-12 h-12 bg-linear-to-b from-transparent" />
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════ */}
      <section
        id="how-it-works"
        className="bg-background-light dark:bg-background-dark py-16 md:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-primary/10 flex flex-col items-center gap-10 rounded-3xl border bg-gray-100 p-6 shadow-2xl md:flex-row md:p-12 lg:gap-20 lg:p-20 dark:bg-slate-900">
            <motion.div
              className="relative aspect-video w-full overflow-hidden rounded-2xl md:w-1/2"
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <Image
                src="/landing-page-elements/blockchain-digital-icon.webp"
                alt="Artwork Documentation Process"
                fill
                className="object-cover"
              />
            </motion.div>

            <motion.div
              className="w-full space-y-6 md:w-1/2"
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5">
                <ShieldCheck className="h-3 w-3 text-blue-400" />
                <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase">
                  How It Works
                </span>
              </div>
              <h2 className="text-2xl leading-tight font-black text-slate-900 md:text-3xl dark:text-white">
                Document, Detect, and
                <br />
                Establish Authorship
              </h2>
              <p className="text-justify text-base leading-relaxed text-slate-600 dark:text-slate-300">
                ArtForgeLab is a research-based intellectual property rights
                management system that helps digital artists document their
                work, detect visually similar artworks, and establish verifiable
                proof of authorship using cryptographic hashing and blockchain
                technology.
              </p>
              <ul className="space-y-3">
                {[
                  {
                    title: "Upload & Classify",
                    desc: "Submit your digital artwork with metadata. The system automatically classifies your work and prepares it for processing.",
                  },
                  {
                    title: "Perceptual & Cryptographic Hashing",
                    desc: "Two unique digital fingerprints are generated — one for visual similarity detection and another for integrity verification.",
                  },
                  {
                    title: "Blockchain Recording",
                    desc: "A cryptographic proof is recorded on-chain with an immutable timestamp, creating verifiable evidence tied to a specific point in time.",
                  },
                  {
                    title: "Monitor & Manage",
                    desc: "Track similarity reports, manage your artwork portfolio, and maintain authorship documentation from a single dashboard.",
                  },
                ].map((item, index) => (
                  <motion.li
                    key={item.title}
                    className="group relative flex cursor-pointer items-center gap-3 text-base font-medium"
                    initial={{ opacity: 0, x: 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.15 }}
                    viewport={{ once: true }}
                  >
                    <div className="h-6 w-6 shrink-0">
                      <Image
                        src="/landing-page-elements/shield-fill-check1.svg"
                        alt="Check"
                        width={24}
                        height={24}
                      />
                    </div>
                    <span className="transition-colors group-hover:text-blue-500">
                      {item.title}
                    </span>
                    <InfoIcon className="text-primary h-4 w-4 shrink-0 animate-pulse opacity-70 group-hover:opacity-100" />
                    <div className="pointer-events-none absolute top-10 left-0 z-50 w-[min(24rem,90vw)] scale-95 rounded-xl border-2 border-blue-950 bg-blue-300 p-4 opacity-0 shadow-2xl transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-100 group-hover:opacity-100">
                      <p className="text-primary text-justify text-base leading-relaxed dark:text-slate-300">
                        {item.desc}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CORE FEATURES — thesis-based modules
      ═══════════════════════════════════════════ */}
      <section id="features" className="bg-orange-300/20 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center md:mb-16">
            <motion.div
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-4 py-1.5"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true, amount: 0.5 }}
            >
              <Blocks className="h-3 w-3 text-orange-400" />
              <span className="text-[10px] font-bold tracking-widest text-orange-500 uppercase">
                Platform Features
              </span>
            </motion.div>
            <motion.h2
              className="mb-3 text-2xl font-black md:text-3xl lg:text-4xl"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
              viewport={{ once: true, amount: 0.5 }}
            >
              Tools for Digital Artists
            </motion.h2>
            <motion.p
              className="text-base text-slate-600 md:text-base dark:text-slate-300"
              initial={{ opacity: 0, scale: 0.85, y: 16 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.4,
                ease: [0.34, 1.56, 0.64, 1],
                delay: 0.1,
              }}
              viewport={{ once: true, amount: 0.5 }}
            >
              Research-backed capabilities designed to assist artists in
              documenting and protecting their work.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            {[
              {
                label: "Artwork Registration",
                icon: ImageIcon,
                desc: "Upload your digital artwork with metadata. Organize and manage your creative portfolio in one secure location.",
              },
              {
                label: "Proof of Authorship",
                icon: Fingerprint,
                desc: "Cryptographic hashing generates a unique digital fingerprint recorded on-chain with an immutable timestamp as verifiable evidence.",
              },
              {
                label: "Similarity Detection",
                icon: Search,
                desc: "Perceptual hashing detects visually similar artworks across the database, serving as an indicator for possible plagiarism or unauthorized modifications.",
              },
              {
                label: "Community Recognition",
                icon: Users,
                desc: "Share your work in the public gallery. Earn upvotes from the community and build visibility for your digital art portfolio.",
              },
              {
                label: "Reporting & Complaints",
                icon: Flag,
                desc: "Submit reports of suspected infringement with supporting evidence. Track the status of your reports through administrative review.",
              },
              {
                label: "Blockchain Documentation",
                icon: ShieldCheck,
                desc: "Maintain transparent, auditable records. Every cryptographic proof is permanently documented on-chain and independently verifiable.",
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    ease: [0.25, 0.1, 0.25, 1],
                    delay: index * 0.07,
                  }}
                  viewport={{ once: true, amount: 0.2 }}
                  className="group cursor-pointer rounded-2xl border border-transparent bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-300 hover:shadow-xl md:p-8 dark:bg-slate-900 dark:hover:border-orange-500/30"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 transition-all duration-300 group-hover:bg-orange-500 group-hover:text-white">
                    <Icon className="h-6 w-6" strokeWidth={1.8} />
                  </div>
                  <h3 className="mb-2 text-lg font-black transition-colors group-hover:text-orange-500">
                    {item.label}
                  </h3>
                  <p className="text-base leading-relaxed text-slate-500">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PROOF OF AUTHORSHIP — deep dive
      ═══════════════════════════════════════════ */}
      <section className="py-16 md:py-24" ref={collectorsRef}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-24">
            <div className="w-full space-y-8 lg:w-1/2">
              <motion.div
                initial={{ opacity: 0 }}
                animate={collectorsInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5"
              >
                <ShieldCheck className="h-3 w-3 text-blue-400" />
                <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase">
                  Evidence-Based Authorship
                </span>
              </motion.div>
              <motion.h2
                className="text-3xl leading-tight font-black md:text-4xl lg:text-5xl"
                initial={{ y: 30, opacity: 0 }}
                animate={
                  collectorsInView
                    ? { y: 0, opacity: 1 }
                    : { y: 30, opacity: 0 }
                }
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                Establish Proof of Authorship
              </motion.h2>
              <motion.p
                className="text-base text-slate-600 md:text-lg dark:text-slate-300"
                initial={{ y: 30, opacity: 0 }}
                animate={
                  collectorsInView
                    ? { y: 0, opacity: 1 }
                    : { y: 30, opacity: 0 }
                }
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              >
                When you register an artwork on {settings.platform_name}, the
                system generates a cryptographic hash — a unique digital
                fingerprint of your file — and records it on the blockchain.
                This creates an immutable, timestamped record that can serve as
                evidence of authorship at a specific point in time. Combined
                with perceptual hashing for similarity detection, the platform
                provides transparent, auditable documentation that supports your
                claim as the original creator.
              </motion.p>
              <div className="flex flex-col gap-4 sm:flex-row">
                {[
                  {
                    stat: "Perceptual Hashing",
                    label: "Visual Similarity Analysis",
                  },
                  { stat: "Blockchain", label: "Immutable Documentation" },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    className="bg-background-light flex-1 rounded-xl border-l-4 border-blue-400 p-5 shadow-[0_4px_24px_rgba(59,130,246,0.12)] md:p-6 dark:bg-slate-900"
                    initial={{ clipPath: "inset(0 100% 0 0)" }}
                    animate={
                      collectorsInView
                        ? { clipPath: "inset(0 0 0 0)" }
                        : { clipPath: "inset(0 100% 0 0)" }
                    }
                    transition={{
                      duration: 0.8,
                      ease: [0.25, 0.1, 0.25, 1],
                      delay: index * 0.15,
                    }}
                  >
                    <div className="text-xl font-black text-blue-500 md:text-2xl">
                      {item.stat}
                    </div>
                    <div className="mt-0.5 text-base text-slate-500">
                      {item.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <motion.div
                className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-[0_8px_60px_rgba(59,130,246,0.2)] sm:aspect-[4/3] lg:aspect-[4/3]"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={
                  collectorsInView
                    ? { scale: 1, opacity: 1 }
                    : { scale: 0.8, opacity: 0 }
                }
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <Image
                  src="/landing-page-elements/ip-background-image.jpg"
                  alt="Proof of authorship documentation"
                  fill
                  className="object-cover"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          WHY CHOOSE — glowing cards
      ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-blue-950 py-16 text-white select-none md:py-24">
        {/* Section-level background glows */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/8 blur-3xl" />
        <div className="pointer-events-none absolute top-0 left-0 h-72 w-72 -translate-x-1/3 rounded-full bg-blue-400/5 blur-3xl" />
        <div className="pointer-events-none absolute right-0 bottom-0 h-72 w-72 translate-x-1/3 rounded-full bg-blue-400/5 blur-3xl" />

        {/* Dot-grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(148,163,184,1) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, amount: 0.5 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-1.5"
            >
              <ShieldUser className="h-3 w-3 text-blue-300" />
              <span className="text-[10px] font-bold tracking-widest text-blue-300 uppercase">
                Why Choose {settings.platform_name}?
              </span>
            </motion.div>
            <motion.h2
              className="mb-3 text-2xl font-black md:text-3xl lg:text-4xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              viewport={{ once: true, amount: 0.5 }}
            >
              Built for Digital Artists
            </motion.h2>
            <motion.p
              className="text-base text-slate-400 md:text-base"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true, amount: 0.5 }}
            >
              Research-driven tools for documenting authorship and detecting
              possible plagiarism.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Fingerprint,
                title: "Proof of Authorship",
                desc: "Cryptographic hashing combined with blockchain timestamping creates verifiable evidence of authorship at a specific point in time.",
                glow: "rgba(59,130,246,0.35)",
                border: "rgba(59,130,246,0.4)",
                iconBg: "bg-blue-500/15",
                iconColor: "text-blue-300",
              },
              {
                icon: FileClockIcon,
                title: "Blockchain Documentation",
                desc: "Records are stored on-chain and cannot be altered or deleted, providing transparent and auditable documentation.",
                glow: "rgba(99,102,241,0.35)",
                border: "rgba(99,102,241,0.4)",
                iconBg: "bg-indigo-500/15",
                iconColor: "text-indigo-300",
              },
              {
                icon: Search,
                title: "Similarity Detection",
                desc: "Perceptual hashing algorithms analyze visual similarity to detect possible instances of plagiarism or unauthorized modification.",
                glow: "rgba(251,146,60,0.3)",
                border: "rgba(251,146,60,0.4)",
                iconBg: "bg-orange-500/15",
                iconColor: "text-orange-300",
              },
              {
                icon: ShieldCheck,
                title: "Artwork Portfolio",
                desc: "Organize and manage your digital artwork collection with metadata, similarity reports, and author documentation in one place.",
                glow: "rgba(234,179,8,0.3)",
                border: "rgba(234,179,8,0.35)",
                iconBg: "bg-yellow-500/15",
                iconColor: "text-yellow-300",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.09 }}
                  viewport={{ once: true, amount: 0.2 }}
                  className="group relative cursor-default overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 md:p-7"
                  style={{
                    ["--glow" as string]: item.glow,
                    ["--border-glow" as string]: item.border,
                  }}
                >
                  {/* ── Per-card radial glow (activates on hover via CSS group) ── */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(ellipse at 30% 30%, ${item.glow}, transparent 70%)`,
                    }}
                  />
                  {/* Border glow */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      boxShadow: `inset 0 0 0 1px ${item.border}, 0 0 32px ${item.glow}`,
                    }}
                  />
                  {/* Subtle top-left shimmer dot */}
                  <div
                    className="pointer-events-none absolute -top-4 -left-4 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
                    style={{ background: item.glow }}
                  />

                  <div className="relative z-10">
                    <div
                      className={`h-12 w-12 rounded-xl ${item.iconBg} mb-5 flex items-center justify-center transition-colors duration-300 group-hover:scale-110 group-hover:brightness-110`}
                    >
                      <Icon
                        className={`h-6 w-6 ${item.iconColor}`}
                        strokeWidth={1.8}
                      />
                    </div>
                    <h3 className="mb-2 text-lg font-black text-white">
                      {item.title}
                    </h3>
                    <p className="text-base leading-relaxed text-slate-400 transition-colors duration-300 group-hover:text-slate-300">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TEAM
      ═══════════════════════════════════════════ */}
      <section
        id="team"
        className="bg-slate-50 py-16 md:py-24 dark:bg-slate-900"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center md:mb-16">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5">
              <Users className="h-3 w-3 text-blue-400" />
              <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase">
                The Team
              </span>
            </div>
            <h2 className="mb-3 text-2xl font-black text-slate-900 md:text-3xl lg:text-4xl dark:text-white">
              The Researchers Behind the Project
            </h2>
            <p className="text-base text-slate-600 md:text-base dark:text-slate-300">
              Meet the team behind this undergraduate thesis research.
            </p>
          </div>
          <div className="grid cursor-pointer grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
            {[
              {
                name: "Ruzzel",
                role: "Lead Developer",
                img: "/team-image/ruzzel.jpg",
                portfolio_link: "https://ruzzel.vercel.app",
              },
              {
                name: "Tenshin",
                role: "Front/Backend Engineer",
                img: "/team-image/tenshin.jpg",
                portfolio_link: "https://tenshinponteres.dev",
              },
              {
                name: "Nathaniel",
                role: "UI/UX Designer",
                img: "/team-image/nathanielSD.jpg",
              },
            ].map((member) => (
              <a
                href={member.portfolio_link}
                target="_blank"
                key={member.name}
                className="group relative text-center"
              >
                <div className="relative mx-auto mb-6 h-40 w-40 rounded-full border-4 border-dotted border-orange-500 p-1 shadow-[0_0_15px_rgba(255,165,0,0.4)] transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(255,165,0,0.8)] md:h-48 md:w-48">
                  <div className="relative h-full w-full overflow-hidden rounded-full bg-slate-200">
                    <Image
                      src={member.img}
                      alt={`${member.name} Profile`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 transform rounded-xl bg-linear-to-r from-orange-400 via-amber-400 to-yellow-300 px-4 py-1 text-base font-semibold whitespace-nowrap text-white opacity-0 shadow-xl transition-all duration-500 ease-out group-hover:-translate-y-12 group-hover:opacity-100 md:group-hover:-translate-y-16">
                    {member.role}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 md:text-2xl dark:text-white">
                  {member.name}
                </h3>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FAQ — refined
      ═══════════════════════════════════════════ */}
      <section
        id="faq-section"
        className="relative overflow-hidden py-16 md:py-24"
      >
        {/* Subtle background */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-slate-50 to-orange-50/30 dark:from-slate-950 dark:to-slate-900" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400/5 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, amount: 0.5 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-4 py-1.5"
            >
              <AlertTriangle className="h-3 w-3 text-orange-400" />
              <span className="text-[10px] font-bold tracking-widest text-orange-500 uppercase">
                Got Questions?
              </span>
            </motion.div>
            <motion.h2
              className="mb-3 text-2xl font-black md:text-3xl lg:text-4xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              viewport={{ once: true, amount: 0.5 }}
            >
              Frequently Asked Questions
            </motion.h2>
            <motion.p
              className="text-base text-slate-500 dark:text-slate-300"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true, amount: 0.5 }}
            >
              Everything you need to know about {settings.platform_name} and how
              it works.
            </motion.p>
          </div>

          {/* FAQ items */}
          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openFaqIndex === i;

              return (
                <motion.div
                  key={faq.q}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  viewport={{ once: true, amount: 0.2 }}
                  className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                    isOpen
                      ? "border-orange-400/50 bg-white shadow-[0_4px_24px_rgba(251,146,60,0.1)] dark:bg-slate-900"
                      : "border-slate-200 bg-white hover:border-orange-300/60 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-orange-500/30"
                  }`}
                >
                  <button
                    className="group flex w-full cursor-pointer items-center justify-between p-5 text-left md:p-6"
                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                  >
                    <span
                      className={`pr-4 text-base font-semibold transition-colors md:text-base ${isOpen ? "text-orange-500" : "group-hover:text-orange-500"}`}
                    >
                      {faq.q}
                    </span>
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
                        isOpen
                          ? "rotate-45 bg-orange-500"
                          : "bg-slate-100 group-hover:bg-orange-100 dark:bg-slate-800 dark:group-hover:bg-orange-900/30"
                      }`}
                    >
                      <Plus
                        className={`h-4 w-4 transition-colors ${isOpen ? "text-white" : "text-slate-500 group-hover:text-orange-500"}`}
                      />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: "auto",
                          opacity: 1,
                          transition: {
                            height: {
                              duration: 0.28,
                              ease: [0.04, 0.62, 0.23, 0.98],
                            },
                            opacity: { duration: 0.22, delay: 0.08 },
                          },
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                          transition: {
                            height: {
                              duration: 0.26,
                              ease: [0.04, 0.62, 0.23, 0.98],
                            },
                            opacity: { duration: 0.18 },
                          },
                        }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 md:px-6 md:pb-6">
                          <div className="mb-4 h-px bg-slate-100 dark:bg-slate-800" />
                          <p className="text-base leading-relaxed text-slate-500 dark:text-slate-300">
                            {faq.a}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          DISCLAIMER
      ═══════════════════════════════════════════ */}
      <section className="bg-slate-50 px-4 py-12 dark:bg-slate-950">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5">
            <InfoIcon className="h-3 w-3 text-blue-400" />
            <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase">
              Disclaimer
            </span>
          </div>
          <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            ArtForgeLab is a research-based intellectual property rights
            management system developed as an undergraduate thesis. It is
            designed to assist digital artists in documenting authorship,
            detecting visually similar artworks, and maintaining transparent
            records. It does not replace formal copyright registration with
            IPOPHL or other legal authorities. The platform does not grant
            copyright, guarantee ownership dispute resolution, or automatically
            determine legal infringement.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA
      ═══════════════════════════════════════════ */}
      <section className="px-4 py-16">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-linear-to-r from-orange-400 via-amber-500 to-amber-400 p-6 text-center text-white sm:p-10 md:p-14">
          {/* CTA inner glows */}
          <div className="pointer-events-none absolute top-0 left-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-orange-300/20 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-1.5">
              <Upload className="h-3 w-3 text-white" />
              <span className="text-[10px] font-bold tracking-widest text-white uppercase">
                Get Started Today
              </span>
            </div>
            <h2 className="mb-4 text-2xl font-black md:mb-5 md:text-4xl">
              Start Documenting Your Artwork Today
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed opacity-90 md:mb-10 md:text-xl">
              Build your portfolio, establish proof of authorship, and join a
              community of digital artists documenting their creative work.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href={isAuthenticated ? "/upload-artwork" : "/register"}
                className="rounded-xl bg-white px-8 py-4 text-base font-black text-orange-500 shadow-lg transition-transform hover:scale-105 md:px-10"
              >
                {isAuthenticated ? "Upload Artwork" : "Get Started"}
              </Link>
              <Link
                href="/about"
                className="rounded-xl border border-white/30 bg-white/20 px-8 py-4 text-base font-bold text-white backdrop-blur-md transition-all hover:bg-white/30 md:px-10"
              >
                About Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Floating Upload Button (hidden on mobile to avoid overlap) ── */}
      <Link
        href="/upload-artwork"
        aria-label="Upload artwork"
        className="fixed right-8 bottom-8 z-50 hidden h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-[0_4px_24px_rgba(249,115,22,0.45)] transition-all duration-300 hover:scale-110 hover:bg-orange-600 hover:shadow-[0_8px_32px_rgba(249,115,22,0.6)] sm:flex"
      >
        <Upload className="h-6 w-6" />
      </Link>
    </main>
  );
}
