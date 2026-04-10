"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ShieldUser, FileClockIcon, Scale, Zap,
  InfoIcon, ShieldCheck,
  Users, Blocks, AlertTriangle, Plus, Upload
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function Home() {
  const [collectorsRef, collectorsInView] = useInView({
    threshold: 0.3,
    triggerOnce: false,
    delay: 100,
  });

  return (
    <main className="min-h-screen overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">

      {/* ═══════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════ */}
      <section className="relative pt-16">
        <div
          className="relative min-h-[85vh] lg:min-h-[92vh] flex items-center justify-center px-4 overflow-hidden"
        >
          {/* ── Background image — always visible in both themes ── */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/landing-page-elements/landing-page-bg.avif')",
              backgroundSize: "cover",
              backgroundPosition: "center top",
            }}
          />
          {/* ── Dark overlay — always dark so text is always readable ── */}
          <div className="absolute inset-0 bg-linear-to-b from-slate-950/80 via-slate-950/75 to-slate-950/90" />

          {/* Dot-grid texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: "radial-linear(rgba(96,165,250,1) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          {/* Hero radial glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-orange-500/6 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl w-full text-center space-y-6 px-4">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/25 rounded-full px-5 py-2"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-bold text-blue-300 uppercase tracking-widest">Digital IP Protection Platform</span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl lg:text-8xl font-black text-white leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              Protecting Digital Creativity with{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-blue-300">
                Confidence
              </span>
            </motion.h1>

            <motion.p
              className="text-base md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              A thesis project dedicated to digital IP protection, ensuring transparency
              and authenticity for every creator in the evolving digital landscape.
            </motion.p>

            <motion.div
              className="flex flex-wrap justify-center gap-4 pt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link
                href="/register"
                className="bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-blue-600 hover:scale-105 transition-all shadow-[0_0_28px_rgba(59,130,246,0.35)]"
              >
                Sign Up
              </Link>
              <Link
                href="/about"
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-white/18 transition-all"
              >
                Learn More
              </Link>
            </motion.div>

            {/* Stat strip */}
            <motion.div
              className="flex flex-wrap justify-center gap-8 pt-6 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {[
                { value: "Perceptual Hash", label: "Artwork Similarity Detection" },
                { value: "< 60s", label: "Proof Generated" },
                { value: "R.A. 8293", label: "PH Law Compliant" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-0.5">
                  <span className="text-white font-black text-lg">{s.value}</span>
                  <span className="text-slate-500 text-xs uppercase tracking-widest">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Bottom fade into page bg */}
        <div className="h-12 bg-linear-to-b from-transparent to-background-light dark:to-background-dark -mt-12 relative z-10 pointer-events-none" />
      </section>

      {/* ═══════════════════════════════════════════
          ABOUT
      ═══════════════════════════════════════════ */}
      <section id="about" className="py-16 md:py-24 bg-background-light dark:bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-100 dark:bg-slate-900 rounded-3xl p-6 md:p-12 lg:p-20 shadow-2xl border border-primary/10 flex flex-col md:flex-row items-center gap-10 lg:gap-20">
            <motion.div
              className="w-full md:w-1/2 rounded-2xl overflow-hidden aspect-video relative"
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: false, amount: 0.3 }}
            >
              <Image
                src="/landing-page-elements/blockchain-digital-icon.webp"
                alt="Blockchain Transparency"
                fill
                className="object-cover"
              />
            </motion.div>

            <motion.div
              className="w-full md:w-1/2 space-y-6"
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              viewport={{ once: false, amount: 0.3 }}
            >
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 rounded-full px-4 py-1.5">
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Transparency & Authenticity</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                The Foundation of<br />Digital Ownership
              </h2>
              <p className="text-base text-justify text-slate-600 dark:text-slate-400 leading-relaxed">
                Our platform focuses on securing digital assets through advanced verification
                methods, providing creators with the confidence they deserve. By leveraging
                cryptographic proof-of-ownership, we bridge the gap between creation and legal protection.
              </p>
              <ul className="space-y-3">
                {[
                  { title: "Immutable Ownership Records", desc: "Once recorded on the blockchain, ownership data cannot be altered or deleted, ensuring permanent proof of authenticity." },
                  { title: "Verified Creator Identities", desc: "Creators undergo identity verification to prevent impersonation and protect original works." },
                  { title: "Automated Licensing Contracts", desc: "Smart contracts automate licensing agreements, reducing disputes and manual paperwork." },
                  { title: "No Wallet Required for Blockchain", desc: "Users can secure assets without needing complex crypto wallets or blockchain knowledge." },
                ].map((item, index) => (
                  <motion.li
                    key={item.title}
                    className="relative group flex items-center gap-3 text-sm font-medium cursor-pointer"
                    initial={{ opacity: 0, x: 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.15 }}
                    viewport={{ once: false }}
                  >
                    <div className="w-6 h-6 shrink-0">
                      <Image src="/landing-page-elements/shield-fill-check1.svg" alt="Check" width={24} height={24} />
                    </div>
                    <span className="group-hover:text-blue-500 transition-colors">{item.title}</span>
                    <InfoIcon className="w-4 h-4 text-primary opacity-70 group-hover:opacity-100 animate-pulse shrink-0" />
                    <div className="absolute left-0 top-10 w-[min(24rem,90vw)] p-4 rounded-xl bg-blue-300 shadow-2xl border-2 border-blue-950 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-1 transition-all duration-300 pointer-events-none z-50">
                      <p className="text-sm text-primary dark:text-slate-300 leading-relaxed text-justify">{item.desc}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CATEGORIES
      ═══════════════════════════════════════════ */}
      <section id="categories" className="py-16 md:py-20 bg-orange-300/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <motion.div
              className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-400/25 rounded-full px-4 py-1.5 mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: false, amount: 0.5 }}
            >
              <Blocks className="w-3 h-3 text-orange-400" />
              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Protected Categories</span>
            </motion.div>
            <motion.h2
              className="text-2xl md:text-3xl lg:text-4xl font-black mb-3"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
              viewport={{ once: false, amount: 0.5 }}
            >
              Explore Protected Categories
            </motion.h2>
            <motion.p
              className="text-sm md:text-base text-slate-600 dark:text-slate-400"
              initial={{ opacity: 0, scale: 0.85, y: 16 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
              viewport={{ once: false, amount: 0.5 }}
            >
              Securing every form of digital expression with custom-tailored protection.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { label: "Digital Paintings", img: "/landing-page-elements/starry-night.png", desc: "High-resolution artwork protection for digital masterworks." },
              { label: "Photography", img: "/landing-page-elements/photography.png", desc: "Metadata preservation and license tracking for professional photographers." },
              { label: "Illustrations", img: "/landing-page-elements/digital-art.png", desc: "Comprehensive IP verification for vectors and character designs." },
              { label: "NFTs", img: "/landing-page-elements/art.png", desc: "On-chain identity confirmation for crypto-native creative assets." },
              { label: "Graphic Designs", img: "/landing-page-elements/graphic-design.png", desc: "Branding and typography asset protection for commercial designers." },
              { label: "AI Art", img: "/landing-page-elements/ai-image.png", desc: "Emerging IP framework for AI-assisted creative workflows." },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1], delay: index * 0.07 }}
                viewport={{ once: false, amount: 0.2 }}
                className="group bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 border border-transparent hover:border-orange-300 dark:hover:border-orange-500/30 cursor-pointer"
              >
                <div className="w-12 h-12 mb-4 relative">
                  <Image src={item.img} alt={item.label} fill className="object-contain" />
                </div>
                <h3 className="text-lg font-black mb-2 group-hover:text-orange-500 transition-colors">{item.label}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          COLLECTORS
      ═══════════════════════════════════════════ */}
      <section className="py-16 md:py-24" ref={collectorsRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
            <div className="w-full lg:w-1/2 space-y-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={collectorsInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 rounded-full px-4 py-1.5"
              >
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Verified Provenance</span>
              </motion.div>
              <motion.h2
                className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight"
                initial={{ y: 30, opacity: 0 }}
                animate={collectorsInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                Empowering Collectors with Verified Provenance
              </motion.h2>
              <motion.p
                className="text-base md:text-lg text-slate-600 dark:text-slate-400"
                initial={{ y: 30, opacity: 0 }}
                animate={collectorsInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              >
                Buying digital art shouldn&apos;t be a gamble. ArtForgeLab provides
                collectors with a clear, immutable file-clock of ownership and
                authenticity, ensuring that your investments are legitimate and
                protected by the creator&apos;s direct authorization.
              </motion.p>
              <div className="flex flex-col sm:flex-row gap-4">
                {[
                  { stat: "67.67%", label: "Verification Accuracy" },
                  { stat: "Transparency", label: "Immutable Records" },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    className="flex-1 p-5 md:p-6 rounded-xl bg-background-light dark:bg-slate-900 border-l-4 border-blue-400 shadow-[0_4px_24px_rgba(59,130,246,0.12)]"
                    initial={{ clipPath: "inset(0 100% 0 0)" }}
                    animate={collectorsInView ? { clipPath: "inset(0 0 0 0)" } : { clipPath: "inset(0 100% 0 0)" }}
                    transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: index * 0.15 }}
                  >
                    <div className="font-black text-xl md:text-2xl text-blue-500">{item.stat}</div>
                    <div className="text-sm text-slate-500 mt-0.5">{item.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <motion.div
                className="rounded-3xl overflow-hidden shadow-[0_8px_60px_rgba(59,130,246,0.2)] relative w-full h-65 sm:h-95 lg:h-125"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={collectorsInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <Image src="/ip-background-image.jpg" alt="Digital art collector gallery" fill className="object-cover" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          WHY CHOOSE — glowing cards
      ═══════════════════════════════════════════ */}
      <section className="relative py-16 md:py-24 bg-blue-950 text-white overflow-hidden select-none">
        {/* Section-level background glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400/5 rounded-full blur-3xl pointer-events-none -translate-x-1/3" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-400/5 rounded-full blur-3xl pointer-events-none translate-x-1/3" />

        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: "radial-linear(rgba(148,163,184,1) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: false, amount: 0.5 }}
              className="inline-flex items-center gap-2 bg-blue-400/10 border border-blue-400/20 rounded-full px-4 py-1.5 mb-4"
            >
              <Zap className="w-3 h-3 text-blue-300" />
              <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Our Advantages</span>
            </motion.div>
            <motion.h2
              className="text-2xl md:text-3xl lg:text-4xl font-black mb-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              viewport={{ once: false, amount: 0.5 }}
            >
              Why Choose ArtForgeLab?
            </motion.h2>
            <motion.p
              className="text-sm md:text-base text-slate-400"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: false, amount: 0.5 }}
            >
              The most secure foundation for your digital legacy.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: ShieldUser, title: "Secure Hashing",
                desc: "Advanced cryptographic algorithms to fingerprint every digital asset.",
                glow: "rgba(59,130,246,0.35)", border: "rgba(59,130,246,0.4)",
                iconBg: "bg-blue-500/15", iconColor: "text-blue-300",
              },
              {
                icon: FileClockIcon, title: "Immutability",
                desc: "Distributed ledger technology ensures records can never be altered.",
                glow: "rgba(99,102,241,0.35)", border: "rgba(99,102,241,0.4)",
                iconBg: "bg-indigo-500/15", iconColor: "text-indigo-300",
              },
              {
                icon: Scale, title: "Legal Ready",
                desc: "Exports court-admissible certificates of authenticity for IP disputes.",
                glow: "rgba(251,146,60,0.3)", border: "rgba(251,146,60,0.4)",
                iconBg: "bg-orange-500/15", iconColor: "text-orange-300",
              },
              {
                icon: Zap, title: "Instant Proof",
                desc: "Generate proof of existence and ownership in under 60 seconds.",
                glow: "rgba(234,179,8,0.3)", border: "rgba(234,179,8,0.35)",
                iconBg: "bg-yellow-500/15", iconColor: "text-yellow-300",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.09 }}
                  viewport={{ once: false, amount: 0.2 }}
                  className="group relative p-6 md:p-7 rounded-2xl bg-white/5 border border-white/10 overflow-hidden cursor-default transition-all duration-300"
                  style={{
                    ["--glow" as string]: item.glow,
                    ["--border-glow" as string]: item.border,
                  }}
                >
                  {/* ── Per-card radial glow (activates on hover via CSS group) ── */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                    style={{
                      background: `radial-linear(ellipse at 30% 30%, ${item.glow}, transparent 70%)`,
                    }}
                  />
                  {/* Border glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                    style={{
                      boxShadow: `inset 0 0 0 1px ${item.border}, 0 0 32px ${item.glow}`,
                    }}
                  />
                  {/* Subtle top-left shimmer dot */}
                  <div
                    className="absolute -top-4 -left-4 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
                    style={{ background: item.glow }}
                  />

                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center mb-5 transition-colors duration-300 group-hover:scale-110 group-hover:brightness-110`}>
                      <Icon className={`w-6 h-6 ${item.iconColor}`} strokeWidth={1.8} />
                    </div>
                    <h3 className="text-lg font-black mb-2 text-white">{item.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
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
      <section id="team" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 rounded-full px-4 py-1.5 mb-4">
              <Users className="w-3 h-3 text-blue-400" />
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">The Team</span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 text-slate-900 dark:text-white">
              The Innovators Behind the Vision
            </h2>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
              Meet the dedicated team developing the future of digital IP.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 cursor-pointer">
            {[
              { name: "Ruzzel", role: "Lead Developer", img: "/team-image/ruzzel.jpg" },
              { name: "Tenshin", role: "Front/Backend Engineer", img: "/team-image/tenshin.jpg" },
              { name: "Nathaniel", role: "UI/UX Designer", img: "/team-image/nathanielSD.jpg" },
            ].map((member) => (
              <div key={member.name} className="text-center group relative">
                <div className="relative w-40 h-40 md:w-48 md:h-48 mx-auto mb-6 p-1 rounded-full border-4 border-dotted border-orange-500
                                shadow-[0_0_15px_rgba(255,165,0,0.4)] transition-all duration-500
                                group-hover:shadow-[0_0_30px_rgba(255,165,0,0.8)] group-hover:scale-105">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-200 relative">
                    <Image src={member.img} alt={`${member.name} Profile`} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="absolute left-1/2 top-0 transform -translate-x-1/2 whitespace-nowrap opacity-0
                                  group-hover:opacity-100 group-hover:-translate-y-12 md:group-hover:-translate-y-16
                                  transition-all duration-500 ease-out
                                  bg-linear-to-r from-orange-400 via-amber-400 to-yellow-300
                                  text-white font-semibold px-4 py-1 rounded-xl shadow-xl text-sm">
                    {member.role}
                  </div>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{member.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FAQ — refined
      ═══════════════════════════════════════════ */}
      <section id="faq-section" className="relative py-16 md:py-24 overflow-hidden">
        {/* Subtle background */}
        <div className="absolute inset-0 bg-linear-to-b from-slate-50 to-orange-50/30 dark:from-slate-950 dark:to-slate-900 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-orange-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: false, amount: 0.5 }}
              className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-400/25 rounded-full px-4 py-1.5 mb-4"
            >
              <AlertTriangle className="w-3 h-3 text-orange-400" />
              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Got Questions?</span>
            </motion.div>
            <motion.h2
              className="text-2xl md:text-3xl lg:text-4xl font-black mb-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              viewport={{ once: false, amount: 0.5 }}
            >
              Frequently Asked Questions
            </motion.h2>
            <motion.p
              className="text-sm text-slate-500 dark:text-slate-400"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: false, amount: 0.5 }}
            >
              Everything you need to know about protecting your digital art.
            </motion.p>
          </div>

          {/* FAQ items */}
          <div className="space-y-3">
            {[
              {
                q: "How does the protection process work?",
                a: "When you upload a file, we generate a unique cryptographic hash that acts as a digital fingerprint. This fingerprint is then timestamped and recorded on our private blockchain network.",
                open: true,
              },
              {
                q: "Is this legally binding?",
                a: "ArtForgeLab provides evidentiary documentation that can be used in legal proceedings to prove you had possession of the specific file at a specific time, supporting your copyright claims.",
              },
              {
                q: "What file types do you support?",
                a: "We support all standard digital media formats including PNG, JPG, TIFF, SVG, AI, and PSD.",
              },
              {
                q: "Do I need a crypto wallet?",
                a: "No. ArtForgeLab handles all blockchain interactions on your behalf. You simply upload your artwork and we take care of the rest no crypto knowledge required.",
              },
              {
                q: "How long does verification take?",
                a: "Proof of ownership is generated in under 60 seconds. Blockchain confirmation typically takes a few minutes depending on network conditions.",
              },
            ].map((faq, i) => {
              const [isOpen, setIsOpen] = useState(faq.open || false);
              return (
                <motion.div
                  key={faq.q}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  viewport={{ once: false, amount: 0.2 }}
                  className={`rounded-2xl border overflow-hidden transition-all duration-300 ${isOpen
                    ? "border-orange-400/50 bg-white dark:bg-slate-900 shadow-[0_4px_24px_rgba(251,146,60,0.1)]"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-300/60 dark:hover:border-orange-500/30"
                    }`}
                >
                  <button
                    className="w-full flex items-center justify-between p-5 md:p-6 cursor-pointer text-left group"
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    <span className={`text-sm md:text-base font-semibold pr-4 transition-colors ${isOpen ? "text-orange-500" : "group-hover:text-orange-500"}`}>
                      {faq.q}
                    </span>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${isOpen ? "bg-orange-500 rotate-45" : "bg-slate-100 dark:bg-slate-800 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30"
                      }`}>
                      <Plus className={`w-4 h-4 transition-colors ${isOpen ? "text-white" : "text-slate-500 group-hover:text-orange-500"}`} />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: "auto", opacity: 1,
                          transition: {
                            height: { duration: 0.28, ease: [0.04, 0.62, 0.23, 0.98] },
                            opacity: { duration: 0.22, delay: 0.08 },
                          },
                        }}
                        exit={{
                          height: 0, opacity: 0,
                          transition: {
                            height: { duration: 0.26, ease: [0.04, 0.62, 0.23, 0.98] },
                            opacity: { duration: 0.18 },
                          },
                        }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 md:px-6 pb-5 md:pb-6">
                          <div className="h-px bg-slate-100 dark:bg-slate-800 mb-4" />
                          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
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
          CTA
      ═══════════════════════════════════════════ */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto relative rounded-3xl overflow-hidden bg-linear-to-r from-orange-400 via-amber-500 to-amber-400 p-6 sm:p-10 md:p-14 text-center text-white">
          {/* CTA inner glows */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-orange-300/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 mb-5">
              <Zap className="w-3 h-3 text-white" />
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">Get Started Today</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black mb-4 md:mb-5">
              Ready to Secure Your Digital Legacy?
            </h2>
            <p className="text-base md:text-xl mb-8 md:mb-10 opacity-90 max-w-2xl mx-auto leading-relaxed">
              Join the next generation of creators who protect their work with
              modern cryptographic technology.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/register"
                className="bg-white text-orange-500 px-8 md:px-10 py-4 rounded-xl font-black text-base hover:scale-105 transition-transform shadow-lg"
              >
                Get Started
              </Link>
              <Link
                href="/about"
                className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 md:px-10 py-4 rounded-xl font-bold text-base hover:bg-white/30 transition-all"
              >
                About Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Floating Upload Button ── */}
      <Link
        href="/upload-artwork"
        aria-label="Upload artwork"
        className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-orange-500 text-white shadow-[0_4px_24px_rgba(249,115,22,0.45)] flex items-center justify-center hover:bg-orange-600 hover:scale-110 hover:shadow-[0_8px_32px_rgba(249,115,22,0.6)] transition-all duration-300"
      >
        <Upload className="w-6 h-6" />
      </Link>
    </main>
  );
}