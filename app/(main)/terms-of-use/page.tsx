"use client";

import Link from "next/link";
import Image from "next/image";
import NavBar from "@/components/blocks/navbar";
import { useEffect, useRef } from "react";
import {
  AlertTriangle, FileText, ShieldCheck, Scale, UserCheck,
  ThumbsUp, Flag, RefreshCw, Globe, BookOpen, Mail,
  Share2Icon, MapPin, BrainCircuit, FileClockIcon, Users, Blocks,
} from "lucide-react";

/* ── Canva-style scroll reveal ── */
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
  { icon: FileText,     num: "01", title: "Acceptance of Terms",       body: "By accessing or using the ArtForgeLab platform, you agree to be bound by these Terms of Use. If you do not agree, please do not use the system. ArtForgeLab is developed as an academic research initiative and is not a commercially deployed service." },
  { icon: ShieldCheck,  num: "02", title: "Use of the Platform",       body: "You may use ArtForgeLab solely for lawful purposes related to intellectual property registration, plagiarism detection, and ownership verification of digital artworks. You must not upload content that infringes on the rights of third parties or violates any applicable law." },
  { icon: Scale,        num: "03", title: "Intellectual Property",     body: "All original content you upload remains your property. By submitting content, you grant ArtForgeLab a limited, non-exclusive license to process and hash your files for the purpose of generating proof-of-authorship records. We do not claim ownership over your uploaded works." },
  { icon: ShieldCheck,  num: "04", title: "Accuracy of Results",       body: "Similarity scores and plagiarism detection results generated through Perceptual Hashing are indicative only. They are not a legal determination of copyright infringement or originality. Users are encouraged to seek legal counsel before taking formal action based on these results." },
  { icon: UserCheck,    num: "05", title: "Account Responsibility",    body: "You are responsible for maintaining the confidentiality of your account credentials. Any activity conducted under your account is your responsibility. Report unauthorized access to our research team immediately." },
  { icon: AlertTriangle,num: "06", title: "Limitation of Liability",   body: "ArtForgeLab, its developers, and affiliated academic institutions shall not be liable for any direct, indirect, or incidental damages arising from use of this platform. The service is provided on an 'as is' basis for academic evaluation purposes." },
  { icon: ThumbsUp,     num: "07", title: "Community Upvoting System", body: "ArtForgeLab features a community upvoting system that allows registered users to upvote digital artworks they find valuable or exceptional. Artworks with higher upvote counts may receive increased visibility and exposure within the platform gallery. Upvotes are intended to reflect community appreciation and may indicate the perceived artistic value of a work. However, upvote counts do not constitute a formal appraisal, monetary valuation, or legal endorsement of any artwork. ArtForgeLab is not responsible for any decisions made based on an artwork's upvote standing." },
  { icon: Flag,         num: "08", title: "Upvoting Conduct",          body: "Users must not manipulate upvote counts through automated means, multiple accounts, or any form of coordinated inauthentic behavior. Abuse of the upvoting system may result in account suspension. ArtForgeLab reserves the right to remove fraudulent upvotes and adjust visibility rankings accordingly." },
  { icon: RefreshCw,    num: "09", title: "Modifications",             body: "We reserve the right to update these Terms of Use at any time. Continued use of the platform after changes are posted constitutes your acceptance of the revised terms." },
  { icon: Globe,        num: "10", title: "Governing Law",             body: "These terms are governed by the laws of the Republic of the Philippines, including the Intellectual Property Code (R.A. 8293), and administered under the jurisdiction of the Intellectual Property Office of the Philippines (IPOPHL)." },
];

export default function TermsOfUsePage() {
  return (
    <main className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 overflow-x-hidden">
      <div className="h-1 w-full bg-linear-to-r from-blue-600 via-blue-400 to-orange-400" />

      {/* ── Hero ── */}
      <div className="relative bg-slate-900 pt-28 pb-20 px-6 text-center overflow-hidden">
        {/* Subtle dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-linear(rgba(96,165,250,1) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Radial blue glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <Reveal>
            <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/25 rounded-full px-5 py-2 mb-6">
              <Scale className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-bold text-blue-300 uppercase tracking-widest">Legal Agreement</span>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none mb-5">
              Terms of{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-blue-300">
                Use
              </span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-slate-300 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Please read these terms carefully before using the ArtForgeLab platform.
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
      </div>

      {/* ── Info bar ── */}
      <div className="bg-blue-600">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {[
            { label: "Total Clauses", value: "10"          },
            { label: "Governing Law", value: "R.A. 8293"   },
            { label: "Jurisdiction",  value: "Philippines" },
            { label: "Effective",     value: "Jan 2026"    },
          ].map((item, i) => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              <span className="text-blue-200 text-xs uppercase tracking-widest font-medium">{item.label}</span>
              <span className="text-white font-black">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section cards ── */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 py-16 md:py-24 space-y-4">

        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Reveal key={section.num}>
              <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-400/60 dark:hover:border-blue-500/50 hover:shadow-[0_6px_28px_rgba(59,130,246,0.09)] transition-all duration-300 overflow-hidden">

                {/* Hover left accent */}
                <div className="absolute left-0 top-0 bottom-0 w-0.75 bg-linear-to-b from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-2xl" />

                <div className="flex gap-0 md:gap-2">

                  {/* Clause number column */}
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
                      {/* Mobile clause number */}
                      <span className="sm:hidden text-xl font-black text-slate-200 dark:text-slate-700 select-none">
                        {section.num}
                      </span>
                      <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {section.title}
                      </h2>
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

        {/* ── Legal disclaimer ── */}
        <Reveal className="pt-4">
          <div className="relative rounded-2xl border border-amber-500/25 bg-linear-to-br from-amber-500/8 to-orange-400/5 p-7 overflow-hidden">
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
                  and does not constitute a registered legal service. All features are provided for research and
                  evaluation purposes only under{" "}
                  <span className="text-slate-700 dark:text-slate-200 font-semibold">R.A. 8293</span>.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── Back link ── */}
        <Reveal className="pt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-500 hover:text-blue-400 transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span>
            Back to Home
          </Link>
        </Reveal>
      </div>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-white">
        <div className="h-1 w-full bg-linear-to-r from-blue-600 via-blue-400 to-orange-400" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 pb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-12 md:mb-14">

            <div className="sm:col-span-2 lg:col-span-1 space-y-5">
              <div className="flex items-center gap-2">
                <Image src="/landing-page-elements/AFL_logoWeb.png" alt="Logo" width={60} height={70} className="shrink-0" />
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
                ArtForgeLab is an academic research initiative developing a Web-based Intellectual Property Rights Management System for Digital Artists using{" "}
                <span className="text-slate-200 font-medium">Perceptual Hashing</span> and{" "}
                <span className="text-slate-200 font-medium">Blockchain Technology</span>.
              </p>
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2">
                <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-xs text-blue-300 font-medium">Undergraduate Thesis Research · 2026</span>
              </div>
            </div>

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
                      <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 shrink-0" />
                      <span>{label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

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
                      <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 shrink-0" />
                      <span>{label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-5">
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-200 border-b border-slate-700 pb-3">Research Team</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Developed as partial fulfillment of an undergraduate thesis requirement. For academic inquiries, reach out below.
              </p>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <span className="break-all">artforgelab@thesis.edu.ph</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <span>Philippines, 2026</span>
                </li>
              </ul>
              <div className="flex gap-3 pt-1">
                {[{ icon: Globe, label: "Website" }, { icon: Share2Icon, label: "Share" }, { icon: Mail, label: "Email" }].map(({ icon: Icon, label }) => (
                  <a key={label} href="#" aria-label={label}
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-500/20 hover:border-blue-500/40 transition-all">
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
                  ArtForgeLab provides cryptographic proof-of-existence and similarity detection as{" "}
                  <span className="text-slate-300 font-medium">evidentiary support</span> for intellectual property claims.
                  All similarity results are <span className="text-slate-300 font-medium">indicative only</span> and do not
                  constitute a legal determination. This system is intended to complement, not replace, formal copyright
                  registration governed by the{" "}
                  <span className="text-slate-300 font-medium">Intellectual Property Code of the Philippines (R.A. 8293)</span>{" "}
                  and administered by <span className="text-slate-300 font-medium">IPOPHL</span>.
                </p>
              </div>
            </div>
          </div>

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
    </main>
  );
}