"use client";

import Link from "next/link";
import Image from "next/image";
import NavBar from "@/components/blocks/navbar";
import {
  ChevronDown,
  Upload,
  ShieldUser,
  FileClockIcon,
  Scale,
  Zap,
  Mail,
  Share2Icon,
  Globe,
  BrainCircuitIcon,
  InfoIcon,
  BookOpen,
  ShieldCheck,
  FileText,
  Users,
  Blocks,
  AlertTriangle,
  MapPin,
  BrainCircuit,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// useInView triggers animations only when the section enters the viewport
import { useInView } from "react-intersection-observer";

export default function Home() {

  // collectorsRef attaches to the Collectors section; collectorsInView becomes true when it's visible
  const [collectorsRef, collectorsInView] = useInView({
    threshold: 0.3,
    triggerOnce: false,
    delay: 100,
  });

  return (
    // overflow-x-hidden prevents wide elements and tooltips from causing horizontal scroll
    <main className="min-h-screen overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">

      <NavBar />

      {/* ================= HERO ================= */}
      <section className="relative pt-16">
        <div
          className="min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center px-4"
          style={{
            background:
              "linear-gradient(rgba(16, 34, 22, 0.7), rgba(16, 34, 22, 0.9)), url('/landing-page-elements/landing-page-bg.avif')",
            backgroundSize: "cover",
            // "center top" keeps the focal point visible on portrait/narrow screens
            backgroundPosition: "center top",
          }}
        >
          <div className="max-w-4xl w-full text-center space-y-6 px-4">
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-white leading-tight">
              Protecting Digital Creativity with{" "}
              <span className="text-blue-500">Confidence</span>
            </h1>
            <p className="text-base md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              A thesis project dedicated to digital IP protection, ensuring transparency
              and authenticity for every creator in the evolving digital landscape.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button className="bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-600 hover:scale-105 transition-transform cursor-pointer">
                Sign Up
              </button>
              <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all cursor-pointer">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}
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
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                Transparency &amp; Authenticity
              </h2>
              <p className="text-base md:text-lg text-justify text-slate-600 dark:text-slate-400 leading-relaxed">
                Our platform focuses on securing digital assets through advanced verification
                methods, providing creators with the confidence they deserve. By leveraging
                cryptographic proof-of-ownership, we bridge the gap between creation and legal protection.
              </p>
              <ul className="space-y-4">
                {[
                  {
                    title: "Immutable Ownership Records",
                    desc: "Once recorded on the blockchain, ownership data cannot be altered or deleted, ensuring permanent proof of authenticity.",
                  },
                  {
                    title: "Verified Creator Identities",
                    desc: "Creators undergo identity verification to prevent impersonation and protect original works.",
                  },
                  {
                    title: "Automated Licensing Contracts",
                    desc: "Smart contracts automate licensing agreements, reducing disputes and manual paperwork.",
                  },
                  {
                    title: "No Wallet Required for Blockchain",
                    desc: "Users can secure assets without needing complex crypto wallets or blockchain knowledge.",
                  },
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
                      <Image
                        src="/landing-page-elements/shield-fill-check1.svg"
                        alt="Check Icon"
                        width={24}
                        height={24}
                      />
                    </div>
                    <span className="group-hover:text-blue-500 transition-colors">{item.title}</span>
                    <InfoIcon className="w-4 h-4 text-primary opacity-70 group-hover:opacity-100 animate-pulse shrink-0" />

                    {/* Tooltip — w-[min(24rem,90vw)] clamps width so it never overflows on mobile */}
                    <div className="absolute left-0 top-10 w-[min(24rem,90vw)] p-4 rounded-xl bg-blue-300 shadow-2xl border-2
                                    border-blue-950 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-1
                                    transition-all duration-300 pointer-events-none z-50">
                      <p className="text-sm text-primary dark:text-slate-300 leading-relaxed text-justify">
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

      {/* ================= CATEGORIES ================= */}
      <section id="categories" className="py-16 md:py-20 bg-orange-300/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <motion.h2
              className="text-2xl md:text-3xl lg:text-4xl font-black mb-4"
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

          {/* ─── Category image data ──────────────────────────────────────────────
              PNG files live in /public/landing-page-elements/ in your project.
              To add, remove, or rename a category — edit this array only.
          ──────────────────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 lg:gap-14">
            {[
              {
                label: "Digital Paintings",
                img:   "/landing-page-elements/starry-night.png",
                desc:  "High-resolution artwork protection for digital masterworks.",
              },
              {
                label: "Photography",
                img:   "/landing-page-elements/photography.png",
                desc:  "Metadata preservation and license tracking for professional photographers.",
              },
              {
                label: "Illustrations",
                img:   "/landing-page-elements/digital-art.png",
                desc:  "Comprehensive IP verification for vectors and character designs.",
              },
              {
                label: "NFTs",
                img:   "/landing-page-elements/art.png",
                desc:  "On-chain identity confirmation for crypto-native creative assets.",
              },
              {
                label: "Graphic Designs",
                img:   "/landing-page-elements/graphic-design.png",
                desc:  "Branding and typography asset protection for commercial designers.",
              },
              {
                label: "AI Art",
                img:   "/landing-page-elements/ai-image.png",
                desc:  "Emerging IP framework for AI-assisted creative workflows.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1], delay: index * 0.07 }}
                viewport={{ once: false, amount: 0.2 }}
                className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl hover:-translate-y-2 hover:shadow-xl transition-all
                           duration-500 border border-transparent hover:border-blue-400 cursor-pointer"
              >
                {/* PNG icon — replaces the previous Lucide icon */}
                <div className="w-12 h-12 mb-4 relative">
                  <Image
                    src={item.img}
                    alt={item.label}
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2">{item.label}</h3>
                <p className="text-slate-500 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= COLLECTORS ================= */}
      {/* ref={collectorsRef} lets useInView detect when this section is on screen */}
      <section className="py-16 md:py-24" ref={collectorsRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">

            <div className="w-full lg:w-1/2 space-y-8">
              {/* animate uses collectorsInView instead of whileInView because this section
                  uses a ref-based observer, not Framer Motion's built-in viewport detection */}
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
                  // clipPath animates the card wiping in from left to right
                  <motion.div
                    key={item.label}
                    className="flex-1 p-5 md:p-6 rounded-xl bg-background-light border-l-4 border-blue-400 shadow-2xl shadow-blue-200"
                    initial={{ clipPath: "inset(0 100% 0 0)" }}
                    animate={collectorsInView ? { clipPath: "inset(0 0 0 0)" } : { clipPath: "inset(0 100% 0 0)" }}
                    transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: index * 0.15 }}
                  >
                    <div className="font-bold text-xl md:text-2xl">{item.stat}</div>
                    <div className="text-sm text-slate-500">{item.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <motion.div
                className="rounded-3xl overflow-hidden shadow-2xl shadow-blue-600 relative w-full h-[260px] sm:h-[380px] lg:h-[500px]"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={collectorsInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <Image
                  src="/ip-background-image.jpg"
                  alt="Digital art collector gallery"
                  fill
                  className="object-cover"
                />
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE US ================= */}
      <section className="py-16 md:py-20 bg-blue-950 text-white select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-4">
              Why Choose ArtForgeLab?
            </h2>
            <p className="text-sm md:text-base text-slate-400">
              The most secure foundation for your digital legacy.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShieldUser,    title: "Secure Hashing",  desc: "Advanced cryptographic algorithms to fingerprint every digital asset." },
              { icon: FileClockIcon, title: "Immutability",    desc: "Distributed ledger technology ensures records can never be altered." },
              { icon: Scale,         title: "Legal Ready",     desc: "Exports court-admissible certificates of authenticity for IP disputes." },
              { icon: Zap,           title: "Instant Proof",   desc: "Generate proof of existence and ownership in under 60 seconds." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                  <Icon className="text-blue-300 w-10 h-10 mb-4" strokeWidth={2} />
                  <h3 className="text-lg md:text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= TEAM ================= */}
      <section id="team" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-4 text-slate-900 dark:text-white">
              The Innovators Behind the Vision
            </h2>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
              Meet the dedicated team developing the future of digital IP.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 cursor-pointer">
            {[
              { name: "Ruzzel",    role: "Lead Developer",         img: "/team-image/ruzzel.jpg" },
              { name: "Tenshin",   role: "Front/Backend Engineer", img: "/team-image/tenshin.jpg" },
              { name: "Nathaniel", role: "UI/UX Designer",         img: "/team-image/nathanielSD.jpg" },
            ].map((member) => (
              <div key={member.name} className="text-center group relative">
                <div className="relative w-40 h-40 md:w-48 md:h-48 mx-auto mb-6 p-1 rounded-full border-4 border-dotted border-orange-500
                                shadow-[0_0_15px_rgba(255,165,0,0.4)] transition-all duration-500
                                group-hover:shadow-[0_0_30px_rgba(255,165,0,0.8)] group-hover:scale-105">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-200 relative">
                    <Image
                      src={member.img}
                      alt={`${member.name} Profile`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  {/* Role label floats above the avatar on hover via -translate-y */}
                  <div className="absolute left-1/2 top-0 transform -translate-x-1/2 whitespace-nowrap opacity-0
                                  group-hover:opacity-100 group-hover:-translate-y-12 md:group-hover:-translate-y-16
                                  transition-all duration-500 ease-out
                                  bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300
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

      {/* ================= FAQ ================= */}
      {/* id="faq-section" is the anchor target for the FAQ link in the navbar More dropdown */}
      <section id="faq-section" className="py-16 md:py-24 bg-primary/5">
        <div className="max-w-3xl lg:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 md:mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
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
                a: "We support all standard digital media formats including PNG, JPG, TIFF, SVG, AI, PSD, and MP4.",
              },
            ].map((faq) => {
              const [isOpen, setIsOpen] = useState(faq.open || false);
              return (
                <div key={faq.q} className="rounded-xl overflow-hidden border border-orange-300 dark:border-slate-700 select-none">
                  <motion.div
                    className="flex items-center justify-between p-4 md:p-6 cursor-pointer font-bold
                                bg-gradient-to-r from-orange-200 to-orange-100 dark:from-slate-900 dark:to-slate-800
                                hover:from-orange-300 hover:to-orange-200 dark:hover:from-slate-800 dark:hover:to-slate-700
                                transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <span className="text-sm md:text-base pr-4">{faq.q}</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="shrink-0"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </motion.div>
                  </motion.div>

                  {/* AnimatePresence enables the exit animation when the answer collapses */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: "auto", opacity: 1,
                          transition: {
                            height:  { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] },
                            opacity: { duration: 0.25, delay: 0.1 },
                          },
                        }}
                        exit={{
                          height: 0, opacity: 0,
                          transition: {
                            height:  { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] },
                            opacity: { duration: 0.2 },
                          },
                        }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 md:p-6 pt-2 text-slate-600 dark:text-slate-400 text-sm border-t border-orange-300 dark:border-slate-700 mt-2">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden bg-gradient-to-r from-orange-400 via-amber-500 to-amber-400 p-6 sm:p-10 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-4xl font-black mb-4 md:mb-6">
            Ready to Secure Your Digital Legacy?
          </h2>
          <p className="text-base md:text-xl mb-8 md:mb-10 opacity-90 max-w-2xl mx-auto">
            Join the next generation of creators who protect their work with
            modern cryptographic technology.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {/* Get Started — redirects to the registration form */}
            <Link
              href="/register"
              className="bg-primary-dark border-2 border-amber-200 text-white px-8 md:px-10 py-4 rounded-xl font-bold text-base
                         md:text-lg hover:scale-105 transition-transform shadow-lg text-center"
            >
              Get Started
            </Link>
            <Link
              href="/about"
              className="bg-white/20 backdrop-blur-md border border-white/30 text-primary px-8 md:px-10 py-4 rounded-xl font-bold text-base
                         md:text-lg hover:bg-white/30 transition-all cursor-pointer"
            >
              About Us
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-900 text-white">
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-blue-400 to-orange-400" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 pb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-12 md:mb-14">

            {/* sm:col-span-2 gives the About column more width on tablet so the text isn't too narrow */}
            <div className="sm:col-span-2 lg:col-span-1 space-y-5">
              <div className="flex items-center gap-2">
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
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 border-l-2 border-blue-500 pl-3">
                Advancing Digital IP Protection
              </p>
              <p className="text-sm text-slate-400 leading-relaxed text-justify">
                ArtForgeLab is an academic research initiative developing a
                Web-based Intellectual Property Rights Management System for
                Digital Artists. The system integrates{" "}
                <span className="text-slate-200 font-medium">Perceptual Hashing</span>{" "}
                algorithms and{" "}
                <span className="text-slate-200 font-medium">Blockchain Technology</span>{" "}
                to provide secure proof of authorship, plagiarism detection, and
                transparent ownership verification for digital creative works.
              </p>
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2">
                <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-xs text-blue-300 font-medium">
                  Undergraduate Thesis Research · 2026
                </span>
              </div>
            </div>

            {/* Platform Links */}
            <div className="space-y-5">
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-200 border-b border-slate-700 pb-3">Platform</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                {[
                  { icon: FileText,      label: "Artwork Registration" },
                  { icon: ShieldCheck,   label: "Proof of Authorship" },
                  { icon: Blocks,        label: "Plagiarism Detection" },
                  { icon: Scale,         label: "Ownership Verification" },
                  { icon: Users,         label: "Community Gallery" },
                  { icon: FileClockIcon, label: "Dispute & Complaint Management" },
                ].map(({ icon: Icon, label }) => (
                  <li key={label}>
                    <a href="#" className="flex items-center gap-2 hover:text-blue-400 transition-colors group">
                      <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors shrink-0" />
                      <span>{label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Links */}
            <div className="space-y-5">
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-200 border-b border-slate-700 pb-3">Resources</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                {[
                  { icon: BookOpen,     label: "Intellectual Property Guide" },
                  { icon: BrainCircuit, label: "How Perceptual Hashing Works" },
                  { icon: Scale,        label: "Research Documentation" },
                  { icon: ShieldCheck,  label: "Support Center" },
                ].map(({ icon: Icon, label }) => (
                  <li key={label}>
                    <a href="#" className="flex items-center gap-2 hover:text-blue-400 transition-colors group">
                      <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors shrink-0" />
                      <span>{label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-5">
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-200 border-b border-slate-700 pb-3">Research Team</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                This system was developed as partial fulfillment of an
                undergraduate thesis requirement. For academic inquiries,
                system feedback, or collaboration proposals, please reach
                out through the channels below.
              </p>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  {/* break-all splits the email if it's too long to fit on one line on mobile */}
                  <span className="break-all">artforgelab@thesis.edu.ph</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <span>Philippines, 2026</span>
                </li>
              </ul>
              <div className="flex gap-3 pt-1">
                {[
                  { icon: Globe,      label: "Website" },
                  { icon: Share2Icon, label: "Share" },
                  { icon: Mail,       label: "Email" },
                ].map(({ icon: Icon, label }) => (
                  <a key={label} href="#" aria-label={label}
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-500/20 hover:border-blue-500/40 transition-all">
                    <Icon className="w-4 h-4 text-blue-400" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 md:p-5 mb-8 md:mb-10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">Legal Disclaimer</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ArtForgeLab provides cryptographic proof-of-existence and similarity detection as{" "}
                  <span className="text-slate-300 font-medium">evidentiary support</span> for
                  intellectual property claims. All similarity results generated through Perceptual
                  Hashing are <span className="text-slate-300 font-medium">indicative only</span> and
                  do not constitute a legal determination of infringement or ownership. This system is
                  intended to complement, not replace, formal copyright registration procedures governed
                  by the{" "}
                  <span className="text-slate-300 font-medium">
                    Intellectual Property Code of the Philippines (R.A. 8293)
                  </span>{" "}
                  and administered by the Intellectual Property Office of the Philippines{" "}
                  <span className="text-slate-300 font-medium">(IPOPHL)</span>.
                </p>
              </div>
            </div>
          </div>

          {/* flex-wrap + gap-x/gap-y lets the links wrap to a second line on small screens */}
          <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p className="text-center md:text-left leading-relaxed">
              © 2026 ArtForgeLab &mdash; A Thesis Project on{" "}
              <span className="text-slate-400">Intellectual Property Rights Management for Digital Artists</span>{" "}
              Using Perceptual Hashing &amp; Blockchain Technology.
            </p>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
              {["Privacy Policy", "Terms of Use"].map((link) => (
                <a key={link} href="#" className="hover:text-white transition-colors whitespace-nowrap">{link}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ================= FLOATING UPLOAD BUTTON ================= */}
      {/* TODO: hide this button when user is not logged in (wrap with isLoggedIn check) */}
      {/* Fixed to bottom-right; z-50 keeps it above all sections */}
      <Link
        href="/upload-form"
        aria-label="Upload artwork"
        className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full
                   bg-orange-500 text-white shadow-lg shadow-orange-400/40
                   flex items-center justify-center
                   hover:bg-orange-600 hover:scale-110 hover:shadow-orange-500/60
                   transition-all duration-300"
      >
        <Upload className="w-6 h-6" />
      </Link>

    </main>
  );
}