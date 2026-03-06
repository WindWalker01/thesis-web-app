"use client";

import Link from "next/link";
import NavBar from "@/components/blocks/navbar";
import { useEffect, useRef } from "react";
import {
  ShieldCheck, Database, Eye, Lock, UserCheck, RefreshCw, Globe,
  AlertTriangle, BookOpen, Mail, Share2Icon, MapPin, BrainCircuitIcon,
  FileText, Scale, FileClockIcon, Users, Blocks, BrainCircuit,
} from "lucide-react";
import Image from "next/image";

/* ─────────────────────────────────────────────
   Canva-style scroll-up reveal component
   • starts 60px below, opacity 0
   • slides up + fades in once in viewport
   • one-shot (unobserves after firing)
───────────────────────────────────────────── */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
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
      { threshold: 0.15 }
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
        transform: "translateY(60px)",
        transition: "opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </div>
  );
}

const sections = [
  { icon: Database,  title: "1. Information We Collect",        body: "When you register and use ArtForgeLab, we collect the following information: your full name and email address during account registration; digital artwork files you voluntarily upload for IP registration; perceptual hash values and cryptographic fingerprints generated from your uploaded files; blockchain transaction records tied to your proof-of-authorship submissions; and usage data such as login timestamps, plagiarism check history, and community interactions including upvotes and reports." },
  { icon: Eye,       title: "2. How We Use Your Information",   body: "Your data is used solely to operate and improve the ArtForgeLab platform. Specifically, we use it to register and protect your digital artworks on the blockchain, generate and store cryptographic proof of authorship, detect visual plagiarism using Perceptual Hashing algorithms, manage your account and authenticate your identity, process ownership dispute reports and complaints, and support community-driven features such as the upvoting system. We do not sell, rent, or share your personal data with third parties for commercial purposes." },
  { icon: Lock,      title: "3. Data Storage and Security",     body: "Your personal information and artwork metadata are stored using Supabase and PostgreSQL, industry-standard cloud database solutions. Digital artwork files are stored via Cloudinary with access controls. All passwords are hashed and never stored in plaintext. Blockchain transaction records are stored on a decentralized ledger and are immutable by design. We implement industry-standard security measures including encrypted connections (HTTPS), role-based access control, and regular security audits. However, no digital system can guarantee absolute security." },
  { icon: UserCheck, title: "4. Your Rights as a Data Subject", body: "Under the Data Privacy Act of 2012 (R.A. 10173), you have the right to be informed about how your data is collected and used; the right to access your personal data held by the system; the right to correct inaccurate or outdated information; the right to object to the processing of your data; the right to erasure or blocking of your data under lawful grounds; and the right to file a complaint with the National Privacy Commission (NPC) if you believe your rights have been violated. To exercise any of these rights, contact our research team at artforgelab@thesis.edu.ph." },
  { icon: Globe,     title: "5. Blockchain and Immutability",   body: "Please note that once your artwork is registered on the blockchain, the cryptographic proof record — including the hash value and timestamp — becomes permanently immutable and cannot be deleted. This is a core feature of the system designed to ensure tamper-proof authorship records. Only the hash representation of your file is stored on-chain; the original artwork file itself is not embedded in the blockchain." },
  { icon: RefreshCw, title: "6. Community Features and Upvotes", body: "When you upvote an artwork or submit a copyright infringement report, your user identifier may be associated with that action within the system for moderation and abuse prevention purposes. Upvote counts are publicly visible as part of the community gallery. Infringement reports are handled confidentially and are only accessible to system administrators." },
  { icon: Eye,       title: "7. Cookies and Analytics",         body: "ArtForgeLab may use session cookies to maintain your authenticated state while using the platform. We do not use third-party advertising cookies or behavioral tracking. Basic analytics may be collected to monitor system performance and improve user experience. These analytics are anonymized and not linked to individual identities." },
  { icon: RefreshCw, title: "8. Changes to This Policy",        body: "We reserve the right to update this Privacy Policy at any time to reflect changes in the system, applicable laws, or our practices. Any significant changes will be communicated through the platform. Continued use of ArtForgeLab after changes are posted constitutes your acceptance of the updated policy." },
  { icon: Globe,     title: "9. Governing Law",                  body: "This Privacy Policy is governed by the laws of the Republic of the Philippines, including the Data Privacy Act of 2012 (R.A. 10173), the Intellectual Property Code (R.A. 8293), and other applicable regulations administered by the National Privacy Commission (NPC) and the Intellectual Property Office of the Philippines (IPOPHL)." },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <NavBar />
      <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-blue-400 to-orange-400" />

      {/* Hero */}
      <section className="relative pt-16 bg-slate-900 text-white">
        <div className="min-h-[42vh] flex items-center justify-center px-4 py-20 text-center">
          <div className="max-w-4xl w-full space-y-6">
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-white leading-tight">
              Privacy <span className="text-blue-500">Policy</span>
            </h1>
            <p className="text-base md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              How ArtForgeLab collects, uses, and protects your personal data under the Data Privacy Act of 2012 (R.A. 10173).
            </p>
            <p className="text-sm text-slate-500">Last updated: January 2026 · ArtForgeLab Undergraduate Thesis Project</p>
          </div>
        </div>
      </section>

      {/* Overview cards — orange theme, cards ascend one by one */}
      <section className="py-16 md:py-20 bg-orange-950 text-white select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-4 text-white">Our Privacy Commitments</h2>
            <p className="text-sm md:text-base text-orange-200/70">Core principles that govern how your data is handled.</p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Database,  title: "Supabase / PostgreSQL",   desc: "Industry-standard cloud storage with role-based access control." },
              { icon: Lock,      title: "Encrypted & Hashed",      desc: "All passwords hashed, connections secured with HTTPS at all times." },
              { icon: Eye,       title: "Your Data, Your Control", desc: "Exercise your R.A. 10173 rights: access, correct, or erase your data." },
              { icon: UserCheck, title: "R.A. 10173 · NPC",        desc: "Fully compliant with the Philippine Data Privacy Act and NPC guidelines." },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={i * 120}>
                  <div className="p-6 md:p-8 rounded-2xl bg-orange-500/10 border border-orange-400/25 hover:bg-orange-500/20 transition-all h-full">
                    <Icon className="text-orange-300 w-10 h-10 mb-4" strokeWidth={2} />
                    <h3 className="text-lg md:text-xl font-bold mb-3 text-white">{item.title}</h3>
                    <p className="text-sm text-orange-100/75 leading-relaxed">{item.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Policy sections — each card ascends as it enters */}
      <section className="py-16 md:py-24 bg-background-light dark:bg-background-dark">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-4">Full Privacy Policy</h2>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
              Please read the following sections carefully before using ArtForgeLab.
            </p>
          </Reveal>

          <div className="space-y-8">
            {sections.map((section, i) => {
              const Icon = section.icon;
              return (
                <Reveal key={section.title} delay={0}>
                  <div className="bg-gray-100 dark:bg-slate-900 rounded-2xl border border-primary/10 shadow-sm p-8 md:p-10 flex flex-col sm:flex-row gap-6">
                    <div className="shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-blue-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">{section.title}</h3>
                      <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed text-justify">{section.body}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal className="mt-14">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 md:p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">Legal Disclaimer</p>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    ArtForgeLab is an <span className="text-slate-300 font-medium">academic thesis project</span> and does not constitute a registered commercial service. All data handling is conducted in accordance with <span className="text-slate-300 font-medium">R.A. 10173</span> and <span className="text-slate-300 font-medium">R.A. 8293</span> for research and evaluation purposes only.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal className="mt-10 text-center">
            <Link href="/" className="text-base text-blue-500 hover:underline">← Back to Home</Link>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-blue-400 to-orange-400" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 pb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-12 md:mb-14">
            <div className="sm:col-span-2 lg:col-span-1 space-y-5">
              <div className="flex items-center gap-2">
                <Image src="/landing-page-elements/AFL_logoWeb.png" alt="Logo" width={60} height={70} className="shrink-0" />
                <span className="text-lg font-bold tracking-tight">
                  <span className="text-blue-400">Art</span><span className="text-orange-500">Forge</span><span className="text-white">Lab</span>
                </span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 border-l-2 border-blue-500 pl-3">Advancing Digital IP Protection</p>
              <p className="text-sm text-slate-400 leading-relaxed text-justify">
                ArtForgeLab is an academic research initiative developing a Web-based Intellectual Property Rights Management System for Digital Artists using <span className="text-slate-200 font-medium">Perceptual Hashing</span> and <span className="text-slate-200 font-medium">Blockchain Technology</span>.
              </p>
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2">
                <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-xs text-blue-300 font-medium">Undergraduate Thesis Research · 2026</span>
              </div>
            </div>
            <div className="space-y-5">
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-200 border-b border-slate-700 pb-3">Platform</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                {[{ icon: FileText, label: "Artwork Registration" }, { icon: ShieldCheck, label: "Proof of Authorship" }, { icon: Blocks, label: "Plagiarism Detection" }, { icon: Scale, label: "Ownership Verification" }, { icon: Users, label: "Community Gallery" }, { icon: FileClockIcon, label: "Dispute & Complaint Management" }].map(({ icon: Icon, label }) => (
                  <li key={label}><a href="#" className="flex items-center gap-2 hover:text-blue-400 transition-colors group"><Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 shrink-0" /><span>{label}</span></a></li>
                ))}
              </ul>
            </div>
            <div className="space-y-5">
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-200 border-b border-slate-700 pb-3">Resources</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                {[{ icon: BookOpen, label: "Intellectual Property Guide" }, { icon: BrainCircuit, label: "How Perceptual Hashing Works" }, { icon: Scale, label: "Research Documentation" }, { icon: ShieldCheck, label: "Support Center" }].map(({ icon: Icon, label }) => (
                  <li key={label}><a href="#" className="flex items-center gap-2 hover:text-blue-400 transition-colors group"><Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 shrink-0" /><span>{label}</span></a></li>
                ))}
              </ul>
            </div>
            <div className="space-y-5">
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-200 border-b border-slate-700 pb-3">Research Team</h4>
              <p className="text-sm text-slate-400 leading-relaxed">Developed as partial fulfillment of an undergraduate thesis requirement. For academic inquiries, reach out below.</p>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-3"><Mail className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" /><span className="break-all">artforgelab@thesis.edu.ph</span></li>
                <li className="flex items-start gap-3"><MapPin className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" /><span>Philippines, 2026</span></li>
              </ul>
              <div className="flex gap-3 pt-1">
                {[{ icon: Globe, label: "Website" }, { icon: Share2Icon, label: "Share" }, { icon: Mail, label: "Email" }].map(({ icon: Icon, label }) => (
                  <a key={label} href="#" aria-label={label} className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-500/20 hover:border-blue-500/40 transition-all">
                    <Icon className="w-4 h-4 text-blue-400" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 md:p-5 mb-8 md:mb-10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">Legal Disclaimer</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ArtForgeLab provides cryptographic proof-of-existence and similarity detection as <span className="text-slate-300 font-medium">evidentiary support</span> for intellectual property claims. All similarity results are <span className="text-slate-300 font-medium">indicative only</span> and do not constitute a legal determination. This system is intended to complement, not replace, formal copyright registration governed by the <span className="text-slate-300 font-medium">Intellectual Property Code of the Philippines (R.A. 8293)</span> and administered by <span className="text-slate-300 font-medium">IPOPHL</span>.
                </p>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p className="text-center md:text-left leading-relaxed">© 2026 ArtForgeLab — A Thesis Project on <span className="text-slate-400">Intellectual Property Rights Management for Digital Artists</span> Using Perceptual Hashing &amp; Blockchain Technology.</p>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
              {["Privacy Policy", "Terms of Use"].map((link) => (
                <a key={link} href="#" className="hover:text-white transition-colors whitespace-nowrap">{link}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}