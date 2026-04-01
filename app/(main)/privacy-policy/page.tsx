"use client";

import Link from "next/link";
import NavBar from "@/components/blocks/navbar";
import { useEffect, useRef } from "react";
import {
  ShieldCheck, Database, Eye, Lock, UserCheck, RefreshCw, Globe,
  AlertTriangle, BookOpen, Mail, Share2Icon, MapPin,
  FileText, Scale, FileClockIcon, Users, Blocks, BrainCircuit,
} from "lucide-react";
import Image from "next/image";

/* ── Canva-style scroll-up reveal ── */
function Reveal({
  children, delay = 0, className = "",
}: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.opacity = "1";
            el.style.transform = "translateY(0px)";
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: 0,
        transform: "translateY(52px)",
        transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {children}
    </div>
  );
}

const SECTIONS = [
  { icon: Database, num: "01", title: "Information We Collect", body: "When you register and use ArtForgeLab, we collect the following information: your full name and email address during account registration; digital artwork files you voluntarily upload for IP registration; perceptual hash values and cryptographic fingerprints generated from your uploaded files; blockchain transaction records tied to your proof-of-authorship submissions; and usage data such as login timestamps, plagiarism check history, and community interactions including upvotes and reports." },
  { icon: Eye, num: "02", title: "How We Use Your Information", body: "Your data is used solely to operate and improve the ArtForgeLab platform. Specifically, we use it to register and protect your digital artworks on the blockchain, generate and store cryptographic proof of authorship, detect visual plagiarism using Perceptual Hashing algorithms, manage your account and authenticate your identity, process ownership dispute reports and complaints, and support community-driven features such as the upvoting system. We do not sell, rent, or share your personal data with third parties for commercial purposes." },
  { icon: Lock, num: "03", title: "Data Storage and Security", body: "Your personal information and artwork metadata are stored using Supabase and PostgreSQL, industry-standard cloud database solutions. Digital artwork files are stored via Cloudinary with access controls. All passwords are hashed and never stored in plaintext. Blockchain transaction records are stored on a decentralized ledger and are immutable by design. We implement industry-standard security measures including encrypted connections (HTTPS), role-based access control, and regular security audits. However, no digital system can guarantee absolute security." },
  { icon: UserCheck, num: "04", title: "Your Rights as a Data Subject", body: "Under the Data Privacy Act of 2012 (R.A. 10173), you have the right to be informed about how your data is collected and used; the right to access your personal data held by the system; the right to correct inaccurate or outdated information; the right to object to the processing of your data; the right to erasure or blocking of your data under lawful grounds; and the right to file a complaint with the National Privacy Commission (NPC) if you believe your rights have been violated. To exercise any of these rights, contact our research team at artforgelab@thesis.edu.ph." },
  { icon: Globe, num: "05", title: "Blockchain and Immutability", body: "Please note that once your artwork is registered on the blockchain, the cryptographic proof record — including the hash value and timestamp — becomes permanently immutable and cannot be deleted. This is a core feature of the system designed to ensure tamper-proof authorship records. Only the hash representation of your file is stored on-chain; the original artwork file itself is not embedded in the blockchain." },
  { icon: RefreshCw, num: "06", title: "Community Features and Upvotes", body: "When you upvote an artwork or submit a copyright infringement report, your user identifier may be associated with that action within the system for moderation and abuse prevention purposes. Upvote counts are publicly visible as part of the community gallery. Infringement reports are handled confidentially and are only accessible to system administrators." },
  { icon: Eye, num: "07", title: "Cookies and Analytics", body: "ArtForgeLab may use session cookies to maintain your authenticated state while using the platform. We do not use third-party advertising cookies or behavioral tracking. Basic analytics may be collected to monitor system performance and improve user experience. These analytics are anonymized and not linked to individual identities." },
  { icon: RefreshCw, num: "08", title: "Changes to This Policy", body: "We reserve the right to update this Privacy Policy at any time to reflect changes in the system, applicable laws, or our practices. Any significant changes will be communicated through the platform. Continued use of ArtForgeLab after changes are posted constitutes your acceptance of the updated policy." },
  { icon: Globe, num: "09", title: "Governing Law", body: "This Privacy Policy is governed by the laws of the Republic of the Philippines, including the Data Privacy Act of 2012 (R.A. 10173), the Intellectual Property Code (R.A. 8293), and other applicable regulations administered by the National Privacy Commission (NPC) and the Intellectual Property Office of the Philippines (IPOPHL)." },
];

const COMMITMENT_CARDS = [
  { icon: Database, title: "Supabase / PostgreSQL", desc: "Industry-standard cloud storage with role-based access control." },
  { icon: Lock, title: "Encrypted & Hashed", desc: "All passwords hashed, connections secured with HTTPS at all times." },
  { icon: Eye, title: "Your Data, Your Control", desc: "Exercise your R.A. 10173 rights: access, correct, or erase your data." },
  { icon: UserCheck, title: "R.A. 10173 · NPC", desc: "Fully compliant with the Philippine Data Privacy Act and NPC guidelines." },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-blue-400 to-orange-400" />

      {/* ── Hero ── */}
      <section className="relative bg-slate-900 pt-28 pb-20 px-6 text-center overflow-hidden">
        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(rgba(96,165,250,1) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Primary radial glow — centre blue */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[320px] bg-blue-500/12 rounded-full blur-3xl pointer-events-none" />
        {/* Secondary glow — orange bottom-right accent */}
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-orange-500/7 rounded-full blur-3xl pointer-events-none" />
        {/* Tertiary glow — soft top-left */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <Reveal>
            <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/25 rounded-full px-5 py-2 mb-6">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-bold text-blue-300 uppercase tracking-widest">Data Privacy</span>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none mb-5">
              Privacy{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-300">
                Policy
              </span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-slate-300 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              How ArtForgeLab collects, uses, and protects your personal data under the Data Privacy Act of 2012 (R.A. 10173).
            </p>
          </Reveal>
          <Reveal delay={220}>
            <div className="flex items-center justify-center gap-3 mt-5 text-xs text-slate-500">
              <span>Last updated: January 2026</span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span>ArtForgeLab Undergraduate Thesis Project</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Info bar ── */}
      <div className="bg-blue-600">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {[
            { label: "Governing Law", value: "R.A. 10173" },
            { label: "Jurisdiction", value: "Philippines" },
            { label: "Effective", value: "Jan 2026" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              <span className="text-blue-200 text-xs uppercase tracking-widest font-medium">{item.label}</span>
              <span className="text-white font-black">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Privacy Commitments — orange section with layered radial glows ── */}
      <section className="relative py-16 md:py-20 bg-orange-950 text-white overflow-hidden select-none">
        {/* Layered radial glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 w-72 h-72 bg-orange-400/6 rounded-full blur-3xl pointer-events-none -translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-400/6 rounded-full blur-3xl pointer-events-none translate-x-1/4 translate-y-1/4" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12 md:mb-14">
            <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-400/25 rounded-full px-4 py-1.5 mb-4">
              <ShieldCheck className="w-3 h-3 text-orange-300" />
              <span className="text-[10px] font-bold text-orange-200 uppercase tracking-widest">Our Commitments</span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-3">Our Privacy Commitments</h2>
            <p className="text-sm text-orange-200/55">Core principles that govern how your data is handled.</p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {COMMITMENT_CARDS.map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={i * 110}>
                  <div className="group relative p-6 md:p-7 rounded-2xl bg-orange-500/10 border border-orange-400/20 hover:bg-orange-500/18 hover:border-orange-400/45 hover:shadow-[0_8px_40px_rgba(251,146,60,0.15)] transition-all duration-300 h-full overflow-hidden">
                    {/* Per-card inner glow on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400/6 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
                    {/* Small corner radial glow */}
                    <div className="absolute -top-4 -left-4 w-20 h-20 bg-orange-400/8 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    <div className="relative z-10">
                      <div className="w-11 h-11 rounded-xl bg-orange-400/15 group-hover:bg-orange-400/28 flex items-center justify-center mb-4 transition-colors duration-300">
                        <Icon className="w-5 h-5 text-orange-300" strokeWidth={2} />
                      </div>
                      <h3 className="text-base font-bold mb-2 text-white">{item.title}</h3>
                      <p className="text-sm text-orange-100/60 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Full Policy — editorial section cards ── */}
      <section className="py-16 md:py-24 bg-background-light dark:bg-background-dark">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          <Reveal className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 rounded-full px-4 py-1.5 mb-4">
              <FileText className="w-3 h-3 text-blue-400" />
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Full Policy</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-3">Full Privacy Policy</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Please read the following sections carefully before using ArtForgeLab.
            </p>
          </Reveal>

          <div className="space-y-4">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <Reveal key={section.num}>
                  <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-400/60 dark:hover:border-blue-500/50 hover:shadow-[0_6px_28px_rgba(59,130,246,0.09)] transition-all duration-300 overflow-hidden">

                    {/* Left accent bar on hover */}
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-2xl" />

                    <div className="flex gap-0 md:gap-2">
                      {/* Section number column */}
                      <div className="hidden sm:flex flex-col items-center justify-start pt-6 pl-6 pr-2 shrink-0 w-20">
                        <span className="text-5xl font-black leading-none text-slate-100 dark:text-slate-800 group-hover:text-blue-100 dark:group-hover:text-blue-900/70 transition-colors select-none">
                          {section.num}
                        </span>
                      </div>

                      {/* Divider */}
                      <div className="hidden sm:block w-px bg-slate-100 dark:bg-slate-800 my-5 shrink-0" />

                      {/* Body */}
                      <div className="flex-1 min-w-0 p-6 md:p-7">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 flex items-center justify-center transition-colors shrink-0">
                            <Icon className="w-4 h-4 text-blue-500" />
                          </div>
                          {/* Mobile number */}
                          <span className="sm:hidden text-xl font-black text-slate-200 dark:text-slate-700 select-none">{section.num}</span>
                          <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {section.title}
                          </h3>
                        </div>
                        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                          {section.body}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* ── Legal disclaimer ── */}
          <Reveal className="mt-10">
            <div className="relative rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/8 to-orange-400/5 p-7 overflow-hidden">
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-amber-400/8 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-start gap-4 relative">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2">Legal Disclaimer</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    ArtForgeLab is an{" "}
                    <span className="text-slate-700 dark:text-slate-200 font-semibold">academic thesis project</span>{" "}
                    and does not constitute a registered commercial service. All data handling is conducted in accordance with{" "}
                    <span className="text-slate-700 dark:text-slate-200 font-semibold">R.A. 10173</span>{" "}
                    and{" "}
                    <span className="text-slate-700 dark:text-slate-200 font-semibold">R.A. 8293</span>{" "}
                    for research and evaluation purposes only.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* ── Back link ── */}
          <Reveal className="mt-10 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-500 hover:text-blue-400 transition-colors group">
              <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span>
              Back to Home
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}